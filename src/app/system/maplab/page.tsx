"use client";
import { useState } from "react";
import { LAB_SPOTS } from "../../../components/vouch/_maplab";
import { MapReal, type MapPin } from "../../../components/vouch/map-real";
import { Button } from "../../../components/vouch/button";
import s from "./maplab.module.css";

export default function MapLab() {
  const [n, setN] = useState(0);
  const pins: MapPin[] = LAB_SPOTS.slice(0, n).map((p, i) => ({
    id: p.name, lat: p.lat, lng: p.lng, name: p.name, line: p.line,
    occasion: p.occasions[0],
    kind: i % 3 === 2 ? "palate" : "mine",
    by: i % 3 === 2 ? { name: "Aditi", ini: "AS" } : undefined,
  }));
  return (
    <main className={s.page}>
      <header className={s.head}>
        <div>
          <p className={s.kicker}>Map sandbox · the real Vouch map</p>
          <h1 className={s.title}>Add vouches. Tap a pin to see who &amp; why.</h1>
        </div>
        <div className={s.controls}>
          <Button variant="primary" disabled={n >= LAB_SPOTS.length} onClick={() => setN((v) => Math.min(LAB_SPOTS.length, v + 1))}>＋ Add a place ({n}/{LAB_SPOTS.length})</Button>
          <Button variant="ghost" onClick={() => setN(0)}>Reset</Button>
        </div>
      </header>
      <MapReal pins={pins} height={560} />
    </main>
  );
}
