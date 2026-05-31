# The Vouch Constitution

> **Vouch is not a restaurant app. It is a trust layer for taste.**
> Know where to go because the right person already put their name on it.

This is the product's north star — the rules we write down *before* we build, to
keep every screen from drifting toward the generic ("feed + search + profile +
bookmarks"). When a decision is ambiguous, **this document wins.** It sits beside
the design system (`docs/design-system/`) and governs it.

Audience for this doc: anyone (human or AI) building Vouch. Read it before you
open a file.

---

## 0. The bet

- **Positioning.** Primarily a **trusted decision network** ("borrow the taste of
  people you trust") **+ a decision tool for tonight** ("where do I go now?").
  A personal taste library is a *supporting* behavior, never the spine.
- **"Letterboxd for restaurants"** is external shorthand only. Internally it is
  banned — it pulls us into generic social-review behavior (feeds, ratings, likes).
- **The real risks are not design.** They are (1) a **weak loop** — no strong,
  repeated reason to add/check/share/return — and (2) **cold start** — a trust
  network is worthless empty. Everything below serves those two.
- **City + scope.** Bengaluru only. Invite-only. Real product (Next.js 15 +
  Supabase + Google Places), mobile-first web.

---

## 1. What a vouch is

> **One place · one line · one name · one occasion.** A *stamp*, not a review.
> The only "review" allowed to exist here.

**The integrity rule (the soul of the product):**
> If you wouldn't put your name on it, it's a **Save** — not a **Vouch**.

A Vouch **requires** a one-line reason **and** at least one occasion. This is
enforced in the **data layer** (`reason` NOT NULL when `stamp = 'vouched'`), not
just in the UI. A vouch with no reason cannot exist.

**The three stamps** — a vouch's state:
| Stamp | Meaning | Carries a public name? |
|---|---|---|
| **Want to go** | Saved for the night you're nearby | no |
| **Been** | Logged & dated — your diary of the city | no |
| **Vouched** | You'd stake your name on it | **yes — the currency** |

Not every visit becomes a vouch. That restraint is what protects quality. After
someone marks **Been**, we *ask* — gently — "would you put your name on it?"

---

## 2. What Vouch never does

- **No star ratings / scores out of five.** Ever. They destroy the point.
- **No anonymous tiles.** Every surfaced place shows *who* and *why it reached you*.
- **No generic explore page. No scroll-feed.** (A weak feed makes the app feel
  dead; volume we don't have.)
- **No comments, no likes, no DMs.** They pull toward social media, not taste.
- **No map-first UI.** Maps appear where context helps; they are not the product
  (that's Google Maps with nicer branding).
- **No long-review forms, no required photos, no 12-field add flow.** Every extra
  field kills supply.
- **No AI-generated guides as the main thing.** AI may assist; the moat is *human
  taste + the trust graph*.
- **No broad public launch.** Grow in dense cells (areas / occasions).
- **No vanity.** "Trending", "top rated near you", follower counts as a hero
  metric — banned.

---

## 3. The Receipt (trust is always visible)

Every place, everywhere it appears (home, place page, guide, share card,
notification), shows **why it reached you**:

> **Aditi** vouched it · **Rinkesh** saved it · added to **"Where I take my
> parents"** · *you follow Aditi + Meera*

Most apps show the place. Vouch shows the **chain of trust**. This is the single
feature that keeps us from becoming generic. The Receipt is **system behavior, not
a screen** — and it is **derived** from the graph at query time, never a stored
table.

---

## 4. The six core objects

Build from **objects, rituals, and rules** — never from screens. Use the lexicon
(`docs/design-system/brand.md §5`) precisely in product, code, and copy.

1. **Vouch** — the atomic unit (§1). `{ palate, spot, stamp, reason, occasions[],
   what_to_order?, created_at }`. Renders as a stamped card, not a post.
2. **Palate** — a person **and** their taste; the **follow target** (you follow
   *palates*, not users). The page is a **taste map**, not a profile: what they
   know, **when to trust them**, their guides, repeat spots, strongest occasions
   (their "parent-safe", "late-night", "worth crossing town for"). No
   bio/followers/posts chrome.
3. **Guide** — an **authored**, named, point-of-view collection of vouches by one
   palate. Occasion/identity titles ("Where I take my parents", "Open past midnight
   and actually worth it", "First date without cringe"), **never taxonomy** ("Best
   in Indiranagar"). The most shareable object.
4. **Receipt** — the trust trail (§3). Present everywhere or the surface is wrong.
5. **Occasion** — first-class, a **controlled vocabulary** (not free tags). Life
   moments, not cuisines. Canonical starting set (~10): **parents · late-night ·
   date · solo-lunch · coffee · group-dinner · worth-the-drive · rainy-day ·
   friends-in-town · quiet-to-talk** (+ **veg-safe**). Powers home, the add-flow,
   guides, and (later) search. People think in situations, not taxonomies.
6. **Spot** — a single place worth returning to. Its page **leads with the
   Receipt**, never Google-Maps chrome (photos/address/hours/rating first).

---

## 5. The core loop & repeat-use

**Loop:** follow taste → a place reaches you *with a receipt* → trust the why →
save / been / vouch → vouch back → your guide pulls in people who trust you.

**Vouch is not a daily product. It owns the *decision moment*, not browsing time.**
> Retention target: when a food decision happens, Vouch is remembered **before**
> Google / Zomato / WhatsApp.

Repeat-use is **occasion-triggered** (weekly/monthly), never generic notification
spam:
- **Friday decision** — "5 places your people vouched, *open tonight, near you*."
- **Saved-but-not-visited** — "You saved 3 near Church St. Going this week?"
- **After-Been** — "Would you put your name on it?" (respects the stamp hierarchy).
- **Creator social-proof** — "4 people used your *parents* guide this week" (tied to
  *utility*, not likes).
- **Area-based** — "6 vouched spots near you" (used sparingly).

**Distribution = shareable artifacts, not an in-app feed.** Build the vouch card,
guide card, palate page, "my Bengaluru map" — designed to **win a group chat** and
to be shared on WhatsApp / IG / X. Share copy: *"Rinkesh vouched for 12 places in
Bengaluru — borrow his palate,"* **never** *"Join Vouch."* Each shared object is
invite-gated but still useful.

**Acquisition loops:** Borrow my palate · Group-chat rescue (the card that ends the
"where do we eat?" thread) · Guide as identity · Queue-jump through *quality*
(vouch −11 · guide −25 · trusted invite −40 · your vouch saved by 3 → −20; don't
over-reward empty invites — they bring the wrong people).

---

## 6. Cold start — the Founding Palates program (supply-first)

Launch as **"Vouch Bengaluru · Founding Palates,"** not an open social app.

- Hand-recruit **50–100 high-*trust* people** — the friends others already text for
  food. **Micro-trust > macro-reach**; avoid influencers (reach, low trust). Seed
  across types: founders, designers, coffee people, late-night people, veg experts,
  area locals, "where to take parents/date" opinion-holders.
- Ask each for **10–20 vouches + 1 proud guide**, framed as *"places you'd put your
  name behind,"* **not** "review restaurants." → **500–2,000 quality vouches**
  before a single open user. This is **real curation, not fake demo data.**
- **Seed around occasions**, not categories.
- **Mandatory first vouch after invite** — "Before you enter, vouch for one place
  you genuinely love." Teaches the product, creates supply, filters for people who
  get the premise. If someone can't name one place they'd vouch for, they may not be
  an early user.
- **The first session must not feel empty.** Onboarding auto-suggests ≥5 founding
  palates matched to the user's areas/occasions; following them populates home
  immediately. (No long quiz up front — the palate quiz is post-invite / footer.)
- **Launch in dense cells** (Indiranagar · Koramangala · coffee · late-night ·
  veg), winning small dense networks before any broad exposure.

**The three early users to serve:** the **Asker** (wants a fast trusted decision),
the **Knower** (wants their taste made visible — the supply engine), the
**Collector** (wants a personal taste memory). Supply comes from Knowers +
Collectors; demand from Askers.

---

## 7. The MVP — four surfaces + one sacred flow

Small but extremely crafted. Nothing else ships first.

1. **Home — "Where should I go?"** Decision support, **not a feed.** Occasion-led
   modes: **Tonight** · Near you · by Occasion · Saved by your people · New from
   people you follow · Borrow a palate. Inputs: time + location + occasion + your
   follow-graph → ranked **trusted** picks, each with a Receipt.
2. **Spot (place) page.** **The Receipt is the hero.** Hierarchy: name → one-line
   verdict(s) from trusted people → who vouched / saved / guided → best occasion →
   what to order / avoid → practical info → your add action. Emotional question:
   *"Can I trust this place for **this** situation?"* — not "is it generally good?"
3. **Palate page.** The taste map (§4): guides, vouched spots, strongest occasions,
   "when to trust this person." Shareable, invite-gated, still readable.
4. **Guide page.** Authored, beautiful public link, "make your own guide" CTA,
   OG-image share card.
5. **Add-vouch flow (sacred — the supply engine).** A **ritual**, not a content
   form: place → stamp (Want / Been / Vouched) → if Vouched: **one-line reason
   (required)** + **occasion(s)** → optional add-to-guide → done. Integrity nudge on
   empty/weak input: *"A vouch needs a reason. Your name is on it."* No photos,
   ratings, or long text. Enrich later.

**Product-native actions** (system behavior, never generic labels): **Vouch · Save
for later · Been · Borrow palate · Add to a guide · Put my name on it.** Keep
critical actions clear — don't over-clever.

**Delight from meaning**, never random motion: the **VOUCHED** stamp landing on a
card; "You're now borrowing **Aditi's** Bengaluru"; "This reached you through
**Meera**"; "Saved for the night you're nearby"; the integrity nudge.

---

## 8. Data model (Supabase)

Real product; RLS on every table. **Auth ↔ palate is 1:1; identity is real-name +
invite** (a vouch carries a name, so anonymity is disallowed at the account level).

| Table | Key fields |
|---|---|
| `palates` | `id, handle, name, avatar_initials, one_liner, home_areas[], occasions_strength jsonb, founding bool, invited_by, created_at` |
| `spots` | `id, name, area, cuisine, price_band, google_place_id, lat, lng, practical jsonb` (hours etc. enriched via Google Places) |
| `vouches` | `id, palate_id, spot_id, stamp ('want'|'been'|'vouched'), reason text, occasions text[], what_to_order text, created_at` — **constraint: `reason` required when `stamp='vouched'`** |
| `guides` | `id, palate_id, title, note, occasions text[], slug, created_at` |
| `guide_items` | `guide_id, spot_id, vouch_id?, rank` |
| `follows` | `follower_palate_id, followee_palate_id` |
| `saves` | `palate_id, spot_id, created_at` (a Save = lightweight want-to-go, no name) |
| `occasions` | controlled lookup/enum (the canonical ~10) |
| `invites` / `waitlist` | `email, position, referred_by, status, founding bool` |
| `decision_events` | append-only metric log: `palate_id, spot_id, type, context, ts` |

**The Receipt is a derived query** (follows × vouches × saves × guide_items) —
never stored.

---

## 9. The one metric

Not signups. Not DAU. Not page views. Not raw vouch count.
> **Useful Decisions Created** — someone discovered a place via Vouch, trusted the
> why, and saved / shared / visited it (or used it to decide with others).

Instrument via `decision_events` (`surfaced · trusted_open · saved_from_rec ·
shared_card · marked_been · visited`). Corroborate manually early: *"Did Vouch help
you decide? Why / why not?"*

---

## 10. The anti-drift gates

Before shipping **any** screen or component, it must pass all four:

1. **Situation.** Does it answer a real user situation ("where do I take my parents
   Sunday?"), not "is this a standard screen"?
2. **Trust visible.** Does it show the Receipt — who, and why it reached me — with
   no anonymous magic?
3. **Better data.** Does it guide the user toward *useful vouches*, not random
   content?
4. **Logo removed.** Strip the wordmark — does it *still* unmistakably feel like
   Vouch (name-backed, trusted, city-specific, warm, opinionated, premium-but-
   usable)? If it'd feel at home in Zomato/Google recolored, it's wrong.

---

## 11. Validation (the 4-week experiment)

- **W1 — supply.** Recruit 30; each gives 10 vouches. Success: ≥20 complete, high
  quality, proud to share their palate. (If people won't do this by hand, the app
  won't fix it.)
- **W2 — demand.** Turn them into palate + guide pages; send to 100 askers. Success:
  they save/share, ask for invites, click *specific guides* (not just admire design).
- **W3 — group-chat utility.** Share cards in real dinner-planning groups. Success:
  the card helps the group decide; "what app is this?"; someone opens the link.
- **W4 — retention.** A weekly "Vouches for this weekend" prompt. Success: repeat
  opens, real visits, and **new vouches submitted after using a rec**.

Throughout: **Useful Decisions Created** trending up.

---

*This Constitution is versioned with the product. Change it deliberately — it is
the thing that keeps Vouch from becoming a beautiful archive people admire once and
forget.*
