"use client";
import { useState } from "react";
import { WebShell } from "./web-shell";
import { ConceptSwitch } from "./concept-switch";
import { Avatar } from "./avatar";
import { Button } from "./button";
import { Tag } from "./chip";
import { findSpot, archetypeFor, DEMO_SESSION } from "./_taste";
import styles from "./the-round.module.css";

/* DIRECTION 2 — "The Round". The home is a GROUP-CHAT ENDER: a shared, link-first
   decision object your people react to with TRUST VERBS (not anonymous likes),
   born to leave the app as the acquisition loop. Honesty: every pick carries a
   name + Receipt; reactions are trust-bearing, never hearts. Prototype: overview. */

type Pick = { spot: string; by: string; ini: string; line: string; reactions: { who: string; verb: string }[] };

const SEED_PICKS: Pick[] = [
  { spot: "Soka", by: "Meera", ini: "MK", line: "Negroni first, then stay for the plates.", reactions: [{ who: "Rohan", verb: "been — go" }] },
];
const CANDIDATES: Omit<Pick, "reactions">[] = [
  { spot: "Toit", by: "You", ini: "RG", line: "Tintin Toit + the patio. Get there early." },
  { spot: "Empire", by: "Rohan", ini: "RK", line: "Chicken ghee roast at 1am." },
];

export function TheRound() {
  const arch = archetypeFor(DEMO_SESSION.mine);
  const [picks, setPicks] = useState<Pick[]>(SEED_PICKS);
  const [sent, setSent] = useState(false);
  const [addIdx, setAddIdx] = useState(0);

  function react(i: number, verb: string) {
    setPicks((ps) => ps.map((p, idx) => idx === i && !p.reactions.some((r) => r.who === "You")
      ? { ...p, reactions: [...p.reactions, { who: "You", verb }] } : p));
  }
  function addPick() {
    const c = CANDIDATES[addIdx % CANDIDATES.length];
    setAddIdx((x) => x + 1);
    if (picks.some((p) => p.spot === c.spot)) return;
    setPicks((ps) => [...ps, { ...c, reactions: [] }]);
  }

  return (
    <WebShell active="map" you={{ ini: "RG", name: "You", line: `${arch.glyph} ${arch.name}` }}>
      <ConceptSwitch current="The Round" />

      <div className={styles.stage}>
        <div className={styles.card}>
          <div className={styles.head}>
            <span className={styles.kicker}>A round · you’re deciding for the group</span>
            <h1 className={styles.title}>Friday · the 4 of us · somewhere in Indiranagar</h1>
            <div className={styles.seats}>
              {["RG", "AS", "MK"].map((s) => <Avatar key={s} initials={s} size={28} />)}
              <span className={styles.seatEmpty}>+1</span>
              <span className={styles.seatsLabel}>{sent ? "sent · 3 can react" : "who’s coming"}</span>
            </div>
          </div>

          <div className={styles.picks}>
            {picks.map((p, i) => {
              const spot = findSpot(p.spot);
              return (
                <article key={p.spot} className={styles.pick}>
                  <div className={styles.pickTop}>
                    <span className={styles.pickName}>{p.spot}</span>
                    <span className={styles.pickTags}><Tag>{spot?.cuisine} · {spot?.area} · {spot?.price}</Tag></span>
                  </div>
                  <p className={styles.pickLine}>“{p.line}”</p>
                  <div className={styles.pickBy}><Avatar initials={p.ini} size={20} /> <b>{p.by}</b> {p.by === "You" ? "put a name on it" : "vouched it"}</div>

                  <div className={styles.reactions}>
                    {p.reactions.map((r, ri) => (
                      <span key={ri} className={styles.reaction}><b>{r.who}</b> · {r.verb}</span>
                    ))}
                  </div>
                  <div className={styles.verbs}>
                    <button type="button" className={styles.verb} onClick={() => react(i, "been — go")}>I’ve been — go</button>
                    <button type="button" className={styles.verb} onClick={() => react(i, "I’d put my name on it")}>I’d put my name on it</button>
                  </div>
                </article>
              );
            })}
            <button type="button" className={styles.addPick} onClick={addPick}>＋ Add a pick</button>
          </div>

          <div className={styles.foot}>
            {sent ? (
              <span className={styles.sentNote}>Sent to the group · reactions land here, no 40-message thread.</span>
            ) : (
              <Button variant="primary" onClick={() => setSent(true)}>Send this Round →</Button>
            )}
            <span className={styles.footMeta}>no stars · no strangers · every pick has a name</span>
          </div>
        </div>
      </div>
    </WebShell>
  );
}
