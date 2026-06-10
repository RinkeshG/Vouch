-- 009: the data keystone (PRD v2.1 §4) — read model + append-only truth.
-- `user_place` answers "what's the map now"; `place_events` answers "what happened"
-- (enables Want→Been conversion, want-duration, gut changes across visits).
-- Auth is deferred: tables are created with RLS ready for auth; the app keeps
-- running on localStorage until accounts are wired. Guides stay on lists/list_places.

-- ── user_place: one latest-wins row per (user, place) ──────────────────────────
create table user_place (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references profiles(id) on delete cascade,
  place_id          uuid not null references places(id) on delete cascade,
  state             text not null check (state in ('want', 'been', 'vouched')),
  gut               text check (gut in ('absolutely', 'maybe', 'no')),   -- latest "Go back?"
  take              text,                                                 -- required when vouched; kept latent on un-vouch
  visit_count       int not null default 0,
  first_wanted_at   timestamptz,
  first_visited_at  timestamptz,
  vouched_at        timestamptz,
  updated_at        timestamptz not null default now(),
  unique (user_id, place_id)
);

-- ── place_events: append-only, the truth ──────────────────────────────────────
create table place_events (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  place_id    uuid not null references places(id) on delete cascade,
  type        text not null check (type in ('wanted', 'visited', 'gut_set', 'vouched', 'unvouched', 'removed')),
  gut         text check (gut in ('absolutely', 'maybe', 'no')),         -- when type = gut_set
  source      text not null default 'manual' check (source in ('manual', 'proximity_prompt', 'onboarding', 'guide_import')),
  created_at  timestamptz not null default now()
);

create index user_place_user_idx        on user_place (user_id);
create index user_place_place_idx       on user_place (place_id);
create index place_events_user_idx      on place_events (user_id);
create index place_events_place_idx     on place_events (place_id);
create index place_events_user_place_idx on place_events (user_id, place_id);

create trigger user_place_updated_at before update on user_place
  for each row execute function update_updated_at();

-- ── RLS — visibility matrix (PRD §4): Vouch is public; Want/Been + gut are private ──
alter table user_place enable row level security;
alter table place_events enable row level security;

-- only vouched rows are world-readable; want/been stay private to the owner
create policy "user_place read vouched or own" on user_place
  for select using (state = 'vouched' or auth.uid() = user_id);
create policy "user_place owner insert" on user_place
  for insert with check (auth.uid() = user_id);
create policy "user_place owner update" on user_place
  for update using (auth.uid() = user_id);
create policy "user_place owner delete" on user_place
  for delete using (auth.uid() = user_id);

-- events are private to the owner (gut never public); aggregates are computed, not exposed.
-- Append-only: no update/delete policies — the truth is immutable.
create policy "place_events owner read" on place_events
  for select using (auth.uid() = user_id);
create policy "place_events owner insert" on place_events
  for insert with check (auth.uid() = user_id);
