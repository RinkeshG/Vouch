"use client";
import { useMemo, useState } from "react";
import { Wordmark } from "./wordmark";
import { Avatar } from "./avatar";
import { Button } from "./button";
import { OccasionChip, Tag } from "./chip";
import { SearchField } from "./input";
import { MapReal, type MapPin } from "./map-real";
import styles from "./onboarding.module.css";

/* J1 — first run (web). The map is the persistent companion on the left; it fills
   as you vouch. The right pane guides you: build → reveal your palate → borrow
   people who match your taste. Composed bespoke from the kit. Mobile is designed
   separately, later. */

type Spot = { name: string; area: string; cuisine: string; price: string; occasions: string[]; lat: number; lng: number };
type Vouch = { spot: Spot; line: string; occ: string[] };

const SEED: Spot[] = [
  { name: "Naru Noodle Bar", area: "Indiranagar", cuisine: "Ramen", price: "₹₹₹", occasions: ["date", "rainy day"], lat: 12.9748, lng: 77.6402 },
  { name: "Empire", area: "Indiranagar", cuisine: "Kebabs", price: "₹₹", occasions: ["late night"], lat: 12.9707, lng: 77.6400 },
  { name: "Brahmin’s Coffee Bar", area: "Shankarpuram", cuisine: "Filter coffee", price: "₹", occasions: ["coffee", "solo lunch"], lat: 12.9544, lng: 77.5650 },
  { name: "Vidyarthi Bhavan", area: "Basavanagudi", cuisine: "Dosa", price: "₹", occasions: ["parents", "coffee"], lat: 12.9419, lng: 77.5732 },
  { name: "Karavalli", area: "Residency Rd", cuisine: "Coastal", price: "₹₹₹₹", occasions: ["parents", "group dinner"], lat: 12.9618, lng: 77.6006 },
  { name: "Toit", area: "Indiranagar", cuisine: "Brewpub", price: "₹₹₹", occasions: ["group dinner", "date"], lat: 12.9785, lng: 77.6403 },
  { name: "CTR · Shri Sagar", area: "Malleshwaram", cuisine: "Benne dosa", price: "₹", occasions: ["coffee", "parents"], lat: 13.0028, lng: 77.5687 },
  { name: "Shivaji Military Hotel", area: "Jayanagar", cuisine: "Donne biryani", price: "₹₹", occasions: ["worth the drive"], lat: 12.9266, lng: 77.5836 },
  { name: "Corner House", area: "Koramangala", cuisine: "Ice cream", price: "₹", occasions: ["late night", "date"], lat: 12.9346, lng: 77.6270 },
  { name: "Soka", area: "Indiranagar", cuisine: "Small plates", price: "₹₹₹", occasions: ["date", "group dinner"], lat: 12.9761, lng: 77.6406 },
];
const coord = (n: string) => { const s = SEED.find((x) => x.name === n); return { lat: s ? s.lat : 12.9716, lng: s ? s.lng : 77.5946 }; };
const OCCASIONS = ["parents", "late night", "date", "solo lunch", "coffee", "group dinner", "worth the drive", "rainy day"];

const ARCH: Record<string, { name: string; glyph: string; line: string }> = {
  "late night": { name: "The Midnight Forager", glyph: "🌙", line: "Your best meals start after 11 and never had a menu." },
  coffee: { name: "The Filter-Coffee Fundamentalist", glyph: "☕", line: "A degree filter by 8am. You’d argue dosa crispness in court." },
  date: { name: "The Small-Plates Romantic", glyph: "🍷", line: "It’s the room, the bottle, the person across the table." },
  parents: { name: "The Safe-Hands Host", glyph: "🍛", line: "You never gamble when it actually matters." },
  "group dinner": { name: "The Table-for-Eight", glyph: "🍕", line: "The more chairs you pull up, the better the night." },
  "worth the drive": { name: "The Pilgrim", glyph: "🛵", line: "Distance is a rounding error for the right meal." },
  "solo lunch": { name: "The Quiet Regular", glyph: "📖", line: "A good solo lunch is a sacred, selfish pleasure." },
  "rainy day": { name: "The Comfort Seeker", glyph: "🌧️", line: "You eat by the weather, and the weather says broth." },
};
const DEFAULT_ARCH = { name: "The All-Rounder", glyph: "✦", line: "A palate with a spot for every occasion." };

