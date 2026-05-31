# The Logged-In Home — Directions

> ⚠️ **SUPERSEDED (v1).** See **`DIRECTIONS-v2.md`** + **`SPINE.md`** for the product-first rethink (spine resolved; references-grounded; un-anchored). Kept for the record.

> The only review that matters has a name on it. This document decides what the
> logged-in home screen **is** — the job someone hires it to do, what dominates
> the screen, and why.

## The question on the table

Two prior homes failed for the same root reason: they decided a **container**
before they decided a **job**.

- **Attempt 1** stacked kit components in a column — no flow, no product thinking.
- **Attempt 2** stretched a phone layout to desktop — a 50/50 map + a flat list
  of my places under the generic headline *"Everything you'd put your name on."*
  This is `src/components/vouch/home-map.tsx`, and it is the rejected attempt. It
  leaks the aggregator idiom (every place, pinned, flat, equal weight) and
  silently promises *"we cover the city"* when the whole wedge is *"we cover your
  people."*

The home is not a place to **read**. On day one there is nothing to read — thin
supply, zero follows, no answer the network can keep. The home is the place where
you **do one thing repeatedly and feel something**, and where that act makes your
taste legible. So the design question is two linked decisions:

1. **What is the dominant first-three-seconds image** — a *state you admire*, or
   an *act you perform*?
2. **What single gesture do you come back to do** — and does it deposit value
   before you follow a single palate?

Everything below is constrained by the spine: **single-player-first**, a wow in
**under ~90 seconds before a single follow**, and a metagame (your map filling,
your archetype sharpening, taste-match with real people) as the reason to return.

A note the room earned the hard way: the earlier synthesis listed *three*
directions, but **The Standing and The Stamp are one home seen from two angles** —
the surface and its gesture. They are collapsed below into one direction,
**The Producer's Home**. The genuinely distinct alternative is **The Ledger**.
"Decide tonight," the deck of strangers' calls, and any borrow/match notification
are deferred until real density and real humans exist.

---

## Direction A — The Producer's Home *(recommended)*

**Your taste rendered as a territory you are visibly building, with one weighty
gesture — putting your name on a place — as the act that fills it.**

### JTBD
*When I open Vouch the morning after I logged my first spots — or idly, on a day
I'm not deciding anything tonight — I want proof that my taste is becoming
legible and that I'm turning into the friend with the spots, plus one satisfying
thing to do that advances it. So I add the next one, before I follow anyone.*

### Thesis
The home is a **status surface that makes YOU feel produced, not fed.** The
dominant object is your map, but reframed from utility (a directory with
neighborhoods and search) into **asset** (reputation-as-territory that visibly
fills). The wow is fully computable from a one-user start: `archetypeFor()` in
`src/components/vouch/_taste.ts` derives an identity from what you back with zero
followers (line 62), and the home titles itself with that identity. This is the
only direction whose payoff depends on **nobody but you**.

But a status surface you only admire is a mirror in an empty room — it goes stale
by D3. So the daily act is not "admire your standing," it is **put a name down**,
made deliberate and weighty. The two are not rivals; the gesture is how the
asset grows. Each stamp ignites a pin, nudges the archetype title, and lands like
signing something. The state updates as a **consequence** of the act — the act is
the home.

### What you see first
A dark (`#100f0d`) map of Bengaluru, mostly empty, with your handful of saffron
pins glowing in the 2–3 areas you actually eat in — **each pin carries a name,
never a number.** Above it, one oversized Bricolage Grotesque line that is
**state, not a label**:

> Four spots. You're becoming **The Midnight Forager.**

A Space Mono eyebrow reads `admit one`. The emptiness is the point: it reads as a
room filling, not a city you failed to cover. The loudest saffron element on the
screen is the always-present **Put a name down** action, anchored to the map.

### Primary action / loop
**Add a vouch — one deliberate gesture.**

1. Pick a spot → choose a stamp (**Want to go / Been / Vouched**) → write one
   line (≤120 chars).
2. *Want to go* pins silently. *Vouched* costs a sentence — **producing stays
   sacred**; the cost is the trust.
3. The pin ignites. The archetype title shifts a notch. A toast confirms
   *"Your name's on it."*

The loop you return for: add a vouch → it lands on your map / sharpens your
archetype → (later, once you follow) their vouches + taste-match enrich your map
→ you decide & go → you vouch again.

