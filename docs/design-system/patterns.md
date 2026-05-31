# Design System — Part IV: Patterns & Product Surfaces

Components are atoms; **patterns** are how we compose them into real product. The
landing proved the *language*; this is how we speak it across the app. Each
pattern: **the job**, **the composition**, **rules**, and **states**.

> Golden thread: every surface answers *"where should I eat?"* with *a name you
> trust.* If a screen loses the name, it's lost the product.

---

## 0. Rules the landing earned

- **Show the unit working, don't enumerate it.** "What a vouch is" and "how it
  reaches you" are **one idea**, not two sections — a vouch *is* the thing that
  travels the chain. Teach it with a single **motion demo** (the *vouch journey*:
  a vouch is made → through people you follow → onto your map), built from people +
  type, **no photos**. Avoid the dead "three labelled boxes" translation of the
  copy — that's mechanical, not design.
- **Canonical landing order:** Hero → Problem → **How a vouch reaches you**
  (what it is + the chain, animated) → The vouch (three states + composer) →
  Guides → Who → Quiz / Waitlist. Earn belief in the chain of people *before* the
  create tool. Spine = **understand → crave → act**, fast.
- **Inside == outside.** A guide's preview card uses the *same* row language as the
  opened guide — curator header, italic ranked number, place name, the curator's
  one-line note (see §2). Don't ship a thinner "teaser" that feels unrelated to the
  real thing.

---

## 1. The Vouch (creating one) — the Composer

The atomic create action. Putting your name on a place. Keep it **one line, one
tap to post** — the friction *is* the anti-feature; a vouch should feel as easy
as a text.

**Composition**
```
[your avatar]  You're vouching for…
Naru Noodle Bar                          ← search-selected place (display)
RAMEN · INDIRANAGAR · ₹₹₹                  ← auto tags
┌ one line — that's the whole review ────┐
│ Best bowl in the city. Get there at 6.  │  ← single-line note (sans, caret)
└─────────────────────────────────────────┘
[ Want to go ] [ Been ] ( Vouched )        ← the three stamps (pick one)
                              [ Post vouch ↵ ]
```
**Rules**
- No star input, ever. The only "rating" is the stamp + your one line.
- The note is **one sentence**, specific. Placeholder coaches: *"why you'd send a
  friend here."*
- Default stamp = **Vouched** when posting from "I loved this"; **Want to go**
  when saving from discovery.
- Place comes from a search (Google Places); tags auto-fill.

**States:** empty (place search) · typing · posting (button → spinner) · posted
(confetti + the new vouch card animates into the feed) · error (warm inline).

---

## 2. The Guide

A named collection of vouches by one palate. The shareable masterpiece.

**Composition (full screen)**
- **Header:** `a guide by <b>Name</b>` + avatar · the title (display-XL/L) ·
  `N places · note` (mono) · Follow/Save + Share.
- **Body:** ranked **leader rows** with full detail + the curator's one-line note
  per place + a `＋` save. (Preview cards show ranked names only; the full guide
  shows everything — see Components §5.)
- **Footer / CTA:** "Follow Name and this guide lands on your map."

**As a modal** (from anywhere): the bottom-sheet/dialog version (Components §12).
**As a page** (`/g/:slug` or `@handle/guide`): same blocks, full-bleed, with the
palate's other guides below.

**States:** loading (skeleton rows) · empty ("no places yet — add the first") ·
private/locked (blurred rows + "Follow to unlock") · owner-editing (drag to
reorder, inline add).

---

## 3. The Palate (profile)

A person *and* their taste. The follow target.

**Composition**
- **Header:** big avatar · display name · `@handle` · `N guides · N followers` ·
  Follow (primary). Optional **palate archetype** badge ("The Midnight Forager").
- **Tabs (mono):** Guides · Vouches · Map · Saved.
- **Guides grid:** interactive preview cards (ranked names, "Open all N →").
- **Recent vouches:** vouch cards with the trust trail collapsed to "you follow".

**Rules:** the profile *is* the product's social currency — make guides and the
archetype the loudest things. Don't bury taste under chrome.

**States:** following / not-following / it's-you (edit affordances) · new palate
(empty but inviting: "Aditi hasn't vouched yet — nudge her").

---

## 4. The Map / Feed (home)

The product's front door once you're in: **everything the palates you follow have
vouched, where you are.** The feed *is* a map (the word and the surface align).

**Two reads of the same data**
- **Map view:** dark map, glowing saffron pins (clustered), tap a pin → the
  rec card (Components §6.2) as a sheet. "Tonight, near you" filters by
  time/occasion (the slot logic, productised).
- **Feed view:** a vertical stream of rec cards + live-pulse-style signals
  ("Aditi just vouched…", "Your circle is loving…"). Each card carries its trust
  trail.

**Rules**
- Every item shows **who** and **who you follow**. No anonymous tiles.
- Context first: default to *near me + right now*; the "decide for me" lever is
  always one tap away.
- Mix signal types (fresh vouches, trending, your saved) like the live pulse —
  variety keeps it alive.

