"use client";
import { useState } from "react";
import { WebShell } from "./web-shell";
import { Button } from "./button";
import { MapReal, type MapPin } from "./map-real";
import { AddVouchModal } from "./add-vouch";
import { type Stamp } from "./_me";
import { useMyMap } from "./_map-context";
import { slugify } from "./_guides";
import { findSpot, placeTint, monogram, FOUNDING } from "./_taste";
import { cleanArea } from "./_catalog";
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
  const { entries, follows, ready } = useMyMap();
  const [focused, setFocused] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [lens, setLens] = useState<Lens>("all");
  const [occ, setOcc] = useState<string | null>(null);   // decision filter: "going out for…"
  const [locating, setLocating] = useState(false);

  const vouched = entries.filter((e) => e.stamp === "vouched");
  const counts = {
    all: entries.length,
    vouched: vouched.length,
    been: entries.filter((e) => e.stamp === "been").length,
    want: entries.filter((e) => e.stamp === "want").length,
  };
  const lead = readMap(counts.all);

  // entries → the occasions you actually have (from your vouch's occ + the place's own
  // occasions), ranked by how often they recur. These become the decision filter.
  const entryOcc = (e: (typeof entries)[number]) => [...(e.occ ?? []), ...(e.spot.occasions ?? [])];
  const occCounts: Record<string, number> = {};
  entries.forEach((e) => entryOcc(e).forEach((o) => { occCounts[o] = (occCounts[o] || 0) + 1; }));
  const myOccasions = Object.entries(occCounts).sort((a, b) => b[1] - a[1]).map(([o]) => o).slice(0, 4);

  const matchOcc = (e: (typeof entries)[number]) => !occ || entryOcc(e).includes(occ);
  const shown = entries.filter((e) => (lens === "all" || e.stamp === lens) && matchOcc(e));
  const minePins: MapPin[] = shown.map((e) => ({ id: `me:${e.spot.name}`, lat: e.spot.lat, lng: e.spot.lng, name: e.spot.name, line: e.line, occasion: e.occ?.[0], kind: "mine", stamp: e.stamp, gut: e.gut, by: { name: "You", ini: "RG" } }));
  // Following is REAL now: a palate you follow drops their vouched spots onto YOUR map.
  // Their spots carry no occasion data, so they step aside when you filter by occasion —
  // we won't pretend they fit a situation we can't check.
  const followedPalates = FOUNDING.filter((f) => follows.includes(f.name));
  const palatePins: MapPin[] = lens === "all" && !occ
    ? followedPalates.flatMap((f) => f.spots
        .filter((s) => !entries.some((e) => e.spot.name === s.name))
        .map((s) => ({ id: `${f.name}:${s.name}`, lat: s.lat, lng: s.lng, name: s.name, line: s.line, kind: "palate" as const, by: { name: f.name, ini: f.ini } })))
    : [];
  const pins: MapPin[] = [...minePins, ...palatePins];
  const empty = ready && entries.length === 0 && palatePins.length === 0;
  const focusedEntry = focused ? entries.find((e) => `me:${e.spot.name}` === focused) ?? null : null;
  // enrich the focused place with vibe / the-move / hero, looked up from the curated
  // set when the stored entry doesn't carry them (capture only keeps the basics).
  const card = focusedEntry ? (() => {
    const sp = focusedEntry.spot;
    const seed = findSpot(sp.name);
    return { e: focusedEntry, sp, vibe: sp.vibe ?? seed?.vibe, move: sp.move ?? seed?.move, cover: sp.cover ?? seed?.cover };
  })() : null;

  // "Pick one for me" / "Closest to you" decide from the places you'd actually go —
  // vouched first, else the ones you loved — honouring the active occasion filter.
  const decideBase = vouched.length ? vouched : entries.filter((e) => e.stamp === "been" && e.gut === "loved");
  const decidePool = decideBase.filter(matchOcc);
  function pickForMe() {
    if (!decidePool.length) return;
    setLens("all");
    const ids = decidePool.map((e) => `me:${e.spot.name}`);
    const others = ids.filter((id) => id !== focused);
    const list = others.length ? others : ids;
    setFocused(list[Math.floor(Math.random() * list.length)]);
  }
  function nearestToMe() {
    if (typeof navigator === "undefined" || !navigator.geolocation || !shown.length) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        const best = shown.reduce<{ e: (typeof shown)[number]; d: number } | null>((acc, e) => {
          const d = (e.spot.lat - latitude) ** 2 + (e.spot.lng - longitude) ** 2;
          return !acc || d < acc.d ? { e, d } : acc;
        }, null);
        if (best) setFocused(`me:${best.e.spot.name}`);
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }

  // the card reads as a recommendation to YOURSELF, in the voice of your own past call
  function recLine(e: (typeof entries)[number]): string {
    if (e.stamp === "been") return e.gut === "loved" ? "You loved it last time." : e.gut === "no" ? "Not your favourite — but it’s on your map." : "It was fine, last time.";
    return "On your radar — you’ve been meaning to go.";
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
          ) : occ ? (
            <>
              <h1 className={styles.state}><span className={styles.arch}>{shown.length}</span>{shown.length === 1 ? " spot" : " spots"} on your map for {occ}.</h1>
              <p className={styles.sub}>{decidePool.length
                ? `${decidePool.length} you’d put your name on. Can’t choose? Let me pick.`
                : "You’re still scouting these — none you’d vouch for yet."}</p>
            </>
          ) : (
            <>
              <h1 className={styles.state}><span className={styles.arch}>{lead.accent}</span>{lead.tail}.</h1>
              <p className={styles.sub}>{counts.vouched > 0
                ? "The glowing pins are the ones you’d put your name on. The rest you’re still weighing."
                : "Want and Been are your scouting list. Your name only lands when you vouch."}</p>
              {palatePins.length > 0 && (
                <p className={styles.palateNote}>+ {palatePins.length} {palatePins.length === 1 ? "spot" : "spots"} from {followedPalates.map((f) => f.name).join(" & ")}, on loan to your map</p>
              )}
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

          {!empty && myOccasions.length > 0 && (
            <div className={styles.occRow} role="group" aria-label="Filter by occasion">
              <span className={styles.occLabel}>Going out for</span>
              {myOccasions.map((o) => (
                <button key={o} type="button" aria-pressed={occ === o}
                  className={`${styles.occChip} ${occ === o ? styles.occOn : ""}`}
                  onClick={() => { setOcc(occ === o ? null : o); setFocused(null); }}>{o}</button>
              ))}
            </div>
          )}

          {!empty && !focused && (decidePool.length > 1 || shown.length > 1) && (
            <div className={styles.decideRow}>
              {decidePool.length > 1 && (
                <button type="button" className={styles.focusBtn} onClick={pickForMe}>Can’t decide? <b>Pick one for me →</b></button>
              )}
              {shown.length > 1 && (
                <button type="button" className={styles.focusBtn} onClick={nearestToMe} disabled={locating}>
                  {locating ? "Finding you…" : <b>Closest to you →</b>}
                </button>
              )}
            </div>
          )}
        </header>

        {card && (
          <div className={styles.placeCard} role="dialog" aria-label={card.sp.name}>
            <button type="button" className={styles.cardClose} onClick={() => setFocused(null)} aria-label="Back to map">✕</button>
            <div className={styles.cardHead}>
              <div className={styles.cardThumb} style={card.cover ? { backgroundImage: `url(${card.cover})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: placeTint(card.sp.cuisine) }}>
                {!card.cover && <span className={styles.cardThumbMono} aria-hidden="true">{monogram(card.sp.name)}</span>}
              </div>
              <div className={styles.cardHeadText}>
                <RelChip stamp={card.e.stamp} gut={card.e.gut} />
                <h2 className={styles.cardName}>{card.sp.name}</h2>
                <div className={styles.cardMeta}>{card.sp.cuisine} · {cleanArea(card.sp.area)} · {card.sp.price}</div>
              </div>
            </div>
            {card.e.stamp === "vouched" && card.e.line
              ? <p className={styles.cardTake}>“{card.e.line}”</p>
              : <p className={styles.cardRec}>{recLine(card.e)}</p>}
            {card.vibe && <p className={styles.cardVibe}>{card.vibe}</p>}
            <div className={styles.cardActions}>
              <a className={styles.cardReceipt} href={`/spot/${slugify(card.sp.name)}`}>see the full place →</a>
              {decidePool.length > 1 && <button type="button" className={styles.cardAnother} onClick={pickForMe}>↻ Pick another</button>}
            </div>
          </div>
        )}

        <div className={styles.addWrap}>
          <Button variant="primary" onClick={() => setAdding(true)}>{empty ? "Add your first place →" : "＋ Add a place"}</Button>
          <span className={styles.stamps}>Want to go · Been · <b>Vouched</b></span>
        </div>
      </div>

      <AddVouchModal open={adding} onClose={() => setAdding(false)} onCaptured={(r) => {
        // entries update reactively via the seam; clear all filters so the new pin
        // is always visible, then frame it.
        setLens("all"); setOcc(null); setFocused(`me:${r.spot.name}`);
      }} />
    </WebShell>
  );
}
