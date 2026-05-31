"use client";
import { useMemo, useState } from "react";
import { WebShell } from "./web-shell";
import { ConceptSwitch } from "./concept-switch";
import { Avatar } from "./avatar";
import { Button } from "./button";
import { Tag } from "./chip";
import { FOUNDING, findSpot, archetypeFor, DEMO_SESSION } from "./_taste";
import styles from "./over-to-you.module.css";

/* DIRECTION 1 — "Over To You". The home is a HAND-OFF TO A PERSON, not a view of
   data. One trusted human is mid-sentence, place-in-hand; you re-roll by PERSON,
   not by place. Honesty rules honored: no synthetic %, only real counted overlap
   + a Receipt. Two phases shown so you feel the journey: PRODUCER (just joined —
   you narrate your own territory) and DECIDER (your cell is warm — a trusted human
   hands you the call). Prototype: overview, not a full flow. */

// Each palate's voiced hand-off (their voice, second person, place-in-hand).
const HANDOFF: Record<string, { occasion: string; pick: string; line: string }> = {
  Aditi: { occasion: "parents", pick: "Karavalli", line: "Folks in town? Karavalli. Take them — they’ll talk about it for months." },
  Rinkesh: { occasion: "late night", pick: "Empire", line: "It’s late and you’re starving. Empire — chicken ghee roast, don’t overthink it." },
  Meera: { occasion: "date", pick: "Soka", line: "Date tonight? Soka — negroni first, then stay for the plates." },
};

export function OverToYou() {
  const { mine } = DEMO_SESSION;
  const arch = archetypeFor(mine);
  const userOcc = useMemo(() => new Set(mine.flatMap((v) => v.spot.occasions.concat(v.occ))), [mine]);

  // Only palates whose taste actually overlaps yours may speak (honest, no fabrication).
  const speakers = useMemo(() =>
    FOUNDING
      .map((f) => ({ f, shared: f.occasions.filter((o) => userOcc.has(o)) }))
      .filter((s) => s.shared.length > 0)
      .sort((a, b) => b.shared.length - a.shared.length),
  [userOcc]);

  const [phase, setPhase] = useState<"producer" | "decider">("decider");
  const [who, setWho] = useState(0);

  const active = speakers[who] ?? speakers[0];
  const hand = HANDOFF[active.f.name];
  const pick = findSpot(hand.pick);

  return (
    <WebShell active="map" you={{ ini: "RG", name: "You", line: `${arch.glyph} ${arch.name}` }}>
      <ConceptSwitch current="Over To You" />

      <div className={styles.stage}>
        <div className={styles.phaseToggle} role="group" aria-label="Journey phase">
          <button type="button" className={phase === "producer" ? styles.phaseOn : styles.phase} onClick={() => setPhase("producer")}>Just joined</button>
          <button type="button" className={phase === "decider" ? styles.phaseOn : styles.phase} onClick={() => setPhase("decider")}>Your cell is warm</button>
          <span className={styles.phaseHint}>{phase === "producer" ? "PRODUCER · the network can’t answer yet — honest about it" : "DECIDER · a trusted human hands you the call"}</span>
        </div>

        <p className={styles.context}>Fri · 7:40 pm · Indiranagar</p>

        {phase === "decider" ? (
          <>
            <div className={styles.handoff} key={active.f.name}>
              <Avatar initials={active.f.ini} size={76} />
              <p className={styles.receipt}>
                <b>{active.f.name}</b> vouched · <span className={styles.overlap}>you both back {active.shared.slice(0, 3).join(", ")}</span>
              </p>
              <h1 className={styles.spoken}>{hand.line}</h1>

              <div className={styles.pick}>
                <span className={styles.pickName}>{pick?.name}</span>
                <span className={styles.pickTags}><Tag>{pick?.cuisine} · {pick?.area} · {pick?.price}</Tag></span>
                <span className={styles.pickWhy}>for {hand.occasion} · open till 11</span>
              </div>

              <div className={styles.actions}>
                <Button variant="primary">Take it →</Button>
                <button type="button" className={styles.askElse} onClick={() => setWho((w) => (w + 1) % speakers.length)}>Ask someone else ↻</button>
              </div>
            </div>

            <div className={styles.faces}>
              <span className={styles.facesLabel}>Or hear it from</span>
              <div className={styles.faceRow}>
                {speakers.map((s, i) => (
                  <button key={s.f.name} type="button" className={`${styles.face} ${i === who ? styles.faceOn : ""}`} onClick={() => setWho(i)}>
                    <Avatar initials={s.f.ini} size={40} />
                    <span className={styles.faceName}>{s.f.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className={styles.handoff}>
            <Avatar initials="RG" size={76} />
            <p className={styles.receipt}><span className={styles.overlap}>{arch.glyph} You’re becoming {arch.name}</span></p>
            <h1 className={styles.spoken}>You’ve put {mine.length} names down. Who’s your call for a late night?</h1>
            <div className={styles.actions}>
              <Button variant="primary">＋ Put a name down</Button>
            </div>
            <p className={styles.countdown}>2 more names and <b>Meera</b> can start handing you her date calls.</p>
          </div>
        )}
      </div>
    </WebShell>
  );
}
