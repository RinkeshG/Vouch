"use client";
import { useMemo, useState } from "react";
import { WebShell } from "./web-shell";
import { HomeSwitch } from "./home-switch";
import { Avatar } from "./avatar";
import { Button } from "./button";
import { MapReal } from "./map-real";
import { FOUNDING, findSpot, archetypeFor, sharedOccasions, occasionsOf, DEMO_SESSION } from "./_taste";
import styles from "./home-tonight.module.css";

/* HOME · concept A — "Tonight". The home answers Vouch's one question: where do I
   eat, right now? It leads with a SINGLE confident, trust-backed answer for your
   moment — a name, not a star — and makes the receipt (who vouched) the proof.
   The occasion is the control; alternates and the rest are quiet and subordinate.
   One focal point; everything else whispers. */

const MOMENTS = ["anything", "late night", "date", "parents", "coffee", "group dinner"];

type Answer = { id: string; name: string; line: string; by: { name: string; ini: string }; match: string; meta: string; occasions: string[]; lat: number; lng: number };

export function HomeTonight() {
  const { mine, followed } = DEMO_SESSION;
  const [moment, setMoment] = useState("anything");
  const [idx, setIdx] = useState(0);

  const candidates: Answer[] = useMemo(() => {
    return FOUNDING.filter((f) => followed.includes(f.name)).flatMap((f) =>
      f.spots.map((sp) => {
        const s = findSpot(sp.name);
        return {
          id: `${f.name}:${sp.name}`, name: sp.name, line: sp.line,
          by: { name: f.name, ini: f.ini }, match: sharedOccasions(f, mine).slice(0, 2).join(", ") || f.occasions[0],
          meta: [s?.cuisine, s?.area, s?.price].filter(Boolean).join(" · "),
          occasions: occasionsOf(sp.name), lat: sp.lat, lng: sp.lng,
        };
      }),
    );
  }, [followed, mine]);

  const pool = moment === "anything" ? candidates : candidates.filter((c) => c.occasions.includes(moment));
  const list = pool.length ? pool : candidates;
  const hero = list[idx % list.length];
  const alts = list.filter((c) => c.id !== hero.id).slice(0, 3);

  function pick(m: string) { setMoment(m); setIdx(0); }
  function next() { setIdx((i) => i + 1); }

  return (
    <WebShell active="map" you={{ ini: "RG", name: "You", line: `${archetypeFor(mine).glyph} ${archetypeFor(mine).name}` }}>
      <HomeSwitch current="Tonight" />
      <div className={styles.page}>
        <div className={styles.col}>
          <p className={styles.context}>Fri · 7:40 pm · Indiranagar</p>
          <h1 className={styles.ask}>Where to tonight?</h1>

          <div className={styles.moments} role="group" aria-label="Pick your moment">
            {MOMENTS.map((m) => (
              <button key={m} type="button" className={m === moment ? styles.momentOn : styles.moment} onClick={() => pick(m)}>{m}</button>
            ))}
          </div>

          <article className={styles.answer} key={hero.id}>
            <div className={styles.answerText}>
              <span className={styles.receipt}>
                <Avatar initials={hero.by.ini} size={22} />
                Vouched by {hero.by.name} · you both back {hero.match}
              </span>
              <h2 className={styles.place}>{hero.name}</h2>
              <p className={styles.line}>“{hero.line}”</p>
              <p className={styles.meta}>{hero.meta} · open till 11</p>
              <div className={styles.actions}>
                <Button variant="primary">Take me there →</Button>
                <button type="button" className={styles.next} onClick={next}>Seen it — show another ↻</button>
              </div>
            </div>
            <div className={styles.answerMap}>
              <MapReal pins={[{ id: hero.id, lat: hero.lat, lng: hero.lng, name: hero.name, line: hero.line, kind: "palate", by: hero.by }]} height="100%" focusId={hero.id} bleed />
            </div>
          </article>

          {alts.length > 0 && (
            <section className={styles.alts}>
              <span className={styles.altLabel}>Or, also {moment === "anything" ? "worth it" : `for ${moment}`}</span>
              <div className={styles.altRow}>
                {alts.map((a) => (
                  <button key={a.id} type="button" className={styles.alt} onClick={() => setIdx(list.findIndex((c) => c.id === a.id))}>
                    <span className={styles.altName}>{a.name}</span>
                    <span className={styles.altBy}>{a.by.name} vouched</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className={styles.foot}>
            <a className={styles.footLink} href="/pulse">Just landed from people you follow →</a>
            <a className={styles.footLink} href="/map">Your map · {mine.length} spots →</a>
          </div>
        </div>
      </div>
    </WebShell>
  );
}
