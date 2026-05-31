"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import styles from "./map-real.module.css";

/* The Vouch map — a REAL dark Bengaluru (Leaflet + Carto dark raster tiles, no
   key, no worker), locked to the city. Core principle: a pin is not a place,
   it's a VOUCH FROM A PERSON. Pins carry identity (yours vs a palate's monogram);
   tap one to see who vouched & why. Markers are DIFFED (added/removed) so typing
   elsewhere never re-renders or blinks the pins. */

export type MapPin = {
  id: string; lat: number; lng: number; name: string;
  line?: string; occasion?: string;
  kind?: "mine" | "palate"; by?: { name: string; ini: string };
};

export function MapReal({ pins = [], height = 460, labelMode = "always", focusId, bleed = false }: { pins?: MapPin[]; height?: number | string; labelMode?: "always" | "hover"; focusId?: string | null; bleed?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const L = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markers = useRef<Record<string, any>>({});

  function popupHTML(p: MapPin) {
    const who = p.kind === "palate" && p.by ? `Vouched by ${p.by.name}` : "Your vouch";
    return `<div class="${styles.pop}"><span class="${styles.popWho}">${who}</span><span class="${styles.popPlace}">${p.name}</span>${p.line ? `<p class="${styles.popLine}">&ldquo;${p.line}&rdquo;</p>` : ""}${p.occasion ? `<span class="${styles.popOcc}">${p.occasion}</span>` : ""}</div>`;
  }

  function sync() {
    const m = map.current, leaflet = L.current;
    if (!m || !leaflet) return;
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
      const html = p.kind === "palate" && p.by
        ? `<div class="${styles.pinP}${hov}"><span class="${styles.ava}">${p.by.ini}</span><span class="${styles.label}">${p.name}</span></div>`
        : `<div class="${styles.pin}${hov}"><span class="${styles.dot}"></span><span class="${styles.label}">${p.name}</span></div>`;
      const icon = leaflet.divIcon({ className: styles.icon, html, iconSize: [2, 2], iconAnchor: [8, 8], popupAnchor: [40, -6] });
      markers.current[p.id] = leaflet.marker([p.lat, p.lng], { icon, riseOnHover: true }).addTo(m).bindPopup(popupHTML(p), { className: styles.popup, closeButton: true });
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
      leaflet.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { subdomains: "abcd", detectRetina: true, minZoom: 11, maxZoom: 18 }).addTo(m);
      leaflet.control.zoom({ position: "bottomright" }).addTo(m);
      map.current = m;
      setTimeout(() => m.invalidateSize(), 60);
      sync();
    })();
    return () => { dead = true; map.current?.remove?.(); map.current = null; markers.current = {}; };
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

  function fit() {
    const m = map.current;
    if (!m || !pins.length) return;
    if (pins.length === 1) m.flyTo([pins[0].lat, pins[0].lng], 14);
    else m.flyToBounds(pins.map((p) => [p.lat, p.lng]), { padding: [70, 70], maxZoom: 14 });
  }

  return (
    <div className={`${styles.wrap} ${bleed ? styles.bleed : ""}`} style={{ height }}>
      <div ref={ref} className={styles.map} />
      <span className={styles.tag}>Your map · Bengaluru</span>
      {pins.length === 0 && <span className={styles.empty}>your vouches drop here</span>}
      {pins.length > 1 && <button type="button" className={styles.fit} onClick={fit} aria-label="Fit my map">⤢ Fit my map</button>}
    </div>
  );
}
