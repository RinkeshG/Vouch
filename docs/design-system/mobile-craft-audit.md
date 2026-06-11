# Mobile Craft Audit — first principles, every screen

*June 2026. Audit + plan only — nothing in this doc is built yet.*

This exists because three failures kept recurring even after repeated feedback:
type hierarchy that doesn't register, screens that are text-after-text with no
visual anchors, and lists that scale into endless scroll. All three are
foundation failures, not screen-by-screen bugs — so this doc fixes the
foundations first, then re-plans every screen against them.

---

## Part 0 — Honest audit of what's wrong (with evidence)

### 0.1 The type "hierarchy" doesn't exist perceptually

Measured, per stylesheet (distinct `font-size` values):

| stylesheet | distinct sizes |
|---|---|
| you-page | **22** |
| spot-page | 19 |
| guides-app | 19 |
| add-vouch | 18 |
| direction-a | 16 |
| palate-page | 15 |

you-page alone uses `0.84 / 0.86 / 0.88 / 0.9 / 0.92 / 0.96 / 0.97 / 1.0 /
1.02 / 1.04 / 1.05 / 1.08 / 1.15 / 1.2 / 1.25rem` — fifteen "levels" inside a
band where the eye can distinguish maybe three. **Hierarchy is ratio, not
increment.** Adjacent levels need ≥1.25× difference (or a hard change of
family/colour) to read as different levels. 1.04 vs 1.08 is the same size with
extra steps.

Root cause: `vouch.css` defines a type ramp (`--t-h1`, `--t-h3`, `--t-body`,
`--t-label`…) and **zero components consume it**. Every component hand-rolls
sizes, so every new screen re-invents a slightly different mush.

### 0.2 Text after text — no visual anchors

After the "boxy cards look random" feedback, lists were over-corrected to pure
hairline text. Result: Vouched, Been, Want, Search, Palate, and the capture
list are typographically different but **visually identical** — a cream line, a
grey line, a rule, repeat. Nothing for the eye to land on, nothing that makes
row 7 different from row 27.

The painful part: the system already owns visual assets and the lists use none
of them —

- `placeTint()` + `monogram()` — the tinted monogram tile (used on the home
  card + spot hero, nowhere in lists)
- `cuisineGlyph()` — the in-pin icons (map only)
- the register marks (dot / ring / glow)
- the seal (the wax-stamp success object)
- the dark map itself (static minis)
- display-800 / outline numerals

### 0.3 Lists don't scale

Every list renders fully. At 50+ entries Been is one undifferentiated
multi-screen scroll; Want too. No bounding, no collapsing, no sticky context,
no rhythm breaks. The list is treated as the interface; it should be the
*result* — the interface is the query (lens, search, summary).

### 0.4 Specific craft misses on the new /you (called out, kept honest)

- **Vouched:** outline numerals float detached from their entries (ragged
  optical column); the take (1.2rem) vs the place name (1.04rem) is a
  non-jump; `folioMeta` is indented 16px to align with nothing; every entry is
  the same density → reads as "a list with italics", not a portfolio.
- **Overview doors:** three text rows that differ only in words; the count
  (1.25rem) barely outranks the label; the take-peek truncates the one
  interesting thing.
- **Been/Want rows:** name + meta only; the verdict word floats far right
  (long eye travel); Want is Been-with-rings.

---

## Part 1 — The laws (foundations every screen must obey)

### 1.1 The type ladder — 7 rungs, nothing in between

Every piece of text maps to exactly one rung. Rungs are *jobs*, not sizes.

| rung | job | spec (mobile/375) |
|---|---|---|
| **R0 · Room title** | "where am I" — one per screen | Bricolage 800 · 30px · lh 1.0 · -0.035em · cream |
| **R1 · Lead content** | the thing the room exists for | take: Grotesk italic 19px · lh 1.35 · cream &nbsp;/&nbsp; place name as list lead: Bricolage 700 · 17px · -0.02em · cream |
| **R2 · Support content** | attribution, sublines | Grotesk 400/500 · 14px · muted (cream when it must anchor) |
| **R3 · Action** | "I can tap" | Grotesk 600 · 15px · saffron (primary) / muted (tertiary). Never mono. |
| **R4 · Meta** | whisper context (cuisine · area · time) | Space Mono · 10px · uppercase · +0.06em · faint |
| **R5 · Section label** | wayfinding | Space Mono 700 · 10px · uppercase · +0.12em · faint (saffron only when live, e.g. "near you") |
| **R6 · Jewelry numerals** | stats, ranks, counts | Bricolage 800 · 21 / 26 / 32px by prominence |

Enforcement rules:

1. **Max 4 rungs per screen** (+ R0). A fifth size is a design error.
2. Adjacent rungs that appear together must differ by ≥1.25× **or** by family +
   colour. (10→14 = 1.4×; 14→17 + family change; 17→30 = 1.76×.)
3. Mono never exceeds 12px and never carries content — it is the ledger
   texture, not a voice.
4. Colour ladder is part of hierarchy: **cream** = content · **muted** =
   support · **faint** = whisper · **saffron** = the single most important
   thing on the screen + actions. If two things are saffron, neither is.
5. The rungs become utility classes / variables consumed by every component.
   Hand-rolled `font-size` in a component stylesheet = review-blocker.

### 1.2 The anchor law — no naked text lists

