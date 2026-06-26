"use client";

import { useEffect, useRef, useState } from "react";
import m from "./mapview.module.css";
import { useTheme } from "../_theme";
import { type Guide, mapsUrl } from "../lib/guides";
import { pointsForGuide, type PlacePoint } from "../lib/geo";

const tileUrl = (dark: boolean) => `https://{s}.basemaps.cartocdn.com/${dark ? "dark_all" : "light_all"}/{z}/{x}/{y}{r}.png`;

let leafletPromise: Promise<unknown> | null = null;
function loadLeaflet(): Promise<unknown> {
  const w = window as unknown as { L?: unknown };
  if (w.L) return Promise.resolve(w.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector("link[data-leaflet]")) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      css.setAttribute("data-leaflet", "1");
      document.head.appendChild(css);
    }
    const js = document.createElement("script");
    js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    js.onload = () => resolve((window as unknown as { L: unknown }).L);
    js.onerror = reject;
    document.body.appendChild(js);
  });
  return leafletPromise;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function GuideMapView({ guide }: { guide: Guide }) {
  const points = pointsForGuide(guide);
  const { theme } = useTheme();
  const dark = theme === "dark";
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const tileRef = useRef<any>(null);
  const markers = useRef<{ marker: any; point: PlacePoint }[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  const cardEls = useRef<(HTMLButtonElement | null)[]>([]);
  const [sel, setSel] = useState(0);
  const selRef = useRef(0);
  selRef.current = sel;

  function icon(L: any, p: PlacePoint, on: boolean) {
    const label = on ? `<span class="${m.pinLabel}">${p.place.name}</span>` : "";
    return L.divIcon({ className: "", html: `<span class="${m.pin} ${on ? m.pinOn : ""}"><b>${p.index + 1}</b>${label}</span>`, iconSize: [26, 26], iconAnchor: [13, 13] });
  }

  useEffect(() => {
    let dead = false;
    loadLeaflet().then((L: any) => {
      if (dead || !mapEl.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(mapEl.current, { zoomControl: false, scrollWheelZoom: false, attributionControl: false });
      mapRef.current = map;
      tileRef.current = L.tileLayer(tileUrl(dark), { subdomains: "abcd", detectRetina: true, maxZoom: 19 }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      points.forEach((p, i) => {
        const mk = L.marker([p.lat, p.lng], { icon: icon(L, p, i === 0) }).addTo(map);
        mk.on("click", () => setSel(p.index));
        markers.current.push({ marker: mk, point: p });
      });
      const ll = points.map((p) => [p.lat, p.lng] as [number, number]);
      if (ll.length > 1) map.fitBounds(ll, { padding: [60, 60], maxZoom: 15 });
      else if (ll.length === 1) map.setView(ll[0], 14);
      setTimeout(() => map.invalidateSize(), 140);
    });
    return () => { dead = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } markers.current = []; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide.handle]);

  // swap the basemap when the theme toggles (pins recolour via CSS vars on their own)
  useEffect(() => { if (tileRef.current) tileRef.current.setUrl(tileUrl(dark)); }, [dark]);

  // keep map + rail in sync with the selected place
  useEffect(() => {
    const L = LRef.current;
    if (L) markers.current.forEach(({ marker, point }) => marker.setIcon(icon(L, point, point.index === sel)));
    const pt = points.find((p) => p.index === sel);
    if (pt && mapRef.current) mapRef.current.panTo([pt.lat, pt.lng], { animate: true, duration: 0.5 });
    const card = cardEls.current[sel];
    if (card) {
      const desktop = typeof window !== "undefined" && window.innerWidth >= 900;
      card.scrollIntoView({ behavior: "smooth", block: desktop ? "nearest" : "nearest", inline: desktop ? "nearest" : "center" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel]);

  // mobile: swiping the carousel selects the centred card
  function onRailScroll() {
    if (typeof window === "undefined" || window.innerWidth >= 900) return;
    const rail = railRef.current;
    if (!rail) return;
    const mid = rail.scrollLeft + rail.clientWidth / 2;
    let best = 0, bestD = Infinity;
    cardEls.current.forEach((el, i) => {
      if (!el) return;
      const c = el.offsetLeft + el.offsetWidth / 2;
      const d = Math.abs(c - mid);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best !== selRef.current) setSel(best);
  }

  return (
    <div className={`${m.split} ${dark ? "" : m.warm}`}>
      <div className={m.mapWrap}>
        <div ref={mapEl} className={m.mapEl} />
        <span className={m.tag}>{guide.curator.city} · {points.length} spots</span>
        <span className={m.credit}>© OpenStreetMap · CARTO</span>
      </div>
      <div className={m.rail} ref={railRef} onScroll={onRailScroll}>
        {points.map((p, i) => (
          <button
            key={p.place.name}
            ref={(el) => { cardEls.current[i] = el; }}
            className={`${m.mvCard} ${p.index === sel ? m.mvCardOn : ""}`}
            onClick={() => setSel(p.index)}
          >
            <span className={m.mvTop}><span className={m.mvIndex}>{String(p.index + 1).padStart(2, "0")}</span><span className={m.mvCat}>{p.place.category}</span></span>
            <span className={m.mvName}>{p.place.name}</span>
            <span className={m.mvWhere}>{p.place.area}</span>
            <span className={m.mvTake}>{p.place.take}</span>
            {p.place.order && <span className={m.mvOrder}><span className={m.mvOrderLabel}>Order</span><span className={m.mvOrderVal}>{p.place.order}</span></span>}
            <a className={m.mvGo} href={mapsUrl(p.place, guide.curator.city)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>Directions ↗</a>
          </button>
        ))}
      </div>
    </div>
  );
}
