# Design System — Part III: Components

The kit. Each entry: **what it's for**, **anatomy**, **specs** (in tokens),
**states**, **do/don't**. Build screens from these. New need → design it *as* a
reusable component and add it here.

> Reference implementations all live in `src/app/v2/landing.module.css` +
> `landing.tsx`. This doc is the spec; that code is the proof.

---

## 1. Buttons

Three button roles. There are only three. Resist inventing a fourth.

### 1.1 Primary — "the saffron"
The single most important action on a view. Saffron gradient, ink text, glows.
- **Spec:** `background: var(--accent-gradient)` · `color: var(--accent-ink)` ·
  `--radius-md` · padding `13–14px 20px` · `box-shadow: var(--shadow-pop)` ·
  weight 600 (sans) or 700 (mono, for compact CTAs).
- **States:** hover → `translateY(-1px)` + stronger glow (`--dur-quick`);
  active → `translateY(1px) scale(.99)` (`--dur-tap`); focus → saffron outline.
- **Do:** one per view. **Don't:** white text on saffron; two primaries competing.

### 1.2 Ghost — "the outline"
Secondary action. Transparent with a hairline.
- **Spec:** `background: transparent` · `border: 1px solid var(--line-2)` ·
  `color: var(--text)` · same radius/padding family.
