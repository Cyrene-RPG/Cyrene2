-- Allow operators to delete their own avatar records

drop policy if exists "operator_avatars_delete_own" on public.operator_avatars;

create policy "operator_avatars_delete_own"
  on public.operator_avatars
  for delete
  using (auth.uid() = user_id);

grant delete on table public.operator_avatars to authenticated;
