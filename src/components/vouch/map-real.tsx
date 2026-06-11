"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { slugify } from "./_guides";
import { cuisineGlyph } from "./_taste";
import styles from "./map-real.module.css";

/* The Vouch map — a REAL dark Bengaluru (Leaflet + Carto dark raster tiles, no
   key, no worker), locked to the city. Core principle: a pin is not a place,
   it's a VOUCH FROM A PERSON. Pins carry identity (yours vs a palate's monogram);
   tap one to see who vouched & why. Markers are DIFFED (added/removed) so typing
   elsewhere never re-renders or blinks the pins. */

/* One basemap, always: the warm-dark night map. Vouch lives After Dark (brand) —
   a day/light basemap washed the saffron pins out and broke the city's amber-at-
   dusk look, so the surface is dark everywhere, day or night. Carto's labelled dark
   tiles + a warming CSS filter (see .themeDark) read as the city at night. */
const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
// the city we cover — location outside it is never framed (we don't pretend to know)
const inBLR = (lat: number, lng: number) => lat >= 12.8 && lat <= 13.16 && lng >= 77.44 && lng <= 77.8;

export type MapPin = {
  id: string; lat: number; lng: number; name: string;
  line?: string; occasion?: string;
  kind?: "mine" | "palate"; by?: { name: string; ini: string };
  stamp?: "want" | "been" | "vouched";
  gut?: "absolutely" | "maybe" | "no";   // tints the "been" mark by your "Go back?" answer
  cuisine?: string;                       // keys the tiny in-pin glyph (what the place IS)
};

