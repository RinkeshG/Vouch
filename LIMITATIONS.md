# Vouch v1 — what ships now vs later

## Ships in v1 (real, not fake)

| Feature | How it works |
|---------|----------------|
| Your Top 4 + vouches | Stored in Supabase + local cache |
| Public Vouch card | `/p/handle` — teaser + join CTA |
| Invite friends | `?invite=handle` — auto-connects after they onboard |
| **Live circle feed** | Home shows friends' vouched places from their public cards |
| **Email sign-in** | You tab → save link or sign-in link; same account across devices |
| **Google Places search** | Add a spot → search any restaurant/cafe in your city |
| Share sheet | Short message + clean link, WhatsApp preview |
| Need a spot? | Filters your vouched places by plan |
| Place catalog | Editorial picks for 6 Indian cities + Google long tail |
| PWA | Installable, offline shell |

**Requires cloud for sync + social:** `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` + `supabase/schema.sql`.

**Google search on Vercel:** `GOOGLE_PLACES_API_KEY` (see DEPLOY.md).

---

## Intentionally not in v1 (upgrades, not blockers)

### 1. Phone / SMS login
Email magic link only for now.

### 2. Push notifications ("Friend X just vouched Y")
Feed refreshes when you open the app or return to the home tab — no background push yet.

### 3. Photos you took
Google/catalog images only. Upload per vouch is a v2 storage/moderation project.

### 4. Ratings, reviews, follower counts
Not Yelp. Core mechanic is trusted names, not crowdsourced stars.

### 5. In-app messaging
WhatsApp is the real channel; we use share sheets instead of rebuilding chat.

### 6. Multi-city catalogs per user
One home city at onboarding (Google search still works in that city).

### 7. Moderation / reporting
Closed beta with people you know. Needed before public launch.

### 8. Native iOS / Android apps
PWA is enough to validate with 10–50 friends.

---

## Known rough edges (honest)

- **Manual friends** (name only, no invite link) don't have a live card.
- **Public save** on someone else's card is session-only until you make your own Vouch.
- **Circle refresh** is pull/focus-based, not real-time WebSockets.
- **Google Places** billing applies on your Google Cloud project — set quotas.

---

## Recommended beta scope

**Good for:** 10 friends in one city, WhatsApp invite loop, email backup, adding any restaurant via Google, seeing each other's vouches on home.

**Not yet for:** Public launch, strangers discovering you, or passive notifications without opening the app.