### How it looks & feels
After-dark and a little smug — like walking into a room where your name is on the
door. Warm `#100f0d` ground; **saffron only where it earns it** (your newest pin,
the add action, the line you're writing). The archetype title set huge in
Bricolage; metadata in dry Space Mono — `11 spots · 3 areas · The Midnight
Forager`. Writing the vouch feels like signing: the textarea is the centerpiece
of the add moment, the 120-char limit a deliberate constraint, not a nag. The
stamp lands with weight (a press, a subtle thunk, the pin igniting in your
peripheral map). You leave **full, having made something** — not starved, not
scrolling.

### Tradeoffs
- **Four pins on a dark city can read as "this app is empty"** to a cold eye.
  Mitigated by titling the screen with *becoming*-state and by saffron glow, but
  it is the live risk and must be designed against, not assumed away.
- **Map-as-canvas flirts with the aggregator idiom.** Defended by: pins always
  carry names; no search-the-whole-city affordance; the map is *yours*, not the
  city's.
- **The sacred/satisfying tension is a real craft bet.** Too toy-like and the
  vouch becomes noise-with-a-face — the exact thing Vouch exists to kill. Detune
  it too far and you lose the frequency that makes it retentive. The resolution:
  *Want to go* is cheap and frequent; *Vouched* is rare and costs a sentence.
- **Low frequency.** You cannot deposit a great restaurant every day. Without an
  inbound social signal, the gap between cold-start and density is unsolved (see
  Open Questions).

### Who / stage it serves
The **Tastemaker on a cold day-one** — it finally hands them a home and a
scoreboard. The **Asker** is made a producer first (vouch before you lean on the
network). Strongest at the zero-follower start; needs the warm-network layers
(borrows, real matches) switched on to retain past D3.

### Who backs it
- **Nikita Bier** — the status mirror; the dopamine of becoming someone worth
  borrowing from; archetype computes in under 60s off your own vouches.
- **Kunal Shah** — Delta-4: the *standing* job has **no incumbent** (the group
  chat gives answers but never standing), so it's a clean +4 from one user; and
  it mirrors India's high-personal-trust model where every pin is a name. With
  the caveat that the gesture must stay weighty — in a low-trust society, trust
  is built by **visible cost**.
- **Brian Norgard** — the home must be a *toy* with one gesture that quietly
  keeps score; the stamp is Vouch's swipe, the surface is the distribution —
  fused here into a single-player producer loop, not a deck of strangers.

---

## Direction B — The Ledger

**Signed testimony as the editorial hero: a place, a face, one quoted line —
your vouches typeset like a private club's reservation book.**

### JTBD
*When I open Vouch, I want the first thing I see to say, unmistakably, "these are
MY people and my places, signed — no strangers shouting averages" — so I trust
the surface and feel the pull to add a line of my own.*

### Thesis
The user's first mental model isn't spatial, it's **social and temporal**: what's
worth my name, and who I trust has weighed in. So lead with named taste rendered
as **editorial testimony** — the vouch-with-a-name as the hero unit, never a pin
or a number. The map is demoted to a *"see it on the map"* lens you pull, not the
room you walk into. This is the truest literal expression of *a name, never a
number* and the After-Dark / Ledger metaphor.

The honest reckoning, post-critique: **on day one this renders three to six
lines.** A vertical text column of six lines is the prettiest empty Notes app in
the world — and it is neither screenshot-worthy nor visibly *growing*. So The
Ledger is strongest **not as the dominant container but as the texture** that
sits on the producer surface: every pin's testimony is a name + a line, never a
number. Held as a full-screen hero, it under-delivers the metagame at the exact
moment (cold start) the product is most fragile.

### What you see first
A single editorial column in Bricolage Grotesque: each entry a place name, a face
+ name (the receipt), one quoted line of why. At the top, a live dated dateline in
Space Mono — *"Saturday. Three people you trust added spots this week."* The
always-set empty seat — a saffron-edged **Put a name down** — looks like the next
line in the ledger. Hierarchy: testimony first, the act of adding second, the map
a quiet third.

### Primary action / loop
**Add a vouch — the diary entry** — rendered as a sub-15-second act (place → one
line → occasions) that lands as a new typeset line in your own ledger and nudges
your archetype. The empty seat is the loudest element.

### How it looks & feels
Like being handed the good table's reservation book — composed, confident, dryly
witty in the dateline. Warm `#100f0d`, generous space, saffron only on the empty
seat and your own newest line. Every line is signed. Not gamified, not busy —
editorial. No infinite scroll, no equal-weight card wall.

### Tradeoffs
- **The cold-start emptiness is worse here than on a map.** Three typeset lines
  read as bare; a filling territory at least *implies* accumulation.
- **A text column doesn't visibly grow or screenshot** — it under-delivers the
  metagame and the virality that reputation-as-territory provides. A list reads
  as a to-do; a filling map reads as accumulating reputation.
- **For a tired Asker who just wants an answer**, leading with testimony-to-write
  is friction, not payoff.

### Who / stage it serves
The Tastemaker who already has taste to typeset, and the brand purist who wants
*"this is not Zomato"* said in the first second. Strongest once there are a few
weeks of testimony; **weakest at the literal cold start.** The most on-brand of
the directions, the least metagame-y.

### Who backs it
- **Julie Zhuo** — one job, one dominant focal point; the first three seconds
  must land on a NAME and a sentence, never a pin or number; kill the split-pane
  map (the aggregator tell, and the rejected attempt).
- **Kunal Shah & Nikita Bier** — on the anti-aggregator wedge: the receipt (a
  name + a line) *is* the UI; no card grid, no star.

---

## Recommendation

**Build The Producer's Home. Take The Ledger's discipline as the texture on it,
not as the container.**

Concretely:

1. **The dominant first-three-seconds image is your dark, mostly-empty territory
   titled by your earned archetype** — *"Four spots. You're becoming The Midnight
   Forager."* This is the only direction whose wow is fully computable from a
   one-user start using code that already exists (`archetypeFor()` in
   `src/components/vouch/_taste.ts`), and the only job with no incumbent and a
   clean Delta-4 from a standing start.

2. **The daily act is the stamp — add-a-vouch made deliberate and weighty.** A
   pin ignites, the archetype title nudges, the line you write feels signed. The
   map and standing are the **peripheral score** the gesture keeps. This is the
   answer to the staleness risk: you don't return to admire, you return to do.

3. **Apply The Ledger as texture:** every pin's testimony is a name + a line,
   never a number. Borrow its editorial restraint — no card wall, no infinite
   scroll, generous space, saffron only where it earns it.

4. **Replace the rejected attempt.** `src/components/vouch/home-map.tsx` — the
   50/50 split-pane with *"Everything you'd put your name on"* — is attempt #2
   and should be retired, not restyled. Demote the map from a split-pane to your
   territory.

5. **Defer** "decide tonight," the deck of others' calls, and all borrow/match
   notifications until real density and real humans exist.

### Two code claims that must be fixed before this ships honestly

The earlier synthesis leaned on social proof that the code **fabricates**, and a
trust brand cannot ship fabricated trust:

- **`matchPct()` is not honest.** Line 75 of `_taste.ts` reads
  `Math.max(58, Math.min(96, Math.round((inter / union) * 100) + 48))` — a hard
  **floor of 58%** and a **+48 offset**. This is not an overlap; it is a number
  invented to look flattering. **Do not surface a taste-match % on the day-one
  home at all.** Show a *reason plus a count* instead — *"You both back late-night
  and dates"* — and only compute a real, unfloored overlap once it can be honest.
- **Onboarding/DEMO auto-follows the founders.** `DEMO_SESSION.followed` is
  hardcoded to `["Aditi", "Meera"]` (line 98), and entry is gated behind a
  follow. **Remove the gate.** The producer home must stand on your own vouches
  with zero follows; the founders are real palates you *may* discover, never
  house furniture pre-attached to your account. A fabricated *"Meera borrowed
  your spot"* on day one is radioactive.

---

## Open questions

1. **Where exactly is the honest line on founding-palate social proof?**
   Taste-match framed as a real, unfloored overlap with a named palate is
   defensible; a hardcoded 58% floor or a fabricated borrow is not. Will a user
   ever sense the three founders are house furniture — and if so, how do we make
   them feel like *discovered* palates instead?

2. **The day-2 return trigger, before the network exists.** Vouches are
   inherently low-frequency; you cannot deposit a great restaurant daily. If
   there's no borrow/match to pull you back, what fills the gap between cold-start
   and density — *Want to go* capture? An archetype that keeps sharpening? A
   weekly "your territory this week" beat?

3. **Can four saffron pins on a dark city reliably read as "reputation growing"
   rather than "this app is empty"** — without leaking the aggregator tell? This
   is the make-or-break visual bet of Direction A.

4. **Is the stamp gesture weighty enough to feel sacred yet satisfying enough to
   repeat** — without becoming a flippant swipe that cheapens the name-on-it
   unit? The *Want-to-go-is-cheap / Vouched-costs-a-sentence* split is the
   proposed answer; it needs to be prototyped and felt.

5. **When does "decide tonight" unlock?** What density threshold (followed
   palates × their vouches in your areas) flips the home from a status surface
   into the earned answer engine?
