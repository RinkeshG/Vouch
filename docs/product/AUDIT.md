# Product Audit — walking the flow as a user

> A PM walkthrough of the built product (landing → onboarding → home → guides →
> palate → spot → share), first-principles, with *why*. What's fixed this pass and
> what's deferred, by lens (tech / design / UX / copy). The bar: when a food
> decision happens, is Vouch the reflex *before* Google/Zomato/WhatsApp (§9)?

## The journey, end to end
`/` landing → request invite → "you're in" → `/start` onboarding (vouch ×3 →
palate reveal → follow palates) → **lands on `/producers-home`** → rail to
`/guides`, `/palate`, and (new) `/spot/[slug]`. Public artifacts: `/g/[slug]`,
`/guide/parents`, `/p/[slug]`.

## Fixed this pass
- **Flow break:** onboarding "Enter Vouch" landed on the rejected `/map`; now lands
  on the real home `/producers-home`. *Why it mattered:* the activation payoff
  pointed at a dead-ended baseline.
- **Honesty (ship-blocking):** the fabricated taste-match `%` (a 58% floor + 48
  offset) was still rendered in onboarding, `/tonight`, `/pulse`. Removed
  everywhere; replaced with the **honest named overlap** ("you both back late-night,
  date"). `matchPct` deleted → `sharedOccasions()`. *Why:* a trust brand cannot
  ship invented social proof — it poisons the one thing we sell.
- **Spot page** built (Receipt-hero) and cross-linked from palate rows + receipt
  names. Honest empty state ("be the first").
- **Nav wired** (Your map / Guides / Your palate) + map tag parameterized.

## Deferred backlog (prioritized, with why)

### P0 — the spine can't be felt without these
- **Supabase / real data.** Everything is in-memory or localStorage; **follows,
  borrows, vouches don't persist or work across people**, so the trust *graph* —
  the entire moat — can't actually form. Borrow/Follow give a toast but the loop
  never closes. *Until this exists, it's a beautiful single-player demo.*
- **Search / Discovery surface (missing).** The rail "Search" is inert. But the
  product's core question is "where do I go?" — you must be able to ask by
  **occasion × area × open-now** and get trusted, receipted answers. This is the
  decide-tonight engine; its absence is the biggest hole in the MVP promise.

### P1 — the built surfaces aren't whole yet
- **Home's primary action is dead.** On `/producers-home`, "Put a name down" does
  nothing (the add-composer lives on the parked `/map`). The home's *one job* —
  add a vouch — must work. (Home is parked by decision; flag loudly for the return.)
- **Spot isn't reachable from where pins live.** Map pins, guide rows, and "just
  landed" don't open the Spot page — only palate rows do. The connective tissue is
  half-wired; a user can't get from "a pin caught my eye" to "the receipt".
- **Add-vouch isn't a first-class flow from everywhere.** The ritual exists
  (composer, onboarding) but there's no single, always-available "＋ Vouch" that
  opens it from any surface.

### P2 — craft & coherence
- **Bespoke vector basemap.** The receded map is a raster+CSS-filter proxy (visible
  tile patchiness). The real Tier-1 is a vector style we control (uniform, our type
  on labels). Worth it only once the map direction is locked.
- **Design-language + voice standard, written down.** The editorial row language +
  one voice now live across guides/palate/spot — but only by hand. Codify it
  (`brand.md` + a components/motion spec) so every new surface inherits it instead
  of re-litigating. Audit landing/onboarding copy against it.
- **Demo-data clash:** the user ("You", RG) and founding palate "Rinkesh" (RG)
  share initials — confusing on Spot/Over-To-You. Rename one in the seed.

### P3
- **Mobile pass** (decided as a separate phase; current surfaces only degrade-stack).
- Minor: `@you` handle renders oddly in caps; add breadcrumbs back from Spot/Palate.

## The honest read
The **objects** are right and on-brand (Vouch, Guide, Palate, Spot, the Receipt),
and the surfaces now share one design + voice. But the **graph is faked** and the
**decision engine (Search/decide-tonight) doesn't exist yet** — so the product can
be *felt* but not yet *used* to win a real decision. The next real leverage is
**backend + Search**, then closing the loop to **action** (see `TEN-X.md`).
