-- Saves table: tracks which users saved which lists
create table if not exists public.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  list_id uuid not null references public.lists(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, list_id)
);

alter table public.saves enable row level security;

create policy "Users can view all saves"
  on public.saves for select
  using (true);

create policy "Users can save lists"
  on public.saves for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave their own saves"
  on public.saves for delete
  using (auth.uid() = user_id);

create index idx_saves_list_id on public.saves(list_id);
create index idx_saves_user_id on public.saves(user_id);
