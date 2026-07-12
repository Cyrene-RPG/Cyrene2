-- Main storyline opt-in captured after sign-up.

alter table public.profiles
  add column if not exists main_storyline_choice text
    check (main_storyline_choice in ('yes', 'no')),
  add column if not exists main_storyline_decided_at timestamptz;

comment on column public.profiles.main_storyline_choice is
  'Operator response to the post-signup main storyline prompt.';
comment on column public.profiles.main_storyline_decided_at is
  'When the operator answered the main storyline prompt.';
