-- Operator avatars (character slots linked to auth users)

create table if not exists public.operator_avatars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slot_index smallint not null check (slot_index >= 0 and slot_index < 3),
  display_name text not null,
  last_name text not null default '',
  gender text,
  gender_other text not null default '',
  class_id text not null,
  subclass_id text,
  species_id text not null,
  subspecies_id text,
  stats jsonb not null,
  age smallint,
  weight_lb smallint,
  height_ft smallint,
  height_in smallint,
  created_at timestamptz not null default now(),
  constraint operator_avatars_user_slot_unique unique (user_id, slot_index)
);

create index if not exists operator_avatars_user_id_idx
  on public.operator_avatars (user_id);

alter table public.operator_avatars enable row level security;

drop policy if exists "operator_avatars_select_own" on public.operator_avatars;
drop policy if exists "operator_avatars_insert_own" on public.operator_avatars;

create policy "operator_avatars_select_own"
  on public.operator_avatars
  for select
  using (auth.uid() = user_id);

create policy "operator_avatars_insert_own"
  on public.operator_avatars
  for insert
  with check (auth.uid() = user_id);

grant select, insert on table public.operator_avatars to authenticated;
