# Vouch

Mobile-first PWA for trusted restaurant recommendations. Build your Top 4, share a public card, invite friends, and log recs from people whose taste you trust.

> **GitHub:** After you push, your repo should be named **Vouch** — see [GITHUB.md](./GITHUB.md).

## Quick start (local)

```bash
npm install
cp .env.example .env   # add Supabase keys for cloud + invites
npm run dev
```

Open `http://localhost:5173`.

## Shippable beta (cloud + deploy)

**Without Supabase:** works offline in one browser (localStorage + hash share links).

**With Supabase:** real public URLs (`?u=handle`), invite links (`?invite=handle`), cloud backup, friend auto-connect on join.

See **[DEPLOY.md](./DEPLOY.md)** for Supabase setup and Vercel deploy.

See **[LIMITATIONS.md](./LIMITATIONS.md)** for what ships now vs v2.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

## Stack

- React 19 + Vite + TypeScript
- Supabase (auth + Postgres) when configured
- PWA manifest + service worker
