-- ============================================================
-- V1 profile fixes
-- 1. Function to check handle availability (bypasses RLS)
-- 2. INSERT policy on profiles (fallback for missing trigger)
-- 3. Make profiles public by default (lists are public, profiles should be too)
-- 4. Backfill: create profiles for orphaned auth.users
-- ============================================================

-- 1. Handle availability check — callable from client without auth
--    Returns true if handle is already taken
create or replace function is_handle_taken(h text)
returns boolean as $$
  select exists(select 1 from profiles where handle = h);
$$ language sql security definer;

-- 2. Allow authenticated users to insert their own profile
create policy "Users can insert own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- 3. Make existing profiles public so list author info is visible
update profiles set is_public = true where is_public = false;

-- 4. Change default so new profiles are public
alter table profiles alter column is_public set default true;

-- 5. Backfill: create profiles for any auth.users missing one
insert into profiles (id, handle, display_name, avatar_tint, is_public)
select
  au.id,
  'user_' || substr(au.id::text, 1, 8),
  coalesce(au.raw_user_meta_data->>'display_name', split_part(au.email, '@', 1)),
  floor(random() * 9)::smallint,
  true
from auth.users au
left join profiles p on p.id = au.id
where p.id is null
on conflict (id) do nothing;
