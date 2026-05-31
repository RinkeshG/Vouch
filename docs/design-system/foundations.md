# Design System — Part II: Foundations

The atoms. Colour, type, space, elevation, motion, texture. All values are
tokens — see [`tokens.css`](./tokens.css). This doc explains the *why* and the
*how to use*.

---

## 1. Colour

### The philosophy — "After Dark"
Vouch lives at night: the glow from a kitchen, a candlelit table, a neon sign on
a wet street. The system is **dark-first and warm**. Backgrounds are a deep,
warm near-black (never pure `#000`, never cool grey). Light is precious — used
for type and for the one colour that means *appetite*: **saffron**.

> Mental model: a near-black room, a single warm lamp. Saffron is the lamp. Use
> it where you want the eye to go; everywhere else, let the dark hold.

### The ramp

**Ink (backgrounds & surfaces)** — warm near-blacks, ~`#0c`→`#22`.

| Token | Hex | Role |
|---|---|---|
| `--footer-bg` (`--c-ink-900`) | `#0c0b09` | Footer, deepest wells |
| `--bg` (`--c-ink-800`) | `#100f0d` | **App background** |
| `--bg-alt` (`--c-ink-700`) | `#16140f` | Alt bands (CTA), sunken areas |
| `--surface` (`--c-ink-600`) | `#1a1712` | **Cards, sheets, the default raised plane** |
| `--surface-2` (`--c-ink-500`) | `#221d16` | Chips on cards, stacked avatars |

**Paper (text)** — warm off-whites, never blue-white.

| Token | Hex | Role | Contrast on `--bg` |
|---|---|---|---|
| `--text` | `#f3eee3` | Primary text, headlines | ~15:1 — AAA |
| `--muted` | `#a79e90` | Secondary / body-secondary | ~7:1 — AA+ |
| `--faint` | `#756c5f` | Tertiary, meta, hints | ~3.4:1 — **large/UI only** |

**Accents** — used sparingly, with intent.

| Token | Hex | Means | Notes |
|---|---|---|---|
| `--accent` (saffron) | `#f6a82b` | **The brand.** Appetite, the highlight, "this matters" | Primary CTA, the V, active states, the highlighted vouch |
| `--accent-hi` | `#ffc658` | Gradient top, hover sheen | Only inside `--accent-gradient`, not as a flat fill |
| `--danger` (ember) | `#ff5b33` | Heat, errors, struck-through "no" | Form errors, the ✕ in contrasts |
| `--success` (jade) | `#76d29b` | Live, "go", saved, joined | The live dot, "Been" stamp, success states |

**Ink-on-accent:** text on a saffron fill is **`--accent-ink` `#1c1408`** (a near-black). Never white text on saffron — it fails contrast and looks cheap.

### Lines & rules
Hairlines are **paper at low alpha** (`--line` 12%, `--line-2` 20%), so they
*glow* against the dark instead of going muddy. The dotted leader line uses
`--rule` (28%) so the dots stay visible.

### Usage rules (read these)
- **Saffron is a scalpel, not a bucket.** One primary saffron moment per
  viewport. If two things are saffron, neither is special.
- **State colours are exclusive:** jade = good/live/saved, ember = heat/error,
  saffron = the brand/active. Don't cross the streams (no jade buttons, no
  saffron errors).
- **Never pure black or pure white.** It breaks the warmth. Use the ramp.
- **`--faint` is for ≥ ~16px or non-text UI only** — it's intentionally below
  AA for small body text. Body copy uses `--muted` minimum.
- **Selection** is saffron with ink text (`::selection { background: var(--accent); color: #1a130b }`).

### The signature gradient & glow
- `--accent-gradient` `linear-gradient(135deg, #ffc658, #f6a82b)` — every primary
  button, the highlighted "name", avatars, the active chip.
- Ambient **glow** is saffron at very low alpha behind hero/CTA (radial,
  `~0.1–0.22` opacity) and a faint ember counter-glow. It *drifts* (see Motion).

