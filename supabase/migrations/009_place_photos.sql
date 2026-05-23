-- ============================================================
-- Add photo_reference column to places for Google Places photos
-- ============================================================

alter table places add column if not exists photo_reference text;

-- Allow authenticated users to update places (for backfilling photo_reference)
create policy "Authenticated users can update places"
  on places for update
  to authenticated
  using (true)
  with check (true);
