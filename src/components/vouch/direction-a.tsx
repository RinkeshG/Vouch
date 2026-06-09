"use client";
import { useEffect, useState } from "react";
import { WebShell } from "./web-shell";
import { Button } from "./button";
import { MapReal, type MapPin } from "./map-real";
import { AddVouchModal } from "./add-vouch";
import { loadMe, type Entry, type Stamp } from "./_me";
import { slugify } from "./_guides";
import { findSpot, placeTint, monogram } from "./_taste";
import { RelChip } from "./rel-chip";
import styles from "./direction-a.module.css";

/* The home headline is a plain, true fact about your map — not a clever observation
   in language no one actually uses. The number's the hero; the rest is quiet. */
function readMap(total: number): { accent: string; tail: string } {
  return { accent: String(total), tail: total === 1 ? " place on your map" : " places on your map" };
}

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
  const [lens, setLens] = useState<Lens>("all");

  useEffect(() => { setEntries(loadMe().entries); setReady(true); }, []);

  const vouched = entries.filter((e) => e.stamp === "vouched");
  const counts = {
    all: entries.length,
    vouched: vouched.length,
    been: entries.filter((e) => e.stamp === "been").length,
    want: entries.filter((e) => e.stamp === "want").length,
  };
  const lead = readMap(counts.all);

  const shown = lens === "all" ? entries : entries.filter((e) => e.stamp === lens);
  const pins: MapPin[] = shown.map((e) => ({ id: `me:${e.spot.name}`, lat: e.spot.lat, lng: e.spot.lng, name: e.spot.name, line: e.line, occasion: e.occ?.[0], kind: "mine", stamp: e.stamp, gut: e.gut, by: { name: "You", ini: "RG" } }));
  const empty = ready && entries.length === 0;
  const focusedEntry = focused ? entries.find((e) => `me:${e.spot.name}` === focused) ?? null : null;
  // enrich the focused place with vibe / the-move / hero, looked up from the curated
  // set when the stored entry doesn't carry them (capture only keeps the basics).
  const card = focusedEntry ? (() => {
    const sp = focusedEntry.spot;
    const seed = findSpot(sp.name);
    return { e: focusedEntry, sp, vibe: sp.vibe ?? seed?.vibe, move: sp.move ?? seed?.move, cover: sp.cover ?? seed?.cover };
  })() : null;

  // "Pick one for me" decides from the places you'd actually go — vouched first,
  // else the ones you loved. A real decision aid, never an arbitrary zoom.
  const decidePool = vouched.length ? vouched : entries.filter((e) => e.stamp === "been" && e.gut === "loved");
  function pickForMe() {
    if (!decidePool.length) return;
    setLens("all");
    const ids = decidePool.map((e) => `me:${e.spot.name}`);
    const others = ids.filter((id) => id !== focused);
    const list = others.length ? others : ids;
    setFocused(list[Math.floor(Math.random() * list.length)]);
  }

  const LENSES: { key: Lens; label: string; dot?: string }[] = [
    { key: "all", label: "All" },
    { key: "vouched", label: "Vouched", dot: styles.lgVouched },
    { key: "been", label: "Been", dot: styles.lgBeen },
    { key: "want", label: "Want to go", dot: styles.lgWant },
  ];

  return (
    <WebShell active="map" onNewVouch={() => setAdding(true)} you={{ ini: "RG", name: "You", line: empty ? "Build your map" : `${counts.all} ${counts.all === 1 ? "place" : "places"} · Bengaluru` }}>
      <div className={styles.stage}>
        <div className={styles.mapLayer}><MapReal pins={pins} height="100%" labelMode="hover" bleed recede locate onPinTap={setFocused} spotlightId={focused} /></div>
        <div className={styles.scrim} aria-hidden="true" />

        <header className={styles.header}>
          {empty ? (
            <>
              <h1 className={styles.state}>Your map’s empty. <span className={styles.arch}>Drop your first place.</span></h1>
              <p className={styles.sub}>Search any spot and mark it — want to go, been, or put your name on it.</p>
            </>
          ) : (
            <>
              <h1 className={styles.state}><span className={styles.arch}>{lead.accent}</span>{lead.tail}.</h1>
              <p className={styles.sub}>{counts.vouched > 0
                ? "The glowing pins are the ones you’d put your name on. The rest you’re still weighing."
                : "Want and Been are your scouting list. Your name only lands when you vouch."}</p>
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

          {!empty && !focused && decidePool.length > 1 && (
            <button type="button" className={styles.focusBtn} onClick={pickForMe}>Can’t decide? <b>Pick one for me →</b></button>
          )}
        </header>

        {card && (
          <div className={styles.placeCard} role="dialog" aria-label={card.sp.name}>
            <div className={styles.cardHero} style={card.cover ? { backgroundImage: `url(${card.cover})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: placeTint(card.sp.cuisine) }}>
              {!card.cover && <span className={styles.cardMono} aria-hidden="true">{monogram(card.sp.name)}</span>}
              <button type="button" className={styles.cardClose} onClick={() => setFocused(null)} aria-label="Back to map">✕</button>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardChip}><RelChip stamp={card.e.stamp} gut={card.e.gut} /></div>
              <h2 className={styles.cardName}>{card.sp.name}</h2>
              {card.vibe && <p className={styles.cardVibe}>{card.vibe}</p>}
              <div className={styles.cardMeta}>{card.sp.cuisine} · {card.sp.area} · {card.sp.price}</div>
              {card.e.stamp === "vouched" && card.e.line && <p className={styles.cardTake}>“{card.e.line}”</p>}
              <div className={styles.cardActions}>
                <a className={styles.cardReceipt} href={`/spot/${slugify(card.sp.name)}`}>see the full place →</a>
                {decidePool.length > 1 && <button type="button" className={styles.cardAnother} onClick={pickForMe}>↻ Pick another</button>}
              </div>
            </div>
          </div>
        )}

        <div className={styles.addWrap}>
          <Button variant="primary" onClick={() => setAdding(true)}>{empty ? "Add your first place →" : "＋ Add a place"}</Button>
          <span className={styles.stamps}>Want to go · Been · <b>Vouched</b></span>
        </div>
      </div>

      <AddVouchModal open={adding} onClose={() => setAdding(false)} onCaptured={(r) => {
        // the place-card sliding up IS the confirmation (no toast needed)
        setEntries(loadMe().entries); setLens("all"); setFocused(`me:${r.spot.name}`);
      }} />
    </WebShell>
  );
}
