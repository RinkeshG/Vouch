-- ============================================================
-- 008: Ensure UPDATE & DELETE policies on lists + list_places
--
-- Some of these policies already exist from 001_initial_schema.
-- We drop-if-exists then recreate to guarantee consistent state
-- and to add the missing UPDATE policy on list_places.
-- ============================================================

-- ---- lists: UPDATE ----
drop policy if exists "Users can update own lists" on lists;
create policy "Users can update own lists"
  on lists for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---- lists: DELETE ----
drop policy if exists "Users can delete own lists" on lists;
create policy "Users can delete own lists"
  on lists for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---- list_places: UPDATE ----
drop policy if exists "Users can update own list places" on list_places;
create policy "Users can update own list places"
  on list_places for update
  to authenticated
  using (
    exists (
      select 1 from lists
      where lists.id = list_places.list_id
        and lists.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from lists
      where lists.id = list_places.list_id
        and lists.user_id = auth.uid()
    )
  );

-- ---- list_places: DELETE ----
-- Recreate to match style (original from 001 is named differently)
drop policy if exists "Users can remove from own lists" on list_places;
drop policy if exists "Users can delete own list places" on list_places;
create policy "Users can delete own list places"
  on list_places for delete
  to authenticated
  using (
    exists (
      select 1 from lists
      where lists.id = list_places.list_id
        and lists.user_id = auth.uid()
    )
  );
