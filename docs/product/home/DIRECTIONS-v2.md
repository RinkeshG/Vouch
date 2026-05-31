# Home Directions v2

The home is not a screen. It is the **output of an entry-point**, rendered at one density of a single surface, driven by one gesture (*put a name down*). This doc carries forward two of three v1 directions, cuts the third, folds the cut one's salvageable mechanic into the floor, and ships them as **lenses on one density-phased spine** — not three rival homes.

---

## The spine, in one sentence

> Build a territory of named taste that becomes the trusted way I decide where to go — starting from my own taste alone, and earning the network's answer the moment my cell can give me one I'd actually trust.

**One surface** (the dark Bengaluru that is yours). **One gesture** (put a name down). **Three per-user density phases**, switched by a real trust-density gate, never a vanity threshold:

- **D** = count of followed-or-discoverable founding palates that have ≥1 **vouch** in one of the user's declared `home_areas` **and** one of their top occasions.
- **PRODUCER** (`D < 3`): your territory + add-a-vouch. The home is honest that the network can't answer yet.
- **BRIDGE** (`D` rising): palates whose territory provably overlaps yours appear, introduced by a **real counted overlap** ("Meera vouched 3 of your late-night spots"), never a synthetic %.
- **DECIDER** (`D ≥ 3` **and** ≥1 occasion-matched, open-now, named, receipted pick): the trusted answer for tonight unlocks. Gated on a real decision event, never on map-fill or follower count.

Same pins, same names-never-numbers, same Receipt-as-texture throughout. Only the **loudest lens** and the **pin/speaker mix** change.

### Two ship-blocking code fixes (constitutional, apply to every direction)

Both fabrications are confirmed in the live source. No direction ships on top of them.

1. **Delete `matchPct()`'s floor/offset** — `src/components/vouch/_taste.ts:75` returns `max(58, min(96, round(inter/union*100)+48))`, a fabricated number-about-people, rendered as "% your taste" / "% match" in `home-tonight.tsx:66`, `home-pulse.tsx:85`, `onboarding.tsx:184`. Replace the *displayed* signal everywhere with a real, unfloored, **countable named overlap**. Never show a %.
2. **`DEMO_SESSION.followed = []`** — `_taste.ts:98` hardcodes `["Aditi","Meera"]`, read as pre-attached furniture by all four homes. This is fabricated social proof and a follow-gate that violates *value before a single follow*. Founding palates are **discovered via honest overlap**, never auto-attached.

Also: formally retire `home-map.tsx` (the aggregator split-pane) and do not build on `home-pulse.tsx` (the Pulse feed anchor).

### The one metric

**Useful Decisions Created** = surfaced → trusted_open → saved_from_rec / shared_card / visited. PRODUCER manufactures the *precondition* supply but never claims a decision. BRIDGE mints the first true discoveries. DECIDER maximizes the metric at peak intent. The gate `D` is itself tuned on Useful Decisions, so the home cannot drift into filling-a-map vanity.

---

## Direction 1 — Over To You *(ship first)*

**Lens:** The home is a **hand-off to a person**. You don't scan pins or a feed; one named human is mid-sentence, handing you their judgment. The unit on screen is a face and a voice; a place only ever appears as the inside of what a person is saying to you. The home *is* the friend everyone texts, already talking.

- **JTBD** — When I open Vouch needing somewhere to go (or wanting to feel the network is alive), I want to be handed straight to the one person whose taste fits this moment — already speaking, place-in-hand — so I can borrow a trusted human's judgment in one beat instead of evaluating options myself.
- **Entry-state** — Primary **E2** (Fri 7pm, hungry, often with people: "I don't want to choose, I want to be told"). Deliberate **E1** variant pays off onboarding by showing a real, overlap-discovered palate already reacting to the names you just put down.
- **What you see first** — Dark Bengaluru-night, no map, no grid. Centred: one large face and, in their voice, a single spoken line — *"It's Friday, you've got your folks in town. Karavalli. Take them — they'll talk about it for months."* Below it, ONE place as the inside of that sentence, with the Receipt as texture (*"Aditi · you follow her · vouched 3 of the places you have"*). A thin row of other faces sits at the bottom edge — others who could hand you something right now. Tapping a face passes the hand-off; the surface re-speaks in their voice.
- **Primary action / loop** — Two taps, CRED-style. (1, optional) tap another face to change *whose taste you borrow* — re-roll by **person**, never by place. (2) **"Take it"** on the place they're holding out — records the decision event that mints the metric. Escape hatch: *"Ask someone else"* passes the baton to the next honest-overlap palate. The gesture is *accepting a person's judgment*, never filtering a database.
- **Journey map (cold → dense):**
  - PRODUCER (`D<3`): the speaker is **you** — your own archetype narrates your territory back (*"You're becoming The Midnight Forager — 3 names down. Who's your call for a date?"*), loudest action = add-a-vouch. It never fakes a friend. A visible countdown frames the empty room as momentum: *"2 more names and Meera can start handing you her late-night calls."*
  - BRIDGE (`D` rising): a discovered palate joins the speaker row, introduced by real counted overlap (*"Meera vouched 2 of your late-night spots — want her date pick?"*).
  - DECIDER (`D≥3` + open/near pick): the full hand-off fires — a trusted human speaks the occasion-matched, open-now, receipted answer.
