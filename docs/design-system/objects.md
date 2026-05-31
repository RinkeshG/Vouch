# Design System — The Objects (the product OS)

Vouch is built from **objects, not screens** (see `docs/product/CONSTITUTION.md`).
Each object below is a **coded component** in `src/components/vouch/`, provable in
the living showcase at **`/system`**. Build screens by composing these — never by
inventing one-off UI.

> The four anti-drift gates apply to every object (Constitution §10): answers a
> *situation* · makes *trust visible* · creates *better data* · still feels like
> Vouch with the logo removed.

Imagery is **people (monogram avatars + face stacks) + type** — no food photos
(`foundations.md §8b`).

---

## 1. Vouch — `vouch-card.tsx` (`VouchCard`)
The atomic unit: **one place · one line · one name · one occasion.** A stamp, not
a post.
- **Variants:** `full` (place page, palate, share) · `compact` (home cards).
- **Composes:** `Avatar` + `Stamp` (the by-line) · `Tag` · `OccasionChip` ·
  optional `Receipt` · optional actions (`Button`).
- **Rule:** a Vouch always shows its **palate** and at least its **stamp**; if the
  stamp is `vouched`, the **one-line reason** is mandatory (Constitution §1).
- **States:** posted (stamp lands — see `composer.tsx`) · compact-in-list.

## 2. The three stamps — `stamp.tsx` (`Stamp`)
A vouch's state: **Want to go · Been · Vouched.** Colour = meaning; **Vouched**
glows (the currency). `animate` lands the stamp on post (delight from meaning).

## 3. Receipt — `receipt.tsx` (`Receipt`, `ReceiptInline`)
**Why a place reached you** — the trust trail. The one component that keeps Vouch
from going generic. **Present on every surfaced place**, derived from the graph,
**never anonymous** (Constitution §3).
- `Receipt` = the full box (who vouched · who you follow saved · added to a guide).
- `ReceiptInline` = one-liner for tight surfaces ("reached you through Meera").

## 4. Palate — `palate.tsx` (`PalateHeader`)
A person **and** their taste; the follow target. A **taste map, not a profile**:
name + handle, **when to trust them**, strongest **occasions**, guides/vouches
counts, a **Follow** action (the in-app verb — "borrow" is marketing only; see
brand.md). No bio/followers-as-hero chrome.

## 5. Guide — `guide.tsx` (`GuideCard`, `GuideView`, `GuideRow`)
An **authored, occasion-titled** collection by one palate. The preview card and
the opened view **share `GuideRow`** — *inside == outside* (`patterns.md §0`).
- `GuideCard` = preview (curator line + anchor + 3 rows + "open all").
- `GuideView` = opened (all rows with tags + save + follow CTA).
- Titles are points of view ("Where I take my parents"), **never taxonomy**.

## 6. Spot — `spot.tsx` (`SpotHeader`)
A place. Its page **leads with the trusted verdict + the Receipt**, never
Google-Maps chrome. Hierarchy: name → one-line verdict from trusted people →
who vouched/saved → **best occasion** → what to order/avoid → practical → your add
action (Constitution §7).

## Occasion — `chip.tsx` (`OccasionChip`)
Not a sixth object but the **controlled vocabulary** that threads all of them
(life moments, not cuisines). Two modes: selectable (filter) · static (label).
Canonical set in the Constitution §4.

---

## The supporting kit (`src/components/vouch/`)
| Concern | Components |
|---|---|
| Brand | `wordmark.tsx` (`Wordmark`, `Mark`) |
| Actions | `button.tsx` (`Button` — primary/ghost/compact, sans sentence-case) |
| People | `avatar.tsx` (`Avatar`, `FaceStack`) |
| Chips | `chip.tsx` (`OccasionChip`, `Tag`, `StatusChip`) |
| Inputs | `input.tsx` (`Input`, `SearchField`, `ComposerField`) |
| Overlay | `modal.tsx` (`Modal` — dialog ↔ bottom-sheet, focus-trap) |
| States | `misc.tsx` (`LeaderRow`, `SkeletonRow`, `SkeletonCard`, `EmptyState`, `Toast`) |
| Create | `composer.tsx` (`AddVouchComposer` — the sacred ritual; the one-line reason is a **wrapping textarea, ≤120 chars** with a live counter; integrity nudge) |
| Shell | `app-shell.tsx` (`AppShell` — top bar + mobile bottom tab; ＋Vouch is the only saffron item) |
| Home | `home.tsx` (`HomeHeader`, `ModeBar`, `SectionLabel`) |
| Tokens | `vouch.css` (the `.vouch` runtime token scope — After-Dark identity) |

## States — every surface designs these (Constitution, patterns.md §9)
**Empty** (never a dead end → `EmptyState`) · **Loading** (skeletons, not spinners
→ `Skeleton*`) · **Error** (warm, blameless) · **First-run** (points to follow a
palate / make a vouch) · **Success** (earned delight → `Toast`, stamp landing).

## Surfaces (assembled from the kit) — `/system/{home,spot,palate,guide,add}`
Static stubs that prove the OS composes into real product before any data wiring.
