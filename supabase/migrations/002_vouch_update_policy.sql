-- ============================================================
-- Fix: Add UPDATE policy on vouches (missing from initial schema)
-- Users need to be able to edit their own vouches/takes
-- ============================================================

create policy "Users can update own vouches"
  on vouches for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
