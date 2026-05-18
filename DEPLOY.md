# Deploy Vouch (shippable beta)

## What you get when deployed

- **Cloud backup** of your Vouch (Supabase) — survives clearing site data on the same browser session via anonymous auth
- **Public card links**: `https://your-domain.com/?u=your-handle`
- **Invite links**: `https://your-domain.com/?invite=your-handle` — friend completes onboarding and is auto-added to your circle
- **Offline PWA** shell still works; syncs when online

Without Supabase env vars, the app still runs as a **local-only** demo (localStorage + hash share links).

---

## 1. Create Supabase project (5 min)

1. Go to [supabase.com](https://supabase.com) → New project
2. **SQL Editor** → paste and run everything in `supabase/schema.sql`
3. **Authentication** → **Providers** → turn **Anonymous sign-ins** ON
4. **Project Settings** → **API** → copy:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`

## 2. Configure locally

```bash
cp .env.example .env
# Edit .env with your Supabase URL and anon key

npm install
npm run dev
```

Complete onboarding once. Open **You** tab — you should see `vouch.app/u/your-handle`. Share that link in an incognito window to verify the public card loads.

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

Redeploy after adding env vars. `vercel.json` already configures SPA rewrites for `?u=` and `?invite=` routes.

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
