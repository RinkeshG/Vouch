# Brand Book — Part I: The Brand

The soul. Read this before you design a pixel. Colour and type are *how* Vouch
looks; this is *who Vouch is*.

---

## 1. Positioning

**Category:** the trusted-friend layer for restaurants.
**One-liner:** *The only review that matters has a name on it.*
**Mission:** end "where should we eat?" by giving everyone the friend with the
spots — and giving that friend a home, and a reach.

### The wedge
The world doesn't need another aggregator. It needs the opposite. Every food app
optimises for *coverage* (every place, every review). Vouch optimises for
*trust* (the few places someone you believe in would stake their name on).

### Name the enemy
We are explicitly **anti-**:
- the **4.2★ average** built by 3,000 strangers,
- the **"sponsored" top pick** that's just whoever paid,
- the **ads dressed as recommendations**,
- the **black-box algorithm** that hands you a place and hopes you trust it.

Naming the enemy is differentiation *and* shareable content. Use it.

### Proof points (the product's truths)
- A **vouch** carries a name. Always.
- **No star ratings. Ever.**
- **Invite-only**, Bengaluru-first — real density, serious eaters.
- Recommendations come **with receipts**: who vouched, who you follow that saved.

---

## 2. Audience — two people, one table

Design for both ends of the same conversation.

**The Tastemaker** — the friend everyone texts before they book. Has the spots
in their head, a Note titled `blr food FINAL`, no good home for it.
→ *Vouch gives their taste a home and a reach.* Their **guides** become the thing
people screenshot and follow.

**The Asker** — everyone else, drowning in 4.1★ noise, gambling on averages.
→ *Vouch hands them the little black book of the people who actually know.*

If a feature doesn't serve one of these two, question it.

---

## 3. Brand personality

Vouch is **the most-fed friend with great taste and zero patience for bad
meals.** Five traits, in priority order:

| Trait | Means | Looks/sounds like |
|---|---|---|
| **Trusted** | A name on the line, never anonymous | "Vouched by Aditi · saved by 3 you follow" |
| **Warm** | A dinner table, not a database | Ember/saffron glow, "pull up a chair" |
| **Opinionated** | Has takes, makes calls | "Benne masala dosa. Don't even debate it." |
| **Editorial** | A field guide with a voice | Display headlines, mono catalog labels |
| **A little exclusive** | Invite-only, insider | Stamps, "admit one", a seat at the table |

**Personality dial (1–10):**
Playful **7** · Warm **8** · Confident **9** · Premium **8** · Loud **3** ·
Corporate **1**.

---

## 4. Voice & Tone

> We talk like the friend who already knows the place — certain, warm, dry, never
> trying too hard. We'd rather be specific and a little funny than safe and
> generic.

### The rules

1. **Be specific, not generic.** "Best bowl in the city. Get there at 6 sharp."
   not "Great ramen spot." Specificity *is* trust.
2. **Short. Confident. Declarative.** Make the call. "Go here." not "You might
   enjoy…". Cut hedges (*maybe, kind of, we think*).
