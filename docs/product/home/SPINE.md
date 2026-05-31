# SPINE — The Resolved Product Spine

> The single load-bearing decision for Vouch's home. Everything downstream (concepts, screens, code) inherits from this document. If a design contradicts the spine, the design is wrong.

---

## 1. The Contradiction (why this document exists)

There is one unresolved, load-bearing contradiction in Vouch, and the previous thinking failed because it picked a side instead of resolving it.

**Side A — Decision-network spine (the Constitution).**
The spine is a *trusted decision-network* answering "where do I go tonight?" The personal taste library is "a SUPPORTING behavior, NEVER the spine." Home is decision support, not a feed or diary. Onboarding **auto-follows ≥5 founding palates** so home is populated immediately. The one metric is **Useful Decisions Created**.

**Side B — Single-player diary-first (recent pivot).**
You build your own map of vouches solo; the network grows later; "decide tonight" is the *earned* payoff. The rejected prototypes ("Producer's Home," "Ledger") flow from this — and directly contradict the Constitution's no-diary / no-map-first rules and its warm-start auto-follow assumption.

Each side fails exactly one of the two named risks:

- **Cold start** — a trust network is worthless empty. Side A's day-1 oracle, shipped into a *thin cell*, renders an empty or thin answer. Being **wrong once** about a trusted answer is worse than Google (the negative-Δ4 failure). Side A as literally coded *fabricates* the asset the brand is built on.
- **Weak loop** — no repeated reason to return. Side B's diary is "a mirror in an empty room": logging spots you already know is supply, not a Useful Decision, and a status mirror with no inbound signal goes stale by the third visit.

Neither pure spine survives both risks. The resolution must.

---

## 2. The Resolved Spine

**ONE trusted-decision-network spine. ONE surface. ONE gesture. THREE per-user, density-gated phases.**

The spine **is** the trusted decision-network. The diary is **its cold-start phase, not a rival** — a sequenced phase of the same spine, never the permanent shape.

- **ONE surface** — the dark Bengaluru that is yours. The map-as-texture, the saffron-where-earned pins, names-never-numbers, and the Receipt-as-texture are **constant across all phases**. This is not a screen swap; only the **loudest lens** and the **pin-mix** change.
- **ONE gesture** — *put a name down* (add a vouch).
- **THREE phases**, gated per-user by trust density `D`:

| Phase | Gate | Job | Loudest lens / pin-mix |
|---|---|---|---|
| **PRODUCER** | `D < 3` | Make my taste legible; pay off that I just joined | My saffron pins, titled by my own-vouch archetype. Loudest action: "Put a name down." |
| **BRIDGE** | `D` rising | Show me people whose territory provably rhymes with mine | Founding-palate pins appear *beside* mine, introduced by a real **counted** named overlap. |
| **DECIDER** | `D ≥ 3` + a real open/near pick | Give me the trusted answer for THIS occasion tonight | The Constitution's Tonight lens — each pick carries a Receipt. Now **earned**. |

The user **never learns a new screen**. Pins, names-never-numbers, and the Receipt are constant; the surface gets *louder and more outward-facing* as the graph earns the right to answer.

---

## 3. The Exact Trigger (the load-bearing decision the prior thinking left fuzzy)

The home does **not** flip on a vanity threshold (map-fill %, follower count — both banned and gameable). It flips on a **trust-density gate measured against the user's own declared cells**, confirmed by a **real decision event**, not by supply merely existing.

For each user, define:

```
D = count of (followed-or-discoverable founding palates that have
    ≥1 VOUCH in one of the user's 2–3 declared home_areas
    AND in one of their top occasions)
```

**DECIDER unlocks for a user the moment:**

> `D ≥ 3` **AND** the surface can return **≥1 occasion-matched, open-now, named, receipted pick**.

Below that bar, the home runs the PRODUCER/BRIDGE job and **is honest about it**. Phase promotion is **gated on the metric** (a real decision the user would trust), so PRODUCER can never become a vanity end.

