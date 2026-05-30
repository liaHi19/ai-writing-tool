-- Allow users to update their own generations (for editing output in the history dialog).
create policy "generations_update_own"
  on public.generations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
