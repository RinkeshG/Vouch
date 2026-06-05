"use client";
import { useEffect, useState } from "react";
import { WebShell } from "./web-shell";
import { Button } from "./button";
import { MapReal, type MapPin } from "./map-real";
import { AddVouchModal } from "./add-vouch";
import { archetypeFor } from "./_taste";
import { loadMe, type Entry, type Stamp } from "./_me";
import styles from "./direction-a.module.css";

/* Home — "The Producer's Home". Your taste as a territory you build. Reads your
   REAL stamps (from onboarding + adds), never demo data. The whole ladder lives on
   one map: Vouched glows, Been sits quiet, Want is a ghost on your radar. A lens
   narrows to one stamp; identity (the archetype) is built from VOUCHED only —
   want/been are scouting, not your name. Honest empty state for a cold user. */

type Lens = "all" | Stamp;

export function ProducersHome() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lens, setLens] = useState<Lens>("all");

  useEffect(() => { setEntries(loadMe().entries); setReady(true); }, []);
  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(null), 3000); return () => window.clearTimeout(t); }, [toast]);

  const vouched = entries.filter((e) => e.stamp === "vouched");
  const arch = archetypeFor(vouched.map((e) => ({ spot: e.spot, line: e.line ?? "", occ: e.occ ?? [] })));
  const counts = {
    all: entries.length,
    vouched: vouched.length,
    been: entries.filter((e) => e.stamp === "been").length,
    want: entries.filter((e) => e.stamp === "want").length,
  };

  const shown = lens === "all" ? entries : entries.filter((e) => e.stamp === lens);
  const pins: MapPin[] = shown.map((e) => ({ id: `me:${e.spot.name}`, lat: e.spot.lat, lng: e.spot.lng, name: e.spot.name, line: e.line, occasion: e.occ?.[0], kind: "mine", stamp: e.stamp, by: { name: "You", ini: "RG" } }));
  const empty = ready && entries.length === 0;
  const hasVouched = vouched.length > 0;

  const LENSES: { key: Lens; label: string; dot?: string }[] = [
    { key: "all", label: "All" },
    { key: "vouched", label: "Vouched", dot: styles.lgVouched },
    { key: "been", label: "Been", dot: styles.lgBeen },
    { key: "want", label: "Want to go", dot: styles.lgWant },
  ];

  return (
    <WebShell active="map" onNewVouch={() => setAdding(true)} you={{ ini: "RG", name: "You", line: hasVouched ? `${arch.glyph} ${arch.name}` : "Build your map" }}>
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
          ) : hasVouched ? (
            <>
              <h1 className={styles.state}>{vouched.length} {vouched.length === 1 ? "spot" : "spots"} vouched. You’re becoming <span className={styles.arch}>{arch.glyph} {arch.name}</span>.</h1>
              <p className={styles.sub}>{arch.line}</p>
            </>
          ) : (
            <>
              <h1 className={styles.state}>Your radar’s taking shape. <span className={styles.arch}>Vouch one to claim your palate.</span></h1>
              <p className={styles.sub}>Want-to-go and Been are your scouting list. Your name only lands on a place when you vouch it.</p>
            </>
          )}

          {!empty && (
            <div className={styles.lens} role="tablist" aria-label="Filter your map by stamp">
              {LENSES.map((l) => (
                <button key={l.key} type="button" role="tab" aria-selected={lens === l.key}
                  className={`${styles.lensChip} ${lens === l.key ? styles.lensOn : ""}`}
                  onClick={() => { setLens(l.key); setFocused(null); }}>
                  {l.dot && <i className={l.dot} />}{l.label} <b>{counts[l.key]}</b>
                </button>
              ))}
            </div>
          )}

          {!empty && pins.length > 1 && (
            <button type="button" className={styles.focusBtn} onClick={() => setFocused((f) => (f ? null : pins[0].id))}>
              {focused ? "← Back to my whole map" : "◎ Focus one spot"}
            </button>
          )}
        </header>

        <div className={styles.addWrap}>
          <Button variant="primary" onClick={() => setAdding(true)}>{empty ? "Put your first name down →" : "＋ Put a name down"}</Button>
          <span className={styles.stamps}>Want to go · Been · <b>Vouched</b></span>
        </div>
      </div>

      <AddVouchModal open={adding} onClose={() => setAdding(false)} onAdded={(v) => { setEntries(loadMe().entries); setLens("all"); setFocused(`me:${v.spot.name}`); setToast(`Your name’s on it. ${v.spot.name} is on your map.`); }} />
      {toast && <div className={styles.toastWrap}><span className={styles.toast}>{toast}</span></div>}
    </WebShell>
  );
}
