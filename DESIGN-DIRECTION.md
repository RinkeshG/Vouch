# Vouch — Landing Page Design Direction: from "works" to "memorable"

A director's review of the **landing page** for Vouch v1. Re-framed: this is not
the product — it's the *first handshake* for it. So it's judged as a piece of
**persuasion and brand craft**, not product UX.

A landing page has one job, done in seconds, usually on a phone, often opened from
a link a friend sent: **make a stranger understand it, want it, trust it, act once,
and remember it.** Everything below is measured against that — not against "is this
a good app."

Reviewed against the current build: an interactive WebGL Bengaluru you scroll
through — Priya's real picks light up neighbourhood by neighbourhood, in her voice,
on a map that quietly reacts to the time and weather — ending on "Light up yours."

---

## 0. The verdict

**The strategy is right and rare: the landing *is the product, live.*** Instead of
screenshots and bullet points, you *receive a guide.* That's the Linear/Arc/Family
move — show it working — and it's the single best decision here. Protect it.

**But it's being judged as a mood film when it needs to also do a landing page's
job.** A cold visitor on a phone, 5 seconds in, should think *"I get it, I want it,
and I know what to do."* Right now they get **mood and mystery** but not
**comprehension, a path, or a reason to trust** — and the one action is buried six
screens down a heavy scroll.

**The five highest-leverage moves (landing lens, in order):**
1. **Land the value in 5 seconds.** Pair the poetry with one plain line that says
   what Vouch *is* and why it's better. Today a stranger can't tell if this is a
   personal blog, a map app, or a product.
2. **Fix the conversion architecture.** The only CTA lives at the bottom of a long
   cinematic. Give a reachable action early *and* keep the earned finale.
3. **Fast, crafted first paint — on a mid-range Android, on Indian mobile data.** A
   heavy WebGL hero that loads blank/janky on a phone bounces before it can charm.
   Performance is a design decision here.
4. **Make "you *make and share* this" legible.** The demo shows you *receiving* a
   guide; the product's value is *creating and sharing* one. The visitor must
   imagine *their* guide, not just admire Priya's.
5. **One signature, shareable moment.** A landing that travels has a beat people
   screenshot and send. We have the ingredients and haven't built the moment.

---

## Product — what this landing is selling

Vouch v1: **you make a page of the places you love — in your voice, with your name
— and send it to someone you'd actually take there.** The anti-Yelp. A
recommendation with a name on it.

The landing's product promise, in one breath: *"the friend's list, as a thing you
can make and give."* Two audiences land here — someone who got a guide (consumer),
and someone who could make one (creator) — and the page must serve the creator's
"I want to make mine" while letting the consumer feel the warmth of receiving.

- **What it must communicate:** *what it is* (a personal, voiced guide of real
  places), *why it's better* (named + trusted + in-voice vs anonymous + aggregated),
  *what to do* (make yours / open one).
- **What it must make them feel:** the warmth of being taken somewhere by someone
  who knows — and the pull to do that for someone they love.
- **What they must remember:** "that thing where a friend's city lit up around you,
  and at the end it handed you the dark and said *now light up yours.*"

## User — who lands here, and in what state

A **distracted stranger, on a phone, with ~5 seconds of patience**, arriving cold
or from a shared link, asking one silent question: *"What is this, and is it for
me?"* They are not in "explore a product" mode; they are in "decide whether to
care" mode.

- **Confidence moment (the landing must manufacture one fast):** "oh — these are
  *real* places, a *real* person, a *real* voice. Not generated, not 3,000 strangers'
  stars." Specificity is the proof.
- **Desire moment:** a line that makes them smile + the realization the map matches
  *their* moment ("it's evening and the bars are warm — it *knows*").
- **Decision moment:** a clear, low-friction "make yours" they believe takes two
  minutes — earned by everything before it.

## Experience — as a landing funnel (not a usage journey)

A landing is a funnel: **Attention → Comprehension → Desire → Trust → Action →
Share.** Mapped to the current build:

