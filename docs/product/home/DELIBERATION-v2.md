# Home Rethink — DELIBERATION v2

_The record of the second pass at Vouch's home. Where v1 produced a recolored aggregator from first instinct, v2 forces a spine decision, a cross-category reference teardown, divergent concepts by lens, a synthesis, and an adversarial critique. This document preserves the reasoning **and the tension** — including what we rejected and why._

> Vouch is "the trust layer for taste" for restaurants, Bengaluru-first, invite-only. **The only review that matters has a name on it.** The wedge is anti-aggregator: not coverage (every place, 4.2 stars from strangers) but **trust** (the few places someone you believe in stakes their name on). Non-negotiables: a vouch always carries a **name**; **no** star/number scores ever; recommendations come **with receipts**; trust is always visible.

---

## 1. Why v1 failed

v1 was rejected for three compounding reasons. They are worth naming precisely, because each is a trap this pass is structured to avoid.

**1.1 Anchoring.** v1 started from "what does a restaurant app's home look like?" and reproduced the answer the category already gives — a map with a list beside it, occasion chips on top, a hero card. That is `home-map.tsx`: the aggregator split-pane. It is **map-first UI**, which the Constitution bans, and it leads with coverage (show everything) rather than trust (show the few). A logo-removed v1 home would feel perfectly at home inside a recolored Zomato or Google — the definition of failure on Gate 4.

**1.2 Isolation.** v1 designed the home as a **standalone screen** rather than as the **output of an entry point**. But nobody arrives at "the home" in the abstract — they arrive just after onboarding (E1), at a Friday-night decision moment (E2), idle (E3), from a friend's shared link (E4), from an occasion notification (E5), or as a Knower checking their spread (E6). A screen designed without an arriving situation defaults to a dashboard, which is exactly the "standard screen" failure mode.

**1.3 No references.** v1 reasoned from the brand deck alone and never interrogated how real products solve the underlying jobs (decide fast, beat cold start, create a reason to return, distribute). With no teardown, it had no transferable mechanics and no anti-patterns to sharpen against — so it drifted to the most generic solution available.

**The correction in v2:** force a spine decision first; treat the home as a per-entry-point output, never a screen; do a live cross-category teardown and cite which reference backs each idea; diverge by lens before converging; then critique adversarially against four anti-drift gates.

---

## 2. The spine debate

The load-bearing question this pass exists to settle: **what is the spine?** The Constitution and recent build work contradict each other, and the contradiction is load-bearing — it decides what the home's job actually is.

- The **Constitution** says the spine is a **trusted decision-network** ("where do I go tonight?"). The personal taste library is "a **supporting** behavior, **never** the spine." It bans star scores, anonymous tiles, scroll-feeds, map-first UI, likes/DMs, and vanity metrics. It assumes onboarding **auto-follows ≥5 founding palates** so the home is populated immediately. The one metric is **Useful Decisions Created**.
- Recent work **pivoted to single-player diary-first**: build your own map of vouches solo; the network grows later; "decide tonight" is the earned payoff.

Two named risks frame the whole debate: **(1) the weak loop** — no repeated reason to return — and **(2) cold start** — a trust network is worthless empty. The spine must serve both.

### Position A — Decision-network-first, as a fixed day-1 screen
The home is a decision surface from day one for everyone. §6 founding palates (500–2,000 real occasion-tagged vouches live before any open user) prevent cold start. The metric is only minted by decisions, so the home must be about deciding.
**Where it's right:** names the endgame and the metric correctly; §6 genuinely does prevent cold start *in dense cells*.
**Where it fails:** shipping a universal day-1 oracle in a **thin cell** renders an empty or thin answer — and an oracle that is wrong once is worse than Google (negative Gate-4). Its cold-start move *as coded* (auto-follow + a floored match %) **fabricates the one asset the brand is built on.**

### Position B — Diary-first, as the permanent spine
The home is your own taste territory; the network is a later layer; "decide tonight" is earned.
**Where it's right:** wins day-1 cold start honestly (your own 1–3 vouches need no network) and produces the honest wow.
**Where it fails:** has no answer to the one metric or to the loop past the first few days. Logging spots you already know is **supply, not a Useful Decision** (no discovery happened). A status mirror with no inbound signal goes stale — "a mirror in an empty room." Worse, to feel alive early it tempts exactly the fabrications already in the code.

