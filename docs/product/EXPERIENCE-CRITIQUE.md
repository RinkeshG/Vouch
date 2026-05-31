# Experience Critique — Vouch as a product, not a set of screens

> A deep, first-principles teardown from the user's seat (not the codebase). The
> earlier AUDIT.md caught the obvious "does it work" gaps. This is the harder
> question every good product team asks: **is this a connected product experience,
> and does it deliver the feeling it promises?** Each issue is grounded in actual
> observed behaviour, with the *why it matters* and the *how to fix*.

---

## The one thing (the thesis)

**Vouch today is a gallery of beautiful, individually-crafted surfaces that do not
connect into a product.** Each screen is considered; the *system between screens*
is not. A product is a machine of **cause and effect** — I do something, the world
changes, that pulls me to do the next thing. Right now almost every action is a
**dead end**: it shows a toast and stops. The Constitution's entire value is the
**loop** (follow → a place reaches you with a receipt → trust → save/vouch → vouch
back → your guide recruits). **That loop is not walkable end-to-end in the live
product.** Fix the screens all you like — until the loop turns, there is no product,
only a portfolio.

This is *the* finding. Everything below is evidence for it.

---

## I walked it as a brand-new user. Here is where the experience broke.

1. Landing → "you're in" → **Start your map.** Good. I add three places I love;
   the map fills; I feel something. This is the best moment in the product.
2. I follow a couple of palates → **"Enter Vouch."**
3. I land on my home... **and it's showing someone else's spots.** The map I just
   built is *gone* — the home renders seeded demo data (`DEMO_SESSION`), not my
   onboarding session. **The single promise of onboarding — "build *your* map" — is
   broken at the very handoff that should pay it off.** (Confirmed: `direction-a`
   reads `DEMO_SESSION`, never `loadSession()`.)
4. The home is the thing I'll open most. I try to do the one thing the product is
   for — add a place. I press **"＋ Vouch a place."** **Nothing happens.** (Confirmed:
   the home, palate, and spot pass no `onNewVouch`; the privileged action is dead on
   3 of 4 primary surfaces.)
5. I tap a glowing pin on my map to see what it is. **Nothing opens.** Pins don't
   lead to spots. The map is a picture, not a surface.
6. I press **"Focus tonight's call."** A dot gets a halo. **Then what?** No place
   surfaces, no "take me there." A control with no consequence.
7. I open a palate I might trust, press **Follow.** A toast says their vouches will
   reach my map. **They don't.** My map is unchanged. The borrow — the entire point
   of a palate — does nothing.
8. I build a guide (this part feels great) and press **Share.** It copies a link.
   I send it to a friend. **They open it and see "this guide isn't on this device."**
   The product's primary acquisition loop is, in practice, broken.
9. On a spot I'd vouch for, I press **"Vouch it."** A toast says *"add why in a
   vouch."* **There is nowhere to add it.** The sacred act is a dead toast.

By step 4 the magic from step 1 is gone. **The product front-loads its only
delight into onboarding, then strands the user on an island of dead buttons.**

---

## The structural issues (first principles, ranked)

### 1. The loop never closes — actions have no consequences
`＋Vouch`, Follow, Borrow, Share, the stamp buttons — all **toast-and-stop**.
*Why it's fatal:* retention is a chain of "I did X → the world changed → now I want
Y." With no consequences there is no chain, so there is no reason to return. This is
not polish; it is the difference between a product and a clickable mock.
*How:* make one full loop real before adding any new surface — add-a-vouch must
actually drop a pin + persist; Follow must actually add their spots; Share must
produce a link a second person can open. (Most of this needs the persistence layer.)

### 2. The surfaces don't connect — there is no navigable space
No path from a **pin / guide row / receipt name → the Spot**. **Search is a dead nav
item** (a broken promise worse than omission). From a Spot or Palate there's **no way
back**. *Why:* a product is a *space you move through with intent*; this is a set of
pages reachable only from the rail. *How:* everything that names a place links to its
Spot; everything that names a person links to their Palate; ship Search (it's the
core "where do I go?" question, not a nice-to-have); add back-affordances.

