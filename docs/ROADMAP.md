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

## Phase 1 — The public page (read‑only)  ☐
The artifact itself: what someone opens from a shared link.

- ☐ A data shape for a guide (`{ handle, title, intro, curator, places[] }`, each place
  `{ name, area, take, category, mapsUrl }`) + a seeded example guide.
- ☐ Public route `/<handle>` (or `/g/<slug>`) rendering the guide: curator header,
  category filter, text‑led place cards, the "your turn" close (P‑004).
- ☐ Mobile‑first layout; real metadata + OG tags for sharing.

**Done =** a logged‑out stranger can open a public guide URL and see a beautiful, fast,
mobile‑first page — the thing they'd actually share.

---

## Phase 2 — The builder (create)  ☐
Making a guide. Local‑first is acceptable here; persistence lands in Phase 3.

- ☐ Add a place (O‑3 — search / paste a link / manual), write the take, pick a category.
- ☐ Reorder, edit, delete; a live preview of the public page as you build.
- ☐ Title + intro + your name/handle.

**Done =** you can build a complete guide and see it render exactly as the public page will.

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