### Position C — Sequenced / density-phased, one surface
One surface, three phases, gated by trust density. Correct in shape but, as first stated, **under-specified on the trigger** ("a density threshold") and **too loose on what unlocks** (risked a vanity threshold like map-fill % or follower count).

### The resolution — **SEQUENCED, with a tightened trigger**

A **single spine, one surface, one gesture**, sequenced by a precise, per-user, metric-bound trigger. The spine is the **trusted decision-network**; the diary is its **cold-start phase, not a rival.** We reject "diary-first as permanent spine" and "decision-network-first as a fixed day-1 screen" because each fails one of the two named risks; we adopt Position C's shape but fix what it left fuzzy.

**The trigger (the load-bearing decision the other positions left vague).** The home does **not** flip on a vanity threshold (banned, gameable). It flips on a **trust-density gate** measured against the user's own declared cells, **and** confirmed by a real decision event. Define for each user:

> **D** = count of (followed-or-discoverable founding palates that have ≥1 **vouch** in one of the user's 2–3 declared `home_areas` **AND** one of their top occasions).

The **DECIDER** lens ("Tonight") unlocks the moment **D ≥ 3 AND at least one of those picks is currently open / near** at a real decision moment — i.e. the home can produce a genuinely trustworthy, occasion-matched, open-now, named answer. Below that bar the home honestly runs the **PRODUCER** job and says so.

This is **not a screen swap.** The dark Bengaluru map, the saffron-where-earned pins, names-never-numbers, and the Receipt-as-texture are **constant.** Only the loudest lens and the pin-mix change: **yours → yours + rhyming → yours + trusted-answer.** Because §6 guarantees real occasion-tagged vouches exist before any open user, a user in a dense launch cell (Indiranagar / coffee / late-night) may cross D ≥ 3 by the **end of onboarding** — DECIDER can be live in session one. A user in a thin cell honestly stays in PRODUCER until the cell fills.

**The three phases (one surface, one gesture — "put a name down"):**

| Phase | Gate | Entry | Job | Loudest object / action |
|---|---|---|---|---|
| **PRODUCER** | D < 3 | E1 / E3 | Make my taste legible; pay off that I just joined | My saffron pins titled by my own-vouch archetype; "Put a name down" |
| **BRIDGE** | D rising | — | Show me people whose territory provably rhymes with mine | Founding-palate pins beside mine, introduced by a real **counted** overlap |
| **DECIDER** | D ≥ 3 + a real open pick | E2 / E5 | Give me the trusted answer for **this** occasion tonight | The Tonight lens; each pick carries a Receipt |

**Cold start** is beaten by **never promising the network can answer until it provably can, while never showing an empty screen.** Day-1 floor of value is the user's own taste, computed honestly (`archetypeFor()` derives "You're becoming The Midnight Forager" from 1–3 of the user's own vouches, zero followers). Three mechanics carry the gap: **retroactive supply** (Beli/Foursquare — a short prompted back-fill keyed off declared areas/occasions deposits 5–15 real vouches early); **unlock-on-contribute** (BeReal — others' picks stay locked until you put your own names down); **honest discovery, never auto-follow** (founding palates surfaced by real named overlap, never pre-attached).

**Weak loop** is beaten by stacking **three loops at different frequencies** on one surface: (1) the always-on supply pump (add a vouch → a pin ignites), (2) a separated lightweight act ("Want to go" — cheap, nameless, 5-second capture; the Duolingo-style day-2 trigger that does **not** cheapen the sacred vouch), and (3) the occasion-triggered retention engine ("5 places your people vouched, open near you" — fires only in DECIDER when the graph can back it). The loops **hand off**: filling territory in PRODUCER is what crosses D ≥ 3 and switches on the DECIDER triggers.

### Non-negotiable code fixes (constitutional, ship-blocking)
The current prototype **lies** in the two ways a trust brand cannot afford. Both are confirmed in source and must be fixed regardless of which concept ships:

1. **`src/components/vouch/_taste.ts` `matchPct()`** floors at 58 and adds +48 — a **fabricated number about people.** Delete the floor/offset entirely. Replace the displayed signal with a real, unfloored, **countable named overlap** ("Meera vouched 3 of your late-night spots"), never a synthetic %.
2. **`_taste.ts` `DEMO_SESSION.followed = ["Aditi","Meera"]`**, read by `home-tonight.tsx` / `home-taste.tsx` / `home-pulse.tsx` / `home-map.tsx` as pre-attached furniture — **fabricated social proof** and a follow-gate that violates "value before a single follow." Founding palates must be **discovered** via honest overlap, never auto-pinned.

### Constitution amendments (additive; no non-negotiable touched)
- **§0 / §7.1:** reframe Home as **one density-phased decision surface**, not a fixed screen. Spine = trusted decision-network; personal taste library = its **cold-start phase**, not merely "supporting." DECIDER is an **earned per-user unlock**, not a day-1 universal.
- **§6:** replace "onboarding auto-follows ≥5 founding palates" with "onboarding seeds the user's **own** territory via retroactive vouches; founding palates are **discovered** via honest named overlap, never auto-attached."
- **§9:** add the per-user density signal **D** as the phase-gate; state plainly that phase promotion is gated on a **real decision event** so PRODUCER can never become a vanity end. Codify ship-blocking: **no fabricated social proof**; taste-match must be a real unfloored named overlap or it is not shown. Formally retire `home-map.tsx` (the aggregator split-pane).

---

## 3. Reference teardown digest (cross-category)

What transfers, what does not, and the anti-pattern each sharpens. Every concept below must cite which of these backs it.

| Reference | What it solves | **Transfers** | **Does NOT transfer (anti-pattern)** |
|---|---|---|---|
| **Beli** | Taste-similarity about **people**, not places; pairwise ranking without numbers; retroactive log of past visits | A number **about people** (overlap count), not places; retroactive cold-start supply | Still shows a 0–10 **place** score — Vouch must never |
| **The Infatuation** | "Perfect For" filters; "your restaurant decider"; situation-first | Occasion as the **spine of the interface**, not a filter atop results | Single editorial authority; **no people / no receipts** |
| **Foursquare / Swarm** | Declared "Tastes" seed cold recs; check-in == Been lifelog | Declared-tastes onboarding seed; check-in as Been | Gamified coins/stickers **decayed into vanity** |
| **Letterboxd** | Diary-as-byproduct; lists == guides (identity); follow-for-activity | Lists == guides as identity artifacts | It's a **feed with ratings** — both banned |
| **Spotify Home** | Familiar→discovery gradient; "no decision needed, just press play" | The familiar→discovery **ordering** within a resolved answer | Pure algorithm, **no name** — the anti-pattern that sharpens Vouch |
| **Strava** | Lightweight recognition + momentum | **Utility-based** proof only ("3 you follow saved this", "your guide used 4×") | Kudos == likes + feed — **banned** |
| **Duolingo** | A separated lightweight daily act + streak as day-2 return trigger | A **separated** cheap act ("Want to go"), decoupled from the rare core act | Don't cheapen the **sacred vouch** into XP |
| **BeReal** | Unlock-on-contribute; prompted moment | Friends' content **locked until you contribute**; fuses cold-start + supply + mandatory-first-vouch | Make the prompt **occasion-triggered**, not clockwork |
| **CRED** | ONE assisted best action on home; premium dark; Indian high-trust | **One confident assisted action** stated with authority | Its action is a **known transaction**; Vouch's must carry a **Receipt** |
| **Partiful** | Link-first shareable artifact **is** the surface; unapologetic exclusivity | The home as a **sendable object** born to leave the app (E4) | Payload is an RSVP, not name-backed receipted picks |
| **"What to eat tonight" deciders** | Speed to a **single** answer; playful escape-hatch; pairwise | Collapse-to-one-answer + a capped escape hatch | Random / **zero-trust** — the void Vouch fills; the answer must have a **name** |

**Cross-cutting transferable kit:** retroactive supply; unlock-on-contribute; ONE assisted best action; situation-first; a number about **people** not places; familiar→discovery; utility-based recognition (not likes); link-first artifacts.

---

## 4. The divergent concepts, by lens

Seven concepts were generated, each from a distinct lens and each citing its reference backing. Summarized with their job, hero, action, spine-fit, and named risk.

### 4.1 The Verdict — _one assisted best action; the Receipt **is** the answer_
**Lens:** CRED's one-action home + decider-app speed + Infatuation situation-first — but the answer always carries a name and a why.
**JTBD:** Footpath at 7:40pm Friday, people waiting — one place I can walk to now that I'd stake the evening on.
**Entry:** E2 (DECIDER); degrades honestly to PRODUCER.
**See first:** One near-full-bleed dark card; context line typed first ("Friday · 7:42pm · Indiranagar"); ONE name; the Receipt rendered as the **body** (Meera's avatar + her actual sentence; a saved FaceStack; "open till 1am · 4 min walk"). No number, no second option above the fold.
**Action:** "Take me there" (mints the decision event). One receipted escape hatch ("Not tonight — who else?" → the runner-up *with why it was second*), capped at two, then routes to "put your own name down."
**Spine-fit:** Fires only at D ≥ 3 + an open occasion-matched pick; degrades honestly on the same surface ("No one you trust has staked a late-night spot near you yet — here's the one move that fixes it").
**Risk:** The honest-degradation gate is make-or-break — a confident lie from a trust brand is fatal (negative Gate-4). Also under-serves group decisions; mitigated by a shareable verdict and receipted runner-up.

### 4.2 Sealed City — _unlock-on-contribute; the home is a vault you open by producing_
**Lens:** BeReal unlock-on-contribute (mechanic) + Beli (the unlocked currency is a counted overlap, never a %).
**JTBD:** Just after my first vouch (E1), I want the city to physically open around that spot, proving the palates I'm matched to are earned.
**See first:** Dark Bengaluru map; one saffron pin (your vouch) surrounded by ~a dozen **sealed** (wax-stamped) pins you can't read until you contribute.
**Action:** Put a name down → the nearest sealed pins sharing that occasion×area animate open, revealing the name, the line, and the honest overlap count.
**Spine-fit:** Claims to be PRODUCER→BRIDGE made visceral; each unseal raises D.
**Risk:** Reads as a paywall; thin cells look sparse; the seal must never imply a hidden score. **(See §6 — this concept fails the critique.)**

### 4.3 The Occasion Line — _situation-first; the home begins as a spoken occasion_
**Lens:** Infatuation "Perfect For" as the **grammar of the interface**, not a filter; decider-app speed; Spotify ordering.
**JTBD:** Open with a specific situation in my head and immediately see who I trust staked a place for exactly that.
**See first:** Near-empty dark surface; ONE warm-serif line as a live text field — "Tonight, I want somewhere for ___" — pre-seeded from context; a quiet row of the user's own declared occasions as autocomplete (not result-mutating chips). No hero card, no map, no list until the line is committed; then 1–3 Receipt-first picks bloom (the voucher's face + their exact words **above** the place name).
**Action:** Author/commit an occasion sentence → act on its resolution. In PRODUCER the same sentence flips to authorship ("No one you trust has vouched a parents spot near you yet — put your name on one," composer pre-filled to that occasion+area).
**Spine-fit:** The sentence is the gesture; D decides what it resolves to; unanswerable lines convert to the supply pump at the exact point of unmet demand.
**Risk:** Free-text NLP is unreliable; mitigate by constraining to tap-to-complete autocomplete over the user's declared occasions/areas (feels authored, structured underneath). Thin-cell "you're the first" could fire too often.

### 4.4 "Out Loud" — _no persistent home; a question you finish, an answer with a name_
**Lens:** Decider-app single-answer-with-redo (fixing its zero-trust flaw); Infatuation grammar; Spotify "just press play" but with a name.
**JTBD:** Just say who I'm with and what tonight is, get back one trusted name, end the loop in under ten seconds.
**See first:** Near-black screen; one fill-in-the-blanks sentence with saffron-underlined blanks pre-filled from context; an "ask" affordance; below the fold only faint past questions (ephemeral, never a feed).
**Action:** Tap "ask" → the app **talks back** in the same column: name first, then the receipt, then the line in quotes, then "going" and "ask again ↻" (re-rolls **names**, not places). In PRODUCER the sentence inverts — the app asks **you**: "I don't have a trusted answer for that yet. What's YOUR call?"
**Spine-fit:** The sentence is constant across phases; only the answer changes with D; an empty network never fakes an answer — it asks you instead, minting supply.
**Risk:** Hides growing territory and others' guides — could starve E4 distribution and make the Knower (E6) invisible; the re-roll risks feeling like a slot machine; brutally exposed to the density gate (one bad DECIDER answer in a thin cell is the whole product).

### 4.5 Over To You — _the home is a hand-off to a person_
**Lens:** CRED one-assisted-best-action + Spotify familiar→discovery — but a **named human** is who presses play, with the why attached.
**JTBD:** Be handed straight to the one person whose taste fits this moment, already speaking, place-in-hand.
**See first:** Dark screen, no map, no grid. One large face + a spoken line in their voice ("It's Friday, you've got your folks in town. Karavalli. Take them — they'll talk about it for months."); ONE place as the inside of that sentence; the Receipt as texture beneath; a thin row of **other faces** who could hand you something. Tapping a face passes the hand-off; the surface re-speaks in their voice.
**Action:** Two taps (CRED-style): optionally pick **who** speaks; "Take it" on the place they hold out (mints the decision event). Escape hatch passes the baton to the next best-overlap palate.
**Spine-fit:** Only **who speaks** changes by phase. PRODUCER: the speaker is **you** (your archetype narrates your own territory; loudest action = add-a-vouch — it does not fake a friend). BRIDGE: a discovered palate enters the speaker row via a real counted overlap. DECIDER: the full hand-off fires. Cold start: there is **always** a speaker (you), so never empty. Weak loop: the speaker is occasion-triggered and changes ("see who's talking tonight").
**Risk:** Being handed to the wrong friend breaks the spell harder than a mediocre list, because it is personal — mitigated by one-tap re-handoff and honest "speak as you" below D ≥ 3.

### 4.6 The Round — _the home is a group-chat ender / link-first artifact_
**Lens:** Partiful link-first artifact **is** the surface, ported from "who's coming?" to "where are we eating?"; CRED one assisted seed; Constitution distribution.
**JTBD:** Mid-argument about where to eat, put a few named occasion-matched picks on the table and let the people I'm going with react in one place.
**See first:** One dark card titled in your words ("Friday, the 4 of us, somewhere in Indiranagar"); ONE seeded name-backed receipted pick; a quiet "+ Add a pick"; a dominant "Send this Round →" with empty seats. Thin cell: honest empty seed ("We don't have a trusted Indiranagar dinner pick from your people yet — put YOUR call down to open the Round").
**Action:** Fill 1–3 named picks → send as a link. Recipients (invite-gated, named) react with trust-bearing verbs — "I've been, go" (Been), "I'd put my name on it" (vouch), "+ a pick" — never anonymous likes. Resolution = the decision event.
**Spine-fit:** The multiplayer expression of the same surface and gesture; D governs what the Round seeds with. Cold start: born useful with one pick (or honestly converts host to supply); is the **E4 acquisition artifact** that drags non-users in. Weak loop: occasion-triggered + inherently social back-and-forth.
**Risk:** **Liveness/infra** — needs real-time reactions, identity-gated guests, link infra the sessionStorage prototype can't fake; depends on co-deciding people existing. Mitigate: ship a single-host shareable Round first (async reactions), presence later.

### 4.7 The Note — _a periodic concierge dispatch that arrives, not a dashboard you visit_
**Lens:** BeReal (sealed until you contribute this week) + Infatuation (situation-first editorial **voice**, but every line named + receipted) + Duolingo (the dated dispatch is the lightweight return trigger) + CRED (one assisted action).
**JTBD:** When a real eating-occasion is near, a short signed note from the few people I trust telling me where THEY would go right now.
**Entry:** E5 (occasion notification); E3 idle.
**See first:** A dark, letter-like surface; a date + dateline; one typeset occasion sentence; 2–3 short **signed** entries, each a human line with avatar + Receipt baked into the prose. Sealed if you haven't put your own names down this week. Thin cell: thinner, in your own voice, honest about what's missing.
**Action:** One assisted action, phase-dependent: DECIDER "Take me there →" + cheap "Want to go" taps; PRODUCER "Put a name down" (unlocks/thickens the Note). The sacred vouch is never cheapened to a tap.
**Spine-fit:** One surface (the dated Note), one gesture, three phases changing only authorship/contents. Weak loop: dated, occasion-triggered (Duolingo) without daily browse. Cold start: unlock-on-contribute + honest thin Notes.
**Risk:** Frequency mismatch (dead between dispatches) — trigger tuning must be per-user occasion-based, never clockwork; the seal could read as a hostile paywall to an Asker — frame as anticipation, keep cheap, open the first Note in session one in dense cells.

---

## 5. Synthesis

The seven concepts are **not seven rival homes.** The resolved spine mandates **one density-phased surface, one gesture.** The synthesis reframes them as the **loudest lens at different densities of the same surface**, plus their honest phase fit:

- **PRODUCER floor (D < 3):** add-a-vouch on your own territory, your archetype narrating, plus the cheap "Want to go" capture and the **unlock-on-contribute** mechanic salvaged from Sealed City (rendered as **named-but-blurred receipts** — a person + an occasion whose place you can't see yet — **never** pins on a map). This is the floor underneath everything.
- **BRIDGE / early-DECIDER lens (D rising):** **Over To You** — a **discovered** person, surfaced by a real counted overlap, hands you their call. Chosen as the lead concept because it spans E1 **and** E2 and degrades honestly in thin cells (it speaks as *you* until a real palate qualifies).
- **DECIDER-with-people lens (D ≥ 3 + a real occasion-with-people):** **The Round** — the multiplayer expression that is also the **E4 acquisition engine**. Deferred behind the gate; first value is the **sendable artifact**, reactions are bonus, so it does not need live infra to be useful.

**Recommended order to ship: Over To You → Sealed City's salvaged mechanic folded into the PRODUCER floor → The Round at the gated DECIDER moment.** The Verdict, The Occasion Line, Out Loud, and The Note remain in the family as alternative DECIDER expressions of the same surface (the answer-with-a-name, the spoken occasion, the conversational ephemeral, the periodic dispatch) — to be drawn from once the lead lens is validated.

Across all of them the metric reads clean **only because** the two fabrications are deleted: early Useful Decisions become real, not manufactured.

---

## 6. The critique

Adversarial pass against the four anti-drift gates. **Verdict: conditional pass for "Over To You" and "The Round"; "Sealed City" FAILS as written.** None is fully spine-compliant yet; two are salvageable with targeted fixes; one needs re-derivation or cutting. The two code fabrications are **confirmed in real source**, ship-blocking, and orthogonal to which concept wins.

### 6.1 Anchoring check
**Sealed City is the anchor in disguise.** "Map pins" first + "unseal → more → lens" is **map-first UI** (banned) and structurally the rejected `home-map.tsx` split-pane with a fog-of-war reskin — same pin field, same "lens" toggle, now gated behind contribution. Withholding pins is a **packaging trick, not a different job**; it cannot justify map-first from first principles (the Constitution bans it). The other two are clean: **Over To You** leads with a **face** (not a map/feed/archetype); **The Round** leads with a sendable **card** (the E4 artifact loop), genuinely outside all six anchors.

### 6.2 Novelty check
- **Over To You** — novel and strongest: hero = a named human handing you their call. Not "Taste" (which profiles *you*), not "Tonight" (which leads with a place-card). Caveat: the one-liner ("Named human / One face") is dangerously thin — without the journey spelled out it risks collapsing into a single static screen.
- **The Round** — novel: the home's primary act is composing + sending a decision object to a group chat. No anchor does this; anchors are all solo-consumption screens.
- **Sealed City** — **not novel** (recombination; see 6.1).

### 6.3 Whole-product check
- **Over To You** maps cleanly to E2 and E1 and degrades honestly in a thin cell — a journey, not a screen — **but only if** the face is chosen by real counted overlap (not `matchPct`) and is not auto-followed furniture.
- **The Round** serves E2-with-people (the actual highest-frequency real situation) and drives E4 acquisition — a journey — **but** has no answer for E1/E3 solo or the cold PRODUCER phase; it is a **DECIDER-phase surface**, not the day-1 home for a lone new user.
- **Sealed City** pretends to be a journey, but "unseal → more → lens" is just "uncover the map you were always going to get" — coverage browsing, failing the situation gate (no real situation is "I want to defog a map").
- All three under-specify **how they coexist** on the one-surface spine. The open question "Coexist no feed" is the right worry; §5 resolves it.

### 6.4 Gates check
| Concept | Gate 1 Situation | Gate 2 Trust visible | Gate 3 Better data | Gate 4 Logo-removed |
|---|---|---|---|---|
| **Over To You** | PASS (E2/E1) | PASS **only if** the face carries a Receipt + real counted overlap; FAIL if it shows "% your taste" | PASS (take it / vouch back) | PASS |
| **The Round** | PASS (decide-with-people) | PASS if each seeded option carries who-vouched | PASS (sending mints a real decision event) | PASS (named, group, city-specific) |
| **Sealed City** | **FAIL** ("open the city" is coverage, not trust) | PARTIAL (sealed pins show withholding, not a receipt) | **WEAK** (defogging rewards vouch quantity → Foursquare-coin vanity) | **FAIL** (a fog-of-war pin map would feel at home in a recolored Zomato/Google) |

### 6.5 Honesty check — CONFIRMED fabrications (ship-blocking)
1. **`src/components/vouch/_taste.ts:75`** — `matchPct` returns `Math.max(58, Math.min(96, round(inter/union*100)+48))`: floored at 58, offset +48, so it **never** reflects real overlap. Rendered as "{match}% your taste" in `home-tonight.tsx:66`, "% your taste" in `home-pulse.tsx:85`, "% match" in `onboarding.tsx:184`. A synthetic score about **people** — violates names-never-numbers' spirit. **Over To You leading with "one face" is the highest-risk surface for this** — if that face is chosen by `matchPct` or pulled from hardcoded `followed[]`, the concept is a lie at its hero moment. **The Round is lowest risk** (trust = the named human who vouched each option).
2. **`_taste.ts:98`** — `DEMO_SESSION.followed = ["Aditi","Meera"]`, read as pre-attached state by `home-tonight.tsx:22`, `home-pulse.tsx:30`, `home-taste.tsx:17`, `home-map.tsx:30` — fabricated social proof / a follow-gate violating "value before a single follow."

No scroll-feed, likes, or vanity counts appear in the three directions themselves (good) — but `home-pulse.tsx` (the Pulse anchor, an activity feed) still exists in the tree and must **not** be the substrate any of these build on.

### 6.6 Required fixes
| Target | Problem | Fix |
|---|---|---|
| **Sealed City (whole direction)** | Map-first UI (banned); fog-of-war reskin of retired `home-map.tsx`; "open the city" is coverage; defogging rewards vouch quantity (vanity). Fails Gates 1 & 4. | **Cut it, or re-derive without a pin map as hero.** Keep **only** the unlock-on-contribute mechanic; move it onto the PRODUCER phase — render locked items as **named-but-blurred receipts** (a person + an unseen occasion), not pins. The unlock reward must be a trusted **answer**, not map coverage. If it can't escape the pin-map hero, it does not ship. |
| **`matchPct()` (`_taste.ts:75`)** | Fabricated number-about-people, rendered as "% your taste / % match". | Delete the floor and +48 entirely. Display only a real, unfloored, countable named overlap ("Meera vouched 3 of your late-night spots"). Never show a %. If ranking internally, compute true Jaccard but never surface it. |
| **`DEMO_SESSION.followed` (`_taste.ts:98`)** | Hardcoded pre-attached follow-graph; fabricated social proof + follow-gate. | Set `followed=[]` by default. Founding palates **discovered** via honest counted overlap, surfaced as candidates, never read as chosen furniture. Over To You's hero face **must** come from this discovered-overlap path. |
| **Over To You (hero "one face")** | Highest-risk fabricated-trust surface; thin one-liner risks a static screen; no thin-cell behavior. | Make the face **earned** by real overlap and carry a Receipt at the hero. Spell the journey: E1 = the person who most overlaps your first vouches; E2 = re-ask for tonight's occasion; thin-cell = "no one you trust covers parents near you yet — here's the closest, or put your name down." Tie unlock to D ≥ 3 — below it, frame as "someone worth following," not "your answer tonight." |
| **The Round (scope + infra)** | DECIDER-phase, has-people surface; no PRODUCER/solo/E1–E3 story; depends on live reactions. | Position explicitly as the **DECIDER-phase expression** of the one surface (unlocks at D ≥ 3 + a real occasion-with-people). Seed each option with a real named vouch so the card is trustworthy before anyone reacts; first value = the sendable artifact, reactions = bonus. The E4 acquisition engine without needing live infra to be useful. |
| **All three vs. the spine** | Read as three rival screens; the resolution mandates one density-phased surface. | Reframe as the loudest **lens** at three densities: **Over To You** = BRIDGE/early-DECIDER (a discovered person); **The Round** = DECIDER-with-people; PRODUCER (add-a-vouch on your territory) is the floor under both. Ship **Over To You first** (spans E1+E2, degrades honestly); fold Sealed City's salvaged unlock mechanic into the PRODUCER floor; defer The Round to the gated DECIDER moment. |

---

_End of DELIBERATION v2. The tension preserved: diary-honesty vs. decision-network-endgame, reconciled by a per-user, metric-bound density trigger on one surface — and a refusal to ship a trust brand that lies in code._
