"use client";

import { useEffect, useRef, useState } from "react";
import m from "./map.module.css";
import { type Guide, mapsUrl } from "../lib/guides";
import { pointsForGuide, type PlacePoint } from "../lib/geo";

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
export default function GuideMap({ guide }: { guide: Guide }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ marker: any; point: PlacePoint }[]>([]);
  const LRef = useRef<any>(null);
  const [selected, setSelected] = useState<PlacePoint | null>(null);

  function makeIcon(L: any, p: PlacePoint, on: boolean) {
    return L.divIcon({
      className: "",
      html: `<span class="${m.pin} ${on ? m.pinOn : ""}"><b>${p.index + 1}</b></span>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });
  }

  useEffect(() => {
    let cancelled = false;
    const points = pointsForGuide(guide);
    loadLeaflet().then((L: any) => {
      if (cancelled || !ref.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(ref.current, { zoomControl: true, scrollWheelZoom: false, attributionControl: false });
      mapRef.current = map;
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { maxZoom: 19, subdomains: "abcd" }).addTo(map);
      points.forEach((p) => {
        const marker = L.marker([p.lat, p.lng], { icon: makeIcon(L, p, false), keyboard: false }).addTo(map);
        marker.on("click", () => setSelected(p));
        markersRef.current.push({ marker, point: p });
      });
      const latlngs = points.map((p) => [p.lat, p.lng] as [number, number]);
      if (latlngs.length) map.fitBounds(latlngs, { padding: [54, 54], maxZoom: 15 });
      setTimeout(() => map.invalidateSize(), 140);
    });
    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      markersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide.handle]);

  useEffect(() => {
    const L = LRef.current;
    if (!L) return;
    markersRef.current.forEach(({ marker, point }) => {
      marker.setIcon(makeIcon(L, point, selected?.place.name === point.place.name));
    });
    if (selected && mapRef.current) mapRef.current.panTo([selected.lat, selected.lng], { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <div className={m.wrap}>
      <div ref={ref} className={m.map} />
      <div className={m.credit}>© OpenStreetMap · CARTO</div>
      {selected && (
        <div className={m.card}>
          <button className={m.cardClose} onClick={() => setSelected(null)} aria-label="Close">✕</button>
          <div className={m.cardCat}>{selected.place.category}</div>
          <div className={m.cardName}>{selected.place.name}</div>
          <div className={m.cardArea}>{selected.place.area}</div>
          <p className={m.cardTake}>{selected.place.take}</p>
          <a className={m.cardGo} href={mapsUrl(selected.place, guide.curator.city)} target="_blank" rel="noopener noreferrer">
            Directions <span aria-hidden="true">↗</span>
          </a>
        </div>
      )}
    </div>
  );
}
