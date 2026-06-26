# Reference Teardowns — workcafes.in & blr.wiki

> Two shipped products in our exact space (Bengaluru, place curation, Google as the
> source of truth). Studied first-hand on **desktop and mobile** on 2026-06-26
> (rendered + interacted with, not just read). This doc is the "what to actually learn"
> — not a feature list, the underlying principles.

---

## 0. The lesson that matters more than the design

The reason these two sites are worth studying is **not** that they're prettier than what
we have. They aren't. workcafes.in is, visually, fairly plain.

They are worth studying because **they exist, work end-to-end, and a stranger can use them
right now.** They are products. Ours is a permanent prototype because we keep re-polishing
surfaces of an experience that has no working spine.

Both sites win by making one ruthless decision we have refused to make:

> **Own the curation. Rent the infrastructure.**

Neither built a maps engine, a places database, a photo pipeline, opening-hours logic,
reviews, or directions. All of that is **deep-linked to Google.** What they built — the
*only* thing they built — is the thin layer Google doesn't have: **judgment, intent-framing,
and honesty.** That layer is small enough to ship in days. We have been trying to build the
whole iceberg before launching the tip that is the actual product.

**If you take one thing from this doc:** the curation layer *alone* — a fast, filterable,
opinionated, shareable list of places that links out to Google for everything else — is a
complete, shippable product. Build that. Stop polishing the thing around it.

---

## 1. Why these two, and how they differ

Both answer the same human job: *"There are too many places and I don't trust the noise —
just tell me where to go."* Google Maps has all the data and none of the opinion. Both
products are **pure opinion layers on top of Google.**

They sit at two ends of one spectrum, and we want the lessons from **both ends**:

|                     | **workcafes.in**                              | **blr.wiki**                                  |
| ------------------- | --------------------------------------------- | --------------------------------------------- |
| Shape               | Structured **database** / directory           | Curated **editorial list**                    |
| Judgment axis       | One intent, deep: *"can I work here?"*         | Personal taste, broad: *"a local's picks"*    |
| Per-place depth     | Rich detail page (work facts, busy times)     | One line. No detail page at all.              |
| Images              | Photo-led cards + galleries                   | **Zero images.** Pure type.                   |
| "Backend"           | Google Places + owner calls + reviews, distilled | Google Maps deep links, full stop          |
| Feels               | Functional, a little busy, *trustworthy*       | Calm, designed, *tasteful*                    |
| Build cost          | Medium (real data model)                      | Tiny (a styled list of links)                 |

workcafes = **how to distill.** blr.wiki = **how little you can ship and still be great.**
Our thesis lives between them: blr.wiki's shippability with a sliver of workcafes' distillation.

---

## 2. workcafes.in — distilling noise into one trustworthy answer

**Positioning (verbatim):** *"Find a cafe you can actually [work] in."* — the verb animates
(study / work / build), which is the entire delight budget: one rotating word that signals
range without a gimmick. Subhead of the value prop: *"Stop hunting from Google Maps."*

That's the whole insight: it's not a cafe directory, it's a **replacement for the act of
digging through Google reviews** to answer one question.

### IA (mobile = app shell)
- **Top:** stacked wordmark, a city pill (`Bengaluru ▾`), hamburger.
- **Hero:** one giant search field + a literal *"Tap to start"* nudge.
- **Editorial rails** ("Our picks") — horizontal-scroll shelves with human names, not filters:
  `Best for work` · `Cheapest good coffee` · `Hidden gems` · `Built for deep focus`. Each rail
  has its own icon and a `View all`. The next card always peeks off-screen — the scroll
  affordance is built into the layout, no arrows needed.
- **Browse by area** — chips with counts (`Indiranagar 34`, `JP Nagar 31` … `+11 more`).
- **Value prop** — *Only the workable ones · The facts that matter · Straight from real reviews.*
- **FAQ** accordion → footer (Explore / Community / About / Follow).
- **Bottom tab bar (fixed):** `Explore · Saved · Compare`. Three literal tabs. It behaves like a
  native app, not a website. This is the single biggest "feels shipped" move.

