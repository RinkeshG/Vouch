# Vouch — The Logged-In Home: Deliberation Record

> ⚠️ **SUPERSEDED (v1).** This pass was anchored to prior prototypes, reasoned the home in isolation, and used no external references. See **`DELIBERATION-v2.md`**, **`SPINE.md`**, **`REFERENCES.md`**, and **`DIRECTIONS-v2.md`** for the product-first, reference-grounded rethink. Kept for the record.

> The documented thinking behind what the Vouch home screen should *be*. This is not a spec. It is the argument — four independent points of view, the debate between them, the directions that survived, and the adversarial critique that forced a revision. Read it to understand *why* the home is what it is, and what we deliberately refused.

---

## 1. The Question

Two attempts at the logged-in home failed:

1. **Stacked kit** — design-system components dropped into a column. The verdict: *"no flow, no product thinking."*
2. **Phone-stretched-to-desktop** — a 50/50 map + a list of my places, flat hierarchy, generic headline *"Everything you'd put your name on."*

Three quick prototypes exist as restyles — **Tonight** (one trusted answer), **Pulse** (a feed of your circle), **Taste** (your palate identity) — but the founder wanted the *concept reasoned from first principles*, not chosen from a menu of skins.

So the question is not "which layout?" It is: **what job does someone hire the home to do the moment they open it?**

### The JTBD framing

The decisive constraint is the **cold start**. Vouch is invite-only, Bengaluru-first, single-player-first. On Day 1 a user follows no one, supply is thin, and the network can keep no promises. The product spine already says it plainly: *activation must deliver value + a wow in under ~90 seconds, before a single follow.*

That single fact reframes the whole question. A home built to **consume** — to feed you an answer or a feed — points at supply that does not exist yet, and reads as broken no matter how the type is set. The home's Day-1 job cannot be to feed you. It has to make **you** feel produced: your taste becoming legible, signed, and worth borrowing from — using nothing but your own first few vouches and the handful of real founding palates already in the data.

Everything below is four people arguing their way to (and around) that conclusion.

---

## 2. The Four Independent POVs

Each thinker reasoned alone before seeing the others. Their voices are preserved.

### 2.1 Nikita Bier — *activation and virality over utility*

> *Lens: the first session must produce a status artifact and a reason to return tomorrow, before a single follow.*

**The argument.** The two prior failures share one root cause: they treated the home as a place to **consume**, when on Day 1 there is nothing to consume. That is a guaranteed D1 cliff. The spine already says single-player-first and activation-before-a-follow — so the home's job is not to feed you, it's to make *you* feel produced. Tonight/Pulse/Taste aren't three rival homes: **Taste is the identity layer, Pulse is the notification layer, Tonight is the earned payoff you graduate into.** Pick the one that retains a brand-new user with zero followers — that's unambiguously the self-status surface, not the answer engine.

**Concept — "The Standing."** Your live trust ledger: a running scoreboard of your taste in the city — what you've put your name on, who's borrowing it, who you're newly matched with. A status surface disguised as a map.

**What you see first.** A dark map of Bengaluru that is unmistakably *yours* — your handful of saffron pins glowing, one oversized editorial line of state on top: not "Everything you'd put your name on" but a live count tied to identity — *"4 spots. You're becoming The Midnight Forager."* The map dominates because it is the visible artifact of your taste accumulating: a list reads as a to-do, a filling map reads as a reputation growing.

**Primary action.** Add a vouch. One button, always the loudest non-content element. Every other surface is a *consequence* of it made visible — a new pin, a sharpened archetype, a taste-match, a "borrowed" notification.

**Why it wins.** It's the only concept that survives the cold start with zero followers. Tonight needs dense trusted supply you don't have; Pulse needs a circle you haven't built; The Standing needs only *you* and pays off in under 60s because the archetype computes off your own first three vouches (`archetypeFor` in `_taste.ts` derives identity from what you back, never a quiz). It renders the brand promise literally — your name is the headline; stamps and receipts are the texture; no stars, a person, never a number (except taste-match, the one allowed number, about people).