**States:** first-run (you follow no one → "Borrow a palate" suggestions + the
quiz) · no vouches nearby ("Nothing vouched within 2km — widen, or be the first")
· loading (skeleton cards) · offline (cached + a quiet banner).

---

## 5. Decide-for-me (the slot, productised)

The slot machine isn't just a landing toy — it's the answer to the core pain.
In-product: a persistent **"Can't decide?"** affordance that surfaces *one*
trusted pick matched to context (time, occasion, distance), with the full reel
delight. Same component, real data, same trust trail on the result.

---

## 6. Onboarding — the Palate Quiz

Four quirky taps → a shareable archetype → starter follows + a seeded **Map**.
Doubles as the empty-state cure. (Components: quiz card → palate result card.)
- Output is a **branded, screenshot-ready card** (Vouch mark + archetype glyph +
  starter spots + `vouch.app` footer). Share spreads the brand. This is the
  virality unit — treat it with the most design care.

---

## 7. Invite / Waitlist

Invite-only is brand, not just gating. Every "Request invite" opens the **invite
modal in place** (never a scroll-jump). On submit → **Waitlist status** you climb
by vouching/referring (Components §13). The waitlist *is* the cold-start engine.

---

## 8. Shareable Artifacts (the virality kit)

Anything meant to be screenshotted gets **Vouch branding baked in** so the share
spreads the brand:
- **Palate card** — archetype identity.
- **Vouch card** — "Vouch sent me to Naru tonight — vouched by Rinkesh."
- **Guide card** — a beautiful index someone passes on.

Each: the wordmark/mark, a `vouch.app` line, the dark+saffron system. Action
buttons sit **outside** the shareable frame so the screenshot stays clean. Plan a
generated **OG image** per artifact for true top-of-funnel.

---

## 9. States — the unglamorous half of the product

A surface isn't designed until its empty/loading/error states are. House rules:

| State | Rule | Voice example |
|---|---|---|
| **Empty** | Never a dead end. Invite the next action. | "No vouches here yet. Be the first to put your name down." |
| **Loading** | **Skeletons**, not spinners, for content (shaped like the real rows/cards; subtle shimmer in `--surface-2`). Spinner only for button-level actions. | — |
| **Error** | Warm, blameless, recoverable. Never a raw code. | "That didn't go through. Tap to try again." |
| **Offline** | Show cached; a quiet `--faint` banner, not a blocker. | "You're offline — showing your saved map." |
| **First-run** | The most important screen. Always points to: follow a palate, take the quiz, or make a vouch. | "Your map's empty because you follow no one yet. Borrow a palate →" |
| **Success** | Earned celebration (confetti on the *right* moments) + a clear next step. | — |
| **Permission** | Ask in context, explain the trade. | "See what's vouched near you? We'll only use your location to sort the map." |

---

## 10. Navigation & App Shell

- **Marketing nav:** wordmark left, one primary action right (Request invite →,
  which opens the modal). Minimal. Links collapse on mobile to wordmark + action.
- **Product shell (logged-in):** a **bottom tab bar on mobile** (thumb zone) —
  Map · Search · ＋ Vouch (centre, saffron) · Guides · Palate(you). Top bar holds
  context (location chip, "can't decide?"). Desktop promotes the same nav to a
  left rail or top bar.
- The centre **＋ Vouch** is the only saffron item in the bar — creating is the
  privileged action.

---

## 11. Responsive behaviour (the experience rules, not just the breakpoints)

Mobile is the room. Design it first; let desktop inherit.
- **Stacking order matters:** when a 2-col split collapses, the **product
  surface stacks below the copy** (lead with the words, reward with the toy).
- **Modals → bottom-sheets** below `--bp-sm` (Components §12).
- **Forms stack** (input over full-width button) below `--bp-sm`.
- **Tap targets ≥44px; primary actions full-width** on phone.
- **Type fluidity:** display sizes use `clamp()` so headlines stay big-but-safe;
  body never drops below ~16px.
- **Don't hide; reflow.** Prefer reflowing/stacking content over hiding it on
  small screens. Hide only true chrome (ticket-stub flourishes, decorative rails).
- **Horizontal scroll** is allowed for *chips/tabs* with an edge mask — never for
  primary content.

---

## 12. Building a new screen — the recipe

1. **State the job** in one sentence ("help the asker pick dinner near them now").
2. **Find the trust** — where does the name/who-you-follow appear? If nowhere,
   redesign.
3. **Compose from the kit** — rail+body or split; cards, leader rows, the trail.
4. **Write the copy** in voice; use the lexicon (palate/vouch/guide/map).
5. **Design the states** (empty/loading/error/first-run) *before* the happy path.
6. **Phone first**, then let desktop inherit; check `--bp-md`, `--bp-sm`.
7. **Pass the gates** — tokens only, focus rings, ≥44px, reduced-motion,
   one-saffron/one-glow, every element earns its place.

---

### Changelog
- **v1.0** — Patterns + product surfaces mapped from the landing language. *(— DS)*
