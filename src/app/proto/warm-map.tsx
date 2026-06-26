"use client";

import { useEffect, useRef } from "react";

/* A real, richer warm map — learns from v3's dark map (styled base, a route
   through the spots, proper pins) but rebuilt for the light terracotta system.
   Carto Voyager tiles (detailed, warm) + a dashed terracotta route + numbered
   teardrop pins. Leaflet loaded from CDN so the prototype needs no deps. */

type Spot = { name: string; lat: number; lng: number; n: number; cat: string };

export default function WarmMap({ spots, height = 440 }: { spots: Spot[]; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    let dead = false;
    function ensureL(): Promise<typeof window & { L: any }> {
      return new Promise((resolve) => {
        const w = window as unknown as { L?: unknown };
        if (w.L) return resolve(window as never);
        if (!document.getElementById("lf-css")) {
          const l = document.createElement("link");
          l.id = "lf-css"; l.rel = "stylesheet"; l.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(l);
        }
        let sc = document.getElementById("lf-js") as HTMLScriptElement | null;
        const done = () => resolve(window as never);
        if (!sc) {
          sc = document.createElement("script");
          sc.id = "lf-js"; sc.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          sc.onload = done; document.body.appendChild(sc);
        } else if ((window as unknown as { L?: unknown }).L) { done(); }
        else { sc.addEventListener("load", done); }
      });
    }

    ensureL().then(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      if (dead || !ref.current || mapRef.current) return;
      const map = L.map(ref.current, { zoomControl: false, attributionControl: false, scrollWheelZoom: false, dragging: true });
      mapRef.current = map;
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { subdomains: "abcd", detectRetina: true, maxZoom: 19 }).addTo(map);
      const pts = spots.map((s) => [s.lat, s.lng] as [number, number]);
      L.polyline(pts, { color: "#CB613A", weight: 2.5, opacity: 0.9, dashArray: "1 10", lineCap: "round" }).addTo(map);
      spots.forEach((s) => {
        const icon = L.divIcon({ className: "", html: `<div class="hmpin"><span>${s.n}</span></div>`, iconSize: [30, 38], iconAnchor: [15, 36] });
        L.marker([s.lat, s.lng], { icon }).addTo(map);
      });
      map.fitBounds(pts, { padding: [56, 56] });
    });

    return () => {
      dead = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = mapRef.current as any;
      if (m) { m.remove(); mapRef.current = null; }
    };
  }, [spots]);

  return (
    <div style={{ position: "relative", height, borderRadius: 24, overflow: "hidden", border: "1px solid #EBDDC8", boxShadow: "0 28px 56px -34px rgba(44,36,24,.55)" }}>
      <style>{`
        .hmwrap .leaflet-tile-pane { filter: saturate(1.08) sepia(.08) brightness(1.01) contrast(1.02); }
        .hmwrap .leaflet-container { background:#EFE3CE; outline:none; }
        .hmpin { width:30px; height:38px; display:flex; align-items:center; justify-content:center;
          background:#CB613A; border:2.5px solid #FFFBF3; border-radius:50% 50% 50% 0; transform:rotate(-45deg);
          box-shadow:0 7px 16px rgba(60,30,10,.4); }
        .hmpin > span { transform:rotate(45deg); color:#fff; font-weight:700; font-size:13px; font-family:'DM Sans',sans-serif; }
      `}</style>
      <div ref={ref} className="hmwrap" style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 0 90px -30px rgba(44,36,24,.35)", borderRadius: 24 }} />
    </div>
  );
}
