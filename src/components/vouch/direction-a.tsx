"use client";
import { WebShell } from "./web-shell";
import { ConceptSwitch } from "./concept-switch";
import { Button } from "./button";
import { MapReal } from "./map-real";
import { archetypeFor, DEMO_SESSION } from "./_taste";
import styles from "./direction-a.module.css";

/* v1 roundtable — DIRECTION A: "The Producer's Home". Your taste rendered as a
   TERRITORY you are visibly building; the dominant object is your dark, mostly-
   empty Bengaluru with your saffron pins, titled by the archetype your own
   vouches earned. The weighty gesture (put a name down) is the act that fills it.
   Honesty: names not numbers; no synthetic %. Prototype: overview. */

export function ProducersHome() {
  const { mine } = DEMO_SESSION;
  const arch = archetypeFor(mine);
  const areas = new Set(mine.map((v) => v.spot.area)).size;
  const pins = mine.map((v) => ({ id: `me:${v.spot.name}`, lat: v.spot.lat, lng: v.spot.lng, name: v.spot.name, line: v.line, occasion: v.occ[0], kind: "mine" as const, by: { name: "You", ini: "RG" } }));

  return (
    <WebShell active="map" you={{ ini: "RG", name: "You", line: `${arch.glyph} ${arch.name}` }}>
      <ConceptSwitch current="Producer's Home" />
      <div className={styles.stage}>
        <div className={styles.mapLayer}><MapReal pins={pins} height="100%" labelMode="hover" bleed /></div>
        <div className={styles.scrim} aria-hidden="true" />

        <header className={styles.header}>
          <span className={styles.eyebrow}>admit one</span>
          <h1 className={styles.state}>{mine.length} spots. You’re becoming <span className={styles.arch}>{arch.glyph} {arch.name}</span>.</h1>
          <p className={styles.sub}>{arch.line}</p>
          <p className={styles.meta}>{mine.length} vouched · {areas} {areas === 1 ? "area" : "areas"} · names, never numbers</p>
        </header>

        <div className={styles.addWrap}>
          <Button variant="primary">＋ Put a name down</Button>
          <span className={styles.stamps}>Want to go · Been · <b>Vouched</b></span>
        </div>
      </div>
    </WebShell>
  );
}
