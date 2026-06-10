"use client";
import { useState } from "react";
import { WebShell } from "./web-shell";
import { Button } from "./button";
import { MapReal, type MapPin } from "./map-real";
import { AddVouchModal } from "./add-vouch";
import { useMyMap } from "./_map-context";
import { type Stamp } from "./_me";
import { slugify } from "./_guides";
import { findSpot, placeTint, monogram, FOUNDING } from "./_taste";
import { cleanArea } from "./_catalog";
import { RelChip } from "./rel-chip";
import styles from "./direction-a.module.css";

/* Home — "The Producer's Home". Your taste as a territory you build. Reads your
   REAL stamps, never demo data. The three registers live on one map: Vouched glows,
   Been sits quiet, Want is a ghost on your radar. The legend IS the filter — tap a
   count to narrow the map to that register (PRD §7.3); off-lens pins dim rather than
   vanish, so the map never jumps. Honest empty state for a cold user. */

type Lens = "all" | Stamp;

export function ProducersHome() {
  const { entries, follows, ready } = useMyMap();
  const [focused, setFocused] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [lens, setLens] = useState<Lens>("all");

  const vouched = entries.filter((e) => e.stamp === "vouched");
  const counts = {
    vouched: vouched.length,
    been: entries.filter((e) => e.stamp === "been").length,
    want: entries.filter((e) => e.stamp === "want").length,
  };
  // the headline narrates the active lens — always a plain, true fact about your map
  const n = lens === "all" ? entries.length : counts[lens];
  const lead = {
    accent: String(n),
    tail: lens === "vouched" ? (n === 1 ? " place carries your name" : " places carry your name")
      : lens === "been" ? (n === 1 ? " place you’ve been" : " places you’ve been")
      : lens === "want" ? (n === 1 ? " place you want to go" : " places you want to go")
      : (n === 1 ? " place on your map" : " places on your map"),
  };

  const minePins: MapPin[] = entries.map((e) => ({ id: `me:${e.spot.name}`, lat: e.spot.lat, lng: e.spot.lng, name: e.spot.name, line: e.line, occasion: e.occ?.[0], kind: "mine", stamp: e.stamp, gut: e.gut, cuisine: e.spot.cuisine, by: { name: "You", ini: "RG" } }));
  // A palate you follow drops their vouched spots onto your map — they show up as their
  // own monogram pins (tap to see who & why). Show it, don't narrate it.
  const followedPalates = FOUNDING.filter((f) => follows.includes(f.name));
  const palatePins: MapPin[] = followedPalates.flatMap((f) => f.spots
    .filter((s) => !entries.some((e) => e.spot.name === s.name))
    .map((s) => ({ id: `${f.name}:${s.name}`, lat: s.lat, lng: s.lng, name: s.name, line: s.line, kind: "palate" as const, by: { name: f.name, ini: f.ini } })));
  const pins: MapPin[] = [...minePins, ...palatePins];
  // the lens dims what's outside it (your pins of other stamps + palate pins, which
  // aren't yours to filter) instead of removing — the map stays still.
  const dimmedIds = lens === "all" ? [] : pins.filter((p) => p.kind === "palate" || p.stamp !== lens).map((p) => p.id);
  const empty = ready && entries.length === 0 && palatePins.length === 0;
  const focusedEntry = focused ? entries.find((e) => `me:${e.spot.name}` === focused) ?? null : null;
  // enrich the focused place with vibe / hero, looked up from the curated set when the
  // stored entry doesn't carry them (capture only keeps the basics).
  const card = focusedEntry ? (() => {
    const sp = focusedEntry.spot;
    const seed = findSpot(sp.name);
    return { e: focusedEntry, sp, vibe: sp.vibe ?? seed?.vibe, move: sp.move ?? seed?.move, cover: sp.cover ?? seed?.cover };
  })() : null;

  // The one decision aid Home needs: when you can't choose, pick from the places you'd
  // actually go — vouched first, else the ones you'd go back to, no question.
  const decidePool = vouched.length ? vouched : entries.filter((e) => e.stamp === "been" && e.gut === "absolutely");
  function pickForMe() {
    if (!decidePool.length) return;
    setLens("all"); // the pick must never land on a dimmed pin
    const ids = decidePool.map((e) => `me:${e.spot.name}`);
    const others = ids.filter((id) => id !== focused);
    const list = others.length ? others : ids;
    setFocused(list[Math.floor(Math.random() * list.length)]);
  }
  function toggleLens(l: Exclude<Lens, "all">) {
    setLens((cur) => (cur === l ? "all" : l));
    setFocused(null); // a stale card over a re-lensed map is a lie
  }

  // the card reads as a recommendation to YOURSELF, in the voice of your own past call
  function recLine(e: (typeof entries)[number]): string {
    if (e.stamp === "been") return e.gut === "absolutely" ? "You’d go back, no question." : e.gut === "no" ? "You wouldn’t go back — but it’s on your map." : "You were on the fence last time.";
    return "On your radar — you’ve been meaning to go.";
  }

  return (
    <WebShell active="map" onNewVouch={() => setAdding(true)} you={{ ini: "RG", name: "You", line: empty ? "Build your map" : `${entries.length} ${entries.length === 1 ? "place" : "places"} · Bengaluru` }}>
      <div className={styles.stage}>
        <div className={styles.mapLayer}><MapReal pins={pins} height="100%" labelMode="hover" bleed recede locate onPinTap={setFocused} spotlightId={focused} dimmedIds={dimmedIds} /></div>
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
              {/* the legend IS the filter — tap a register to narrow the map to it */}
              <div className={styles.legend} role="group" aria-label="Filter the map by register">
                <button type="button" className={`${styles.lgBtn} ${lens === "vouched" ? styles.lgOn : ""}`} disabled={!counts.vouched} aria-pressed={lens === "vouched"} onClick={() => toggleLens("vouched")}>
                  <i className={styles.lgVouched} />{counts.vouched} vouched
                </button>
                <button type="button" className={`${styles.lgBtn} ${lens === "been" ? styles.lgOn : ""}`} disabled={!counts.been} aria-pressed={lens === "been"} onClick={() => toggleLens("been")}>
                  <i className={styles.lgBeen} />{counts.been} been
                </button>
                <button type="button" className={`${styles.lgBtn} ${lens === "want" ? styles.lgOn : ""}`} disabled={!counts.want} aria-pressed={lens === "want"} onClick={() => toggleLens("want")}>
                  <i className={styles.lgWant} />{counts.want} want
                </button>
              </div>
            </>
          )}

          {!empty && !focused && decidePool.length > 1 && (
            <button type="button" className={styles.focusBtn} onClick={pickForMe}>Can’t decide? <b>Pick one for me →</b></button>
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
        // entries update reactively via the seam; clear the lens so the new pin is
        // never dimmed, then frame it.
        setLens("all"); setFocused(`me:${r.spot.name}`);
      }} />
    </WebShell>
  );
}