- Every repeating row carries a **non-text anchor**: the 36px tinted monogram
  tile (colour varies by cuisine → 50 rows are 50 colours, scan rhythm for
  free), with the register mark (dot/ring/seal-check) sitting on the tile.
- Every room gets **one hero visual moment** that is *of that room* — not
  decoration: Vouched = the seal + take typography; Been = the verdict-mix
  bar; Want = the radar mini-map; Home = the map itself; Spot = the tinted
  monogram hero (already right).
- Two shared atoms, reused everywhere, end the per-screen reinvention:
  - **PlaceRow** — tile · name (R1) · meta (R4) · right slot (verdict word /
    action / distance). Used by: Been, Want, Search, capture list, guide
    editor pool.
  - **TakeEntry** — tile+seal · take (R1 italic) · credit line (R2 name + R4
    meta, one line). Used by: Vouched, Palate's "stake your name on", guide
    view items.

### 1.3 The scale law — the list is the result, the UI is the query

- **Bounded by default:** any section renders max 5–8 rows, then `All 23 →`.
- **Chronology collapses:** This week + This month render; `Earlier · 214`
  is collapsed until tapped, then grouped by month.
- **Sticky wayfinding:** group labels stick under the top bar past one screen
  of content.
- **Search threshold:** the find field appears at >10 entries and is the
  primary tool at 50+.
- **Summary before list:** big lists open with a visual summary that doubles
  as the filter (Been: the verdict-mix bar; Want: the radar map + area
  chips).
- **Rhythm breaks:** never more than ~8 visually identical rows without a
  break (group label, density change, stat).

---

## Part 2 — Room-by-room plan

### /you · Overview — the passport page
**Now:** three same-looking text doors; counts barely outrank labels.
**Becomes:** identity block (avatar 56 · You at R0 · signature at R1-ish 17px
with the count as jewelry) → the one saffron nudge → three doors **that carry
their room's visual DNA**:
- Vouched door: seal mark + latest take, 2 lines italic (R2) + count (J-21)
- Been door: the **verdict-mix bar** (jade/tan/grey segments) + count
- Want door: ghost-ring + "2 near you" live line (saffron R4) + count
Doors stop being labels and start being previews.

### /you · Vouched — the portfolio (worst offender, biggest change)
**Now:** detached numerals over hairline italics; no anchors; non-jump sizes.
**Becomes:** strict two-column grid — 44px tile column (tinted monogram, seal
check on the corner) + content column; everything aligns to the content axis.
Entry = take at R1-italic 19 → credit line: name (R2-500, cream) `· cuisine ·
area` (R4) on one line. Most recent entry is **featured** (56px tile, take at
21px); the rest standard — a portfolio has a lead piece, not uniform rows.
Numerals drop (tiles are the anchors now; numerals return on /palate where
rank is the message). Bounded: ≤12 shown; beyond that grouped by cuisine with
R5 labels. Foot: Build a guide (primary R3) · how it reads to others (tertiary).

### /you · Been — the diary
**Becomes:** opens with the **verdict-mix bar** (your honesty as a visual
object; segments tappable = filter). Rows become PlaceRow: 36px tile (verdict
dot on the tile corner) + name R1 + meta R4 + verdict word R4 in its colour on
the right. This week/This month full · `Earlier · 214` collapsed → month
groups. Sticky labels. Find field at >10. Lenses stay (Recent/Verdict/Area);
in Verdict lens the word leaves the rows for the header (already correct).

### /you · Want — the radar
**Becomes:** literally a radar — opens with a **static mini-map** (existing
atom) of your ghost pins, tap → home map in want lens. Then "Near you" as
saffron-tinted PlaceRows with distance + `Go →`. Then the queue **grouped by
area** (R5 label + count — wants cluster geographically because that's how you
plan), aging in tan at R4, `Been here? →` action. Bounded per area.

### Home — already has its visual (the map)
Type-ladder sweep only: headline R0, legend R5, assist R3, card uses R1/R2/R4.
Card meta/actions currently span ~6 sizes → 4 rungs.

### Search + capture list — same PlaceRow atom
Add the 36px tile (recognition is visual before it's verbal), meta to R4,
right slot = state mark. Capture's nearest-5 and search results become the
same component — one place-row everywhere in the product.

### Spot — closest to right already
Hero stays. Sweep: "What to order" line = R1; Good-to-know values R2, labels
R4; receipts already have tile-avatars. Cut to 4 rungs (currently 19 sizes).

### Palate — the outward mirror
"Stake your name on" entries become TakeEntry **with** the outline numerals
(rank is the message here). Strongest-on chips R5. Map card stays.

### Guides — editor + view
Editor pool + contents = PlaceRow; guide view items = TakeEntry. The 4:5
share card is already its own designed object.

---

## Part 3 — Order of work (when approved)

1. **Foundations:** type-ladder variables + utility classes in `vouch.css`;
   delete per-component font-sizes as screens are touched.
2. **Atoms:** PlaceRow, TakeEntry, MixBar, MiniRadar (static map reuse),
   tile (placeTint+monogram+mark).
3. **Rooms in order of pain:** Vouched → Been → Want → Overview.
4. **Sweep:** Search, capture, Spot, Palate, Guides, Home type pass.
5. **Scale QA:** seed a 60-been / 25-want / 15-vouched dev dataset and
   screenshot every room at 375px — the bounded/collapsed/sticky rules must
   visibly hold at volume, not in theory.

*Each step lands as its own commit, verified at 375px before the next.*