**Hot take.** *Kill "decide tonight" as the home — it's a trap.* Every founder wants the home to answer "where do we eat," so they build the answer engine first and ship an empty restaurant. The home's Day-1 job is the opposite of answering: make the user the kind of person other people ask. Make them feel like the answer before you ever let them seek one.

---

### 2.2 Brian Norgard — *toys, not tools*

> *Lens: is the home something you WANT to touch? What's the one gesture that makes it a toy, and does that gesture quietly keep score?*

**The argument.** All three prototypes are **tools, not toys** — and the founder can feel it, which is why none stuck. Tonight is a vending machine. Pulse is a feed (infinite, anxious — the exact 4.2-star noise we exist to kill, with faces on it). Taste is a trophy case you visit once. None has a gesture you'd do forty times. The home is not where you *read* information — it's where you **DO one thing repeatedly and feel something each time.** Vouch already owns the most under-exploited gesture in food apps: the **STAMP** (Want to go / Been / Vouched). That is the swipe.

**Concept — "The Deck."** One trusted call at a time. A single full-bleed dark card: ONE vouch, with a name on it, that you react to with one gesture. Not a feed, not a map, not a dashboard — a stack of trusted calls dealt one at a time, and a hand of three stamps to play.

**What you see first.** One card, dark, nearly full-bleed, ~70% of the canvas. The dominant element is a **NAME and a face** — *"Aditi vouches"* in Space Mono caps — above the spot name set huge in Bricolage, then her one line: *"Take your parents. They'll talk for months."* Trust is a person, not a place, so the human lands first — not a photo (we have none by design), not a number. Below: three stamps as physical-feeling keys.

**Primary action.** STAMP-AND-ADVANCE. Play a stamp (or skip), the next call slides in. "Want to go" pins silently. "Been" asks the network-growing question — *"would you vouch it?"* "Vouched" puts your name down and deals the add-a-line moment.

**Why it wins.** It's the only option that is a **TOY**, the only thing that earns a daily open before the network exists. A deck of stamps is the metagame made into a gesture — every card visibly moves your archetype glyph and fills your map. It enforces scarcity: ONE call, ONE name — the opposite of a 3,000-stranger average wall. The constraint *is* the trust signal.

**Hot take.** *Kill the map as the home.* Everyone reaches for the map because it looks like a product — but a map is a scoreboard, not a toy, and nobody opens a scoreboard for fun. If you can't make putting your name on a place feel as good as a Tinder right-swipe felt in 2014, you don't have a consumer product — you have a database with nice fonts.

---

### 2.3 Kunal Shah — *Delta-4, trust, and status*

> *Lens: don't ask "what answer does the home give?" — ask "what status does it confer, what habit's inertia must it beat, and is the gap unmistakably 4+?"*

**The argument.** Run the prototypes through Delta-4. **Tonight** is the highest-delta *job* but the most fragile in single-player: on Day 1 you follow two people, the oracle is thin, and a thin oracle that's wrong once is **worse than Google — negative delta.** **Pulse** imports the exact low-trust, infinite-scroll grammar Vouch exists to kill — a recolor of Instagram, and it fails the founder's "fresh structure" bar. **Taste** is the only one whose delta is HIGH from a standing start of one user, because the unit it trades in — **status** — is the one thing India's affluent will change a deep habit for.

**Concept — "Your Standing."** The home is a living ledger of trust you hold and trust you've earned: a map you own, surrounded by the names that fill it and the names that follow you. Not a feed, not an answer box — a balance sheet of taste.

