-- Vouch beta schema — run in Supabase SQL Editor (Dashboard → SQL → New query)

-- ── Private profile + full app state (owner only) ───────────────────────────
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  handle text not null unique,
  display_name text not null default '',
  city text not null default 'Bangalore',
  taste_tags text[] not null default '{}',
  onboarded boolean not null default false,
  onboarding_step smallint not null default 0,
  app_state jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint handle_format check (handle ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$')
);

create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists profiles_handle_idx on public.profiles(handle);

-- ── Public Vouch card (readable by anyone with the link) ────────────────────
create table if not exists public.public_vouches (
  handle text primary key references public.profiles(handle) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  snapshot jsonb not null,
  updated_at timestamptz not null default now()
);

-- ── Invite tracking (who joined via whose link) ─────────────────────────────
create table if not exists public.invite_links (
  id uuid primary key default gen_random_uuid(),
  inviter_handle text not null references public.profiles(handle) on delete cascade,
  invitee_user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.public_vouches enable row level security;
alter table public.invite_links enable row level security;

-- Profiles: owner read/write
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Public cards: anyone can read; owner can write
drop policy if exists "public_vouches_select_all" on public.public_vouches;
create policy "public_vouches_select_all"
  on public.public_vouches for select
  using (true);

drop policy if exists "public_vouches_insert_own" on public.public_vouches;
create policy "public_vouches_insert_own"
  on public.public_vouches for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "public_vouches_update_own" on public.public_vouches;
create policy "public_vouches_update_own"
  on public.public_vouches for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
  );

-- Invites: owner can read their sent invites; anyone authenticated can insert own redemption
drop policy if exists "invite_links_select_inviter" on public.invite_links;
create policy "invite_links_select_inviter"
  on public.invite_links for select
  using (
    exists (
      select 1 from public.profiles p
      where p.handle = inviter_handle and p.user_id = auth.uid()
    )
    or auth.uid() = invitee_user_id
  );

drop policy if exists "invite_links_insert_self" on public.invite_links;
create policy "invite_links_insert_self"
  on public.invite_links for insert
  with check (auth.uid() = invitee_user_id);

-- Enable anonymous sign-in in Supabase Dashboard:
-- Authentication → Providers → Anonymous sign-ins → ON