- **Reference backing** — CRED (one assisted best action, two taps, premium dark, Indian high-trust voice) — but the action carries a **Receipt**, not a transaction. Spotify Home's "no decision needed, just press play" — except a *named human you trust* presses play and tells you why, the exact inversion of the algorithm anti-pattern.
- **NEW vs anchor** — Not *Tonight*: Tonight leads with a place-card and people are supporting evidence; here the **person is the hero** and the place is the object inside their sentence, and you re-roll by *person*. Not *Pulse* (no scroll; exactly one person speaks, to you, in second person). Not *Taste* (the archetype only narrates in the empty PRODUCER phase). No map. Anchors treat the home as a *view onto data*; this treats it as a *conversational act* — a relationship being exercised, not information displayed.
- **Tradeoffs** — Highest-risk fabricated-trust surface: if the face is wrong for the moment it breaks the spell harder than a mediocre list. Mitigation: the face is **earned by real overlap** and always carries its Receipt; re-handoff is one tap; below `D≥3` it refuses to fake a friend and speaks as you. The thin one-liner "named human" must never collapse into a static screen — the journey above is load-bearing.
- **Who / stage** — The Asker, at the decision moment; spans E1→E2 and degrades honestly in thin cells.

---

## Direction 2 — The Round *(DECIDER-with-people lens; ships second)*

**Lens:** The home as **group-chat ender / link-first artifact** (Partiful + Constitution distribution). Not a private view of my state but a shared, live decision object that named people act inside — born to leave the app as a link that wins a group chat.

