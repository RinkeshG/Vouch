# Supabase — what's wired, what's local, what's next

Project: **vouchweb** (`fvaghydskpxwzwgpizhz`, ap-northeast-1). Keys (publishable/
anon — public by design) live in `.env.local` (gitignored).

## Phase 4a — DONE (no auth, per the founder's call)
- **Reads the real catalog.** `_catalog.ts` reads the existing `places` table (150+
  real Bengaluru spots) via PostgREST `fetch` directly — no SDK, to stay light under
  Turbopack. Read-only, anon, on the existing "Places readable by all" RLS policy.
- **Search surface** (`/search`) over that catalog; the rail "Search" item is no
  longer a dead end. Results open the Spot page.
- **Spot page** falls back to the catalog for any place not in the founding SEED set
  (renders with the honest "be the first" receipt — no one you follow has vouched).

## What stays LOCAL for now (auth-correlated, deferred)
The signed-in user is local (`_me` in localStorage): your vouches, follows, and
guides (`_guides`). These don't tie to a server user yet because there's no auth.

## Phase 4b — NEXT (needs auth, deferred by choice)
To make Follow/Borrow/Share real across people and devices (Constitution §8):
1. **Auth ↔ palate (1:1).** Invite/email or magic-link; a `palates` row per user.
2. **New-lexicon schema** beside/over the v1 tables: `palates`, `spots` (or reuse/
   migrate `places`), `vouches` (stamp, `reason` NOT NULL when vouched, `occasions[]`),
   `guides` + `guide_items`, `follows`, `saves`. RLS per table. The **Receipt stays a
   derived query**, never stored.
3. **Migrate the local stores** (`_me`, `_guides`) → Supabase under the auth user.
4. **Borrow** (a followed palate's spots land on your map) and **Share** (a friend
   opens your guide cross-device) become real.
5. Decide reuse/migration of the v1 `lists`/`list_places` (7 lists, 145 items) as
   founding guides, and whether to fully migrate `places` → `spots`.

> v1 tables (`profiles`, `lists`, `list_places`, etc.) are left untouched. Nothing
> with data was dropped.