**Why this is computable on day one:** §6 Founding Palates guarantees 500–2,000 real occasion-tagged vouches exist *before any open user*. So a user in a **dense launch cell** (e.g. Indiranagar / coffee / late-night) may cross `D ≥ 3` at the **end of onboarding** — DECIDER can be live in session one. A user in a **thin cell** honestly stays in PRODUCER and is *told so* until their cell fills. **Same surface, per-user honest density.**

---

## 4. The Home Job

> **"Build a territory of named taste that becomes the trusted way I decide where to go — starting from my own taste alone, and earning the network's answer the moment my cell can give me one I'd actually trust."**

The same dark-Bengaluru-that-is-mine answers three sequential jobs without changing form:

- **PRODUCER (D<3, E1/E3)** — "make my taste legible and pay off that I just joined." Dominant object: my saffron pins, titled by my own-vouch archetype (`archetypeFor`). Loudest action: *Put a name down*.
- **BRIDGE (D rising)** — "show me people whose territory provably rhymes with mine." Founding-palate pins appear beside mine, introduced by a real counted overlap ("Meera vouched 3 of your late-night spots").
- **DECIDER (D≥3 + a real open pick, E2/E5)** — "give me the trusted answer for THIS occasion tonight." The Tonight lens, each pick carrying a Receipt.

---

## 5. Cold-Start Story

Cold start is beaten by **never promising the network can answer until it provably can, while never showing an empty screen.**

- **Day-1 floor of value = the user's own taste, computed honestly.** `archetypeFor()` derives "You're becoming The Midnight Forager" from the user's own 1–3 vouches with **zero followers** — no seeding, no lie.
- **Three mechanics carry the gap:**
  1. **Retroactive supply (Beli / Foursquare).** Onboarding's mandatory first vouch extends into a short prompted back-fill keyed off declared areas/occasions ("you eat in Indiranagar + late-night; what's your call?"). The user deposits 5–15 real vouches in their first sessions — their per-user contribution to the §6 seed.
  2. **Unlock-on-contribute (BeReal).** Others' picks stay locked until the user has put their own names down — extending mandatory-first-vouch and earning the context to trust what later appears.
  3. **Honest discovery, never auto-follow.** §6 founding palates are surfaced in BRIDGE as palates whose territory provably overlaps yours (named, counted), **never** pre-attached via the radioactive `DEMO_SESSION` hardcode.

Because launch is in **dense cells**, an Indiranagar/late-night user can cross `D ≥ 3` by end of onboarding and see DECIDER in session one. A thin-cell user honestly stays in PRODUCER and is **told** ("we don't have trusted picks for parents in your area yet — add yours"): a promise kept, not a dead screen.

---

## 6. Loop Story

Food decisions and great-restaurant discoveries are both low-frequency, so a single-job home dies between events. This spine **stacks three loops at different frequencies on one surface**; the active phase picks which carries you, and they **hand off**:

1. **Low-frequency, always-on (day one, zero followers)** — add a real vouch → a pin ignites, the archetype title sharpens, territory fills. The Constitution's core loop, the supply pump.
2. **Higher-frequency separated lightweight act (Duolingo)** — *"Want to go"* is cheap, nameless, 5-second ambient capture: a reason to open on a non-deciding day (E3) **without cheapening the sacred vouch** (which stays rare and costs a written sentence — the cost is the trust).
3. **Occasion-triggered, the real retention engine** — the Friday "5 places your people vouched, open near you" (E5) and "you saved 3 near Church St, going this week?" fire **only in DECIDER**, when the graph can back them, pulling the user in at peak intent.

**The hand-off:** filling your territory in PRODUCER is what crosses `D ≥ 3` and switches on the DECIDER triggers — early diary effort visibly "saves up" for the decision payoff.

- **Distribution (E4)** = the shareable guide / palate / "my Bengaluru map" card that wins a group chat and pulls new Askers onto the same surface. An artifact only a *built territory* can produce — which is why the empty oracle cannot drive the acquisition loop.
- **The Knower (E6)** is served by **utility-recognition only** — "4 people used your parents guide this week" — never likes/kudos.

