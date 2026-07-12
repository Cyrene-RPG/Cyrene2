-- Resolve operator handle to auth email for password sign-in (client cannot read auth.users).
create or replace function public.resolve_login_email(identifier text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  trimmed text;
  profile_id uuid;
  user_email text;
begin
  trimmed := lower(btrim(identifier));

  if trimmed = '' or strpos(trimmed, '@') > 0 then
    return null;
  end if;

  select id into profile_id
  from public.profiles
  where lower(username) = trimmed
  limit 1;

  if profile_id is null then
    return null;
  end if;

  select lower(email) into user_email
  from auth.users
  where id = profile_id;

  return user_email;
end;
$$;

revoke all on function public.resolve_login_email(text) from public;
grant execute on function public.resolve_login_email(text) to anon, authenticated;
