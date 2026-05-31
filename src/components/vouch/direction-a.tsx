"use client";
import { useState } from "react";
import { WebShell } from "./web-shell";
import { Button } from "./button";
import { MapReal, type MapPin } from "./map-real";
import { archetypeFor, findSpot, DEMO_SESSION } from "./_taste";
import styles from "./direction-a.module.css";

/* v1 roundtable — DIRECTION A: "The Producer's Home", now showing the Tier-1 map
   direction: the city RECEDES so only trust glows; pins encode your RELATIONSHIP
   (Vouched glows · Been quiet · Want-to-go ghost); a FOCUS toggle spotlights one
   pin (the decision-moment narrowing). Honesty: names not numbers, no synthetic %.
   Prototype: design-direction only. */

// Stamp variety so the pin encoding is legible (real flow derives this per vouch).
const STAMPS: Record<string, MapPin["stamp"]> = { Empire: "vouched", "Corner House": "vouched", Toit: "been", Soka: "want" };

export function ProducersHome() {
  const { mine } = DEMO_SESSION;
  const arch = archetypeFor(mine);
  const areas = new Set(mine.map((v) => v.spot.area)).size;
  const [focused, setFocused] = useState<string | null>(null);

  // a couple extra spots so all three stamp states show
  const extra = ["Soka"].map((n) => findSpot(n)!).filter(Boolean);
  const pins: MapPin[] = [
    ...mine.map((v) => ({ id: `me:${v.spot.name}`, lat: v.spot.lat, lng: v.spot.lng, name: v.spot.name, line: v.line, occasion: v.occ[0], kind: "mine" as const, stamp: STAMPS[v.spot.name] ?? "vouched", by: { name: "You", ini: "RG" } })),
    ...extra.map((s) => ({ id: `me:${s.name}`, lat: s.lat, lng: s.lng, name: s.name, occasion: s.occasions[0], kind: "mine" as const, stamp: STAMPS[s.name] ?? "want", by: { name: "You", ini: "RG" } })),
  ];
  const vouched = pins.filter((p) => p.stamp === "vouched").length;

  return (
    <WebShell active="map" you={{ ini: "RG", name: "You", line: `${arch.glyph} ${arch.name}` }}>
      <div className={styles.stage}>
        <div className={styles.mapLayer}>
          <MapReal pins={pins} height="100%" labelMode="hover" bleed recede spotlightId={focused} />
        </div>
        <div className={styles.scrim} aria-hidden="true" />

        <header className={styles.header}>
          <span className={styles.eyebrow}>admit one</span>
          <h1 className={styles.state}>{pins.length} spots. You’re becoming <span className={styles.arch}>{arch.glyph} {arch.name}</span>.</h1>
          <p className={styles.sub}>{arch.line}</p>
          <div className={styles.legend}>
            <span><i className={styles.lgVouched} /> {vouched} vouched</span>
            <span><i className={styles.lgBeen} /> been</span>
            <span><i className={styles.lgWant} /> want to go</span>
            <span className={styles.legendNote}>· names, never numbers</span>
          </div>
          <button type="button" className={styles.focusBtn} onClick={() => setFocused((f) => (f ? null : "me:Empire"))}>
            {focused ? "← Back to my whole map" : "◎ Focus tonight’s call"}
          </button>
        </header>

        <div className={styles.addWrap}>
          <Button variant="primary">＋ Put a name down</Button>
          <span className={styles.stamps}>Want to go · Been · <b>Vouched</b></span>
        </div>
      </div>
    </WebShell>
  );
}