---

## 7. Metric Story

**Useful Decisions Created** = `surfaced → trusted_open → saved_from_rec / shared_card / visited` (decision_events, §8/§9).

This spine grows the metric monotonically AND keeps the read clean:

- **PRODUCER** *manufactures the supply* (own-loop `marked_been` + back-filled vouches) that is the **precondition** for any future Useful Decision. It does **not** pretend logging known spots is a decision.
- **BRIDGE** mints the **first true discoveries** the instant an honest-overlap founding pin surfaces (`trusted_open`, `saved_from_rec`), driven by the **real counted overlap** ("Meera vouched 3 of your spots") — which raises `trusted_open` more than any anonymous or fabricated signal.
- **DECIDER** maximizes the metric at the high-intent moment (`visited`, `shared_card`).

The phase gate `D` is itself **tuned on Useful Decisions Created** — you graduate to Tonight only when your graph can produce a decision you'll actually trust — so the home **cannot drift into vanity** (filling a map for its own sake stays in PRODUCER and never claims credit).

**Critically:** killing the `matchPct` floor and the auto-follow gate (see §9) means early Useful Decisions are **real, not manufactured** — preserving a clean read at the exact moment you most need it.

---

## 8. What Is Rejected, And Why

### Diary-first as permanent spine — REJECTED
Correctly wins day-1 cold start and the honest wow, but has **no answer to the one metric or the loop past D3**. Logging spots you already know is supply, not a Useful Decision (no discovery happened); a status mirror with no inbound signal goes stale — "a mirror in an empty room." Worse, to feel alive early it tempts exactly the fabrications already in the code (the `matchPct` floor, the hardcoded `DEMO_SESSION` borrows) — fatal in a trust brand. **Right about the START, wrong to stop there.**

### Decision-network-first as a fixed day-1 screen — REJECTED
Correctly names the endgame and the metric, and §6 *does* prevent cold start **in dense cells** — but shipping a universal day-1 oracle in a **thin cell** renders an empty/thin answer that, wrong once, is worse than Google (negative-Δ4) and gives a reason to leave. Its cold-start move *as literally coded* (auto-follow + floored match) fabricates the one asset the brand is built on. **Right about the DESTINATION, wrong to start there for every user.**

### Pure toy / swipe-deck — REJECTED
No cards to deal on a cold start, and a swipe **trivializes the sacred vouch** — banned grammar.

### "Sealed City" concept — REJECTED (anchoring in disguise)
A pin map as hero (`whatYouSeeFirst = "Map pins"`, journey `"Unseal, more, lens"`) is **map-first UI (banned)** and is structurally the retired `home-map.tsx` split-pane with a fog-of-war reskin. "Open the city" is a **coverage** job, not a trust job; defogging rewards vouch **quantity** (Foursquare-coin vanity drift). Fails Gate 1 and Gate 4. **Salvage only the unlock-on-contribute mechanic** (§5) and fold it into the PRODUCER floor as named-but-blurred *receipts* (a person + an occasion, place withheld) — never pins on a map; the unlock reward is a trusted **answer**, not map coverage.

### Why the sequenced spine is strictly dominant
It takes diary-first's honest **start** and decision-network-first's honest **endgame**, and connects them with a per-user, metric-gated density trigger — so the user is **never shown a promise the network cannot keep**, and the network is **never starved of the supply only the diary pump can produce**. The only cost is building the phase-gate — far cheaper than either failure (a dead empty home, or a trust brand caught lying).

---

## 9. Constitution Amendment (precise, ship-blocking)

Three **additive** amendments. **No non-negotiable is touched** — names-always, no-scores, Receipt-everywhere, and no-feed / no-map-first / no-likes / no-vanity all stand.

**(1) §0 + §7.1 — Home is ONE density-phased decision surface, not a fixed screen.**
The spine is the trusted decision-network; the personal taste library is its **cold-start PHASE**, not merely "supporting." Home **Phase 1 (PRODUCER)** is your territory + add-a-vouch. The Tonight/occasion **DECIDER** lens is an **earned per-user unlock** gated by trust density, **not** a day-1 universal.