| Stage | What a great landing does | Current | The gap |
|---|---|---|---|
| **Attention (load, 0–2s)** | hook instantly; fast, crafted first paint | WebGL map fades in; no crafted load; heavy on mobile | **Risk of a blank/janky first impression on a phone** → bounce before the charm lands. The hook is slow. |
| **Comprehension (the fold)** | "I understand what this is" in 5s | "come, i'll show you my Bengaluru… not a list off the internet" | Evocative, but a stranger can't tell it's a **product you make & share** vs a blog or a map. **No plain-language value line. No action in the fold.** |
| **Desire (the scroll-demo)** | watching it makes me *want* it | Priya's neighbourhoods light up in her voice; the map reacts to my moment | Strong — but it shows me *receiving*, never *that people make these*. The magic (context) is **invisible**, so the biggest desire-driver never fires. |
| **Trust** | proof it's real / for people like me | implicit (real places) | No explicit credibility — no other guides, no faces, no "made by people who…". A v1 can be light, but trust is currently *assumed*. |
| **Action (finale)** | one obvious, low-friction step | "Light up yours" + buttons, ~6 screens deep | **The only CTA is at the very bottom of a long cinematic.** Emotionally earned, but most never reach it; no early path; friction of "make a guide" unframed (the "two minutes" line is the one save). |
| **Share** | a reason and a way to pass it on | none | The landing isn't built to be sent; **no signature shareable artifact** — a missed growth loop for a peer-shared product. |

---

## 1. Delight opportunities (landing-grade, not gimmicks)

Delight on a landing must *also* sell. Each below builds desire or trust.

- **The 5-second "oh, I get it."** Comprehension delivered with style is itself a
  delight on a landing — the relief of instantly understanding. Pair the poetic
  line with a plain one. *Emotion: clarity, confidence. Impact: high (top of
  funnel). Effort: low.*
- **The map matches your moment — revealed once.** The single biggest "whoa, this
  is different" the page has, and it's hidden. Surface it once. *Emotion: "it
  knows me." Impact: very high (desire). Effort: low.*
- **The voice that makes you smile.** Her lines are the personality; deliver one
  big enough to land a laugh ("don't offer to share"). *Emotion: warmth, humour.
  Impact: high. Effort: low.*
- **"[Name] sent you here."** If from a real share link — the warmest possible
  open, and free trust. *Emotion: belonging. Impact: high on shared traffic.
  Effort: low-med.*

## 2. Motion opportunities (motion must sell or explain)

On a landing, motion's job is **explain the value** and **carry the brand** — not
ambience. Today the camera glides smoothly but uniformly; it *moves* but doesn't
*say* anything.

- **Motion that explains the product.** A beat that visibly assembles a *vouch* —
  *a place → a voice → a name* clicking into one object — animates the value prop
  itself. A landing should *show the idea*, not just the artifact. *Ref: Stripe's
  "how it works" beats, Linear's feature reveals. Effort: med.*
- **The "warm-up" — one signature motion.** Define the amber-bloom-plus-breath and
  reuse it at load, on focus, at the finale until it's *the Vouch motion*. Brand
  recognition without a logo. *Ref: Stripe gradient, Arc squish, Raycast. Effort:
  low-med.*
- **Camera with intention (anticipation → arrival).** Pull back to feel the
  distance between neighbourhoods, commit a descent in. A journey, not a slideshow
  — and it keeps people scrolling toward the CTA. *Ref: Apple Maps flyover, Framer
  scroll scenes. Effort: med.*
- **Scroll that earns the next screen.** Each beat should end on a tiny hook that
  pulls the thumb down — the mechanism that gets people to the CTA. *Ref:
  Apple/Igloo product scrolls. Effort: low.*
- **Kill:** motion identical across all four neighbourhoods (sameness erases
  meaning), and the bare chapter-rail dots (communicate nothing — earn or cut).

## 3. Product magic (the demo's "it's alive" beats)

The landing's job is to make the *product* look magical. All latent in the build:

- **"Right now" context** (time + weather, live) — the strongest differentiator,
  currently invisible. *Make it perceptible once* (WOW W2). The rain warming the
  chai spots is the single most "I have to show someone" beat available.
- **A living clock** — a visitor returning at a different hour sees a different
  city. A reason to come back to the *page*. *Effort: low (already context-driven).*
- **Referral awareness** — the page knows it was shared, and by whom.
- **The artifact feels real** — because the places, person, and voice *are* real.
  Lean into specificity as the magic (cash only, 7am sharp, by two).

## 4. Emotional design (what the page makes a stranger feel)

| Stage | Should feel | Currently feels | Why it fails |
|---|---|---|---|
| Open | curious, warm — "someone's about to show me something" | pretty but cool/abstract | orphaned voice (no person), no plain hook, slow heavy load |
| Scroll | charmed, "I want this for me / for someone" | competent, smooth, a touch repetitive & passive | shows *receiving*, never *making*; the human line is sub-ordinated to the map UI |
| End | "yes — I'll make mine" (pride + intent) | "here's a CTA" | no bridge from *her* city to *yours*; the act isn't pre-felt; the button arrives cold after a long scroll |

