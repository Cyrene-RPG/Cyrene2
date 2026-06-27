-- Admin flag on operator profiles (city map build access, etc.)

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

update public.profiles
set is_admin = true
where lower(username) = 'fallen_star';
