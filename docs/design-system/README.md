# Vouch — Brand Book & Design System

> **v1.0 · "After Dark"** — distilled from the v2 landing (`/v2`), this is the
> reference we build the rest of the product from. It is opinionated on
> purpose. A design system isn't a paint set; it's a set of decisions already
> made so the team can move fast *and* stay coherent.

---

## What Vouch is, in one breath

**Vouch is the trusted-friend layer for restaurants.** You follow the *palates*
you believe in; their *vouches* — not star averages — tell you where to eat.
It is the end of "where should we eat?" and the death of the anonymous 4.2★.

Everything in this system exists to make one feeling tangible: **a
recommendation from someone whose taste you trust.** Warm, certain, a little
exclusive. Never clinical, never crowd-sourced, never an ad in disguise.

---

## The seven principles

These are the tie-breakers. When two designs both "look fine," the one that
honours these wins.

1. **Trust has a face.** Nothing is anonymous. Every recommendation shows *who*
   vouched and *who you follow* that saved it. We never render a number where we
   could render a name.

2. **Show the product, don't describe it.** A real card beats a paragraph about
   the card. When we can let someone *use* the magic (spin the slot, open a
   guide, take the quiz), we do.

3. **Appetite is the brief.** This is food. It should feel like the warm glow
   from a kitchen at night — dark, cinematic, a little hungry. If a screen feels
   like a SaaS dashboard, it's wrong.

4. **Editorial, not corporate.** We're a field guide with a point of view, not a
   utility. Confident display type, mono "catalog" labels, generous whitespace,
   real opinions in the copy.

5. **Mobile is the room, desktop is the window.** Most people meet Vouch on a
   phone, one-handed, deciding dinner. Thumb-reachable, big tap targets,
   bottom-sheets over centre-modals. Design the phone first; let desktop inherit.

6. **Motion is seasoning.** It rewards action and signals life (a reel settling,
   a glow drifting, a vouch arriving). It never blocks, never nags, always
   yields to `prefers-reduced-motion`.

7. **Every pixel earns its place.** If you can't say why an element is there and
   what job it does, delete it. Density is a feature; clutter is a bug.

---

## How to use this system

- **Tokens are law.** Read from [`tokens.css`](./tokens.css). Never hard-code a
  colour, radius, or easing in a component. New value? Add it to tokens with
  intent, then use it.
- **Semantic over raw.** Components reference `--text`, `--surface`, `--accent`
  — not `--c-saffron-500`. This lets us re-theme without a find-and-replace.
- **Compose from the kit.** Build screens out of documented
  [components](./components.md) and [patterns](./patterns.md). If you need
  something new, design it *as a reusable component* and add it here.
- **Copy is design.** Run microcopy past [the voice guide](./brand.md#voice--tone).
  The words carry as much brand as the type.

---

## Index

| Doc | What's inside |
|---|---|
| [`brand.md`](./brand.md) | Positioning, audience, personality, **voice & tone**, the **lexicon** (our words), logo & wordmark |
| [`foundations.md`](./foundations.md) | **Colour**, **typography**, space & layout, radius, **elevation & glow**, texture, **motion**, iconography, a11y |
| [`components.md`](./components.md) | The kit — buttons, inputs, chips/stamps, avatars, rows, cards, the **slot machine**, modals & sheets, ticker, **live pulse**, the trust trail |
| [`patterns.md`](./patterns.md) | Compositions — the **vouch**, the **guide**, the **palate** profile, the recommendation, the feed, quiz, waitlist, **states** (empty/loading/error), the invite flow |
| [`tokens.css`](./tokens.css) | The single source of truth — import once, reference everywhere |

---

## Status & governance

- **v1.0** documents what shipped in the v2 landing, formalised for product use.
- Treat this as a **living** document. A pattern used in 3+ places becomes a
  component here. A value used twice becomes a token.
- **Changelog** lives at the bottom of each doc. Date and initial every change —
  a design system you can't trust is just decoration.

*Built for people who care where they eat. Bengaluru edition.*
