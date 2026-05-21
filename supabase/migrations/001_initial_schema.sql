-- ============================================================
-- Vouch — Initial Database Schema
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- Types
-- ============================================================

create type city as enum ('bangalore', 'bombay', 'delhi', 'goa', 'chennai');
create type follow_status as enum ('active', 'pending');
create type notification_type as enum ('vouch', 'follow', 'follow_request', 'list_save', 'mention');
create type entity_type as enum ('vouch', 'place', 'list', 'profile');

-- ============================================================
-- Profiles
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null,
  display_name text not null,
  bio text,
  city city not null default 'bangalore',
  avatar_url text,
  avatar_tint smallint not null default 0,
  is_public boolean not null default false,
  taste_line text,
  onboarding_step smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint handle_format check (handle ~ '^[a-z0-9_]{3,20}$'),
  constraint avatar_tint_range check (avatar_tint >= 0 and avatar_tint < 9),
  constraint onboarding_range check (onboarding_step >= 0 and onboarding_step <= 4)
);

create index profiles_handle_idx on profiles using btree (handle);
create index profiles_handle_trgm_idx on profiles using gin (handle gin_trgm_ops);
create index profiles_display_name_trgm_idx on profiles using gin (display_name gin_trgm_ops);
create index profiles_city_idx on profiles using btree (city);

-- ============================================================
-- Places
-- ============================================================

create table places (
  id uuid primary key default uuid_generate_v4(),
  google_place_id text unique,
  name text not null,
  area text not null,
  city city not null,
  cuisines text[] not null default '{}',
  price_tier smallint not null default 2,
  cover_image_url text,
  latitude double precision,
  longitude double precision,
  phone text,
  website text,
  hours jsonb,
  is_closed boolean not null default false,
  vouch_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint price_tier_range check (price_tier >= 1 and price_tier <= 4)
);

create index places_google_id_idx on places using btree (google_place_id);
create index places_city_idx on places using btree (city);
create index places_name_trgm_idx on places using gin (name gin_trgm_ops);
create index places_area_trgm_idx on places using gin (area gin_trgm_ops);

-- ============================================================
-- Vouches
-- ============================================================

create table vouches (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  place_id uuid not null references places(id) on delete cascade,
  take text not null,
  context_tags text[] not null default '{}',
  created_at timestamptz not null default now(),

  constraint take_length check (char_length(take) >= 20 and char_length(take) <= 120),
  constraint unique_user_place unique (user_id, place_id)
);

create index vouches_user_idx on vouches using btree (user_id);
create index vouches_place_idx on vouches using btree (place_id);
create index vouches_created_idx on vouches using btree (created_at desc);

-- ============================================================
-- Lists
-- ============================================================

create table lists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint title_length check (char_length(title) >= 1 and char_length(title) <= 60)
);

create index lists_user_idx on lists using btree (user_id);

create table list_places (
  id uuid primary key default uuid_generate_v4(),
  list_id uuid not null references lists(id) on delete cascade,
  place_id uuid not null references places(id) on delete cascade,
  position smallint not null default 0,
  added_at timestamptz not null default now(),

  constraint unique_list_place unique (list_id, place_id)
);

create index list_places_list_idx on list_places using btree (list_id);

create table list_saves (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  list_id uuid not null references lists(id) on delete cascade,
  saved_at timestamptz not null default now(),

  constraint unique_user_list unique (user_id, list_id)
);

-- ============================================================
-- Circle (follow relationships)
-- ============================================================

create table follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  status follow_status not null default 'active',
  created_at timestamptz not null default now(),

  constraint no_self_follow check (follower_id != following_id),
  constraint unique_follow unique (follower_id, following_id)
);

create index follows_follower_idx on follows using btree (follower_id) where status = 'active';
create index follows_following_idx on follows using btree (following_id) where status = 'active';
create index follows_pending_idx on follows using btree (following_id) where status = 'pending';

-- ============================================================
-- Notifications
-- ============================================================

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  actor_id uuid not null references profiles(id) on delete cascade,
  entity_id uuid,
  entity_type entity_type,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on notifications using btree (user_id, created_at desc);
create index notifications_unread_idx on notifications using btree (user_id) where is_read = false;

-- ============================================================
-- Saved places (bookmarks)
-- ============================================================

