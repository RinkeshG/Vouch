# Vouch Landing — Design (v3 system, artifact-led)

First-principles design for the landing, built on the **v3 design system** (warm-dark,
golden-amber, Hanken Grotesk, cover-led cards) and the locked positioning. Not the
existing v3 *map-journey* landing — a different execution of the same product truth.
Design-first: this is the whole page on paper before a line of the real build.

---

## 0. The one first-principles decision

The product's magic is **the artifact** — a guide that's *personal* (your voice),
*owned* (your name), and *beautiful enough to send*. The existing v3 landing leads
with a WebGL city map; the team's own DESIGN-DIRECTION flags that the map **upstages
the product** ("a gorgeous interactive map is a different product than make-and-send-a-
guide") and **tanks mobile first-paint** on Indian data.

> **So the guide artifact is the hero — not the map.** The map survives exactly where
> it earns its place: as the **cover texture inside each card** (the v3 cover-led card
> already crops a real map tile per place). Lighter, faster on a phone, mobile-first —
> and the *product* never leaves the frame.

## 1. The one idea everything ladders to

**"A recommendation with a name on it."**
- The artifact you make = a **guide**.
- The voiced note + name on each place = a **vouch**.
- The hero = **you** (the maker). The example (Priya's Bengaluru) = **proof**.

## 2. The funnel (the job, in order)

Attention → Comprehension (5s) → Desire → Trust → Action → Share. A reachable CTA the
whole way down, and an *earned* finale. Mobile-first; fast first paint.

---

## 3. The spine (the whole page)

**Nav** — wordmark `Vouch` + one amber `Make yours`. Always reachable. Mobile: a slim
persistent `make yours →` pill rides a corner (you can convert from anywhere).

### 1 · HERO — understood in 5 seconds, and wanted
- **Job:** comprehension + desire + a reachable action, all above the fold.
- **Copy:**
  - eyebrow (amber): `a recommendation with a name on it`
  - headline: **`The places you'd actually send someone.`**
  - sub: `Make a guide to the spots you love — in your words, your name on each one. The answer to "where should I go?", made once, worth sending.`
  - primary: `Make yours — free, 2 min` · ghost: `see a real one ↓`
  - microline: `free · two minutes · your name on every pick`
- **Visual:** the hero object *is a real guide* — a curator header (monogram `P` · Priya
  · *filter-coffee evangelist* · Bengaluru) above two **cover-led cards** (real map-crop
  cover, amber pin, place name in Hanken, the *italic voiced note*). Slightly overlapped,
  like a thing you'd hold and send. A soft amber bloom behind it; film grain over all.
- **Motion:** the **warm-up** (amber bloom + breath) on load; cards rise in (`v3-rise`,
  staggered); the top card's pin warms up. Reduced-motion → static, full.
- **Mobile:** headline → sub → CTA → the artifact (one card full, the next peeking).

### 2 · THE UNIT — why it isn't a saved pin (anatomy of a vouch)
- **Job:** kill the "this is just a Google list" reaction (positioning's #1 risk) by
  *showing* the difference.
- **Copy:** eyebrow `the unit` · headline **`Not a saved pin. A vouch.`** · sub `A place,
  your reason, your name — together. That's the difference between a Google list and a
  guide someone actually keeps.`
- **Visual:** ONE cover-led card, large, with three quiet annotations to its parts —
  the cover → *"where it is"* · the italic line → *"your words — why you'd send them"* ·
  the name → *"your name — a recommendation, not a rating."*
- **Motion:** the card **assembles once** — cover settles, the line types in (caret), the
  name lands. (Animate the value prop, not just show the artifact.) Three calm beats.

### 3 · SEE ONE — the real guide (proof + warmth)
- **Job:** let them *feel receiving* a guide; prove the notes are real — specificity is
  the trust.
- **Copy:** eyebrow `see a real one` · headline **`This is a guide.`** · sub `Priya's
  Bengaluru — the spots she'd actually take you, in her voice. (The notes are real.
  That's the whole point.)` · persistent tag `a guide · Bengaluru · by Priya`
- **Visual:** 3–4 cover-led cards in the guide's rhythm (one wide *feature*, then two
  tighter — variable density, not a uniform grid). The voiced notes carry it ("best
  filter kaapi in town, macha — by two, cash only"). Map-crop covers = real place texture.
- **Motion:** rise-in on scroll; hover lift `-4px` + cover Ken-Burns (`scale 1.05`).

### 4 · MAKE ONE — the making, shown (is it hard? no)
- **Job:** make "*you* make this" legible; answer "is this a lot of work?" → two minutes.
- **Copy:** eyebrow `the making` · headline **`Add a place. Say why. That's a guide.`** ·
  sub `Search a spot, write one line, drop your name. No design, no fuss — two minutes,
  and it's yours to send.`
- **Visual:** an *illustrative* build (never a fake clicky UI) — empty card → a pin drops
  and warms → a note writes in → `by you` settles → it's a card. Three light beats; the
  sample note reads as *anyone's* ("the corner table — order what they're known for").
- **Motion:** the same warm-up grammar, flipped from *her* to *you*.

### 5 · SHARE IT WITH THE WORLD — distribution + proof
- **Job:** make the *share* half tangible (it's literally half the product's sentence);
  prove real people do this (the weakest asset today); end the one-person-POV.
- **Copy:** eyebrow `share it` · headline **`Guides people have shared with the world.`**
  · sub `Cities, neighbourhoods, the things they know by heart.` → settles on a dark gap:
  **`Yours is the one that's missing.`**
- **Visual:** a warm wall of real published guides as mini cover-led cards — Priya ·
  Bengaluru, Arjun · Goa, Meera · Lisbon, "filter-coffee in Bangalore", "where to swim in
  Goa" — real people + places. One slot left **dark** (yours).
- **Honest dependency:** needs ~6–10 *real* seed guides (never fabricated names). Until
  seeded, this beat is hollow — a content prerequisite, flagged, not faked.

### 6 · THE CLOSE — make yours (the earned finale)
- **Copy:** eyebrow `that's a vouch.` · headline **`Now make yours.`** · sub `Your spots,
  your words, your name on them — the guide you'd actually send. Two minutes, free.` ·
  primary `Make yours →` · ghost `send a guide to a friend ↗`
- **Visual:** the amber at its warmest — the warm-up bloom; the **dark slot from §5
  becomes your blank guide** (empty-state as invitation).

**Footer** — wordmark · `Made in Bengaluru`. Minimal.

---

## 4. The four signatures (logo-off recognizable)

- **Object:** the cover-led **vouch card** (map-crop cover + amber pin + voiced italic
  note + name). Owned the way Things owns its checkbox.
- **Motion:** the **warm-up** — amber bloom + breath — reused at load, as the unit
  assembles, and at the close.
- **Voice:** a *named* person + Bengaluru texture (filter kaapi, by two, 7am, cash only).
- **Moment:** *"Yours is the one that's missing." → "Now make yours."*

## 5. Craft / system fidelity

Warm near-black `#14110B` + **one** amber `#E6A23E`; Hanken Grotesk; earthy category
tints on covers; film grain (`.045`); soft warm shadows; calm earned motion
(`cubic-bezier(.2,.7,.2,1)`); 8px grid; generous space. Mobile-first; fast first paint
(static cover tiles, no WebGL). **No** stamps, mono, ledger rows, ticker, or gimmicks.
Fewer, deeper moments at Linear/Apple craft.

## 6. What I deliberately did NOT do (vs the existing v3 landing)

- **No** WebGL/Leaflet city flythrough — it upstages the product and kills mobile
  first-paint. The map lives *inside* the cards as cover texture.
- **No** "tour a stranger's city" as 90% of the page — the example is one proof beat.
- The **maker is the hero from the first line**; *make* and *share* are shown, not stated.

---

## 7. Build plan (after this design is signed off)

1. Port the v3 system into this worktree: `theme.css` (scoped `.v3`), `kit.tsx`
   (Eyebrow/Title/Lede/Button/Chip/Monogram/Curator/Media/PlaceCard/SaveHeart), Hanken
   via `next/font`. Keep it self-contained so it can't collide with the legacy theme.
2. Build the landing from the kit, section by section, mobile-first.
3. Seed ~6–10 honest guides for §3 + §5 (real places, real notes; team/friends as authors).
4. Verify on a phone viewport + reduced-motion + slow first paint; screenshot.