### The card (the atomic unit) — everything answerable at a glance
Photo · quality badge (`Top Work Cafe` / `Solid for Work` — a **2-tier rating in plain
English**, no stars-out-of-5 to decode) · name · area · **live** open status (`Closed · opens
6:30 AM`) · a **one-line human verdict** ("Wi-Fi, plugs and long laptop sessions are
confirmed") · and a **single comparable price anchor: `₹237 cappuccino`.** That price is the
quiet masterstroke — one universal unit lets you compare any two cafes instantly, the way a
Big Mac index works. No menus, no ranges.

### The detail page — a clinic in distillation (`/cafe/{google_place_id}`)
This is where the product's whole philosophy is visible. Every generic Google signal is
**re-framed around the one intent**:

- Photo gallery + `Top Work Cafe` badge, rating `4.6 (594)`, `Call the cafe` (tel: link).
- Three plain-language callouts: **`Cafe-verified` — "the cafe confirmed its work details with
  us"** (they literally phoned the owner — trust as a feature), `Quiet, focused room`,
  `Open late — till 1:30 AM, good for night work`.
- A short, human paragraph that ends with **`Catch: music can be loud at times.`** — it
  volunteers the downside. Honesty is the product.
- Two price cards (`Cappuccino ₹237`, `Cold coffee ₹265`).
- **"What it's like to work here":** Wi-Fi `Yes`, Power outlets `Plenty`, Seating `Spacious`…
  the messy reality reduced to a scannable spec sheet.
- **`Worth knowing`** (amber): the catch, flagged again, *"· from reviews"*.
- **Busy times** = Google Popular Times **re-labelled for the work use-case**: *"Quietest around
  6 AM on weekdays."* Same data Google has, recast as the answer the user actually wants.
- **`How we know: Google · Owner call · Reviews`** + *"Something off? Report a discrepancy"*
  (a Google Form). Provenance shown; correction crowdsourced. No CMS built.

**Compare** (`/compare`): "Compare two cafes head-to-head — Work Score, price, wifi, plugs and
quiet, side by side." The whole product is engineered so a place collapses to a tiny comparable
vector `{score, price, wifi, plugs, quiet}`. *That* is why comparison is even possible.

### What to steal
1. **Reduce a place to the 3–5 facts the intent cares about, and one comparable number.**
2. **Plain-language tiers** (`Top` / `Solid`) beat numeric scores for glanceability.
3. **Volunteer the catch.** The flaw, stated, buys more trust than five upsides.
4. **Re-label borrowed data for your intent** (Popular Times → "quietest at 6am").
5. **Mobile = app shell** (fixed bottom tabs), not a stretched webpage.

---

## 3. blr.wiki — the shareable artifact, stripped to nothing but taste

**This is the one we keep saying we want to build** — except blr.wiki is the *output* (one
finished guide); our thesis is the *tool* that lets anyone generate one and get a public link.
So study it as **"what the published page should feel like."**

**Positioning (verbatim):** *"a local's guide to falling in love with bengaluru."* Lowercase,
warm, first-person. Not a utility — a love letter with links.

### IA — one long, fast, single page
- Header: tiny logo + `blr.wiki` + the one-line tagline. That's it.
- **Filter pills** (horizontal scroll, with counts): `All (97)` · `OG Spots (13)` · `Dosas and
  Darshinis (6)` · `Gourmet (27)` · `Coffee (16)` · `Sweet Tooth (12)` · `Pints (4)` ·
  `Date Plans (7)` · `Things to Do (12)`. Counts double as a confidence signal.
- **`OG Lists`** — named contributor lists: `Mehul's BLR (13)`, `Arpan's coffee (72)`,
  `Ajit's Thindies List ↗`, `Ishaan Preet's list ↗`. **Some hosted on-site, some are just
  external Google Maps list links.** This is the multi-author / personal-list model in the
  wild — and it's exactly our `lists` concept. Note they didn't even build hosting for all of
  them; a couple are raw Maps links. Ship first, formalize later.
- **Sections** = categories, each with a witty one-line intro that does the editorial work:
  *OG Spots — "the institutions. eating here is a rite of passage."* ·
  *Gourmet — "for when you want to dress up a little."* ·
  *Date Plans — "places that do half the talking for you."*

### The card — text only, and better for it
Name · star rating (only when it exists) · `Type · Area` (`Vegetarian restaurant · Indiranagar`)
· **one opinionated lowercase line** ("idli so soft it feels illegal. standing room only.") ·
`Google Maps ↗` · optional contributor credit (`@ItsAllDandy_`). **No photo. No detail page.
No hours. No price.** The Maps link carries all of that — for free, always up to date.

### Layout
- **Desktop:** classic **list + map split** (list left, live map right) — and the empty/no-WebGL
  state still degrades gracefully: *"The map needs WebGL… The list on the left still has
  everything."*
- **Mobile:** **list-first, map hidden behind `Show map`.** The phone gets a clean vertical
  scroll of generously-spaced cards that loads instantly *because there are no images.*

### Why it looks more "designed" than ours while doing far less
Restraint, not features. One typeface, one warm paper background, one accent dot, lots of
whitespace, one perfectly consistent card. **There is nothing to get wrong.** "Looks designed"
= coherent + restrained. Our prototypes look unfinished because they're *broad and
inconsistent*, not because they lack polish. (Ties to our own note: *fresh design = new
structure, not a recolor* — blr.wiki's design IS its structure.)

### What to steal
1. **Maps deep-link as the entire backend.** No detail page, no photo store, no hours table.
2. **One opinionated line per place** does more than ten metadata fields.
3. **Category as occasion** ("Date Plans", "when you want to dress up"), not taxonomy.
4. **Counts everywhere** as cheap confidence.
5. **Named lists / contributors** = the personal, shareable, multi-author primitive.
6. **No images is a feature** on mobile: instant load, nothing to misalign, taste stays the focus.

---

## 4. First principles for our mobile-web, shareable product

The user's emphasis was *mobile* and *simplicity*. From both teardowns:

1. **The shareable link IS the product, and it opens cold on a phone.** People tap these from
   WhatsApp/Instagram, logged out, on mobile data. Therefore: **no auth wall to view**, instant
   first paint, a real OG image, and full usefulness on the very first screen. Optimize the
   *received* experience before the *creating* one.
2. **The card must be self-sufficient.** Verdict + the 1–3 facts that matter + one action, all
   answerable without a tap. A detail page is a *luxury*, not a requirement (blr.wiki proves it).
3. **One screen, one scroll.** Vertical list with sectioning. Map is *on-demand*, never the
   default on mobile. Horizontal rails only earn their place if cards are rich (workcafes) —
   for a text list, plain vertical wins.
4. **Pick one comparable unit** (workcafes: cappuccino price). It makes glance-comparison and a
   future "compare" view possible for nearly free.
5. **Literal labels, counts, plain-language tiers.** `Explore / Saved / Compare`, `All (97)`,
   `Top / Solid`. No clever names for nav. (Already our house style — these confirm it.)
6. **Honesty as delight.** The single most memorable beat in either site is workcafes' `Catch:`.
   That's the subtle, meaning-derived delight we want — not confetti.
7. **Borrow Google's data, relabel it for the intent.** Don't out-build Google; out-*frame* it.

---

## 5. What this means for us (the ruthless cut)

Map of the two thesis halves:
- **blr.wiki = what a published Vouch guide should look/feel like** (the public link).
- **workcafes.in = how deep a single place card can get** *if and only if* we want that later.

**The MVP is the blr.wiki half, in our design language.** Concretely, a shippable Vouch v0.1
is:

- **Create:** a user adds places (paste a Google Maps link / search → we resolve name, type,
  area, rating, the Maps URL), types **one line** of why, drops each into a **section**.
- **Publish:** it becomes a **public, no-login URL** with an OG image.
- **View:** that URL renders as a fast, filterable, vertical, image-optional list of cards that
  deep-link to Google for maps/hours/photos/directions. Mobile-first, app-shell chrome.
- **That's the whole loop.** `Saved`, `Compare`, rich `/place` detail pages, busy-times,
  owner-verification — **all of it is Phase 2+,** and workcafes shows we can add them later
  without rework because each is just more fields on an already-shipped card.

**Explicitly cut for v0.1 (this is the part that breaks the polish loop):**
- ❌ No bespoke detail pages — the Maps link is the detail page.
- ❌ No photo pipeline — text cards ship today and look *more* designed.
- ❌ No hours/price/wifi data model — borrow from Google or skip.
- ❌ No new design-system components until the create→publish→view loop works end-to-end with
  ugly defaults. **Working-and-plain beats beautiful-and-broken.** Re-skin a *working* spine.

### The anti-pattern to kill
We have been treating *polish* as *progress*. Both references prove the opposite: they shipped
plain, and usefulness made them feel finished. The order is **spine → ship → skin**, never
**skin → re-skin → re-skin.** Next unit of work should be a *complete loop a stranger can use*,
even if it's the ugliest version of it — then, and only then, bring our design language to a
thing that already works.
