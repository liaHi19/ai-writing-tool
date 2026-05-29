-- Allow users to delete their own generations.
-- RLS was enabled on generations with only select/insert policies, so deletes
-- were silently filtered to zero rows.
create policy "generations_delete_own"
  on public.generations for delete
  using (auth.uid() = user_id);
