"use client";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { slugify } from "./_guides";
import { cuisineGlyph } from "./_taste";
import styles from "./map-real.module.css";

/* The Vouch map — a REAL dark Bengaluru (Leaflet + Carto dark raster tiles, no
   key, no worker), locked to the city. Core principle: a pin is not a place,
   it's a VOUCH FROM A PERSON. Pins carry identity (yours vs a palate's monogram);
   tap one to see who vouched & why. Markers are DIFFED (added/removed) so typing
   elsewhere never re-renders or blinks the pins. */

/* Two basemaps, because of the sun (PRD §11): a warm-dark night map and a warm-light
   day map (Carto Voyager — legible in Indian daylight). Pins, labels and chrome are
   dark glass over the tiles, so they stay legible on both; only the tile layer + its
   filter swap. */
const TILES = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
};
type MapTheme = "light" | "dark";
function resolveTheme(): MapTheme {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem("vouch:maptheme");
  if (saved === "light" || saved === "dark") return saved;
  const hour = new Date().getHours();
  const daytime = hour >= 7 && hour < 18;
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches ?? false;
  return daytime || prefersLight ? "light" : "dark";
}

export type MapPin = {
  id: string; lat: number; lng: number; name: string;
  line?: string; occasion?: string;
  kind?: "mine" | "palate"; by?: { name: string; ini: string };
  stamp?: "want" | "been" | "vouched";
  gut?: "absolutely" | "maybe" | "no";   // tints the "been" mark by your "Go back?" answer
  cuisine?: string;                       // keys the tiny in-pin glyph (what the place IS)
};

export function MapReal({ pins = [], height = 460, labelMode = "always", focusId, bleed = false, recede = false, spotlightId, dimmedIds = [], locate = false, onPinTap, onLocated, themeToggle = false, tag = "Your map · Bengaluru" }: { pins?: MapPin[]; height?: number | string; labelMode?: "always" | "hover"; focusId?: string | null; bleed?: boolean; recede?: boolean; spotlightId?: string | null; dimmedIds?: string[]; locate?: boolean; onPinTap?: (id: string) => void; onLocated?: (lat: number, lng: number) => void; themeToggle?: boolean; tag?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState<MapTheme>("dark"); // SSR-safe; resolved on mount
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
  // When the host wants to own the reveal (a designed place-card, not a Leaflet
  // popup), a tap reports the id up instead of opening the built-in popup.
  const onTap = useRef(onPinTap);
  onTap.current = onPinTap;
  const onLoc = useRef(onLocated);
  onLoc.current = onLocated;
  const themeRef = useRef(theme);
  themeRef.current = theme;
  // always hold the latest pins so sync() is never stale — the map can finish
  // initializing AFTER the parent's data lands (or vice versa); either order works.
  const pinsRef = useRef<MapPin[]>(pins);
  pinsRef.current = pins;

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
      }).setView([12.9716, 77.5946], 11.5);
      // Always the LABELLED dark base — neighbourhood names are what let you read
      // the map at a glance. Warmth + legibility come from a CSS filter (see
      // .recede in the stylesheet), never from crushing the tiles to black.
      tiles.current = leaflet.tileLayer(TILES[themeRef.current], { subdomains: "abcd", detectRetina: true, minZoom: 11, maxZoom: 18 }).addTo(m);
      leaflet.control.zoom({ position: "bottomright" }).addTo(m);
      map.current = m;
      setTimeout(() => m.invalidateSize(), 60);
      sync();

      // Location BY PERMISSION, never assumption: if the user grants it and they're
      // in the city we cover, drop a "you are here" marker and (only when the map
      // isn't already framing their pins) recenter on them. Denied → stay on the
      // city, silently and honestly.
      if (locate && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const m2 = map.current;
            if (dead || !m2) return;
            const { latitude, longitude } = pos.coords;
            if (!BLR.contains([latitude, longitude])) return; // outside our coverage → keep the city view
            onLoc.current?.(latitude, longitude); // the host may want the position (the want-loop spine)
            const youIcon = leaflet.divIcon({ className: styles.icon, html: `<div class="${styles.you}"><span class="${styles.youDot}"></span></div>`, iconSize: [2, 2], iconAnchor: [9, 9] });
            youMarker.current = leaflet.marker([latitude, longitude], { icon: youIcon, interactive: false, keyboard: false, zIndexOffset: -200 }).addTo(m2);
            if (pinsRef.current.length === 0) m2.flyTo([latitude, longitude], 14, { duration: 0.8 });
          },
          () => { /* denied / unavailable → city fallback, no guess */ },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
        );
      }
    })();
    return () => { dead = true; map.current?.remove?.(); map.current = null; markers.current = {}; youMarker.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // resolve the real basemap on mount (time-of-day + prefers-color-scheme + saved
   // override) — SSR rendered "dark" to avoid a hydration flash.
  useEffect(() => { setTheme(resolveTheme()); }, []);
  // swap the tile layer in place when the theme changes (no remount, no blink)
  useEffect(() => { tiles.current?.setUrl(TILES[theme]); }, [theme]);
  function toggleTheme() {
    setTheme((t) => {
      const next = t === "light" ? "dark" : "light";
      try { window.localStorage.setItem("vouch:maptheme", next); } catch { /* ignore */ }
      return next;
    });
  }

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotlightId, sig, dimKey]);

  function fit() {
    const m = map.current;
    if (!m || !pins.length) return;
    if (pins.length === 1) m.flyTo([pins[0].lat, pins[0].lng], 14);
    else m.flyToBounds(pins.map((p) => [p.lat, p.lng]), { padding: [70, 70], maxZoom: 14 });
  }

  return (
    <div className={`${styles.wrap} ${theme === "light" ? styles.themeLight : styles.themeDark} ${bleed ? styles.bleed : ""}`} style={{ height }}>
      <div ref={ref} className={styles.map} />
      {recede && <div className={styles.vignette} aria-hidden="true" />}
      <span className={styles.tag}>{tag}</span>
      {themeToggle && (
        <button type="button" className={styles.theme} onClick={toggleTheme} aria-label={theme === "light" ? "Switch to the night map" : "Switch to the day map"}>
          {theme === "light" ? "☾" : "☀"}
        </button>
      )}
      {pins.length === 0 && <span className={styles.empty}>your vouches drop here</span>}
      {pins.length > 1 && <button type="button" className={styles.fit} onClick={fit} aria-label="Fit my map">⤢ Fit my map</button>}
    </div>
  );
}