The fix is re-ranking, not more feeling: **person > voice > the moment > the map.**

## 5. Brand expression — the logo-off test

*Strip the wordmark — would you know it's Vouch?* **Barely.** It reads as "a nice
dark map." Four signatures could make it unmistakable, and we have all four
un-plated:

- **A signature object** — the *voiced vouch pin* (place + person + line). Own it
  the way Things owns its checkbox.
- **A signature motion** — the **warm-up** (§2), reused everywhere.
- **A signature voice** — a *named* person + Bengaluru's texture (filter kaapi, by
  two, 7am, the rain). Present but buried; it should be the personality you recall.
- **A signature moment** — the finale (W1). No competitor ends a tour by handing
  you the dark.

A landing that owns object + motion + voice + moment becomes screenshot-recognizable.

## 6. Craft review — ruthless, landing lens

- **The fold is doing too little (highest severity).** The most valuable real estate
  on any landing carries no plain value statement and no action — only mood + a
  scroll cue. *A stranger should grasp the product and see a way in, here.*
- **Conversion is architected as "scroll to the end or leave."** The sole CTA is
  ~6 screens down. Needs an early, well-integrated path *and* the earned finale.
- **Performance is a design hole.** WebGL + vector tiles is heavy; on a mid Android
  on mobile data the hero can paint blank or stutter. **First paint and a crafted
  loading state are part of the design**, not an afterthought. (Consider a static,
  instant first frame that upgrades to the live map.)
- **Mobile-first, not desktop-with-media-queries.** Shared peer-to-peer = opened on
  phones via WhatsApp. The hover-to-focus model doesn't exist on touch; the left
  panel + wide map are desktop compositions. The real device is the afterthought.
- **Inverted type hierarchy.** The "move" (her voice) is the smallest text under a
  giant area name. The thing that sells is sub-ordinated to scaffolding.
- **"Receiving" vs "making."** Nothing on the page says *you* can make and send one
  — the actual product. The demo needs to imply authorship.
- **Trust signals: none.** For a launch, even light proof (other real guides, a
  face, "made in Bengaluru by…") raises conversion.
- **Loading/empty states** under-designed; the finale *wants to be* an empty state
  (W1) and isn't using it.