**(2) §6 — Replace the auto-follow assumption.**
Strike *"onboarding auto-follows ≥5 founding palates so home is populated immediately."* Replace with:
> "Onboarding seeds the user's OWN territory via retroactive vouches; founding palates are **DISCOVERED via honest named overlap, never auto-attached**; the first session is full of the user's own taste, and DECIDER unlocks per-user when their cell can produce a trustworthy open-now answer."

**(3) §9 — Add the density signal as the phase-gate.**
Add the per-user **density signal `D`** (followed/discoverable palates with vouches in the user's areas × occasions) as the phase-gate, and state plainly that **phase promotion is gated on a real decision event**, so PRODUCER can never become a vanity end.

### Constitution-level non-negotiables (new, ship-blocking)

- **NO fabricated social proof.** A taste-match must be a **real, unfloored, named, countable overlap** — or it is **not shown**.
- **Retire `matchPct()`** (`src/components/vouch/_taste.ts:75`): the `Math.max(58, …)+48` floor/offset is a fabricated number-about-people. **Delete the floor and offset entirely.** Replace the displayed signal everywhere (`home-tonight.tsx:66`, `home-pulse.tsx:85`, `onboarding.tsx:184`) with a real counted overlap ("Meera vouched 3 of your late-night spots" / "Shares 4 of your occasions"). **Never show a %.** If you must rank internally, compute true Jaccard but never surface it as a number.
- **Retire the hardcoded follow-gate** (`DEMO_SESSION.followed = ["Aditi","Meera"]`, `_taste.ts:98`, read by `home-tonight.tsx:22`, `home-pulse.tsx:30`, `home-taste.tsx:17`, `home-map.tsx:30`). Set `followed = []` by default. Founding palates are **discovered** via honest counted overlap and surfaced as *candidates*, never read as already-chosen furniture. This violates "value before a single follow."
- **Formally retire `home-map.tsx`** (the aggregator split-pane) as superseded by the one density-phased surface.

---

## 10. Reasoning Trail (the three arguments this resolution reconciles)

This resolution is a *tightening* of three prior arguments, not a fourth fresh take. What it keeps and what it rejects from each:

- **Argument 1 (decision-network-first).** *Kept:* the metric is only minted by decisions, and §6 already prevents cold start. *Rejected:* the claim that home is a decision surface "from day one" **universally** — in a thin cell that ships an empty oracle (negative-Δ4).
- **Argument 2 (diary-first).** *Kept:* the honest cold-start mechanism (own vouches + retroactive back-fill + unlock-on-contribute) and the kill-the-fabrication demand. *Rejected:* making the diary the **permanent** spine — logging known spots mints supply, not Useful Decisions, and a producer mirror goes stale by D3.
- **Argument 3 (sequenced, one-surface-three-phases).** *Adopted in shape.* *Tightened:* the trigger from a loose "density threshold" to the exact **`D ≥ 3` + a real open-now pick + metric-gated** rule above; and the PRODUCER phase is made **shorter** than argument 3 implies — the goal is to cross into DECIDER as fast as honestly possible, because the metric only moves in BRIDGE/DECIDER.

---

## 11. The Four Anti-Drift Gates (every concept must still pass)

1. **Situation** — answers a real user situation, not "a standard screen."
2. **Trust visible** — shows the Receipt (who + why it reached me); no anonymous magic, no scores. When trust is thin, it **confesses** rather than inventing.
3. **Better data** — guides toward useful vouches; every path drives real supply/decisions, nothing rewards idle browsing.
4. **Logo-removed** — still unmistakably Vouch (name-backed, trusted, city-specific, warm, opinionated). Would never feel at home in a recolored Zomato/Google.

---

*This spine resolves the decision-network-vs-diary contradiction by sequencing, not choosing. One surface, one gesture, three honest densities, one exact trigger.*
