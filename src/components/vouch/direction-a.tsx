"use client";
import { useEffect, useState } from "react";
import { WebShell } from "./web-shell";
import { Button } from "./button";
import { MapReal, type MapPin } from "./map-real";
import { AddVouchModal } from "./add-vouch";
import { archetypeFor, type Vouch } from "./_taste";
import { loadMe } from "./_me";
import styles from "./direction-a.module.css";

/* Home — "The Producer's Home". Your taste as a territory you build. Reads your
   REAL vouches (from onboarding + adds), never demo data. The city recedes so only
   your trust glows; pins encode your relationship; a focus toggle narrows to one.
   Honest empty state for a cold user. */

export function ProducersHome() {
  const [vouches, setVouches] = useState<Vouch[]>([]);
  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { setVouches(loadMe().vouches); setReady(true); }, []);
  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(null), 3000); return () => window.clearTimeout(t); }, [toast]);

  const arch = archetypeFor(vouches);
  const areas = new Set(vouches.map((v) => v.spot.area)).size;
  const pins: MapPin[] = vouches.map((v) => ({ id: `me:${v.spot.name}`, lat: v.spot.lat, lng: v.spot.lng, name: v.spot.name, line: v.line, occasion: v.occ[0], kind: "mine", stamp: "vouched", by: { name: "You", ini: "RG" } }));
  const empty = ready && vouches.length === 0;

  return (
    <WebShell active="map" onNewVouch={() => setAdding(true)} you={{ ini: "RG", name: "You", line: vouches.length ? `${arch.glyph} ${arch.name}` : "Build your map" }}>
      <div className={styles.stage}>
        <div className={styles.mapLayer}><MapReal pins={pins} height="100%" labelMode="hover" bleed recede spotlightId={focused} /></div>
        <div className={styles.scrim} aria-hidden="true" />

        <header className={styles.header}>
          <span className={styles.eyebrow}>admit one</span>
          {empty ? (
            <>
              <h1 className={styles.state}>Your map’s empty. <span className={styles.arch}>Put your first name down.</span></h1>
              <p className={styles.sub}>Vouch for a place you’d send a friend to, no hesitation. It lands here, with your name on it.</p>
            </>
          ) : (
            <>
              <h1 className={styles.state}>{vouches.length} {vouches.length === 1 ? "spot" : "spots"}. You’re becoming <span className={styles.arch}>{arch.glyph} {arch.name}</span>.</h1>
              <p className={styles.sub}>{arch.line}</p>
              <div className={styles.legend}>
                <span><i className={styles.lgVouched} /> {vouches.length} vouched</span>
                <span className={styles.legendNote}>· {areas} {areas === 1 ? "area" : "areas"} · names, never numbers</span>
              </div>
              {pins.length > 1 && (
                <button type="button" className={styles.focusBtn} onClick={() => setFocused((f) => (f ? null : pins[0].id))}>
                  {focused ? "← Back to my whole map" : "◎ Focus tonight’s call"}
                </button>
              )}
            </>
          )}
        </header>

        <div className={styles.addWrap}>
          <Button variant="primary" onClick={() => setAdding(true)}>{empty ? "Put your first name down →" : "＋ Put a name down"}</Button>
          <span className={styles.stamps}>Want to go · Been · <b>Vouched</b></span>
        </div>
      </div>

      <AddVouchModal open={adding} onClose={() => setAdding(false)} onAdded={(v) => { setVouches(loadMe().vouches); setFocused(`me:${v.spot.name}`); setToast(`Your name’s on it. ${v.spot.name} is on your map.`); }} />
      {toast && <div className={styles.toastWrap}><span className={styles.toast}>{toast}</span></div>}
    </WebShell>
  );
}