### 3. The data isn't mine — personalization is faked
Onboarding's output is discarded; Home and Palate show seeded demo numbers. *Why:*
"this is *yours*" is the whole activation thesis (single-player-first). A home that
ignores what I just made tells me my input doesn't matter. *How:* carry the
onboarding session into Home/Palate; the home must render *my* vouches, my archetype,
my real counts.

### 4. Honesty regressions — invented numbers are back
We removed the fabricated taste-match %. But **"37 follow you"**, **"410 follow"**,
**"borrowed 4×"** are the same sin: invented social proof, hard-coded. *Why:* the
brand *is* trust; a single fabricated number anywhere is a crack in the one thing we
sell — and the user will eventually sense the founders are house furniture. *How:*
show real counts or none ("be the first"); never invent a follower/borrow number.

### 5. The product is static — the promised feeling isn't built
`DELIGHT.md` describes the stamp landing, the pin igniting, the fly-in on follow.
**None of it exists in the running product.** *Why:* "delight from meaning" is *how
the brand is felt*; without it, even correct screens read as a wireframe, and the
emotional arc flatlines the moment onboarding ends. *How:* build the four signature
motions at the moments that matter (add, reveal, follow, share) — not everywhere.

### 6. The home is an island, and it can read as "empty app"
Producer's Home is a near-black map with a few faint pins under a huge headline. To a
cold eye that's *"is this broken / is there nothing here?"* — the exact risk flagged
when we chose it. It also connects to nothing (pins dead, ＋Vouch dead, Focus has no
payoff). *Why:* the most-visited surface sets the felt verdict on the whole product.
*How:* the territory must visibly hold *my* spots (legible, named-on-hover), the add
action must work, and a pin must open its Spot or surface its receipt inline.

---

## Per-surface, the sharper notes

- **Onboarding** — still uses the *old, non-receded* map while the whole product
  moved to "the city recedes, only trust glows." The single most important screen
  uses the weakest visual language. And its output is thrown away (#3).
- **Home** — see #6. Also: "Focus tonight's call" is a toy without a destination; the
  three stamps at the bottom are decorative.
- **Guides** — the editor's *"Add from your vouches"* actually lists **all of
  Bengaluru** (SEED), not places I've vouched — the label is a small lie that breaks
  the model (a guide is supposed to be built from *your* vouches). Share is
  same-device-only (#1). "Borrow this guide" does nothing.
- **Palate** — fabricated follower counts (#4); Follow has no consequence (#1); the
  **You / Rinkesh initials clash (both "RG")** makes the receipt ("Rinkesh vouched",
  RG avatar) read as *me* — confusing on Palate and Spot. Fix the seed identities.
- **Spot** — the strongest surface (Receipt-hero is right). But "Vouch it" is a dead
  toast (the ritual never opens), and "Add to a guide" jumps to the builder without
  pre-adding this place — a broken affordance that erodes trust in every button.
- **Navigation / IA** — one-way, rail-only, with a dead Search and dead ＋Vouch. There
  is no sense of "where am I, where can I go." This is the connective-tissue failure
  behind #2.

---

## What this means (and the order)

The instinct will be to keep polishing screens. **Don't.** The leverage is making the
loop *turn*:

1. **Wire the spine action everywhere:** ＋Vouch opens the real ritual on every
   surface; it drops a pin and persists. (The product's reason to exist must work.)
2. **Carry the user's data through:** onboarding → Home/Palate render *my* map.
3. **Connect the space:** pins / rows / receipts → Spot; names → Palate; ship Search;
   add back-affordances.
4. **Make consequences real** (needs persistence): Follow adds spots; Share opens for
   a second person; Borrow lands on my map.
5. **Then** the craft: the four signature motions; the receded map done for real
   (vector, not a raster filter); kill the invented numbers and the RG/RG clash.

Until 1–4 are true, Vouch is a gorgeous prototype of a product, not the product. The
good news: the hard part (the objects, the voice, the design language, the spine
*thinking*) is right. What's missing is the wiring that turns parts into a machine.

*Companion docs: AUDIT.md (the surface gaps), TEN-X.md (the step-changes), DELIGHT.md
(where motion earns its place). This doc is the connective critique they were missing.*
