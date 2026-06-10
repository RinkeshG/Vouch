"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark } from "./wordmark";
import { MapReal, type MapPin } from "./map-real";
import { SearchField } from "./input";
import { SEED, placeTint, monogram, cuisineGlyph, type Spot } from "./_taste";
import { searchCatalog, cleanArea, type CatalogSpot } from "./_catalog";
import { useMyMap } from "./_map-context";
import { type Gut } from "./_me";
import styles from "./onboarding.module.css";

/* Onboarding — organic cold signup (PRD §7.1). In ~60s: seed the map, read a taste
   signal, end on forward intent. A full-screen swipe of 12 recognizable local spots —
   on each, "I've been" → Go back? (Absolutely/Maybe/No), or Want to go, or skip. NO
   typing, NO vouch asked, NO assigned persona. The payoff is the map filling in; the
   close is a Want, so every signup exits holding one. */

const DECK: Spot[] = SEED.slice(0, 12);
type Step = "swipe" | "payoff" | "close";

export function Onboarding() {
  const router = useRouter();
  const { entries, setStamp } = useMyMap();
  const [step, setStep] = useState<Step>("swipe");
  const [i, setI] = useState(0);
  const [goBack, setGoBack] = useState(false); // is the current card asking "Go back?"
  const [tipSeen, setTipSeen] = useState(false); // one tooltip, first time only
  const [q, setQ] = useState("");
  const [results, setResults] = useState<CatalogSpot[]>([]);

  const card = DECK[i];
  function advance() {
    setGoBack(false);
    if (i + 1 >= DECK.length) setStep("payoff");
    else setI((n) => n + 1);
  }
  function markWant() { setStamp(card, "want", { source: "onboarding" }); advance(); }
  function markBeen(gut: Gut) { setStamp(card, "been", { gut, source: "onboarding" }); setTipSeen(true); advance(); }

  // what they built this session — drives the payoff (read straight from the seam)
  const mine = entries;
  const spots = mine.length;
  const areas = useMemo(() => new Set(mine.map((e) => cleanArea(e.spot.area))).size, [mine]);
  const goBackCount = mine.filter((e) => e.stamp === "been" && e.gut === "absolutely").length;
  const payoffPins: MapPin[] = mine.map((e) => ({ id: e.spot.name, lat: e.spot.lat, lng: e.spot.lng, name: e.spot.name, kind: "mine", stamp: e.stamp, gut: e.gut, cuisine: e.spot.cuisine }));

  // close-step search (the one Want that sends you off)
  useEffect(() => {
    if (step !== "close") return;
    let dead = false;
    const have = new Set(entries.map((e) => e.spot.name));
    searchCatalog(q).then((r) => { if (!dead) setResults(r.filter((s) => !have.has(s.name)).slice(0, 6)); });
    return () => { dead = true; };
  }, [q, step, entries]);
  function wantAndGo(s: CatalogSpot) {
    setStamp({ name: s.name, area: s.area, cuisine: s.cuisine, price: s.price, occasions: [], lat: s.lat ?? 12.9716, lng: s.lng ?? 77.5946 }, "want", { source: "onboarding" });
    router.push("/home");
  }

  // ── SWIPE ────────────────────────────────────────────────────────────────────
  if (step === "swipe") {
    const glyph = cuisineGlyph(card.cuisine);
    return (
      <div className={styles.stage}>
        <div className={styles.card} key={i} style={{ background: placeTint(card.cuisine) }}>
          <header className={styles.top}>
            <Wordmark size={0.95} />
            <span className={styles.count}>{i + 1} <i>/</i> {DECK.length}</span>
          </header>
          <span className={styles.bars} aria-hidden="true">
            {DECK.map((_, k) => <i key={k} className={k <= i ? styles.barOn : styles.bar} />)}
          </span>

          <span className={styles.watermark} aria-hidden="true">{monogram(card.name)}</span>

          <div className={styles.body}>
            <span className={styles.kind}>
              {glyph && <span className={styles.glyph} dangerouslySetInnerHTML={{ __html: glyph }} />}
              {card.cuisine} · {cleanArea(card.area)} · {card.price}
            </span>
            <h1 className={styles.name}>{card.name}</h1>
            {card.vibe && <p className={styles.vibe}>{card.vibe}</p>}
          </div>

          <div className={styles.actions}>
            {!goBack ? (
              <>
                <span className={styles.ask}>Know this one?</span>
                <div className={styles.row}>
                  <button type="button" className={styles.been} onClick={() => setGoBack(true)}>I’ve been</button>
                  <button type="button" className={styles.want} onClick={markWant}>Want to go</button>
                </div>
                <button type="button" className={styles.skip} onClick={advance}>Skip</button>
              </>
            ) : (
              <>
                <span className={styles.ask}>Go back?{!tipSeen && <em className={styles.tip}> — your honest gut. It stays private.</em>}</span>
                <div className={styles.gutRow}>
                  <button type="button" className={`${styles.gut} ${styles.gAbs}`} onClick={() => markBeen("absolutely")}>Absolutely</button>
                  <button type="button" className={`${styles.gut} ${styles.gMaybe}`} onClick={() => markBeen("maybe")}>Maybe</button>
                  <button type="button" className={`${styles.gut} ${styles.gNo}`} onClick={() => markBeen("no")}>No</button>
                </div>
                <button type="button" className={styles.skip} onClick={() => setGoBack(false)}>← not this</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── PAYOFF ───────────────────────────────────────────────────────────────────
  if (step === "payoff") {
    return (
      <div className={styles.stage}>
        <div className={styles.payoff}>
          <div className={styles.payoffMap}>
            <MapReal pins={payoffPins} height="100%" labelMode="hover" recede tag="Your map · Bengaluru" />
          </div>
          <div className={styles.payoffText}>
            <p className={styles.payEyebrow}>Your map</p>
            <h1 className={styles.payTitle}>
              {spots > 0 ? <><span className={styles.payNum}>{spots}</span> {spots === 1 ? "spot" : "spots"}, {areas} {areas === 1 ? "neighbourhood" : "neighbourhoods"}. This is yours.</>
                : <>A clean map. Let’s put something on it.</>}
            </h1>
            {goBackCount >= 2 && <p className={styles.payNote}>You’d go back to {goBackCount} of these, no question.</p>}
            <button type="button" className={styles.payCta} onClick={() => setStep("close")}>One place you’ve been meaning to try? →</button>
          </div>
        </div>
      </div>
    );
  }

  // ── CLOSE (exit holding a Want) ──────────────────────────────────────────────
  return (
    <div className={styles.stage}>
      <div className={styles.close}>
        <p className={styles.payEyebrow}>One last thing</p>
        <h1 className={styles.closeTitle}>One place you’ve been meaning to try?</h1>
        <p className={styles.closeSub}>Drop it on your map. Next time you’re nearby, Vouch will remind you.</p>
        <SearchField placeholder="Search any spot in Bengaluru…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
        <ul className={styles.closeResults}>
          {q.trim() === "" ? (
            <li className={styles.closeHint}>Start typing a place you’ve been curious about.</li>
          ) : results.length === 0 ? (
            <li className={styles.closeHint}>Nothing matching “{q}”.</li>
          ) : results.map((s) => (
            <li key={s.slug}>
              <button type="button" className={styles.closeRow} onClick={() => wantAndGo(s)}>
                <span className={styles.closeName}>{s.name}</span>
                <span className={styles.closeMeta}>{s.cuisine} · {cleanArea(s.area)} · {s.price}</span>
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className={styles.closeSkip} onClick={() => router.push("/home")}>I’m good for now →</button>
      </div>
    </div>
  );
}