- **States:** hover → fill `rgba(text, .06)` + border warms to `--text`.
- ⚠️ **Buttons must set `background: transparent`** — a bare `<button>` inherits
  the UA grey. (We shipped this bug once; don't repeat it.)

### 1.3 Mono control — nav / footer / compact
Small, label-style action. Mono, uppercase.
- **Spec:** `font: var(--font-mono) 700 0.68rem` · `track 0.06em` · UPPERCASE ·
  `--radius-sm` · border `--line-2`. Hover → fills saffron with ink text.

**All buttons:** real `<button>`/`<a>`, `cursor: pointer`, visible focus ring,
≥44px touch target.

---

## 2. Inputs & the Invite Field

The signature input is the **pill field row**: input + primary button share one
rounded container that lights up on focus.

```
┌───────────────────────────────────────────────┐  --radius-md, border --line-2
│  you@where-you-eat.com         [ Request → ]   │  bg rgba(paper,.04)
└───────────────────────────────────────────────┘
   // invite-only · no spam · a seat at the table   ← mono helper, --faint
```
- **Spec:** row `display:flex; padding:6px; gap:8px`. Input is borderless,
  transparent, `--text`, placeholder `--faint`. Button is the primary inside.
- **Focus:** `border-color: var(--accent)` + `box-shadow: 0 0 0 4px rgba(saffron,.13)`.
- **Error:** helper turns `--danger` with a human message; `aria-invalid` on input.
- **Mobile (`--bp-sm`):** the row stacks — input over a full-width button.
- **Always:** a `<label class="srOnly">`, `type/inputmode/autocomplete` set.

---

## 3. Chips & Stamps

### 3.1 The three vouch stamps (brand-critical)
A vouch's state. Pill, mono, with a glowing dot. Colour = meaning.

| Stamp | Colour | Means |
|---|---|---|
| **Want to go** | muted gold `#cdb595` / outline | saved for when you're near |
| **Been** | `--success` jade | logged & dated, your diary |
| **Vouched** | `--accent` saffron + glow | the currency — you'd stake your name |

- **Spec:** `--radius-pill` · mono 700 `0.64rem` · track `0.15em` · UPPERCASE ·
  `1px solid currentColor` · faint `currentColor` bg · a 6px `currentColor` dot
  with `box-shadow: 0 0 10px currentColor`.
- **Vouched** is the brightest/glowing one — it's the hero state.

### 3.2 Tag
Tiny metadata pill (cuisine, ₹₹, neighbourhood): mono `0.62rem` uppercase,
`--surface-2` bg, `--radius-xs`, `--muted`. Used in clusters under a place name.

### 3.3 Status / live chip
"● live", "● near you", category labels in the live pulse. Mono caption, the
relevant state colour, optional pulsing dot.

---

## 4. Avatars

- **Initials avatar:** rounded-square (`--radius-md`), a 2-letter mono monogram,
  on a saffron→ember gradient (palettes) — `color: var(--accent-ink)`. Sizes
  20 / 26 / 30 / 42px. Per-person gradients allowed (saffron/ember, jade, gold).
- **Face stack:** overlapping initials avatars (`margin-left: -8px`, `border:
  1px solid var(--bg)` to notch), ending in a `+N` chip. Used for "3 you follow
  saved it". Reads as *people*, instantly.
- No photo avatars in the system yet; when added, keep the rounded-square shape.

---

## 5. The Leader Row (the ledger primitive)

The backbone of "menu/guide/ledger" surfaces. A name, a dotted leader, a value.

```
01   Karavalli  ···········································  COASTAL · ₹₹₹₹   ✓
└num └name (flex:none)   └dotted leader (flex:1, --rule)   └meta (mono)  └tail
```
- **Spec:** `display:flex; align-items:baseline`. `num` mono saffron; `name` sans
  600; `dots` a `flex:1` element with `border-bottom: 1.5px dotted var(--rule)`;
  `meta` mono uppercase `--muted`; optional `tail` (✓/✗/"10 seats").
- **Variants:** *bill* (struck-through, ember decoration, a "good" saffron row);
  *menu/guide preview* (ranked names only — keep tags out of narrow columns to
  avoid clipping); *surfaced* (a single highlighted row).
- ⚠️ In narrow columns, **drop the leader+meta and show ranked names only** — long
  tags clip. (Shipped fix.) Full detail belongs in the opened guide.

---

## 6. Cards

### 6.1 Base card
The default raised plane.
- **Spec:** `background: var(--surface)` · `border: 1px solid var(--line)` (or
  `--line-2` for emphasis) · `--radius-xl` · padding `--space-5/6` ·
  `box-shadow: var(--shadow-card)`.
- **Interactive card** (opens something): it's a real `<button>` (reset: `width:
  100%; text-align:left; font:inherit; background:var(--surface)`), hover lifts
  6px + border warms, with an explicit affordance ("Open all 6 →").

### 6.2 The vouch / recommendation card (brand-critical)
A place *with its trust receipts*. This is the product in one card — never just
a place + rating.
```
ON YOUR MAP · TONIGHT                    ● 1.2 km   ← mono label / live distance
Karavalli                                            ← display, the place
COASTAL · RESIDENCY RD · ₹₹₹₹                         ← tag row
┌ WHY YOU'RE SEEING THIS ──────────────────────────┐ ← the trust trail (§7)
│ [AS] Aditi vouched it  "Take your parents…"   2h │
│ [RG][MK] Rinkesh, Meera +1 you follow saved it   │
└──────────────────────────────────────────────────┘
[ ＋ Save ]  [ Add to a guide ]                       ← primary + ghost
```
- The "why" box is a nested panel (`--radius-lg`, `--line`, faint bg). It is
  **mandatory** on any surfaced recommendation — trust is never implicit.
- The payoff card may glow (saffron border + inner radial). One per view.

### 6.3 Feature / payoff card
Any card that is "the answer" in a flow: saffron-tinted border, gradient surface
(`linear-gradient(160deg,#251d12,#18130c)`), `--shadow-lift` + saffron glow.

---

## 7. The Trust Trail

The mechanism that makes "a vouch reaches you" legible — used inside rec cards
and provenance moments. **Never show a recommendation without it.**
- Row 1: `[avatar] <b>Name</b> vouched it · "quote…" · 2h`
- Row 2: `[face-stack] <b>Names</b> +N you follow saved it · now`
- Mono timestamps right-aligned; rows divided by `--line`.
- Copy frames it: *"Why you're seeing this."* No black box.

---

## 8. Stats / Numerals

- **Stat block:** big Bricolage-800 numeral (`--accent`) + mono caption label
  under it. Used in tight rows (top-bordered).
- **Outline numerals:** giant section numbers as
  `color: transparent; -webkit-text-stroke: 1.4px var(--line-2)` — structural,
  not loud. They sit in the sticky rail.

---

## 9. Ticker (masthead)

A thin scrolling marquee of brand facts — "Vouch · Bengaluru edition · 1,204
vouches logged · invite-only · no star ratings, ever". Mono caption, saffron dot
separators, `#0c0b09` band, 44s loop, pause on hover, `aria-hidden`. Sets a
"living catalog" tone above the nav.

---

## 10. Live Pulse

A single, slow, one-at-a-time line of **mixed** city signals — *not* a repeating
ticker of one thing.
- **Mix:** vouches (`<b>Name</b> vouched for X · area · just now`), **Top this
  week**, **Heating up / Climbing** (trending), **Did you know** (facts), **Just
  joined**. Each non-vouch type gets a small saffron mono tag (`TOP THIS WEEK`).
- **Cadence:** irregular **5.5–9.5s**, randomised content, **never the same
  signal back-to-back**, a soft `pulseIn` rise on each change. (Slow + varied =
  feels real; fast + uniform = feels fake.)
- One centred line: `● Live in Bengaluru   🥞 …`. Wraps gracefully on mobile.

---

## 11. The Slot Machine (signature interactive)

Vouch's hero toy *and* its core promise: "can't decide? — get a trusted pick."
- **Anatomy:** time-aware header (`Late-night craving? · ● live`) → a **reel**
  (ghost row / selected row in a saffron bracket / ghost row, edge-masked) →
  result meta (tags, note, "vouched by X" + ↗ share) → **Pull the lever ⤓** →
  a playful footer counter.
- **Behaviour:** lands on a **random highly-vouched** pick (always different);
  decelerating tick ramp so it *settles* like a machine; **jackpot** (~10%) → a
  hidden vouch + bigger confetti; **share** copies a branded line; subtle reel
  **sound + haptics** on action only.
- **Surface:** `--radius-2xl`, gradient `#221c14→#130f09`, `--shadow-lift`,
  gentle float. Fills width on mobile.
- A11y: `aria-live` on the reel; reduced-motion → instant pick, no sound.

> This is the template for "make the demo *be* the product." When a feature can
> be played, make it playable.

---

## 12. Modals & Sheets

One shared **`Modal`** shell powers everything (guide detail, invite flow).
- **Behaviour (all mandatory):** scroll-lock body, **Esc** to close,
  **backdrop-click** to close, **focus moves in** on open and **restores** on
  close, **focus trap** (Tab cycles inside), `role="dialog" aria-modal`.
- **Form factor:** centred dialog on desktop (`--radius-2xl`, `--shadow-lift`,
  blurred scrim); **bottom-sheet on mobile** (anchored bottom, top corners
  rounded, full-width) — thumb-reachable. Switch at `--bp-sm`.
- **Animation:** scrim fades (`--dur-quick`); sheet rises+scales in
  (`modalIn`, `--dur-base`, `--ease-settle`).
- **In-place flows:** actions inside a modal open the next overlay *in place*
  (guide → "Request an invite" swaps to the invite modal, **no scroll jump**).
  Never bounce the user back to a page anchor.

### Modal content blocks
- **Guide detail:** header (`a guide by <b>Name</b>` + avatar, title, `N places ·
  note`), a scrollable list of leader rows (full detail + notes + `＋`), a sticky
  footer CTA ("Follow Name → this guide lands on your map · Request an invite →").
- **Invite:** kicker + "Pull up a chair." + sub + the invite field; on submit it
  becomes the **Waitlist status** in place.

---

## 13. Waitlist Status (the success state with a job)

Submitting an email doesn't dead-end in "thanks". It shows a **line position you
can climb**:
- Big saffron numeral `No. 482 · you're in`.
- Two actions that *move the number* (with a pop): **Vouch a place you love**
  (−11 each, seeds content) and **Invite a friend** (−40, copies a link, seeds
  distribution).
- The form *is* the growth loop. Mono action rows, saffron meta.

---

## 14. Section Scaffolding

- **Eyebrow:** mono label, small saffron square + a bold sub-word —
  `· 01 / The problem`. Track `0.12–0.16em`, uppercase.
- **Rail:** sticky column = eyebrow + giant outline numeral. Goes inline-row at
  `--bp-md`.
- **Section header block:** eyebrow → display-L title (≤ ~18ch) → optional body-L
  lede (≤ ~44ch). Generous `--section-y` rhythm.

---

## Component checklist (ship gate)
- [ ] Reads from tokens only (no literal hex/px)
- [ ] All states: default / hover / active / focus / disabled (+ error/empty/loading where relevant)
- [ ] Real semantics + visible focus ring + ≥44px touch
- [ ] Works at `--bp-md` and `--bp-sm`
- [ ] Respects reduced motion
- [ ] One saffron / one glow per view honoured

---

### Changelog
- **v1.0** — Component kit documented from the v2 landing. *(— DS)*