**What you see first.** A dark map of Bengaluru that is unmistakably yours — saffron pins clustered in the 2–3 neighbourhoods you actually eat in, each pin carrying a name, overlaid with your palate archetype as a title: *"The Midnight Forager — 11 spots, 3 hands you trust."* The map dominates because it is simultaneously the **receipt** (every pin has a name), the **asset** (it's yours, it fills over time), and the **status object** (screenshot-worthy, borrowable). A number-free, name-full territory says "this is not Zomato" before a word is read.

**Primary action.** Add a vouch — the deposit that grows your standing. Tap any name on your map to see that palate and your taste-match, feeding the follow/borrow loop.

**Why it wins.** Against "just Google it / ask the group chat," a Day-1 answer engine is a +1–2 delta. But "a home of MY taste that others can borrow, that tells me who I am as an eater" has **no incumbent** — the group chat gives answers, never standing. That's a clean +4. India is a low-generalised-trust, high-personal-trust society: the affluent Bengalurean already routes every real decision through known people, so the home that mirrors that mental model wins on familiarity. The reason they change a deep habit isn't efficiency — they're not poor in answers — it's to be *seen* as the friend with the spots.

**Hot take.** *Stop trying to make the home answer "where do I eat tonight."* Google and the group chat already do that at a 7/10, so your answer-engine home is a 2-delta loser on Day 1. Build the trophy room first; the oracle is what you unlock by filling it.

---

### 2.4 Julie Zhuo — *mental models and the first three seconds*

> *Lens: when this opens, what mental model is the user in, and what is the ONE thing the screen must say before anything else?*

**The argument.** Both failures came from picking a **CONTAINER** (a map; a column of cards) before deciding the **JOB**. The map is a view, not a home — it answers "where," but the user's first mental model on open is not spatial, it's **social and temporal**: "what's worth my name, and who that I trust has weighed in." So the home must lead with **named taste rendered as editorial testimony** — vouches as lines, each carrying a face and a sentence — not pins, not stars, not equal cards.

**Concept — "The Standing Table."** A living ledger of taste you can act on: your seat at the table where every spot has a name on it — your vouches and the palates you trust, ordered by recency and relevance, with the empty seat (add a vouch) always set. A diary that doubles as an answer engine, not a map and not a feed of strangers.

**What you see first.** A single editorial column of vouches set in Bricolage Grotesque — each entry a place name, a face + name (the receipt), and one quoted line of why. It dominates because in the first 3 seconds the eye must land on a **NAME and a sentence**, never a number or a pin. The top is not a generic headline but a live, dated dateline: *"Saturday. Three people you trust added spots this week."* The always-set empty seat — a saffron-edged "Put a name down" — looks like the next line in the ledger, not a floating FAB. Hierarchy: testimony first, the act of adding second, the map a quiet third.

**Primary action.** Add a vouch — the diary entry. A one-line, sub-15-second act that visibly extends your ledger and sharpens your archetype.

**Why it wins.** It's the only option that obeys the spine (single-player food-diary first) *and* the wedge (trust with a name, never coverage). The current map+list home buries the atomic unit — the vouch-with-a-name — inside a 50/50 canvas where the map (pure aggregator idiom) competes with the testimony; that's the exact flat hierarchy the founder flagged. The Standing Table makes the vouch the hero unit and vouching the hero verb. The receipt — face + line — *is* the UI; no card grid, no star.

**Hot take.** *Kill the split-pane map on the home.* The map is the most seductive wrong answer in this product — it LOOKS like a finished feature, which is exactly why both failed homes reached for it. But a map is an aggregator's idiom (every place, pinned, flat) and Vouch's wedge is that it is NOT a map of everywhere. Leading with the map silently tells the user "we cover the city," when the promise is "we cover your people." **The map should be a verb you pull, not the room you walk into.**

---

## 3. The Debate

### 3.1 Where they agreed

A remarkable amount of convergence, from four different lenses:

- **Kill "decide tonight" as the Day-1 home.** Unanimous. Kunal's Delta-4 (a thin oracle is worse than Google) and Nikita's cold-start curve prove it from opposite directions. Tonight is the *earned* payoff once supply is dense.
- **Kill the feed of strangers.** Pulse imports the exact low-trust, 4.2-star scroll grammar Vouch exists to destroy — just with faces on it.
- **Kill the map-as-canvas.** The 50/50 split-pane is the aggregator idiom and the rejected attempt #2. The map is a scoreboard/lens, not the room.
- **The home leads with the user's OWN named taste** — the vouch-with-a-name as the hero unit. No stars, no place-numbers; taste-match is the only number, and it's about people.
- **"Add a vouch" is the single load-bearing action** — the only act that simultaneously fills your map, sharpens your archetype, and creates the artifact that pulls others in.
- **The metagame is the return engine** — map filling, archetype sharpening, taste-match — and it computes off your own first three vouches with zero followers. The wow is local and honest.

### 3.2 The real pushbacks — who challenged whom

**Norgard → Bier & Shah (the status mirror is a mirror in an empty room).** A status surface with no one watching goes stale by D3. And the code proves the danger isn't hypothetical: `matchPct()` floors at 58% and `DEMO_SESSION` auto-follows Aditi and Meera — so every "someone borrowed your spot" / "92% match" dopamine hit on Day 1 is **seeded**. For a brand whose entire wedge is "a name you can trust, never a number," a fabricated social payoff isn't a growth hack — it's a gunshot to the one asset we have. *A status surface that has to lie to feel alive is more dangerous than an empty map that's honestly empty.*

**Bier, Shah & Zhuo → Norgard (the Deck dies on a true cold start).** A card stack needs a deck to deal. On an invite-only Bengaluru launch there are no trusted calls to deal — the code has exactly **three founding palates with three spots each: nine cards.** Brian's home deals nine strangers' cards and is empty by minute two. He concedes this himself. The deeper betrayal: a Tinder stamp **trivializes the vouch.** The whole wedge is that a vouch is *sacred* — your name, weighed deliberately. Turn it into a right-swipe and you've built hot-or-not for restaurants — the disposable noise we exist to kill. *The gesture is real; the object he applies it to is wrong.*

**Shah → Norgard (trust physics, not just supply).** A swipe-stack trains the hand to act faster than the brain — that's its entire design intent. But in a low-generalised-trust society, trust is built by visible **cost and friction**, not frictionless reps. The Deck optimizes the one variable Vouch must NOT optimize. Brian's own mitigations ("slow the gesture, make Vouched cost a sentence, cap the deck") are an admission that the toy fights the brand.

**Bier & Shah → Zhuo (the prettiest empty book in the world).** A single editorial column of three typeset lines on Day 1 reads as a near-empty Notes app with good fonts. A vertical text column is neither screenshot-worthy nor visibly *growing* — so it under-delivers the metagame and virality the map-as-asset would. A list reads as a to-do; a filling territory reads as accumulating reputation.

**Norgard → everyone (including himself).** We are all designing the home around a **STATE** (your standing, your ledger, your archetype). States go stale. Vouch needs a home built around an **ACTION** you'll do forty times, where the state updates in your peripheral vision as a consequence.

### 3.3 What each thinker conceded

- **Bier** conceded a status surface without a daily gesture is a vanity dashboard, and "add a vouch" alone is too low-frequency. He evolved: keep The Standing as the surface, but make the **daily gesture** Norgard's stamp — aimed at *your* spots, not a deck of strangers.
- **Norgard** conceded the Deck can't be the cold-start home (no cards to deal without seeding) and that a stamp risks cheapening the vouch. He evolved: fuse the gesture *into* a single-player producer loop — the add-a-vouch ritual rendered as a weighty stamp, with the deck of others' calls deferred until you follow real palates.
- **Shah** conceded he reached for the map because it "looks like a product" — Julie's exact trap — and that a standing you only admire has weak D2 retention. He evolved: present the map as *reputation filling*, not a directory, with add-a-vouch as the weighty daily gesture.
- **Zhuo** conceded her ledger column was too austere and that identity, not "act on trusted taste," is the Day-1 primary job. She evolved: lead with identity (archetype as an oversized editorial title), vouches as signed testimony beneath, map a quiet third.

### 3.4 The genuine split

Everyone agreed on what to kill. The unresolved fork was **what the home's dominant object and daily gesture are** — and it split three ways:

| | Dominant object | Strength | Fatal risk |
|---|---|---|---|
| **Bier / Shah** | Your **map / standing** (reputation-as-territory) | Survives cold-start off your own 3 vouches | Goes stale by D3 without inbound social signal |
| **Norgard** | A finite **deck** of trusted cards you stamp (a toy) | Highest frequency, most addictive | Structurally needs supply that doesn't exist; risks trivializing the sacred vouch |
| **Zhuo** | An editorial **ledger column** of testimony | Truest to brand, "not Zomato" in one second | A beautiful empty book on Day 1 |

Underneath sat the **sharper, scarier sub-decision** all four named independently: in a thin-density launch, the social payoff (borrowed/matched notifications) may not fire for days — so whichever object wins **must be rewarding from the user's own vouches alone**, with founding-palate taste-match as the only honest seeded signal. And if that seeding feels fake, *it poisons the whole trust brand.* That dial — how much founding-palate presence is honest versus fake — is the real founder's call, not the layout.

---

## 4. The Synthesis — directions that emerged

Three directions crystallized. (The critique below collapses them; they are recorded here as argued.)

### Direction A — "The Standing": your taste as a living territory

A dark Bengaluru that is unmistakably yours: your saffron pins igniting on a near-empty city, titled by the archetype your own vouches just earned.

- **JTBD:** the morning after I logged my first spots, prove my taste is becoming legible and that I'm turning into the friend with the spots — before I follow anyone.
- **What you see first:** a mostly-empty dark map, your saffron pins in the 2–3 areas you eat in, each carrying a name. Above it, one oversized Bricolage line of *state*, not a label: *"Four spots. You're becoming The Midnight Forager."* The emptiness is the point — a room filling, not a city you failed to cover.
- **Primary action:** add a vouch — the loudest saffron element, anchored to the map. Every other surface is a visible consequence.
- **Backed by:** Bier (status mirror, computes in <60s) and Shah (Delta-4: status has no incumbent, a clean +4).
- **Tradeoff:** a mirror with no one watching; can go stale by D3; four pins can read as "empty"; the only *honest* social signal at launch is founding-palate taste-match — any fabricated borrow would poison the brand.

### Direction B — "The Stamp": the home as a toy, producing made tactile

One deliberate, weighty gesture — putting your name on a place — as the core act, with your map and archetype as the score it keeps in your peripheral vision.

- **JTBD:** give me one satisfying thing to DO that makes my taste legible and a little addictive to build, so I come back tomorrow even though I can't discover a great restaurant every day.
- **What you see first:** not a map, not a list — a centered dark composition built around the act: a large "Put a name down" surface in Bricolage, three stamps (Want to go / Been / Vouched) as physical keys; the filling map and sharpening archetype in the periphery as the score.
- **Primary action:** stamp / add a vouch — lands with weight (a press, a thunk, the pin igniting). "Vouched" costs a sentence; producing stays sacred.
- **Backed by:** Norgard (the home must be a toy; the stamp is Vouch's swipe), aimed at your own spots — tempered by Shah (the gesture must stay weighty, never a frictionless rep).
- **Tradeoff:** the stamp and the sacred vouch fight each other — too toy-like cheapens the unit; detuned, it loses the frequency that made it retentive.

### Direction C — "The Ledger": signed testimony as the editorial hero

An editorial column of vouches as named testimony — a place, a face, one quoted line — led by a live dated dateline and an always-set "put a name down" seat.

- **JTBD:** the first thing I see should say, unmistakably, "these are MY people and my places, signed — no strangers shouting averages."
- **What you see first:** a single Bricolage column, each entry a place + face + name + one quoted line; a Space Mono dateline on top; the empty seat as the next line, not a button; the map a quiet third.
- **Primary action:** add a vouch — the diary entry, a sub-15-second act that lands as a new typeset line.
- **Backed by:** Zhuo (one job, one focal point; the first 3 seconds land on a name and a sentence; kill the split-pane map).
- **Tradeoff:** three lines reads as a near-empty Notes app; not screenshot-worthy or visibly growing; for a tired Asker, testimony-to-write is friction, not payoff.

### The recommendation

**Pursue The Standing first, but build the add-a-vouch action with The Stamp's tactile weight.** These two are not rivals — they are the *surface and its gesture*, and the room converged on exactly this fusion. The Standing is the only direction whose wow is fully computable from a one-user start using code that already exists (`archetypeFor` and `matchPct` in `_taste.ts` run on your own three vouches against the three real founding palates), and Delta-4 proves status is the only job with no incumbent and a clean +4 from a standing start. But a status surface you only admire goes stale by D3, so the daily act must be **The Stamp**: add-a-vouch made deliberate and weighty, with the map and standing as the peripheral score it keeps.

- **Demote the map** from a 50/50 split-pane to your dark, mostly-empty territory. The current `home-map.tsx` (with "Everything you'd put your name on" and an aggregator-style canvas) is the rejected attempt #2 and should be replaced.
- **Hold The Ledger's editorial discipline as the texture ON the asset** — every pin's testimony is a name + a line, never a number — not as the dominant container.
- **Defer** "decide tonight," the deck of others' calls, and any borrow/match notification until real density and real humans exist.

---

## 5. The Critique (the adversary)

> **Verdict: REVISE.** Two ideas presented as three, and the recommendation rests on a code claim that is false.

- **Distinctness — two ideas, not three.** The Ledger is genuinely distinct. **The Standing and The Stamp are one producer-home from two angles** — a surface and its gesture, not two directions. → *The Stamp should be demoted to a gesture spec inside The Standing, not stand as a peer direction.*

- **The false code claim — `matchPct` is fabricated.** The recommendation leans on taste-match being honest. But `matchPct()` **floors at 58% with a +48 offset**, and onboarding **gates entry behind a follow** — so the percentage is manufactured, and the "before a single follow" promise is violated by the current flow. → *Remove the follow gate; show a **reason + a count**, not a percentage.* (e.g. "3 spots overlap with Meera" — verifiable and named — instead of a synthetic "92%").

- **Genericity — three leaks** of generic product thinking that must be made concrete to Vouch:
  1. the **right-swipe anchor** (Tinder framing imported wholesale);
  2. the **Taste-prototype completion meter** (a progress bar is generic gamification);
  3. the **unconcretized "sacredness" claim** (asserting the vouch is sacred without a mechanism that makes it cost something).

- **The Ledger's Day-1 reality:** it renders only **3–6 lines**. → *Make testimony the texture on the producer surface, not the surface itself.*

### What the critique changes

The honest, post-critique position: **one producer-home — The Standing — with The Stamp as its gesture spec and The Ledger's testimony as its texture.** Taste-match becomes an honest, named, countable overlap (no synthetic percentage), the follow gate is removed so activation truly happens before a single follow, and any imported swipe/meter/sacredness framing must be re-grounded in a concrete Vouch mechanism (e.g. "Vouched" costs a written line) before it ships.

---

## Appendix — Non-negotiables this record assumes

- A vouch always carries a **name**. No star ratings, ever.
- The only allowed number is **taste-match**, and it is about *people*, not places — and it must be honest (a real overlap with a real named palate), never a floored or offset synthetic figure.
- The map is **your territory**, dark and mostly empty except your saffron pins — never a coverage map of "every place in BLR."
- "Decide tonight" is the **earned endgame**, unlocked by density — not the Day-1 front door.
- No fabricated social proof (auto-follows, seeded borrows). In a trust brand, a faked payoff is fatal, not suboptimal.
