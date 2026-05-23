-- ============================================================
-- List Saves — denormalized save_count + public visibility
-- Adds save_count to lists (like place_count), with trigger.
-- Opens list_saves SELECT to public (save counts are not private).
-- ============================================================

-- ---- Add save_count column ----

alter table lists add column if not exists save_count integer not null default 0;

-- ---- Trigger: keep save_count in sync ----

create or replace function update_list_save_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update lists set save_count = save_count + 1 where id = new.list_id;
    return new;
  elsif tg_op = 'DELETE' then
    update lists set save_count = save_count - 1 where id = old.list_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_list_save_count on list_saves;
create trigger trg_list_save_count
  after insert or delete on list_saves
  for each row execute function update_list_save_count();

-- ---- Public read access for save counts ----
-- Anyone can see who saved what (save counts are social, not private)

drop policy if exists "Own saves viewable" on list_saves;
create policy "Saves are publicly viewable"
  on list_saves for select
  using (true);

-- ---- Backfill save_count for any existing saves ----

update lists set save_count = (
  select count(*) from list_saves where list_saves.list_id = lists.id
);
