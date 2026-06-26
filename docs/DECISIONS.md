# Hotlist — Decisions Log

The single running reference for every settled decision — product, brand, design, and
technical. **Append, never silently overwrite.** When a decision changes, mark the old
one `SUPERSEDED` (don't delete it — the history is the point) and add the new one.

**Format:** `ID · Category · Status · Date` → the decision, then **why**, then **how it
applies**. Status = `LOCKED` (settled) · `ACTIVE` (in force, may evolve) · `SUPERSEDED`
· `OPEN` (decided to revisit).

Last updated: 2026-06-26.

---

## Product

**P‑001 · Product · LOCKED · 2026-06-26 — What Hotlist is**
Hotlist is a tool to **make your own beautiful, shareable page of recommendations** — your
favourite places, each with your personal take — published at your own link. Think "make
your own [blr.wiki](https://blr.wiki)": blr.wiki is the *output* (one finished guide);
Hotlist lets *anyone* make their version and share it.
**Why:** the strongest, clearest framing the user landed on after rejecting vaguer ones.
The page *is* the product's magic.
**How:** every surface serves "make a page → share it."

**P‑002 · Product · LOCKED · 2026-06-26 — Positioning: taste, not utility**
Hotlist sells **showcasing your taste / status**, never "another list/save app." The user
is *the friend everyone asks where to go*. We convey status + taste by **embodying** them
(craft, restraint, the beauty of the artifact) — **never by claiming them** ("you have
great taste" is banned as copy). The **maker is the hero**; an example guide is *proof*,
not the pitch.
**Why:** a "list tool" is a commodity; "publish your taste" is identity. The user was
explicit: don't be literal, sell it through how it's designed and positioned.
**How:** copy is warm/confident and implicit; the example artifact carries desire.

**P‑003 · Product · ACTIVE · 2026-06-26 — The core loop**
`Create a guide (add places + write your take) → Publish → Share a public link.` The public
shared page is the centre of gravity (it's what spreads).

**P‑004 · Product · ACTIVE · 2026-06-26 — The viral loop is in the artifact**
Every public Hotlist carries a "Make your own →" nav action and a "your turn" close
("made in 4 minutes — your turn"). Distribution is baked into the shared object, not a
separate growth feature.

**P‑005 · Product · ACTIVE · 2026-06-26 — v1 scope**
Single city to start (Bangalore). One guide type (a list of places). No social graph,
no rankings, no gamification in v1. Phases in [ROADMAP.md](./ROADMAP.md).

---

## Brand

**B‑001 · Brand · LOCKED · 2026-06-26 — Name = Hotlist**
The product is **Hotlist**. (Chosen by the user over Plug / Faves / Almanac.) Leans into
flaunt + status — "a list worth showing off."

**B‑002 · Brand · LOCKED · 2026-06-26 — Clean slate, nothing from Vouch**
We borrow **nothing** from the prior "Vouch" work — not the name, design system, copy,
lexicon, fonts, or palette. Hotlist is a wholly new thing. (Vouch's research on *user
emotion* — how people share recs — remains valid input; its *brand/design* does not.)

---

## Design

**D‑001 · Design · LOCKED · 2026-06-26 — Visual direction = "Warm & tactile"**
Cream paper, warm ink, a single terracotta accent, rounded shapes, a hand‑touched feel —
it should read like a personal rec from a friend, not a slick SaaS tool.
**Why:** chosen by the user from four prototyped first folds (Editorial / Bold / Premium‑
minimal / Warm). Warm best fits "personal, mine, generous."
**How:** approachable over corporate; one accent does the work; restraint = craft.

**D‑002 · Design · LOCKED · 2026-06-26 — Typography: DM Sans + Caveat**
**DM Sans** for everything; **Caveat** as a sparing hand‑written accent (a note here and
there). **Fraunces — and any similar warm‑wonky display serif — is banned** (user call).
**How:** type carries the warmth; the hand accent adds personality without childishness.

**D‑003 · Design · ACTIVE · 2026-06-26 — Palette (one accent)**
`--paper #FBF2E4 · --surface #FFFBF3 · --ink #2C2418 · --muted #8A7A63 · --line #EBDDC8 ·
--accent (terracotta) #CB613A`. Plus a dark surface `#2C2418` for the CTA block. **One
accent** — terracotta is the only colour that signals "interact / this matters."

**D‑004 · Design · LOCKED · 2026-06-26 — v1 place cards have NO photos**
Cards are **text‑led** (place name + the opinionated take + category/area + open‑in‑maps).
No photos, no map‑as‑cover.
**Why:** the user's call — "cards look better without photos, at least in v1." blr.wiki
itself is text‑led and gorgeous; it ships with zero image infrastructure.
*Supersedes a brief experiment with photo covers (D‑004a) and map‑crop covers (D‑004b),
both rejected — a map cover "tells you nothing about the place."*
**How:** the **take is the hero** of every card; warmth comes from type + the tint accent.

**D‑005 · Design · RESOLVED · 2026-06-26 — The map must be properly designed (v3‑grade)**
*Built in Phase 4: warmed Positron base (sepia/desaturate + faint terracotta wash), refined
circular glowing terracotta numbered pins (no teardrops), no drawn routes, on-brand zoom,
an elegant selected-place card. `GuideMap` + `lib/geo.ts`. The direction below is what shipped.*
The map is a real feature in a later phase and must look **premium and intentional**, not
childish. Take craft cues from the old Vouch v3 map (a real styled map, refined glowing
pins, elegant restraint) but rebuild for our **warm/light** system.
Hard nos (user): **no dotted route lines**; **not the bright/colourful default tiles**;
nothing that reads as "randomly done."
Direction to pursue: a **muted, refined base** (e.g. a minimal Positron‑style style, lightly
warmed — not colourful Voyager), **refined circular terracotta pins with a soft glow**
(not teardrops), considered framing, an elegant selected‑place card. Decide the exact base
+ pin treatment when we build the map (Phase 4); prototype is explicitly **not** the bar.

**D‑006 · Design · ACTIVE · 2026-06-26 — Craft principles**
Mobile‑first (shared links open on phones). Soft warm shadows. Rounded radii (cards ~20px,
pills for actions). Caveat used sparingly. Every screen one‑handed. No gimmicks.

**D‑007 · Design/Product · ACTIVE · 2026-06-26 — Landing strategy: emotion‑first, sell don't list**
The landing **sells** — it is not a feature brochure. It layers **PAS** (feel the pain fast)
+ **StoryBrand** (the visitor is the hero, Hotlist is the guide) + **show‑don't‑tell** (the
artifact is the hero shot), per a teardown of Linear/Letterboxd/Lapse/Partiful/Family/Things/
Superhuman + Julian Shapiro's hero formula.
**The arc:** recognition hero (*"you're the one everyone asks where to go"*) with the dream
artifact shown → **the pain made vivid** (a dark section + the real *scattered before*: the
`blr-food-FINAL.txt` Note, 47 grey Maps pins, the re‑typed WhatsApp list) → **the payoff**
(the share moment — a friend asks, you send a *link* not a paragraph, "you're the best") →
how (3 beats, *"faster than the text"*) → proof (real Hotlists) → CTA.
**Rules:** lead with feeling, never a feature, above the fold. **Visuals carry the emotion**
(before/after, the share moment) — not paragraphs. Copy is **specific** ("47 grey pins") and
**implies status, never claims it** (Letterboxd's *"your life in film"*, never "you have
taste"). No braggy lines.
**Why:** the first, feature‑led landing was "basic, zero effort, didn't show the pain or
make the user feel why." *(Supersedes that v1 landing.)*
**How:** every future landing edit must preserve **the feeling‑first, show‑don't‑tell
discipline** (the *specific* section list above — the mess / fake‑WhatsApp payoff / icon
step‑cards / plain example cards — is **SUPERSEDED by D‑008**; the strategy is not).

**D‑008 · Design · ACTIVE · 2026-06-26 — The product is the throughline (no mockups)**
The landing is built from **one product‑led visual language**: a single real Hotlist card
(curator + the takes) reused in *every* section, so the page reads as one product — never a
parade of mockups. **The arc:** hero (the real shared product, with the map) → **the
contrast** (the same places *drained & anonymous* "everywhere else" — a grey Saved‑places
list, no notes, shared with no one — vs *alive, named, voiced* "on Hotlist") → **the
gallery** (a living, slowly‑drifting wall of real Hotlists, each in its own accent — the
centrepiece; proof + desire + status by company kept) → **the finale** (the *dream*: a
beautiful finished page, then *"now go make the good one"* + the ask).
**Why:** the earlier arc leaned on **generic mockups** (a fake Notes/Maps/WhatsApp "mess",
a fake chat "payoff", three icon step‑cards, plain example cards, an empty‑form finale). The
user read them — correctly — as "random, generic, vibe‑coded," and they clashed with the
real‑product hero. **Coherence = the product as throughline + restraint (few, rich moments)
+ real motion** (entrance, pin‑drop, marquee drift, scroll‑reveal). *Supersedes the section
list in D‑007.*
**How:** never introduce a generic/stock mockup — show the real Hotlist card. Every new
section reuses the shared card component. Keep to a handful of designed moments, not a
feature list. Headline sizing: section `h2` sits **below** the hero `h1` in scale (≤2.7rem)
so hierarchy holds; container `max-width` for centred headlines must be in `rem`/`px`, never
`ch` (which mis‑evaluates against the container's own 16px font, not the headline).

**D‑009 · Design/Product · ACTIVE · 2026-06-26 — The landing is a STORY, not a feature list**
Grounded in a teardown of the closest analogs — **Letterboxd, Beli, Partiful, Linktree**
(scraped) + a builder POV (Gamma via Lenny):
- **Taste products sell joy + identity, not agitated pain.** *None* of these run a dark
  "here's your problem" section. → **kills the dark pain / grey‑contrast sections** as the
  wrong genre. (User's explicit call: light + positive tension only.)
- **Status is implied through real, specific examples — never claimed** (Letterboxd "share
  your life in film"; lists with personality; Linktree's wall of real famous users).
- **Lead with the product, shown alive** (Beli screenshots; Letterboxd's live "Just
  reviewed" feed). **The spine is a rhythmic triad of identity‑actions** (Letterboxd
  Track/Save/Tell; Beli Track/Share/Discover).
**The Hotlist arc — each beat a designed product moment, never a paragraph:**
1. *You're already this person* — "you're the one everyone asks" + the real page (hero).
2. *The take is what makes a place yours* — one place: cold public facts (rating, 12,803
   reviews) vs your **handwritten** take. Shows the core value; positive, not a guilt‑trip.
3. *You send a place, not a paragraph* — the link **unfurls** into a page inside a minimal
   chat; they keep it. (The payoff — the one beat the user said the prior version got right.)
4. *You're in good company* — the drifting wall of real Hotlists (status by association).
5. *Your turn* — claim `hotlist.to/yourname` + CTA.
**Why:** user: "there's no narrative, no story, no arc… same hero / problem / example / how."
A *story* (identity → the magic → the payoff → status → the call) replaces the template.
*Supersedes the D‑008 section list (contrast / gallery / dream); D‑008's "product is the
throughline + restraint + motion" principle still holds.*
**How:** every beat communicates through a designed visual (the product), not body copy; keep
the arc; **no dark‑pain section**; status stays implied; lead with joy/identity.

**D‑010 · Design · ACTIVE · 2026-06-26 — Editorial city‑zine redesign (current landing)**
From a full creative brief ("premium, warm, social, food‑native; kill the beige; strong
hierarchy, contrast, rhythm; real product moments; delight details"). Evolves the system:
- **Palette (extends D‑003):** cream + terracotta stay; add a full‑bleed **espresso band**
  `#221A12` (used on *The Send* + *Claim* — two dark bands frame the cream middle = the
  rhythm/contrast the page lacked); a **personality‑accent set** (olive/ochre/teal/plum/
  brick/indigo) so no two cards are twins; a highlighter `#F4C84B` (sticky notes).
- **Type (extends D‑002):** DM Sans pushed big (hero ~4.7rem); **DM Mono** added for stamps /
  labels / counters (the zine/ticket texture); **Caveat now carries every take** (handwritten
  = the human voice = the value). Fraunces still banned.
- **Texture:** subtle paper grain + long shadows.
- **Structure (6 beats, refines D‑009):** Hero (real shareable page + props — sister's sticky
  note, BENGALURU stamp, `sent 14×`, `updated 2d`) → **The Send** (espresso; DM pile‑up → the
  link unfurls → "saving this forever" — the signature moment) → **The Loop** (add / *say why*
  [emphasized] / send, as connected product fragments, not an icon grid) → **Taste Identity**
  (opinionated named lists — *"Safe orders when the menu's a minefield"* — the desire trigger)
  → **Gallery** (distinct pages + `sent N×` receipts + friend notes) → **Claim** (espresso;
  claim `hotlist.to/yourname` ✓ available).
- **Mobile:** hero props hidden, loop stacks vertical, **sticky bottom "Make yours" bar**.
**Why:** prior page was "too beige, too static, too obvious — explains the idea but doesn't
make you want one." Grounded in the D‑009 teardown (Letterboxd / Beli / Partiful / Linktree).
*Supersedes the flat warm‑only landing; the public product page should adopt the same
evolution (espresso accents, mono stamps, handwritten takes).*
**How:** lead with joy/identity; the take is handwritten everywhere; espresso bands for
rhythm; mono stamps + `sent N×` receipts for the lived‑in zine feel; status implied via real
examples + counts. New tokens live in `globals.css` (`--espresso`, `--a-*`, `--font-mono`).

---

## Technical

**T‑001 · Tech · ACTIVE · 2026-06-26 — Stack & branch**
Next.js (App Router) on the existing scaffold; work lives on branch **`hotlist`**.
`turbopack.root` pinned in `next.config.ts` (multiple lockfiles otherwise mis‑infer root).

**T‑002 · Tech · ACTIVE · 2026-06-26 — Fonts via `next/font`**
DM Sans + Caveat loaded with `next/font/google` (self‑hosted, no layout shift), exposed as
`--font-sans` / `--font-hand`.

**T‑003 · Tech · OPEN · 2026-06-26 — Map library**
Leaflet (CDN/npm) used in prototype; final choice (Leaflet vs MapLibre vector) deferred to
the map phase, driven by the look D‑005 demands.

---

## Reference / superseded

- The four landing first‑fold prototypes and the warm public‑page/kit/map prototypes live
  under `src/app/proto/*` — **reference only**, to be replaced by the real, documented build.
- All prior "Vouch" landing/app code (`src/app/_landing`, `src/app/(vouch)`, the dark
  "After Dark" + warm "coffee" systems) is **legacy** and slated for removal (ROADMAP Phase 0).

## Open questions (to resolve, with the deciding phase)

- O‑1 — Final map base style + pin treatment (Phase 4). See D‑005.
- O‑2 — Auth model for publishing (anonymous + claim, or sign‑in first?) (Phase 3).
- O‑3 — How places are added: Google Places search vs manual vs paste‑a‑link (Phase 2).
- O‑4 — Do photos ever return (curator‑uploaded), and when? (Post‑v1.)
- O‑5 — The `hotlist.to/<handle>` URL scheme + handle claiming (Phase 3).
