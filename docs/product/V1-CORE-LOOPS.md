# V1 — The two core loops: a PM teardown

> V1 does exactly two things, and does them best-in-class: **(A) vouch for a place**
> and **(B) make a guide of places you vouch.** This is a funnel teardown of both —
> grounded in the *actual* built product — naming the leaky buckets (with severity +
> why), what to cut, and the order to fix. The test isn't "does it work" — it's
> "would a serious Bengaluru eater do this twice and show a friend."

---

## Scope discipline (what V1 is, and isn't)

A great V1 is defined by what it **refuses**. The two loops are *creation*
(single-player supply + artifact). So for V1:

**In:** the vouch ritual · your vouches as a living thing · making/editing a guide ·
sharing a guide. **Parked (don't polish for V1):** Borrow/Follow consequences, the
decide-tonight engine, the palate-as-follow-target, search-as-discovery beyond
finding-a-place-to-vouch. Keep them reachable but don't let them dilute the two
loops. *Every screen should serve "put your name down" or "group your names."*

---

## Loop A — Vouch for a place

**The job:** "I just had / I know a place I'd stake my name on — capture it in
seconds, and feel it become part of my taste."

**The funnel:** Trigger → Find the place → Stamp + one line + occasion → It lands →
I can find/manage it later.

| Step | State today | Leak | Sev | Fix |
|---|---|---|---|---|
| Trigger | ＋Vouch on every surface, "Vouch it" on a Spot, home CTA, onboarding ×3 | Triggers are good. | — | — |
| **Find the place** | The add ritual searches **only the ~14 SEED spots** (`add-vouch.tsx` searches `SEED`, not the catalog) | **You literally cannot vouch for most real places.** The 150-place Supabase catalog (and Google Places) is only in `/search`, not the ritual. This caps the entire supply loop. | **P0 — fatal** | Make the ritual search the **real catalog** (Supabase `places`), then Google Places for anything missing. The thing you're vouching for must be findable. |
| Stamp + line + occasion | Required line (≤120) + occasion; can't submit empty (integrity holds) | Solid. Minor: no nudge on a lazy one-word line. | P2 | Optional integrity nudge on weak lines. |
| It lands | Pin spotlights on the home, archetype updates, stamp-toast | Good payoff. | — | — |
| **Find/manage later** | Pins on the home map + "what you'd stake your name on" on the palate | **No diary list of your vouches; you can't edit a line or remove a vouch** (the store supports it; no UI). Your taste feels write-only. | **P1** | A simple "Your vouches" list with edit-line / change-occasion / remove. |
| Want-to-go / Been | On a Spot these are **toasts that don't persist or convert** | The stamp ladder (Want→Been→Vouched, the §1 "would you put your name on it?" nudge) is decorative. | P1 | For V1, **either** make Want/Been persist + a Been→Vouch nudge, **or cut them** to keep the loop pure (recommended: cut to one act for V1). |
| Durability | localStorage only | Clearing the browser wipes your taste. | P1 (auth-gated) | Server persistence (Phase 4b / auth). Acceptable for a prototype, not for "top". |

**Loop A verdict:** the ritual itself is crafted, but it's **strangled at "find the
place"** — you can vouch for ~14 things. Fixing catalog-search is the single highest-
leverage change in the product.

---

## Loop B — Make a guide of places you vouch

**The job:** "Turn the places I've vouched into a point-of-view list I'm proud of —
'where I take my parents' — and send it to someone."

**The funnel:** Trigger to create → Name it (POV) → Add my vouches → Order + notes →
Save → **Share** → It gets used (→ feeds my pride / pulls others in).

| Step | State today | Leak | Sev | Fix |
|---|---|---|---|---|
| Trigger to create | `/guides` "Start a guide"; Spot "Add to a guide" | Decent. But **onboarding never introduces guides at all** — many users won't discover loop B. | **P1** | Introduce the guide in onboarding or a one-time home nudge after N vouches. |
| Name (POV) | Title + POV prompt chips | Strong, on-voice. | — | — |
| **Add my vouches** | Pool = your real vouches (`_me`) | Correct model — but it inherits Loop A's cap: **few vouches → nothing to guide.** | P0 (via A) | Fixed by the catalog-search fix in Loop A. |
| Order + notes | ↑/↓ reorder, per-item one-line | Works; drag would feel better. | P2 | Drag reorder later. |
| Save | Validates title + ≥1 place; owner view | Solid. | — | — |
| **Share** | Copies a `/g/[slug]` link, but the guide is in **localStorage → opens only on the maker's device** | **The artifact's entire purpose is to be sent — and a friend opening the link sees "not on this device."** The reward of loop B is hollow. | **P0 — fatal** | Store guides **server-side** (Supabase `guides`/`guide_items`, public read by slug, anonymous insert) so a link opens anywhere. Doesn't need full auth. |
| Add to an *existing* guide | Spot "Add to a guide" always opens a **new** build | You can't drop a freshly-vouched place into your existing "parents" guide. | P1 | "Add to a guide" → choose existing or new. |
| It gets used | "borrowed N×" life-signal | Honest only once share works + borrowing exists (network). For V1, the win is "I sent it and it looked great." | — | Make share real (above); borrowing is parked. |

**Loop B verdict:** the *builder* is genuinely good (live artifact preview, one
voice). It's **gated at "Share"** — the payoff doesn't leave the device. Plus the
loop is starved by Loop A's catalog cap.

---

## The cross-loop leak (the habit)

Today the two loops don't hand off: you vouch… and nothing ever says *"you've got 5
late-night spots — that's a guide."* The natural V1 habit is **vouch a few →
get nudged to group them → share → vouch more.** Missing the **convert nudge**
(vouch→guide) is why this reads as two features, not one loop. **P1.**

---

## The leaky-bucket summary (prioritized)

**P0 — without these it's a demo, not the product:**
1. **Vouch from the real catalog** (Supabase places, then Google Places) — unstrangle Loop A.
2. **Share that works cross-device** — store guides server-side, public-read by slug.

**P1 — required to feel "top, not a prototype":**
3. **Your vouches, manageable** — a diary list (edit line, remove).
4. **Add to an existing guide** (not just new).
5. **The convert nudge** (vouch → guide) — connect the loops.
6. **Decide Want/Been:** cut for V1, or make them persist + convert.
7. **Onboarding introduces the guide loop** (or a post-vouch nudge).

**P2 — polish:** drag-reorder · integrity nudge on weak lines · guide cover.

**Parked (not V1):** Borrow/Follow consequences, decide-tonight, palate-as-follow,
auth-gated durability (note the localStorage risk honestly).

---

## What "top, not a prototype" means here

When a real Bengaluru eater can **vouch for any place they actually love** (not 14),
**see and tend their list of names**, **group them into a guide they're proud of**,
and **send it to a friend who can actually open it** — the two loops are whole.
That's three of the P0/P1s: **catalog-search, your-vouches-diary, real-share.** Do
those and V1 is genuinely good; everything else is refinement.

## Recommended build order
1. **Vouch from the real catalog** (P0, unlocks both loops).
2. **Real cross-device share** (P0, the loop-B payoff) — Supabase guides, public read.
3. **Your vouches diary** + **add-to-existing-guide** + **convert nudge** (P1, the habit).
4. Decide Want/Been; onboarding guide moment; then P2 polish.