- **Microcopy** sings in her voice, flattens in scaffolding ("scroll — i'll take you
  through" good; the rest should reach for the same register).
- **Density honesty:** "1,400 places" is conceptually nice but mostly invisible — is
  fullness *felt* or just paid for? Decide.

---

## 7. WOW moments (10–15, ranked by landing leverage)

Each: **Why it matters · Emotion/problem · Why it fits · Impact · Effort · Ref.**
All emerge from the product; all serve comprehension, desire, action, or share.

### A — the conversion-defining moments

**W1. The finale that becomes *yours* (the conversion).**
After her city, the warmth **cools to dark** — her lights go out — leaving an empty
Bengaluru that's *yours*: *"this one's yours. light it up."* The CTA is the first
frame of *making*, not a button.
*Why: the highest-converting possible ending — turns the mood into the act. ·
Emotion: invitation, ownership. · Fit: mirrors the product's real empty state. ·
Impact: very high (conversion). · Effort: med. · Ref: Duolingo "your turn," the
app's own empty state.*

**W2. The single "it knows your moment" reveal.**
One restrained beat where the map's logic becomes legible — it names the real
moment and the right places breathe up — then recedes.
*Why: the strongest differentiator, currently invisible = wasted desire. · Emotion:
"this is different / it knows me." · Fit: the contextual core. · Impact: very high.
· Effort: low. · Ref: Apple Weather, Arc personal touches.*

**W3. The 5-second clarity layer.**
A plain line beside the poetry — *"a guide of the places you love, in your voice —
made to send to someone."* — so a stranger groks it instantly.
*Why: comprehension is the top-of-funnel gate. · Emotion: confident understanding.
· Fit: it's a landing. · Impact: very high. · Effort: low. · Ref: Linear/Stripe/
Vercel hero clarity over poetry.*

**W4. A CTA that's always within reach.**
A persistent, beautifully integrated "make yours / open a guide" — not buried at the
bottom; the finale stays the *emotional* close.
*Why: you can't convert an action people never reach. · Emotion: low friction. ·
Fit: conversion. · Impact: very high. · Effort: low. · Ref: Family, Linear sticky
CTAs.*

### B — the first-impression & brand signatures

**W5. Fast, crafted first paint.**
An instant, beautiful static first frame (a treated still of the city + the line)
that *upgrades* to the live WebGL map once ready — never a blank/janky hero.
*Why: the hook must beat the bounce; mobile-India reality. · Emotion: "fast,
premium." · Fit: performance-as-craft. · Impact: high (saves top of funnel). ·
Effort: med. · Ref: Apple product pages, Vercel.*

**W6. The city wakes (signature load).**
Roads draw, places light like windows across the city, settling on the first warm
cluster (~1.5s) — a branded opening, not a fade.
*Why: turns load into identity. · Emotion: anticipation, awe. · Impact: high (first
impression). · Effort: med. · Ref: Stripe hero, Apple reveals.*

**W7. The "warm-up" brand motion.**
One amber-bloom-plus-breath reused at load, focus, finale until it's *the* Vouch
motion.
*Why: logo-off recognition. · Emotion: cohesion, satisfaction. · Impact: high
(compounding). · Effort: low-med. · Ref: Stripe, Arc, Raycast.*

**W8. Motion that animates the value prop.**
A beat that assembles a vouch — *place → voice → name* — so the idea is *shown*, not
told.
*Why: a landing should explain visually. · Emotion: "ohh, that's the idea." · Fit:
the unit of the product. · Impact: high (comprehension+desire). · Effort: med. ·
Ref: Stripe "how it works," Linear reveals.*

### C — desire, trust, and the demo

**W9. The voice as the centerpiece.**
On focus, her line is delivered large and paced, place + name beneath — the headline
of the moment.
*Why: the voice is the entire differentiator and it's tiny. · Emotion: intimacy,
humour. · Impact: high. · Effort: low. · Ref: editorial pull-quotes, Readwise
cards.*

**W10. "Priya sent you."**
A real share link greets you by its sender.
*Why: warmest open + free trust on the channel that matters (WhatsApp). · Emotion:
belonging. · Impact: high on shared traffic. · Effort: low-med. · Ref: shared
Figma/Notion greetings.*

**W11. Rain that recommends.**
When it's actually raining in Bengaluru, it rains *and* the chai/dosa spots warm —
weather as recommendation.
*Why: unforgettable, specific, multi-sensory; nobody else does it. · Emotion: cozy
delight. · Fit: Bengaluru + context. · Impact: med (huge when it hits). · Effort:
low (half-built). · Ref: Apple Weather.*

**W12. Light credibility, woven in.**
A glimpse that *people make these* — a few real guides/faces, "made in Bengaluru,"
a real count — without a testimonial wall.
*Why: trust is currently assumed; a launch needs a little proof. · Emotion:
reassurance, "this is real." · Impact: med-high (conversion). · Effort: low-med. ·
Ref: Linear logo strips, Family's restraint.*

### D — shareability & memory (the growth loop)

**W13. The shareable frame.**
A poster-grade still — the map at golden hour, one glowing vouch, the line, the name
— a visitor can save/send as a beautiful image.
*Why: built-in virality; "I have to show someone." · Emotion: pride, beauty. · Fit:
guides are shared. · Impact: high (growth). · Effort: med. · Ref: Spotify Wrapped,
Arc Easels.*

**W14. Sequence as the walk.**
Scrolling within a neighbourhood moves through her picks *in her order* — walking
with her — no drawn line, just pacing and arrival.
*Why: honours "the way I'd take you," surfaces all four voices (not just on hover),
and keeps the thumb moving toward the CTA. · Emotion: companionship. · Impact:
med-high. · Effort: med. · Ref: NYT/Pudding scrollytelling.*

**W15. The pin as a crafted object.**
Micro-physics on focus — lift, soft shadow, spring settle, the warm-up. The badge
becomes the iconic Vouch object.
*Why: perceived quality = "someone cared." · Emotion: tactility. · Impact: med
(compounding). · Effort: low. · Ref: Linear, Things, Raycast.*

---

## How to sequence (buildable, not a wishlist)

1. **Make it convert (foundation):** W3 (clarity), W4 (reachable CTA), W2 (context
   reveal), W9 (voice hierarchy), mobile-first + W5 (fast first paint). *These make
   the landing actually do its job.*
2. **Make it signature:** W6 (city wakes), W7 (warm-up), W8 (value-prop motion), W1
   (cool-to-dark finale), W15 (pin craft). *This is where it becomes unmistakably
   Vouch.*
3. **Make it travel:** W10 (referral), W11 (rain), W13 (shareable), W12 (proof),
   W14 (sequence). *Trust + growth loops.*

**Discipline:** no new sections, more places, more cards, or motion-for-motion. The
landing wins by being *understood in 5 seconds, wanted by the end, and impossible to
mistake for anyone else* — fewer, deeper moments executed to Linear/Apple craft.
```
