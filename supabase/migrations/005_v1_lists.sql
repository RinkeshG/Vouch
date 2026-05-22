-- ============================================================
-- Vouch V1 — Lists-first simplification
-- Adds slug, emoji, cover_style, is_published to lists
-- Adds note to list_places
-- Adds place_count trigger
-- ============================================================

-- ---- Lists table additions ----

alter table lists add column if not exists slug text;
alter table lists add column if not exists emoji text;
alter table lists add column if not exists cover_style smallint not null default 0;
alter table lists add column if not exists place_count integer not null default 0;
alter table lists add column if not exists is_published boolean not null default false;

-- Slug format constraint
alter table lists add constraint slug_format
  check (slug is null or slug ~ '^[a-z0-9][a-z0-9-]{0,79}$');

-- Unique slug per user (allows null slugs for drafts)
create unique index if not exists lists_user_slug_idx
  on lists (user_id, slug)
  where slug is not null;

-- Cover style range (0-4 for 5 palettes)
alter table lists add constraint cover_style_range
  check (cover_style >= 0 and cover_style <= 4);

-- ---- List places additions ----

alter table list_places add column if not exists note text;

alter table list_places add constraint note_length
  check (note is null or char_length(note) <= 140);

-- ---- Slug generation function ----

create or replace function generate_list_slug(title text)
returns text as $$
begin
  return left(
    regexp_replace(
      regexp_replace(
        lower(trim(title)),
        '[^a-z0-9\s-]', '', 'g'
      ),
      '[\s]+', '-', 'g'
    ),
    80
  );
end;
$$ language plpgsql immutable;

-- ---- Place count trigger ----

create or replace function update_list_place_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update lists set place_count = place_count + 1 where id = new.list_id;
    return new;
  elsif tg_op = 'DELETE' then
    update lists set place_count = place_count - 1 where id = old.list_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_list_place_count on list_places;
create trigger trg_list_place_count
  after insert or delete on list_places
  for each row execute function update_list_place_count();

-- ---- Backfill place_count for any existing lists ----

update lists set place_count = (
  select count(*) from list_places where list_places.list_id = lists.id
);

-- ---- Mark existing lists as published (they were created before draft concept) ----

update lists set is_published = true where is_published = false;
