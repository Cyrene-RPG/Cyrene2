-- Repair profiles table, policies, trigger, and backfill missing rows.
-- Safe to run multiple times.

-- 1. Ensure table exists
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now()
);

-- 2. Add created_at if an old broken version is missing it
alter table public.profiles
  add column if not exists created_at timestamptz not null default now();

-- 3. Normalize usernames (lowercase, trimmed)
update public.profiles
set username = lower(trim(username))
where username <> lower(trim(username));

-- 4. Fix duplicate usernames before adding unique index
with ranked as (
  select
    id,
    username,
    row_number() over (
      partition by lower(username)
      order by created_at nulls last, id
    ) as rn
  from public.profiles
)
update public.profiles p
set username = p.username || '_' || left(p.id::text, 4)
from ranked r
where p.id = r.id
  and r.rn > 1;

-- 5. Drop old constraints/indexes and enforce case-insensitive uniqueness
alter table public.profiles drop constraint if exists profiles_username_key;

drop index if exists public.profiles_username_lower_idx;

create unique index profiles_username_lower_idx
  on public.profiles (lower(username));

-- 6. Row Level Security
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_all"
  on public.profiles
  for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id);

-- 7. Grants (anon needs SELECT for username availability check)
grant usage on schema public to anon, authenticated;
grant select on table public.profiles to anon, authenticated;
grant insert, update on table public.profiles to authenticated;

-- 8. Trigger function (security definer bypasses RLS on insert)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix text;
begin
  base_username := lower(trim(coalesce(
    new.raw_user_meta_data ->> 'username',
    split_part(new.email, '@', 1)
  )));

  if base_username is null or base_username = '' then
    base_username := 'operator';
  end if;

  final_username := base_username;

  if exists (
    select 1
    from public.profiles
    where lower(username) = final_username
  ) then
    suffix := left(replace(new.id::text, '-', ''), 4);
    final_username := base_username || '_' || suffix;
  end if;

  insert into public.profiles (id, username)
  values (new.id, final_username)
  on conflict (id) do update
    set username = excluded.username;

  return new;
end;
$$;

-- 9. Recreate trigger
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 10. Backfill profiles for auth users missing a row
insert into public.profiles (id, username)
select
  u.id,
  case
    when exists (
      select 1
      from public.profiles p
      where lower(p.username) = lower(trim(coalesce(
        nullif(u.raw_user_meta_data ->> 'username', ''),
        split_part(u.email, '@', 1)
      )))
    )
    then lower(trim(coalesce(
      nullif(u.raw_user_meta_data ->> 'username', ''),
      split_part(u.email, '@', 1)
    ))) || '_' || left(replace(u.id::text, '-', ''), 4)
    else lower(trim(coalesce(
      nullif(u.raw_user_meta_data ->> 'username', ''),
      split_part(u.email, '@', 1)
    )))
  end
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
