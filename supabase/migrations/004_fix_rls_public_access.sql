-- ============================================================
-- Fix: Open up read-access for public profile viewing
--
-- Several RLS policies were too restrictive, breaking:
-- 1. Profile pages (vouches, places, follow counts)
-- 2. Search (places table only allowed authenticated)
-- 3. Public profile links shared externally
--
-- Places and vouches from public profiles are not sensitive.
-- Follow counts need to be publicly readable.
-- ============================================================

-- ---- Places: readable by everyone (not just authenticated) ----
-- Drop the old restrictive policy
drop policy if exists "Places viewable by authenticated" on places;

-- Anyone can read places (restaurant data is public)
create policy "Places readable by all"
  on places for select
  using (true);

-- ---- Vouches: add policy for anon users viewing public profile vouches ----
-- The existing "Public profile vouches viewable" policy uses a subquery
-- to check is_public on profiles. But for anon users, the profiles RLS
-- might block that subquery. Drop and recreate to be safe.
drop policy if exists "Public profile vouches viewable" on vouches;

create policy "Public profile vouches viewable"
  on vouches for select
  using (
    exists (
      select 1 from profiles
      where id = vouches.user_id
        and is_public = true
    )
  );

-- Also allow all authenticated users to read all vouches
-- (needed for feed, search, and profile viewing)
drop policy if exists "All vouches viewable by authenticated" on vouches;
create policy "All vouches viewable by authenticated"
  on vouches for select
  to authenticated
  using (true);

-- ---- Follows: allow anyone to count followers/following ----
-- Currently only involved parties can see follows.
-- We need public read for follower/following counts on profiles.
drop policy if exists "Follow counts readable by all" on follows;
create policy "Follow counts readable by all"
  on follows for select
  using (true);

-- ---- Lists: ensure public lists are readable by everyone ----
-- The existing policy should work, but let's make it explicit for anon too
drop policy if exists "Public lists viewable" on lists;
create policy "Public lists viewable"
  on lists for select
  using (is_public = true);

-- ---- List places: readable if parent list is public ----
-- Already has a policy but ensure it works for anon
drop policy if exists "List places viewable with list" on list_places;
create policy "List places viewable with list"
  on list_places for select
  using (
    exists (
      select 1 from lists
      where lists.id = list_places.list_id
        and (lists.is_public = true or lists.user_id = auth.uid())
    )
  );

-- ---- Vouches: allow users to UPDATE their own vouches ----
-- (needed when re-vouching a place already in their profile)
drop policy if exists "Users can update own vouches" on vouches;
create policy "Users can update own vouches"
  on vouches for update
  using (auth.uid() = user_id);
