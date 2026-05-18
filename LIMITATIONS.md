# Vouch beta — what ships now vs later

## Ships in this beta (real, not fake)

| Feature | How it works |
|---------|----------------|
| Your Top 4 + vouches | Stored in Supabase + local cache |
| Public Vouch card | `?u=handle` — loaded from server |
| Invite friends | `?invite=handle` — auto-connects after they onboard |
| Share sheet | WhatsApp, copy link, native share |
| Friend recs | Log place + attribution; shows on home |
| Need a spot? | Filters your vouched places by plan |
| Place catalog | Real editorial copy for 6 Indian cities (not user-generated reviews) |
| Custom places | You add name/area; stored in your profile |
| PWA | Installable, offline shell |

---

## Intentionally not in v1 (and why)

### 1. Email / phone login
**Why later:** Anonymous auth ships fastest for a friends-only beta. Downside: new browser or cleared data = new account unless you add email.  
**v2:** Magic link or Google sign-in so your Vouch follows you across devices.

### 2. Live friend feed (“see what friends vouched today”)
**Why later:** Needs every friend on cloud with real-time sync or push. Today, friends are **linked** when they join via invite; you **log** their recs manually (or they share their card).  
**v2:** Activity feed from friends’ `public_vouches` updates.

### 3. Automatic friend graph
**Why later:** We record `invite_links` but don’t yet show “Friend X just vouched Y” without them sharing. Manual “log a rec” is the honest MVP for taste transfer.  
**v2:** Subscribe to friends’ public card changes.

### 4. Google Places search
**Why later:** Catalog is curated for quality in beta cities. Custom add covers long tail.  
**v2:** Places API autocomplete + photos.

### 5. Photos you took
**Why later:** Storage, moderation, and rights. Catalog uses licensed stock images.  
**v2:** Upload per vouch (Supabase Storage).

### 6. Ratings, reviews, follower counts
**Why later:** That’s Yelp, not Vouch. Product promise is **trusted names**, not crowdsourced stars.  
**Not planned** as core mechanic.

### 7. In-app messaging / asking friends
**Why later:** WhatsApp is the actual channel in India; we lean into share sheets instead of rebuilding chat.  
**v2 maybe:** “Ask [friend] for a date spot” deep link only.

### 8. Multi-city catalogs per user
**Why later:** Onboarding picks one home city; catalog filters to it.  
**v2:** Multiple cities on one profile.

### 9. Moderation / reporting
**Why later:** Closed beta with people you know.  
**Before public launch:** Report profile, block handle.

### 10. Native iOS / Android apps
**Why later:** PWA is enough to validate daily use with 10–50 people.  
**v2:** Wrapper or React Native if retention proves out.

---

## Known rough edges (honest)

- **Same person, two browsers** = two accounts (until email auth).
- **Manual friends** (name only) don’t have a live card until they join with your invite link.
- **Public save** on someone’s card is session-only until you make your own Vouch (saved IDs aren’t migrated yet).
- **Hash links** (`#v=...`) still work offline but don’t update when you edit your Top 4 — use `?u=handle` links when cloud is on.

---

## Recommended beta scope

**Good for:** 10 friends in one city, WhatsApp invite loop, building your Top 4, logging recs to each other, planning nights out from your own vouches.

**Not yet for:** Public launch, strangers discovering you, replacing Google Maps, or daily use without ever sharing your link once.