create table saved_places (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  place_id uuid not null references places(id) on delete cascade,
  saved_at timestamptz not null default now(),

  constraint unique_saved_place unique (user_id, place_id)
);

create index saved_places_user_idx on saved_places using btree (user_id);

-- ============================================================
-- Functions: update vouch count on places
-- ============================================================

create or replace function update_place_vouch_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update places set vouch_count = vouch_count + 1 where id = new.place_id;
  elsif tg_op = 'DELETE' then
    update places set vouch_count = vouch_count - 1 where id = old.place_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger vouches_count_trigger
  after insert or delete on vouches
  for each row execute function update_place_vouch_count();

-- ============================================================
-- Functions: update updated_at timestamp
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger places_updated_at before update on places
  for each row execute function update_updated_at();

create trigger lists_updated_at before update on lists
  for each row execute function update_updated_at();

-- ============================================================
-- Functions: auto-create profile on signup
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, handle, display_name, avatar_tint)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'handle', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', 'New User'),
    floor(random() * 9)::smallint
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table places enable row level security;
alter table vouches enable row level security;
alter table lists enable row level security;
alter table list_places enable row level security;
alter table list_saves enable row level security;
alter table follows enable row level security;
alter table notifications enable row level security;
alter table saved_places enable row level security;

-- Profiles: public profiles readable by everyone, own profile editable
create policy "Public profiles viewable by all"
  on profiles for select
  using (is_public = true);

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Places: readable by all authenticated users, insertable by authenticated
create policy "Places viewable by authenticated"
  on places for select
  to authenticated
  using (true);

create policy "Authenticated users can insert places"
  on places for insert
  to authenticated
  with check (true);

-- Vouches: readable from circle or own, writable by self
create policy "Own vouches viewable"
  on vouches for select
  using (auth.uid() = user_id);

create policy "Circle vouches viewable"
  on vouches for select
  using (
    exists (
      select 1 from follows
      where follower_id = auth.uid()
        and following_id = vouches.user_id
        and status = 'active'
    )
  );

create policy "Public profile vouches viewable"
  on vouches for select
  using (
    exists (
      select 1 from profiles
      where id = vouches.user_id
        and is_public = true
    )
  );

create policy "Users can insert own vouches"
  on vouches for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own vouches"
  on vouches for delete
  using (auth.uid() = user_id);

-- Lists: public lists readable, own lists manageable
create policy "Public lists viewable"
  on lists for select
  using (is_public = true);

create policy "Own lists viewable"
  on lists for select
  using (auth.uid() = user_id);

create policy "Users can manage own lists"
  on lists for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own lists"
  on lists for update
  using (auth.uid() = user_id);

create policy "Users can delete own lists"
  on lists for delete
  using (auth.uid() = user_id);

-- List places: follow list visibility
create policy "List places viewable with list"
  on list_places for select
  using (
    exists (
      select 1 from lists
      where lists.id = list_places.list_id
        and (lists.is_public = true or lists.user_id = auth.uid())
    )
  );

create policy "Users can manage own list places"
  on list_places for insert
  to authenticated
  with check (
    exists (
      select 1 from lists
      where lists.id = list_places.list_id
        and lists.user_id = auth.uid()
    )
  );

create policy "Users can remove from own lists"
  on list_places for delete
  using (
    exists (
      select 1 from lists
      where lists.id = list_places.list_id
        and lists.user_id = auth.uid()
    )
  );

-- List saves: own saves
create policy "Own saves viewable"
  on list_saves for select
  using (auth.uid() = user_id);

create policy "Users can save lists"
  on list_saves for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can unsave lists"
  on list_saves for delete
  using (auth.uid() = user_id);

-- Follows: viewable by involved parties, manageable by follower
create policy "Own follows viewable"
  on follows for select
  using (auth.uid() = follower_id or auth.uid() = following_id);

create policy "Users can follow"
  on follows for insert
  to authenticated
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on follows for delete
  using (auth.uid() = follower_id);

create policy "Following user can accept/reject"
  on follows for update
  using (auth.uid() = following_id);

-- Notifications: own only
create policy "Own notifications viewable"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Own notifications updatable"
  on notifications for update
  using (auth.uid() = user_id);

-- Saved places: own only
create policy "Own saved places viewable"
  on saved_places for select
  using (auth.uid() = user_id);

create policy "Users can save places"
  on saved_places for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can unsave places"
  on saved_places for delete
  using (auth.uid() = user_id);