---

## 2. Typography

Three families, three jobs. The contrast between them *is* the editorial voice.

### The families

| Token | Family | Job | Why |
|---|---|---|---|
| `--font-display` | **Bricolage Grotesque** | Headlines, numerals, card titles, wordmark | Characterful, slightly wonky grotesque — confident and contemporary, not a generic sans. Carries personality at huge sizes. |
| `--font-sans` | **Space Grotesk** | Body, UI text, buttons, descriptions | Clean, modern, faintly technical — pairs precisely with the mono. |
| `--font-mono` | **Space Mono** | Labels, metadata, prices, timestamps, "catalog" UI | The ledger/menu texture. Mono = "this is a record, an index, a receipt." |

Load via `<link>` (the v2 route does this per-page) or `next/font`. Always
include the system fallbacks in the token.

### The scale (roles, not just sizes)

| Role | Token | Spec | Where |
|---|---|---|---|
| Display XL | `--type-display-xl` | `clamp(2.5rem,5.6vw,4.7rem)` · Bricolage 800 · leading 0.96 · track -0.035em | Hero headline |
| Display L | `--type-display-l` | `clamp(2rem,4.2vw,3.2rem)` · Bricolage 700–800 · leading 1.0 · track -0.03em | Section headers |
| Display M | `--type-display-m` | `clamp(1.7rem,2.6vw,2rem)` · Bricolage 700 | Quiz Q, sub-headers |
| Display S | `--type-display-s` | `1.3–1.8rem` · Bricolage 700 | Card titles, place names |
| Body L | `--type-body-l` | `clamp(1.04rem,1.4vw,1.2rem)` · Space Grotesk 400 · leading 1.5 | Lede / intro paragraphs |
| Body M | `--type-body-m` | `1rem` (root 17px) · leading 1.6 | Default body |
| Body S | `--type-body-s` | `0.9rem` | Dense rows, captions-in-cards |
| Label | `--type-label` | `0.58–0.72rem` · Space Mono 700 · **UPPERCASE** · track 0.06–0.16em | The mono UI labels |
| Caption | `--type-caption` | `0.6rem` · Space Mono · uppercase | Micro-meta, timestamps |

Root is **17px**, line-height **1.6**, tracking **-0.006em**, antialiased.

### Conventions (the type "grammar")
- **Display is tight, mono is open.** Tighten big grotesque (`-0.03em`); open mono
  labels (`+0.06–0.16em`). This contrast is the look.
- **Numerals are display 800.** Big section numbers (`01`, `02`), the slot reel,
  stats, list ranks — all Bricolage. Often as **outline numerals**
  (`color: transparent; -webkit-text-stroke: 1.4px var(--line-2)`).
- **Italics are an accent, not a paragraph.** Use Bricolage/Space Grotesk italics
  for a single emphasized word or a short quote, never for long runs.
- **The "01 — LABEL" pattern.** Section eyebrows are mono uppercase with a small
  saffron square and a bold sub-word: `· 01 / The problem`.
- **Mono microcopy gets `//`.** Helper/finely-printed notes read like a code
  comment: `// invite-only · no spam · a seat at the table`.
- **Never** set body in mono (tiring) or labels in the sans (loses the texture).

### Emphasis devices
- **Highlight box** — a saffron-gradient inline mark behind one hero word
  (box-decoration-break: clone). Used **once**, on the single most important word.
- **Marker underline** — *(retired on the landing per feedback; available but use
  with restraint.)* Prefer a clean bold-display word or a saffron word for
  emphasis in headers.

---

## 3. Spacing & Layout

### The 4px grid
All spacing comes from `--space-1…13` (4 → 128px). Compose from these; a stray
`13px` is a smell. Common rhythms: card padding `--space-5/6` (20–24px), gaps
`--space-2/3`, section vertical `--section-y` (`clamp(56px,8vw,112px)`).

