# Deploy Vouch (shippable beta)

## What you get when deployed

- **Cloud backup** of your Vouch (Supabase) — survives clearing site data on the same browser session via anonymous auth
- **Public URLs** (sharing & link previews): `https://your-domain.com/handle-name` — and for a curated list `https://your-domain.com/handle/list-slug`.
- **Bots & messengers**: those routes hit **`/api/profile-preview`** — they get canonical Open Graph/Twitter meta + a **preview image from the featured place** — then browsers redirect people into the app with `/?u=` + optional `list=`.
- **Legacy** `/p/:handle` still works end-to-end; new links use **`/{handle}[/{list}]`**.
- **Canonical domain**: Set `VITE_PUBLIC_SITE_URL=https://vouch.app` (or your custom domain) in production so shared links aren’t localhost.
- **Invite links**: `https://your-domain.com/?invite=your-handle` — friend completes onboarding and is auto-added to your circle
- **Offline PWA** shell still works; syncs when online

Without Supabase env vars, the app still runs as a **local-only** demo (localStorage + hash share links).

---

## 1. Create Supabase project (5 min)

1. Go to [supabase.com](https://supabase.com) → New project
2. **SQL Editor** → paste and run everything in `supabase/schema.sql`
   - If you migrated from an earlier beta, re-run the file — `create table if not exists` makes it safe, and the new `place_saves` table powers the Home influence row ("3 saves from your list").
3. **Authentication** → **Providers** → turn **Anonymous sign-ins** and **Email** ON
4. **Authentication** → **URL configuration** → Site URL = your deploy URL; add same URL to Redirect URLs
5. **Project Settings** → **API** → copy:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`

## 2. Configure locally

```bash
cp .env.example .env
# Edit .env with your Supabase URL and anon key

npm install
npm run dev
```

Complete onboarding once. Open **You** tab — you should see clean profile links `vouch.app/your-handle`. Share `https://vouch.app/your-handle` in an incognito window to verify previews and the public card.

## 3. Deploy to Vercel (recommended)

```bash
npm run build
npx vercel
```

In the Vercel project **Settings → Environment Variables**, add:

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | Your Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Your anon key |
| `GOOGLE_PLACES_API_KEY` | Google Cloud API key (Places API New enabled) |

Redeploy after adding env vars. `vercel.json` configures link previews (`/:handle[/:list]`, legacy `/p/…`), and `/api/places-*` for Google search.

### Google Places setup (5 min)

1. [Google Cloud Console](https://console.cloud.google.com/) → create/select project
2. Enable **Places API (New)**
3. **Credentials** → Create API key → restrict to Places API
4. Add key as `GOOGLE_PLACES_API_KEY` on Vercel (kept server-side via `/api/places-autocomplete`)
5. Optional local dev: also set `VITE_GOOGLE_PLACES_API_KEY` in `.env`

### Email account setup

1. Supabase → **Authentication** → **Email** → enable
2. **You** tab in app → **Your account** → enter email → **Send save link**
3. Tap link in inbox — same Vouch, now follows you across devices
4. New phone → **Sign in elsewhere** with the same email

### Other hosts

Any static host works (Netlify, Cloudflare Pages, GitHub Pages with redirects). Build command: `npm run build`, output: `dist/`.

---

## 4. Test with 10 friends (checklist)

1. **You**: onboard → vouch 4 places → share `?u=yourhandle` in WhatsApp
2. **Friend A**: opens link → sees your card → taps **Make my own Vouch** → finishes onboarding
3. **You**: should see Friend A in Friends (if they used `?invite=yourhandle`)
4. **Friend A**: logs a rec from you (or you from them) → appears under **From your circle** on home
5. **Need a spot?**: tap **Date night** → Places tab filtered
6. **Second device**: same anonymous session won't transfer — see LIMITATIONS.md (email auth is next)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Public link 404 / not found | Finish onboarding; wait for “Saving…” to clear; check `public_vouches` table in Supabase |
| Invite didn’t connect friend | Friend must open `?invite=handle` before or during onboarding, not only `?u=` |
| Data lost on new phone | Anonymous auth is per-browser; add email auth in v2 (see LIMITATIONS.md) |
| Build works locally, not on Vercel | Env vars must be set on Vercel and redeployed |