3. **Felt, not stated.** Name the thing people feel but never say. ("Dinner dies
   in the group chat.") Recognition beats description.
4. **Dry wit, never zany.** A wink, not a stand-up set. "The usual. Undefeated
   since 2019." One joke per moment, max.
5. **Anti-corporate.** Never "users," "leverage," "seamless," "curated
   experiences." We say *palates*, *spots*, *guides*, *vouches*.
6. **Lowercase utility, sentence-case humanity.** Mono labels run lowercase or
   UPPERCASE (`// invite-only · no spam`); human copy is sentence case with real
   punctuation and the occasional em dash.

### Tone shifts by moment

| Moment | Tone | Example |
|---|---|---|
| Hero / pitch | Bold, certain | "The only review that matters has a name on it." |
| The problem | Wry, relatable | "Four people. Three apps. Still no answer." |
| Product labels | Terse, catalog | `ON YOUR MAP · TONIGHT`, `ST·03 · VOUCHED` |
| Delight (quiz, jackpot) | Playful | "argue about dosa crispness in a court of law" |
| Errors | Warm, human, no blame | "That doesn't look like an email — mind checking it?" |
| Empty states | Inviting, never dead | "No vouches here yet. Be the first to put your name down." |
| Legal/footer | Plainspoken pride | "No star ratings. Ever." |

### Words we love / words we ban

**Love:** vouch, palate, guide, spot, the usual, go here, worth the drive,
worth your one dinner tonight, receipts, a seat at the table.

**Ban:** users, reviews-as-stars, ratings, curated experiences, foodie,
hidden gems (overused), seamless, elevate, leverage, "discover amazing places."

---

## 5. The Lexicon — *our words*

A vocabulary that only makes sense inside Vouch is half the brand. Use these
precisely and consistently across product, marketing, and code (UI strings).

| Word | Definition | Use it like |
|---|---|---|
| **Vouch** *(v. / n.)* | To put your name on a place; the atomic unit of trust. The one review that's allowed to exist here. | "I vouched for Naru." · "41 vouches." |
| **Palate** *(n.)* | A person on Vouch **and** their taste. You don't follow *users*; you follow *palates*. | "Follow the palates you trust." · "318 palates." · "What's your palate?" |
| **Guide** *(n.)* | A curated, named collection of vouches by one palate. (Formerly "list" — never say *list* in product.) | "Aditi's guide to filter coffee." · "Open all 6 →" · "Add to a guide." |
| **Spot** *(n.)* | A single place worth returning to. | "your spots" · "midnight spots" |
| **Map** *(n.)* | Your personal surface — everything the palates you follow have vouched, pinned where you are. The feed *is* a map. | "lands on your map" · "on your map, tonight" |
| **The three stamps** | A vouch's state: **Want to go** (gold/muted) · **Been** (jade) · **Vouched** (saffron, the currency). | "ST·03 · Vouched" |

**Deliberately dropped:** *Black Book* (too heavy, dating-app connotation),
*Rounds*, *Spreads*. `Map` carries the "everything from people you follow" idea.

*(Aside: the phrase "no black **box**" in trust copy is fine — that's about
algorithm opacity, a different word from the dropped "black book.")*

---

## 6. Logo & Wordmark

### The wordmark
**"Vouch"** set in **Bricolage Grotesque, weight 800**, tracking `-0.025em`,
paired with the mark. Display weight is mandatory — never set the wordmark in the
body or mono face.

### The mark — "the V in the seal"
A rounded square **seal** (the stamp / a passport mark) containing a downward
**V** check stroke in saffron. It reads as *vouch* (a checkmark of approval) and
*ledger stamp* at once.

```
 ┌──────────┐      rounded-square seal, 1.3px stroke, --line-2 @ 50%
 │  \    /  │      the "V": saffron (--accent), 2.4px, round caps
 │   \  /   │
 │    \/    │      mark = 24–28px in nav, scales with wordmark
 └──────────┘
```

**Construction:** seal `rx 4` on a `26×26` box; V path `M7 8.5l6 9 6-9`.
A small saffron dot above the V is used as a "spotlight/plate" accent variant.

### Clearspace & sizing
- Minimum clearspace around the lockup = the height of the mark.
- Mark minimum **20px**; below that, drop the mark and keep the wordmark only.
- Wordmark may stand alone; the mark may stand alone (app icon, favicon, avatars
  fallback).

### Don'ts
- ✕ Don't recolour the V anything but saffron (or `--accent-ink` on saffron fills).
- ✕ Don't set the wordmark in Space Grotesk / Space Mono.
- ✕ Don't add a drop shadow, outline, or gradient to the wordmark text.
- ✕ Don't stretch, condense, or re-letter-space the wordmark.
- ✕ Don't place the mark on a busy photo without the seal's contrast holding.

---

## 7. Brand-in-one-screen checklist

Before shipping any surface, it should pass:

- [ ] Is the trust visible? (a name, never just a number)
- [ ] Does it feel warm + appetite-led, not like a dashboard?
- [ ] Is the copy specific, confident, and in our voice?
- [ ] Are we using *our* words (palate, vouch, guide, map)?
- [ ] Does it work one-handed on a phone first?
- [ ] Does every element earn its place?

---

### Changelog
- **v1.0** — Initial brand book, distilled from the v2 landing. *(— DS)*