### Container
- Max width **`--container` 1160px**, centred, gutter **28px** desktop / **18px**
  mobile (`--container-pad` / `--container-pad-sm`).
- Long-form/reading width caps around **40–48ch** (lede, body) regardless of
  container.

### The signature layouts
1. **Rail + Body** — numbered sections use a sticky left **rail** (mono kicker +
   big outline numeral) and a content body (`grid: 200px 1fr`). Collapses to a
   single column with an inline rail at `--bp-md`.
2. **Split** — hero & "how a vouch reaches you" use a 2-col split (`~1.04fr
   0.96fr`): copy/text one side, a live product surface the other. Collapses to
   1 col at `--bp-lg`, **product surface stacks below the copy**.
3. **Card grids** — `repeat(3, 1fr)` with `--space-5` gaps → 1 col at `--bp-md`.
4. **Leader rows / ledger** — full-width rows with dotted leaders (see
   components). The "menu/ledger" backbone.

### Breakpoints
| Token | Width | What changes |
|---|---|---|
| `--bp-lg` | 960px | Hero/2-col split → single column |
| `--bp-md` | 900px | Multi-col grids → 1 col; rail goes inline; flows stack |
| `--bp-sm` | 560px | Forms stack (input over button); tighten gutters & type |

---

## 4. Radius & Shape

A consistent radius family makes the kit feel like one thing.

| Token | Value | Used on |
|---|---|---|
| `--radius-xs` | 4px | tags, tiny chips, stamps |
| `--radius-sm` | 6px | inline chips, small controls |
| `--radius-md` | 8px | **buttons, inputs, list rows** |
| `--radius-lg` | 11px | nested panels (the "why" box) |
| `--radius-xl` | 14px | **cards** |
| `--radius-2xl` | 18px | feature cards, sheets, the slot machine |
| `--radius-pill` | 999px | the live dot, the invite input row, status chips |

**Shape motifs** (brand-specific, optional but ownable): perforated **ticket
stubs** (dashed divider + notch circles cut with `--bg`), **passport stamps**
(double border, slight rotation), and the **seal** (the mark). Reach for these on
"membership/admission" moments (CTA, invite, vouch states).

---

## 5. Elevation & Glow

Dark UI can't use grey boxes for depth. Vouch uses three signals, in this order:

1. **Surface step** — raise the background one ramp step (`--bg` → `--surface`).
2. **Hairline** — a `--line-2` border catches the light; this is what actually
   "draws" the card edge on dark.
3. **Soft warm shadow** — `--shadow-card` / `--shadow-lift`: large, very soft,
   warm-black. It implies a spotlight from above, not a hard drop shadow.

| Token | Value | Use |
|---|---|---|
| `--shadow-card` | `0 24px 60px -38px rgba(0,0,0,.9)` | resting cards, sheets |
| `--shadow-lift` | `0 44px 90px -44px rgba(0,0,0,.95)` | the hero product surface, modals, hover peak |
| `--shadow-pop` | `0 12px 26px -12px rgba(246,168,43,.8)` | **saffron buttons only** — they glow, they don't drop-shadow |

**The payoff card glows.** The single most important card in a flow (the
recommendation that "reaches you", the jackpot, the highlighted vouch state)
gets a saffron-tinted border + an inner radial glow. Everything else stays calm.

> Rule: at most **one** glowing element per view. Glow = "this is the answer."

---

## 6. Texture

A single **film-grain overlay** sits fixed over the whole page (`feTurbulence`
SVG, `opacity 0.05`, `mix-blend-mode: overlay`, `pointer-events: none`). It's
imperceptible consciously but makes the dark feel *cinematic* and tactile rather
than flat digital black. Keep it. Don't stack more textures on top.

---

## 7. Motion

> **Motion rewards action and signals life. It never blocks, never loops loudly,
> always yields to `prefers-reduced-motion`.**

