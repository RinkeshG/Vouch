"use client";
import { useState } from "react";
import { WebShell } from "./web-shell";
import { Button } from "./button";
import { MapReal, type MapPin } from "./map-real";
import { AddVouchModal } from "./add-vouch";
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

export function ProducersHome() {
  const { entries, follows, ready } = useMyMap();
  const [focused, setFocused] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const vouched = entries.filter((e) => e.stamp === "vouched");
  const counts = {
    vouched: vouched.length,
    been: entries.filter((e) => e.stamp === "been").length,
    want: entries.filter((e) => e.stamp === "want").length,
  };
  const lead = readMap(entries.length);

  const minePins: MapPin[] = entries.map((e) => ({ id: `me:${e.spot.name}`, lat: e.spot.lat, lng: e.spot.lng, name: e.spot.name, line: e.line, occasion: e.occ?.[0], kind: "mine", stamp: e.stamp, gut: e.gut, by: { name: "You", ini: "RG" } }));
  // A palate you follow drops their vouched spots onto your map — they show up as their
  // own monogram pins (tap to see who & why). Show it, don't narrate it.
  const followedPalates = FOUNDING.filter((f) => follows.includes(f.name));
  const palatePins: MapPin[] = followedPalates.flatMap((f) => f.spots
    .filter((s) => !entries.some((e) => e.spot.name === s.name))
    .map((s) => ({ id: `${f.name}:${s.name}`, lat: s.lat, lng: s.lng, name: s.name, line: s.line, kind: "palate" as const, by: { name: f.name, ini: f.ini } })));
  const pins: MapPin[] = [...minePins, ...palatePins];
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
  // actually go — vouched first, else the ones you loved. Browsing/filtering lives on /you.
  const decidePool = vouched.length ? vouched : entries.filter((e) => e.stamp === "been" && e.gut === "absolutely");
  function pickForMe() {
    if (!decidePool.length) return;
    const ids = decidePool.map((e) => `me:${e.spot.name}`);
    const others = ids.filter((id) => id !== focused);
    const list = others.length ? others : ids;
    setFocused(list[Math.floor(Math.random() * list.length)]);
  }

  // the card reads as a recommendation to YOURSELF, in the voice of your own past call
  function recLine(e: (typeof entries)[number]): string {
    if (e.stamp === "been") return e.gut === "absolutely" ? "You’d go back, no question." : e.gut === "no" ? "You wouldn’t go back — but it’s on your map." : "You were on the fence last time.";
    return "On your radar — you’ve been meaning to go.";
  }

  return (
    <WebShell active="map" onNewVouch={() => setAdding(true)} you={{ ini: "RG", name: "You", line: empty ? "Build your map" : `${entries.length} ${entries.length === 1 ? "place" : "places"} · Bengaluru` }}>
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
              <div className={styles.legend} aria-label="What the pins mean">
                <span><i className={styles.lgVouched} />{counts.vouched} vouched</span>
                <span><i className={styles.lgBeen} />{counts.been} been</span>
                <span><i className={styles.lgWant} />{counts.want} want</span>
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
        // entries update reactively via the seam; just frame the new pin.
        setFocused(`me:${r.spot.name}`);
      }} />
    </WebShell>
  );
}