type PSpot = { name: string; lat: number; lng: number; line: string };
const FOUNDING: { name: string; ini: string; occasions: string[]; blurb: string; spots: PSpot[] }[] = [
  { name: "Aditi", ini: "AS", occasions: ["parents", "coffee", "solo lunch"], blurb: "Old-school South Indian and the filter-coffee canon.", spots: [
    { name: "Karavalli", ...coord("Karavalli"), line: "Take your parents. They’ll talk for months." },
    { name: "Brahmin’s Coffee Bar", ...coord("Brahmin’s Coffee Bar"), line: "Idli + that chutney. Peak." },
    { name: "Vidyarthi Bhavan", ...coord("Vidyarthi Bhavan"), line: "Go before 9am, beat the queue." },
  ] },
  { name: "Rinkesh", ini: "RG", occasions: ["late night", "date", "group dinner"], blurb: "Late-night, brewpubs, and where to take a date.", spots: [
    { name: "Empire", ...coord("Empire"), line: "Chicken ghee roast at 1am." },
    { name: "Toit", ...coord("Toit"), line: "Go early, it fills up." },
    { name: "Corner House", ...coord("Corner House"), line: "Death by Chocolate, always." },
  ] },
  { name: "Meera", ini: "MK", occasions: ["coffee", "date", "worth the drive"], blurb: "Coffee obsessive who’ll drive 40km for a dosa.", spots: [
    { name: "Soka", ...coord("Soka"), line: "Negroni, then stay for the plates." },
    { name: "CTR · Shri Sagar", ...coord("CTR · Shri Sagar"), line: "Benne dosa. Settled." },
    { name: "Naru Noodle Bar", ...coord("Naru Noodle Bar"), line: "Wine + ramen. Yes." },
  ] },
];

type Phase = "add" | "reveal" | "borrow";