- **JTBD** — When my group is mid-argument about where to eat tonight, I want to put a few named, occasion-matched picks on the table and let the people I'm going with react in one place, so we land a decision everyone trusts without 40 WhatsApp messages and a 4.1-star stranger's pick.
- **Entry-state** — Primary **E2** with people ("we're deciding NOW and I got volun-told to pick"). Secondary **E4** (a sent Round is the recipient's first, invite-gated Vouch surface — the acquisition loop) and **E5** ("5 places your people vouched, open near Church St — start a Round?").
- **What you see first** — One dark card titled in your words — *"Friday, the 4 of us, somewhere in Indiranagar"* — over the constant dark-Bengaluru surface. Below: ONE seeded pick, name-backed and receipted (*"Soka — Meera vouched it: 'Negroni, then stay for the plates'"*). Then a quiet **"+ Add a pick"** and, dominant, **"Send this Round →"** with a row of empty seats. No stars, no numbers, no feed. In a thin cell the seed is honest, not fake: *"We don't have a trusted Indiranagar dinner pick from your people yet — put YOUR call down to open the Round."*
- **Primary action / loop** — **Send this Round.** The host fills 1–3 named picks (each a discovered trusted pick or their own put-a-name-down vouch) and shares the link. Recipients react with **trust-bearing verbs**, never anonymous likes: *"I've been, go"* (Been), *"I'd put my name on it"* (vouch), *"+ a pick."* Resolution to one place, with a visible who-backed-what trail, is the decision event.
- **Journey map (cold → dense):**
  - PRODUCER (`D<3`, thin cell): the Round is honestly empty of network picks and asks the host to put their **own** name down first — the supply pump. Sending an empty-but-yours Round still pulls trusted reactions back in, which raises `D`.
  - BRIDGE: seeds with a founding-palate pick introduced by honest counted overlap — discovered, never auto-attached.
  - DECIDER (`D≥3` + real open-now pick): pre-seeded with a trusted, occasion-matched, receipted pick — the host looks like a genius in two taps.
- **Reference backing** — Partiful (the link-first artifact *is* the surface: create-tool + live board + thing you paste in chat). Payload swapped from date/time to **name-backed receipted picks**. CRED's one assisted best action (the host gets one pre-filled trusted seed, never a blank canvas).
- **NEW vs anchor** — Every anchor is single-player and inbound (a private view of *my* state). The Round inverts the **ownership axis**: a shared object multiple named people act inside, born to leave the app. Closest to *Tonight*, but Tonight hands *me* one answer to consume privately; the Round is a multiplayer, mutable, expiring container whose primary verb is **Send-outbound**, and it *is* the E4 distribution loop a private card structurally cannot be.
- **Tradeoffs** — (1) Liveness/infra: needs identity-gated guests and real-time reactions the current sessionStorage prototype can't fake; mitigate by shipping a single-host, async-viewable, shareable Round first (the **first value is the sendable artifact**; reactions are bonus), presence later. (2) Needs co-deciding moments with invitable people — the E4 link-out to non-users is the saving grace, but don't gate invites so tight the Round dead-ends. Position explicitly as the **DECIDER-with-people lens**, not the day-1 home for a lone new user.
- **Who / stage** — The Asker-with-people, at the decision moment; the Knower's distribution engine.

---

## Cut — Sealed City (mechanic salvaged into the PRODUCER floor)

**Cut as written.** Its hero was "map pins" defogged by contribution — that is **map-first UI (banned)** and structurally a fog-of-war reskin of the retired `home-map.tsx` split-pane. "Open the city" is a **coverage** job, not a trust job; defogging rewards vouch *quantity* (Foursquare-coin vanity drift). It fails Gate 1 (no real situation is "I want to defog a map") and Gate 4 (a fog-of-war pin map would feel at home in a recolored Zomato with a gimmick). Withholding is a packaging trick, not a deeper job.

**Salvage the BeReal unlock-on-contribute mechanic onto the PRODUCER floor of Direction 1.** What your people vouched in *your* areas/occasions stays sealed until you've put your own names down — but render the locked items as **named-but-blurred receipts** (a person + an occasion, place withheld), never pins on a map. The unlock reward is a **trusted answer**, not map coverage. This is the floor underneath both shipped lenses: it forces the supply pump, earns the context to trust what later appears, and is the thing that crosses `D≥3` and switches DECIDER on.

---

## Recommendation

**Ship Over To You first.** It is the only direction that spans **E1 + E2**, degrades honestly in thin cells, and carries the user across all three phases without learning a second screen — so it serves the journey, not a screen. Fold the salvaged unlock-on-contribute mechanic into its PRODUCER floor.

**Then The Round**, scoped as the **DECIDER-with-people lens** and the E4 acquisition engine — deferred to the gated decision-with-people moment, shipped single-host-shareable first to sidestep live infra.

These are **not three homes.** They are the loudest lens at different densities of one surface: PRODUCER (add-a-vouch on your own territory) is the floor; **Over To You** is the BRIDGE / early-DECIDER lens (a discovered person hands you a call); **The Round** is the DECIDER-with-people lens.

This sequence grows **Useful Decisions Created** monotonically and reads clean: PRODUCER manufactures the supply that is the precondition, BRIDGE mints the first real discoveries via honest counted overlap, DECIDER (both lenses) maximizes saved/visited/shared at peak intent — and because the gate is tuned on real decision events with the two fabrications deleted, every early Useful Decision is **real**, not manufactured.

---

## Open questions

1. **Density gate `D`** — exact thresholds, the "open-now" data freshness bar at decision time, and how `D` recomputes per occasion×area. A loose gate ships an empty oracle (negative-Δ4); too tight strands dense-cell users in PRODUCER.
2. **Speaker choice (Over To You)** — selection logic when multiple palates qualify; ordering of the bottom face-row; how it stays honest (only qualified palates speak) without feeling arbitrary.
3. **Round infrastructure** — minimum viable async-shareable Round vs. real-time presence; identity-gating for guests; how a sent link onboards a non-user without leaking into a feed.
4. **Coexist without a feed** — how the two lenses and the PRODUCER floor live on one surface without quietly growing a feed/profile through the back door (E4 artifacts and E6 utility-recognition must not become a stream).
5. **Thin cells** — launch only in dense cells (Indiranagar / coffee / late-night) so common asks resolve in session one; define the honest copy and frequency caps for the "you're the first — put your name down" state so it reads as invitation, not a broken product.
6. **Onboarding fixes** — wire the retroactive back-fill (5–15 real vouches keyed to declared areas/occasions) and confirm `matchPct` floor/offset and `DEMO_SESSION.followed` are deleted before any of this ships.
