"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark } from "./wordmark";
import { Avatar } from "./avatar";
import { Button } from "./button";
import { OccasionChip, Tag } from "./chip";
import { SearchField } from "./input";
import { MapReal, type MapPin } from "./map-real";
import { SEED, OCCASIONS, FOUNDING, archetypeFor, type Spot, type Vouch } from "./_taste";
import { saveMe } from "./_me";
import styles from "./onboarding.module.css";

/* J1 — first run (web). The map is the persistent companion on the left; it fills
   as you vouch. The right pane guides you: build → reveal your palate → follow
   people who match your taste. Composed bespoke from the kit; the taste data and
   the archetype/match rules are shared with Home (./_taste). Mobile is designed
   separately, later. */

type Phase = "add" | "reveal" | "borrow";

export function Onboarding() {
  const router = useRouter();
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

  const archetype = useMemo(() => archetypeFor(mine), [mine]);
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
  const myOcc = useMemo(() => new Set(mine.flatMap((v) => v.spot.occasions.concat(v.occ))), [mine]);
  function enterVouch() {
    saveMe({ vouches: mine, follows: followed });
    router.push("/producers-home");
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
          <MapReal pins={pins} height={560} recede labelMode="hover" />
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
                  const shared = f.occasions.filter((o) => myOcc.has(o));
                  const reason = shared.length ? `you both back ${shared.slice(0, 2).join(", ")}` : `covers your ${f.occasions[0]}`;
                  return (
                    <div key={f.name} className={`${styles.palate} ${on ? styles.palateOn : ""}`}>
                      <Avatar initials={f.ini} size={40} />
                      <div className={styles.palateInfo}>
                        <span className={styles.palateRow}><span className={styles.palatePName}>{f.name}</span><span className={styles.match}>{reason}</span></span>
                        <span className={styles.palateBlurb}>{f.blurb}</span>
                      </div>
                      <Button variant={on ? "ghost" : "primary"} onClick={() => toggleFollow(f.name)}>{on ? "Following ✓" : "Follow"}</Button>
                    </div>
                  );
                })}
              </div>
              <div className={styles.borrowFoot}>
                <Button variant="primary" disabled={followed.length === 0} onClick={enterVouch}>Enter Vouch →</Button>
                {followed.length === 0 && <span className={styles.hint}>Follow at least one to fill your map.</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