export function Onboarding() {
  const [phase, setPhase] = useState<Phase>("add");
  const [mine, setMine] = useState<Vouch[]>([]);
  const [sel, setSel] = useState<Spot | null>(null);
  const [line, setLine] = useState("");
  const [occ, setOcc] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [followed, setFollowed] = useState<string[]>([]);

  const picked = new Set(mine.map((v) => v.spot.name));
  const remaining = SEED.filter((s) => !picked.has(s.name));
  const results = q ? remaining.filter((s) => (s.name + s.area + s.cuisine).toLowerCase().includes(q.toLowerCase())) : remaining;

  const archetype = useMemo(() => {
    const tally: Record<string, number> = {};
    mine.forEach((v) => v.occ.forEach((o) => { tally[o] = (tally[o] || 0) + 1; }));
    const top = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0];
    return (top && ARCH[top]) || DEFAULT_ARCH;
  }, [mine]);
  const areas = useMemo(() => new Set(mine.map((v) => v.spot.area)).size, [mine]);
  const borrowedSpots = FOUNDING.filter((f) => followed.includes(f.name)).reduce((n, f) => n + f.spots.length, 0);
  const GOAL = 3;
  const phaseIdx = phase === "add" ? 0 : phase === "reveal" ? 1 : 2;
  const PHASE_LABELS = ["Build your map", "Your palate", "Follow palates"];
  function removeVouch(name: string) { setMine((m) => m.filter((v) => v.spot.name !== name)); }

  const pins: MapPin[] = [
    ...mine.map((v) => ({ id: `me:${v.spot.name}`, lat: v.spot.lat, lng: v.spot.lng, name: v.spot.name, line: v.line, occasion: v.occ[0], kind: "mine" as const })),
    ...FOUNDING.filter((f) => followed.includes(f.name)).flatMap((f) =>
      f.spots.filter((sp) => !picked.has(sp.name)).map((sp) => ({ id: `${f.name}:${sp.name}`, lat: sp.lat, lng: sp.lng, name: sp.name, line: sp.line, kind: "palate" as const, by: { name: f.name, ini: f.ini } })),
    ),
  ];

  function commitVouch() {
    if (!sel || !line.trim() || occ.length === 0) return;
    setMine((m) => [...m, { spot: sel, line: line.trim(), occ }]);
    setSel(null); setLine(""); setOcc([]); setQ("");
  }
  const toggleOcc = (o: string) => setOcc((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));
  const toggleFollow = (n: string) => setFollowed((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
  function matchPct(f: (typeof FOUNDING)[number]) {
    const a = new Set(mine.flatMap((v) => v.spot.occasions.concat(v.occ)));
    const inter = f.occasions.filter((o) => a.has(o)).length;
    const union = new Set([...a, ...f.occasions]).size || 1;
    return Math.max(58, Math.min(96, Math.round((inter / union) * 100) + 48));
  }

  return (
    <div className={styles.stage}>
      <header className={styles.top}>
        <Wordmark size={1.3} />
        <div className={styles.progress}>
          <span className={styles.progressStep}>Step {phaseIdx + 1} of 3</span>
          <span className={styles.progressLabel}>{PHASE_LABELS[phaseIdx]}</span>
          <span className={styles.bars} aria-hidden="true">
            {[0, 1, 2].map((i) => <i key={i} className={i <= phaseIdx ? styles.barOn : styles.bar} />)}
          </span>
        </div>
      </header>

      <div className={styles.split}>
        <div className={styles.mapPane}>
          <MapReal pins={pins} height={560} />
        </div>

        <div className={styles.pane}>
          {phase === "add" && (
            <>
              <h1 className={styles.title}>{mine.length < 1 ? "A place you’d send a friend to — no hesitation." : mine.length < 3 ? "Nice. One more you’d vouch for." : "Add as many as you like."}</h1>
              {!sel ? (
                <div className={styles.picker}>
                  <SearchField placeholder="Search a place you love…" value={q} onChange={(e) => setQ(e.target.value)} />
                  <ul className={styles.results}>
                    {results.slice(0, 5).map((s) => (
                      <li key={s.name}>
                        <button type="button" className={styles.result} onClick={() => setSel(s)}>
                          <span className={styles.resultName}>{s.name}</span>
                          <span className={styles.resultMeta}>{s.cuisine} · {s.area} · {s.price}</span>
                        </button>
                      </li>
                    ))}
                    {results.length === 0 && <li className={styles.noResult}>That’s the demo set — see your palate below.</li>}
                  </ul>
                </div>
              ) : (
                <div className={styles.compose}>
                  <div className={styles.composeHead}>
                    <span className={styles.composePlace}>{sel.name}</span>
                    <button type="button" className={styles.change} onClick={() => setSel(null)}>↺ Change place</button>
                  </div>
                  <span className={styles.composeTags}><Tag>{sel.cuisine} · {sel.area} · {sel.price}</Tag></span>
                  <label className={styles.fieldLabel}>One line — why you’d send them</label>
                  <div className={styles.lineWrap}>
                    <textarea
                      className={styles.lineInput}
                      value={line}
                      maxLength={120}
                      rows={2}
                      placeholder="Best bowl in the city. Go at 6 sharp."
                      autoFocus
                      onChange={(e) => setLine(e.target.value.replace(/\n/g, " "))}
                      onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = `${t.scrollHeight}px`; }}
                    />
                    <span className={styles.lineCount}>{line.length}/120</span>
                  </div>
                  <label className={styles.fieldLabel}>Best for</label>
                  <div className={styles.occ}>{OCCASIONS.map((o) => <OccasionChip key={o} selected={occ.includes(o)} onToggle={() => toggleOcc(o)}>{o}</OccasionChip>)}</div>
                  <Button variant="primary" full disabled={!line.trim() || occ.length === 0} onClick={commitVouch}>Put it on my map ↵</Button>
                </div>
              )}
              {!sel && (
                <div className={styles.addFootWrap}>
                  {mine.length > 0 && (
                    <div className={styles.added}>
                      <span className={styles.addedLabel}>On your map · {mine.length}</span>
                      <div className={styles.addedChips}>
                        {mine.map((v) => (
                          <button key={v.spot.name} type="button" className={styles.addedChip} onClick={() => removeVouch(v.spot.name)} aria-label={`Remove ${v.spot.name}`}>
                            {v.spot.name}<span aria-hidden="true">×</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={styles.addFoot}>
                    <span className={styles.dots} aria-hidden="true">
                      {[0, 1, 2].map((i) => <i key={i} className={i < mine.length ? styles.dotOn : styles.dotEmpty} />)}
                    </span>
                    <Button variant="primary" disabled={mine.length < GOAL} onClick={() => setPhase("reveal")}>
                      {mine.length < GOAL ? `Add ${GOAL - mine.length} more to continue` : "See my palate →"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {phase === "reveal" && (
            <div className={styles.revealPane}>
              <button type="button" className={styles.back} onClick={() => setPhase("add")}>← Add more places</button>
              <p className={styles.kicker}>Your map’s taking shape</p>
              <div className={styles.palateCard}>
                <span className={styles.palateGlyph} aria-hidden="true">{archetype.glyph}</span>
                <div className={styles.palateBrand}><Wordmark size={1} /><span className={styles.palateTag}>Palate Card</span></div>
                <span className={styles.palateBadge}>Your palate is</span>
                <h2 className={styles.palateName}>{archetype.name}</h2>
                <p className={styles.palateLine}>{archetype.line}</p>
                <div className={styles.palateStat}><span><b>{mine.length}</b> spots</span><span className={styles.dot}>·</span><span><b>{areas}</b> neighbourhood{areas > 1 ? "s" : ""}</span><span className={styles.dot}>·</span><span>vouched, not rated</span></div>
                <div className={styles.palateFoot}>vouch.app · Bengaluru</div>
              </div>
              <div className={styles.revealActions}>
                <Button variant="primary">↗ Share my palate</Button>
                <Button variant="ghost" onClick={() => setPhase("borrow")}>Keep going →</Button>
              </div>
            </div>
          )}

          {phase === "borrow" && (
            <div className={styles.borrowPane}>
              <button type="button" className={styles.back} onClick={() => setPhase("reveal")}>← Back</button>
              <h2 className={styles.title}>People whose taste matches yours.</h2>
              <p className={styles.borrowSub}>Follow a palate and their spots land on your map — that’s the whole point of Vouch.{borrowedSpots > 0 && <b> ＋{borrowedSpots} spots joined.</b>}</p>
              <div className={styles.palateList}>
                {FOUNDING.map((f) => {
                  const on = followed.includes(f.name);
                  return (
                    <div key={f.name} className={`${styles.palate} ${on ? styles.palateOn : ""}`}>
                      <Avatar initials={f.ini} size={40} />
                      <div className={styles.palateInfo}>
                        <span className={styles.palateRow}><span className={styles.palatePName}>{f.name}</span><span className={styles.match}>{matchPct(f)}% match</span></span>
                        <span className={styles.palateBlurb}>{f.blurb}</span>
                      </div>
                      <Button variant={on ? "ghost" : "primary"} onClick={() => toggleFollow(f.name)}>{on ? "Following ✓" : "Follow"}</Button>
                    </div>
                  );
                })}
              </div>
              <div className={styles.borrowFoot}>
                <Button variant="primary" disabled={followed.length === 0}>Enter Vouch →</Button>
                {followed.length === 0 && <span className={styles.hint}>Follow at least one to fill your map.</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
