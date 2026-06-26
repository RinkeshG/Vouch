# Hotlist — Roadmap

Built in phases. **Each phase ships something real** — no half‑states, no "prototype‑level"
work that can't go live. A phase is done only when its *Done =* criteria are all true and
it's verified in the browser (desktop + mobile). Decisions referenced as `D‑00x` /
`P‑00x` live in [DECISIONS.md](./DECISIONS.md).

Status: ▶ in progress · ☐ not started · ✅ done.

---

## Phase 0 — Foundation & Landing  ▶
The design system as *real* code, plus the marketing landing. The front door.

- ✅ Branch `hotlist`, decisions log, this roadmap.
- ✅ Design system: `globals.css` tokens (D‑003), `next/font` DM Sans + Caveat (D‑002, T‑002),
  base reset, motion tokens.
- ✅ **The landing page** at `/` — hero (shows a real example guide in context) → how it
  works (3 steps) → examples → CTA → footer. Warm (D‑001), text‑led (D‑004), mobile‑first.
  *(Verified: hero rendered; all sections present in DOM.)*
- ☐ Extract the landing's inline bits into a reusable kit (`Button`, `Chip`, `Avatar`,
  `PlaceCard`) — shared with Phase 1 so the public page and landing stay one system.
- ☐ Remove legacy Vouch routes (`_landing`, `(vouch)`) and quarantine `proto/*` out of the
  build.

**Done =** a stranger lands on `/`, instantly gets *"I can make my own shareable guide,"*
sees a real example, and there's a clear CTA — shippable, responsive, accessible.
*(Landing built; kit extraction + legacy cleanup remain.)*

---

## Phase 1 — The public page (read‑only)  ✅
The artifact itself: what someone opens from a shared link.
**JTBD (visitor):** find places I'd actually go, trust the takes, act (directions), and
leave wanting my own. **JTBD (owner):** look generous + tasteful, be useful without retyping.

- ✅ Data layer (`lib/guides.ts`) — `Guide { handle, title, intro, curator, sent, saved,
  minutes, places[] }`, `place { name, area, category, take }`, `mapsUrl()` (Google deep
  link — own the curation, rent the infra), `categoriesOf()`. 8 seeded guides.
- ✅ Public route `/<handle>` — muted map cover + city stamp, curator header (avatar, title,
  intro, `sent/saved/updated` receipts, Share + Save), **sticky category filter**, editorial
  text‑led place list (mono index, handwritten take = hero, one‑tap **Directions**), the
  espresso **"made this in N minutes → make yours"** viral close (P‑004), footer.
- ✅ Mobile‑first; `generateMetadata` (OG/Twitter) + `generateStaticParams`. Share = native
  share → clipboard + toast. *(Verified: desktop + mobile; filter works; per‑curator tints.)*

**Done =** a logged‑out stranger can open a public guide URL and see a beautiful, fast,
mobile‑first page — the thing they'd actually share. ✅
*(Real persistence/sharing across devices = Phase 3; the map cover is decorative until Phase 4.)*

---

## Phase 2 — The builder (create)  ✅
Making a guide. **JTBD:** capture my recommendations fast and watch my page become real —
so it feels like making something, not filling a form.

- ✅ Add a place: typeahead over a seeded Bangalore index (`lib/places.ts`) + free-text
  "Add &lt;name&gt;"; the take input is a **handwritten (Caveat) note**, category select,
  reorder (↑↓), delete. (O‑3: search + manual for now; paste-a-link later.)
- ✅ Two-pane **studio** — editor left, a device-framed **live preview** right that IS the
  public page (reuses `GuideView preview`); tabbed Edit/Preview on mobile.
- ✅ Title + your name + city + intro; live `hotlist.to/<handle>` peek; localStorage draft
  (`lib/draft.ts`, swappable for a backend); Publish enables when there's a name + a place.
  *(Verified desktop + mobile: typeahead, add, take, filter auto-updates, live preview.)*

**Done =** you can build a complete guide and see it render exactly as the public page will. ✅
*(Publish currently saves the draft; a real shareable link is Phase 3.)*

---

## Phase 3 — Publish & share  ☐
Make it real and persistent — the create → publish → share loop, end to end.

- ☐ Auth (O‑2) + persistence (DB), claim a `hotlist.to/<handle>` (O‑5).
- ☐ Publish flow → a real public URL; copy‑link + share sheet; generated OG image.
- ☐ Edit‑after‑publish.

**Done =** a stranger creates a guide, publishes it, and the link genuinely works for
someone else on another device.

---

## Phase 4 — Maps & richness  ☐
The map view, done to a premium bar (D‑005) — not before.

- ☐ Decide base style + pin treatment (O‑1) against the D‑005 look.
- ☐ A real map view of a guide (refined pins, elegant base, **no dotted route**), a
  selected‑place card, on‑brand controls.
- ☐ Per‑place "where it is" map in the detail.

**Done =** the map looks designed and premium on its own, and clearly belongs to Hotlist.

---

## Phase 5 — Discovery & growth  ☐ *(post‑v1)*
- ☐ Browse / featured guides, follow makers, profiles.
- ☐ Categories across guides, search.
- ☐ (Maybe) curator photos return (O‑4).

---

### Working rules
1. **Ship the spine, then skin** — a working loop with plain defaults beats a beautiful
   broken one.
2. **Every decision → [DECISIONS.md](./DECISIONS.md)**, labelled, before it's "done."
3. **Verify in the browser** (desktop + mobile) before calling a phase done.
4. **No prototype‑grade work in `main`/`hotlist`** — `proto/*` is the only place that lived.