export function MapReal({ pins = [], height = 460, labelMode = "always", focusId, bleed = false, recede = false, spotlightId, dimmedIds = [], locate = false, onPinTap, onLocated, declutter = false, interactive = true, tag = "Your map · Bengaluru" }: { pins?: MapPin[]; height?: number | string; labelMode?: "always" | "hover"; focusId?: string | null; bleed?: boolean; recede?: boolean; spotlightId?: string | null; dimmedIds?: string[]; locate?: boolean; onPinTap?: (id: string) => void; onLocated?: (lat: number, lng: number) => void; declutter?: boolean; interactive?: boolean; tag?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tiles = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const L = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markers = useRef<Record<string, any>>({});
  // "you are here" — set only after the user grants location (never a guess)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const youMarker = useRef<any>(null);
  const youPos = useRef<{ lat: number; lng: number } | null>(null);
  // the spotlight we were on last pass — so when a card closes (spotlight clears),
  // we know to animate the camera back to the overview instead of sitting zoomed-in.
  const prevSpot = useRef<string | null | undefined>(null);
  // When the host wants to own the reveal (a designed place-card, not a Leaflet
  // popup), a tap reports the id up instead of opening the built-in popup.
  const onTap = useRef(onPinTap);
  onTap.current = onPinTap;
  const onLoc = useRef(onLocated);
  onLoc.current = onLocated;
  const declutterRef = useRef(declutter);
  declutterRef.current = declutter;
  // always hold the latest pins so sync() is never stale — the map can finish
  // initializing AFTER the parent's data lands (or vice versa); either order works.
  const pinsRef = useRef<MapPin[]>(pins);
  pinsRef.current = pins;

  /* DECLUTTER (PRD §11 readability) — same-neighbourhood pins overlap into an
     unreadable clump at city zoom. Each settle, recompute from the pins' TRUE screen
     positions (never compounding) and push overlapping ones apart just enough to read,
     then reposition the marker. Anchors stay near true; the alternative is a smudge. */
  function spreadPins() {
    const m = map.current;
    if (!declutterRef.current || !m || !L.current) return;
    const ps = pinsRef.current;
    if (ps.length < 2) return;
    const TH = 40; // min centre-to-centre px between pins
    const it = ps.map((p) => { const pt = m.latLngToContainerPoint([p.lat, p.lng]); return { p, x: pt.x, y: pt.y }; });
    for (let r = 0; r < 8; r++) {
      let moved = false;
      for (let i = 0; i < it.length; i++) for (let j = i + 1; j < it.length; j++) {
        const a = it[i], b = it[j];
        let dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
        if (d < TH) {
          if (d < 0.5) { dx = Math.cos(i * 2.4); dy = Math.sin(i * 2.4); d = 1; }
          const push = (TH - d) / 2, ux = dx / d, uy = dy / d;
          a.x -= ux * push; a.y -= uy * push; b.x += ux * push; b.y += uy * push; moved = true;
        }
      }
      if (!moved) break;
    }
    it.forEach((o) => {
      const mk = markers.current[o.p.id]; if (!mk) return;
      const tp = m.latLngToContainerPoint([o.p.lat, o.p.lng]);
      const ll = Math.abs(o.x - tp.x) < 0.5 && Math.abs(o.y - tp.y) < 0.5 ? [o.p.lat, o.p.lng] : m.containerPointToLatLng([o.x, o.y]);
      mk.setLatLng(ll);
    });
  }

  function popupHTML(p: MapPin) {
    const who = p.kind === "palate" && p.by ? `Vouched by ${p.by.name}` : "Your vouch";
    return `<div class="${styles.pop}"><span class="${styles.popWho}">${who}</span><span class="${styles.popPlace}">${p.name}</span>${p.line ? `<p class="${styles.popLine}">&ldquo;${p.line}&rdquo;</p>` : ""}${p.occasion ? `<span class="${styles.popOcc}">${p.occasion}</span>` : ""}<a class="${styles.popLink}" href="/spot/${slugify(p.name)}">see the receipt &rarr;</a></div>`;
  }

  function sync() {
    const m = map.current, leaflet = L.current;
    if (!m || !leaflet) return;
    const pins = pinsRef.current; // latest, never the stale mount-time closure
    const want = new Set(pins.map((p) => p.id));
    let changed = false;
    // remove pins that are gone (never touches existing markers → no blink)
    for (const id of Object.keys(markers.current)) {
      if (!want.has(id)) { markers.current[id].remove(); delete markers.current[id]; changed = true; }
    }
    // add only the new pins
    pins.forEach((p) => {
      if (markers.current[p.id]) return;
      const hov = labelMode === "hover" ? ` ${styles.hover}` : "";
      const beenClass = p.gut === "absolutely" ? styles.dotBeenAbsolutely : p.gut === "no" ? styles.dotBeenNo : styles.dotBeen;
      const dotClass = p.stamp === "been" ? beenClass : p.stamp === "want" ? styles.dotWant : styles.dot;
      // the glyph says WHAT it is; the dot colour says your relationship (register)
      const glyph = p.kind !== "palate" ? (cuisineGlyph(p.cuisine) ?? "") : "";
      const html = p.kind === "palate" && p.by
        ? `<div class="${styles.pinP}${hov}"><span class="${styles.ava}">${p.by.ini}</span><span class="${styles.label}">${p.name}</span></div>`
        : `<div class="${styles.pin}${hov}"><span class="${dotClass}">${glyph}</span><span class="${styles.label}">${p.name}</span></div>`;
      const icon = leaflet.divIcon({ className: styles.icon, html, iconSize: [2, 2], iconAnchor: [10, 10], popupAnchor: [40, -6] });
      const mk = leaflet.marker([p.lat, p.lng], { icon, riseOnHover: true }).addTo(m);
      // your own pins open the designed place-card (onPinTap); a palate's borrowed pins
      // open the receipt popup (who vouched + why).
      if (onTap.current && p.kind !== "palate") mk.on("click", () => onTap.current?.(p.id));
      else mk.bindPopup(popupHTML(p), { className: styles.popup, closeButton: true });
      markers.current[p.id] = mk;
      changed = true;
    });
    if (!changed) return;
    if (pins.length === 1) m.flyTo([pins[0].lat, pins[0].lng], 14, { duration: 0.8 });
    else if (pins.length > 1) m.flyToBounds(pins.map((p) => [p.lat, p.lng]), { padding: [70, 70], maxZoom: 14, duration: 0.8 });
  }

  useEffect(() => {
    let dead = false;
    (async () => {
      const leaflet = (await import("leaflet")).default;
      if (dead || !ref.current || map.current) return;
      L.current = leaflet;
      const BLR = leaflet.latLngBounds([12.80, 77.44], [13.16, 77.80]);
      const m = leaflet.map(ref.current, {
        zoomControl: false, attributionControl: false,
        minZoom: 11, maxZoom: 18, maxBounds: BLR, maxBoundsViscosity: 1.0,
        // static (embedded) maps are a glance, not a tool: kill every interaction so
        // they never trap the page scroll. The home map (interactive) keeps them all.
        dragging: interactive, scrollWheelZoom: interactive, doubleClickZoom: interactive,
        touchZoom: interactive, boxZoom: interactive, keyboard: interactive, tapHold: false,
      }).setView([12.9716, 77.5946], 11.5);
      // Always the LABELLED dark base — neighbourhood names are what let you read
      // the map at a glance. Warmth + legibility come from a CSS filter (see
      // .recede in the stylesheet), never from crushing the tiles to black.
      tiles.current = leaflet.tileLayer(DARK_TILES, { subdomains: "abcd", detectRetina: true, minZoom: 11, maxZoom: 18 }).addTo(m);
      // zoom buttons only on an interactive embedded card (none exist today — the
      // home map uses pinch/scroll, embedded maps are static); kept for future use.
      if (interactive && !bleed) leaflet.control.zoom({ position: "bottomright" }).addTo(m);
      map.current = m;
      // re-spread overlapping pins whenever the map settles (after a fly, zoom, or pan)
      m.on("moveend", () => spreadPins());
      setTimeout(() => { m.invalidateSize(); spreadPins(); }, 60);
      sync();

      // Location BY PERMISSION, never assumption: on mount, ask once. Only fly to
      // them if the map has nothing of theirs to frame yet (an empty map). Denied →
      // stay on the city, silently. The recenter control re-asks on demand later.
      if (locate) requestLocate({ fly: pinsRef.current.length === 0 });
    })();
    return () => { dead = true; map.current?.remove?.(); map.current = null; markers.current = {}; youMarker.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-sync ONLY when the set of pins changes — not on every parent render
  const sig = pins.map((p) => p.id).join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { sync(); }, [sig]);

  // the ledger drives the map: focus a pin → fly to it & open its who/why
  useEffect(() => {
    const m = map.current, mk = focusId ? markers.current[focusId] : null;
    if (!m || !mk) return;
    m.flyTo(mk.getLatLng(), 15, { duration: 0.6 });
    mk.openPopup();
  }, [focusId]);

  // spotlight (the decision-moment focus) and lens-dimming (the legend filter) share
  // one pass: spotlight wins when set; otherwise pins outside the active lens recede.
  // Dimming — never removing — keeps the map still and your spatial memory intact.
  const dimKey = dimmedIds.join("|");
  useEffect(() => {
    const dim = new Set(dimmedIds);
    Object.entries(markers.current).forEach(([id, mk]) => {
      const el = (mk.getElement?.() as HTMLElement | undefined);
      if (!el) return;
      const dimmed = spotlightId ? id !== spotlightId : dim.has(id);
      el.classList.toggle(styles.dimmed, dimmed);
      el.classList.toggle(styles.lit, !!spotlightId && id === spotlightId);
    });
    if (spotlightId && map.current && markers.current[spotlightId]) {
      map.current.flyTo(markers.current[spotlightId].getLatLng(), 14, { duration: 0.6 });
    } else if (!spotlightId && prevSpot.current) {
      // entering focus zooms in + dims; leaving it must reverse both — glide the
      // camera back to the whole-map overview, not leave it stranded on one pin.
      frameAll();
    }
    prevSpot.current = spotlightId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotlightId, sig, dimKey]);

  // drop or move the "you are here" marker (created once, then reused)
  function placeYou(lat: number, lng: number) {
    const m = map.current, leaflet = L.current;
    if (!m || !leaflet) return;
    youPos.current = { lat, lng };
    if (youMarker.current) { youMarker.current.setLatLng([lat, lng]); return; }
    const youIcon = leaflet.divIcon({ className: styles.icon, html: `<div class="${styles.you}"><span class="${styles.youDot}"></span></div>`, iconSize: [2, 2], iconAnchor: [9, 9] });
    youMarker.current = leaflet.marker([lat, lng], { icon: youIcon, interactive: false, keyboard: false, zIndexOffset: -200 }).addTo(m);
  }

  // ask for location (the browser caches the grant, so repeat taps are instant).
  // Outside the city, or denied → fall back to framing their places, never a guess.
  function requestLocate({ fly }: { fly: boolean }) {
    if (typeof navigator === "undefined" || !navigator.geolocation) { if (fly) frameAll(); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!inBLR(latitude, longitude)) { if (fly) frameAll(); return; }
        onLoc.current?.(latitude, longitude);
        placeYou(latitude, longitude);
        if (fly) map.current?.flyTo([latitude, longitude], 15, { duration: 0.9 });
      },
      () => { if (fly) frameAll(); },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 },
    );
  }

  // frame everything that's yours — your pins plus you, if we know where you are
  function frameAll() {
    const m = map.current;
    if (!m) return;
    const pts = pinsRef.current.map((p) => [p.lat, p.lng] as [number, number]);
    if (youPos.current) pts.push([youPos.current.lat, youPos.current.lng]);
    if (pts.length === 0) return;
    if (pts.length === 1) m.flyTo(pts[0], 15, { duration: 0.9 });
    // generous top/bottom padding so pins clear the header overlay and the spine card
    else m.flyToBounds(pts, { paddingTopLeft: [36, bleed ? 200 : 60], paddingBottomRight: [36, bleed ? 190 : 60], maxZoom: 15, duration: 0.9 });
  }

  // the recenter control: reframe the whole map — your places plus you. Refresh
  // your location first (cached grant → instant), then fit everything. One tap
  // always animates back to "your map", whether you panned off or zoomed in.
  function recenter() {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (inBLR(latitude, longitude)) { onLoc.current?.(latitude, longitude); placeYou(latitude, longitude); }
          frameAll();
        },
        () => frameAll(),
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 120000 },
      );
    } else frameAll();
  }

  return (
    <div className={`${styles.wrap} ${styles.themeDark} ${bleed ? styles.bleed : ""} ${interactive ? "" : styles.staticMap}`} style={{ height }}>
      <div ref={ref} className={styles.map} />
      {recede && <div className={styles.vignette} aria-hidden="true" />}
      <span className={styles.tag}>{tag}</span>
      {pins.length === 0 && <span className={styles.empty}>your vouches drop here</span>}
      {/* only the immersive home map carries a control — recenter: reframe your whole
          map (your places + you). Embedded maps are static glances, no controls. */}
      {locate && (
        <button type="button" className={styles.recenter} onClick={recenter} aria-label="Recenter the map on your places">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" /></svg>
        </button>
      )}
    </div>
  );
}
