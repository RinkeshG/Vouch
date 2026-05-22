-- ============================================================
-- Fix: Allow anyone (including anon) to read profiles
--
-- The original RLS only allowed reading profiles where
-- is_public = true. This broke handle uniqueness checks
-- during sign-up (new profiles default to is_public = false).
--
-- Profile data (handle, display_name, avatar_url, bio, etc.)
-- is non-sensitive — it needs to be readable for:
-- 1. Handle availability checks during sign-up
-- 2. Viewing any user's profile page
-- 3. Search results showing people
-- ============================================================

-- Drop the restrictive policy
drop policy if exists "Public profiles viewable by all" on profiles;

-- Replace with unrestricted read (handle, name, avatar are not sensitive)
create policy "Profiles readable by all"
  on profiles for select
  using (true);
