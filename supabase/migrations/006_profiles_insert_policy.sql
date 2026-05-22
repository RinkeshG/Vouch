-- ============================================================
-- Allow authenticated users to insert their own profile
-- Needed when handle_new_user trigger didn't fire or failed
-- ============================================================

-- Insert policy: users can only create a profile with their own auth.uid()
create policy "Users can insert own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Backfill: create profiles for any auth.users that don't have one
insert into profiles (id, handle, display_name, avatar_tint)
select
  au.id,
  'user_' || substr(au.id::text, 1, 8),
  coalesce(au.raw_user_meta_data->>'display_name', split_part(au.email, '@', 1)),
  floor(random() * 9)::smallint
from auth.users au
left join profiles p on p.id = au.id
where p.id is null
on conflict (id) do nothing;