### One curve to rule them
`--ease` `cubic-bezier(0.2, 0.7, 0.2, 1)` — the "Vouch ease" — does ~90% of the
work (reveals, hovers, swaps). Overlays landing use `--ease-settle`
`cubic-bezier(0.2,0.8,0.2,1)` for a touch more arrival.

### Duration scale
| Token | ms | For |
|---|---|---|
| `--dur-tap` | 120 | `:active`, chip select, the felt "press" |
| `--dur-quick` | 200 | hover, colour/border state |
| `--dur-base` | 340 | modal in/out, content swap, card flip |
| `--dur-reveal` | 650 | scroll-in reveals |

### The motion vocabulary (named patterns)
- **Reveal-on-scroll** — content is *visible by default* (SSR/no-JS/SEO safe);
  only below-the-fold elements arm a hidden state and rise+fade in (`translateY
  18–24px`, `--dur-reveal`, `--ease`) as they enter. Above-the-fold never hides.
- **Entrance stagger** — hero children rise in on load with 0/60/120/180ms delays.
- **Ambient glow drift** — hero/CTA glows slowly scale+translate over 14–16s,
  `alternate`. Subliminal "this is alive."
- **Float** — the hero product surface (slot) bobs ~8px over 7s.
- **Ticker** — the masthead marquee translates -50% over 44s, pauses on hover.
- **Reel** — the slot decelerates through a hard-coded delay ramp
  (`60→320ms`) so it *feels* like a real machine settling; each tick replays a
  short `slotTick` rise.
- **Hover lift** — cards translate up 4–6px + border warms to saffron; never a
  scale that reflows neighbours.
- **Confetti** — food-emoji burst (Web Animations API, self-cleaning) on
  signup & jackpot only. Earned celebration, not decoration.

### Hard rules
- **Respect reduced motion** everywhere — the token scale collapses durations to
  ~1ms and all loops/`animation` are disabled. Test it.
- **No motion that blocks input.** Never gate a tap behind an animation.
- **No infinite loud loops.** Ambient loops are slow and low-contrast only.
- **Sound & haptics** are opt-in-by-action only (the slot lever): a soft reel
  tick, a two-note chime + light `navigator.vibrate` on landing. Never autoplay
  audio; gate behind reduced-motion.

---

## 8. Iconography

- **Lean on type & emoji, not an icon set.** The system is mono-label-led;
  arrows (`→ ↗ ↓ ⤓`), the `＋`, `●`, `✓`, `✕` carry most UI. Set them in the mono
  or sans, sized with text.
- **Emoji are intentional and food-led** (🍜 ☕ 🥘 🍷 🌙 ☕ 🏆 📈). Used as
  category/signal markers (live pulse, palate glyphs, confetti), never as
  decoration sprinkled into headers.
- If/when a real icon set is needed, it must be **thin (1.5px), rounded-cap,
  monoline** to sit with the type — never filled, never duotone.

---

## 9. Accessibility (non-negotiable)

- **Contrast:** body text ≥ AA (`--text`/`--muted` pass; `--faint` is for large
  or non-essential UI only). Text on saffron uses `--accent-ink`.
- **Focus is always visible:** `outline: 2.5px solid var(--accent); offset 3px`
  on every interactive element. Never remove outlines without a replacement.
- **Targets ≥ 44px** on touch. Primary actions are full-width on mobile.
- **Semantics:** real landmarks (`header/nav/main/section/footer`), heading
  order, `aria-label` on icon-only buttons, `role="dialog" aria-modal` + focus
  trap + restore on modals, `aria-selected` on tabs, `aria-live` on the slot result.
- **Motion & sound** both gate on `prefers-reduced-motion`.
- **No-JS / SSR:** content renders without JS (reveals start visible). Don't hide
  meaning behind interaction.

---

### Changelog
- **v1.0** — Foundations formalised from the v2 landing tokens & usage. *(— DS)*
