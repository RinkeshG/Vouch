"use client";
import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "../../../components/v3/kit";
import { CATS, PLACES } from "./places";

/* The landing — a living Bengaluru you glide through. ONE pin design for every
   place (a circle badge with its cuisine glyph). The map quietly reads the moment
   (time + rain) and the places worth it right now warm up — never announced, just
   felt. In each neighbourhood her picks sit in the list with their voice; hover
   one and it lifts off the map with its name. WebGL vector map; continuous camera. */

type Spot = { name: string; cat: string; vo: string; lng: number; lat: number };
type Way = { c: [number, number]; z: number; p: number; b: number };
type Area = { key: string; kicker: string; name: string; tag: string; flavor: string; spots: Spot[] };

const CITY: [number, number] = [77.600, 12.962];
const CITY_Z = 10.7;
const CATI: Record<string, number> = { coffee: 0, bar: 1, dosa: 2, pizza: 3, burger: 4, dessert: 5, chinese: 6, food: 7 };

const AREAS: Area[] = [
  {
    key: "koramangala", kicker: "the young heart", name: "Koramangala", tag: "where the city actually hangs out", flavor: "all walkable. sakkath, every one.",
    spots: [
      { name: "Truffles", cat: "burger", vo: "the bird's eye chilli burger. there'll be a wait — full worth it.", lng: 77.6205, lat: 12.9347 },
      { name: "Maverick & Farmer", cat: "coffee", vo: "best coffee in town, macha. i work from here.", lng: 77.6265, lat: 12.9352 },
      { name: "The Black Pearl", cat: "food", vo: "a medieval feast, hands only. go full hungry.", lng: 77.6188, lat: 12.9320 },
      { name: "Dyu Art Cafe", cat: "coffee", vo: "the courtyard, a book, an afternoon gone.", lng: 77.6275, lat: 12.9285 },
    ],
  },
  {
    key: "indiranagar", kicker: "100 ft road & the lanes off it", name: "Indiranagar", tag: "dressed up, but still ours", flavor: "park once, walk the rest, guru.",
    spots: [
      { name: "Toit", cat: "bar", vo: "toit weiss + a wood-fired pizza. never weekend.", lng: 77.6408, lat: 12.9783 },
      { name: "Glen's Bakehouse", cat: "dessert", vo: "the red velvet. don't offer to share.", lng: 77.6350, lat: 12.9760 },
      { name: "Sodabottleopenerwala", cat: "food", vo: "berry pulao and a raspberry soda. obviously.", lng: 77.6440, lat: 12.9716 },
      { name: "Arbor Brewing", cat: "bar", vo: "the bagsy brown, up on the terrace.", lng: 77.6378, lat: 12.9705 },
    ],
  },
  {
    key: "basavanagudi", kicker: "one kaapi, by two", name: "Basavanagudi", tag: "the old city — proper, since before all of us", flavor: "cash only. swalpa wait, always.",
    spots: [
      { name: "Vidyarthi Bhavan", cat: "dosa", vo: "masala dose, crisp at the edges. since '43, maga.", lng: 77.5731, lat: 12.9498 },
      { name: "Brahmin's Coffee Bar", cat: "coffee", vo: "idli-vada, one filter kaapi by two. 7am sharp.", lng: 77.5670, lat: 12.9450 },
      { name: "VV Puram Food Street", cat: "food", vo: "walk it twice. end on the holige. full pet.", lng: 77.5745, lat: 12.9419 },
      { name: "MTR, Lalbagh", cat: "dosa", vo: "rava idli, then the chandrahara. bring patience.", lng: 77.5848, lat: 12.9507 },
    ],
  },
  {
    key: "golden", kicker: "an occasion, not a place", name: "Golden hour", tag: "up high, before the sun goes", flavor: "be there by six, maga. trust me.",
    spots: [
      { name: "Skyye, UB City", cat: "bar", vo: "a martini as the city switches its lights on.", lng: 77.5965, lat: 12.9716 },
      { name: "High Ultra Lounge", cat: "bar", vo: "31 floors up. the whole of bengaluru below you.", lng: 77.5950, lat: 12.9850 },
      { name: "Byg Brewski", cat: "bar", vo: "go for the sunset off the deck, not the beer.", lng: 77.6403, lat: 13.0358 },
    ],
  },
];
const WAY: Way[] = [
  { c: CITY, z: CITY_Z, p: 0, b: 0 },
  { c: [77.6235, 12.9340], z: 14.4, p: 30, b: -12 },
  { c: [77.6400, 12.9745], z: 14.4, p: 30, b: 10 },
  { c: [77.5745, 12.9465], z: 14.2, p: 28, b: -8 },
  { c: [77.6080, 13.0010], z: 12.5, p: 22, b: 6 },
  { c: [77.600, 12.978], z: 10.9, p: 0, b: 0 },
];
const NAV = [{ key: "hero", label: "the city" }, ...AREAS.map((a) => ({ key: a.key, label: a.name })), { key: "finale", label: "your turn" }];
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

const ICONS: Record<string, string> = {
  coffee: "<path d='M5 8h10v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8z'/><path d='M15 9h1.5a2.5 2.5 0 0 1 0 5H15'/><path d='M8 3v2M11 2v2.5M14 3v2'/>",
  bar: "<path d='M6 5h9v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5z'/><path d='M15 9h1.5a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H15'/><path d='M6 8.5h9'/>",
  dosa: "<path d='M4 15a8 8 0 0 1 16 0z'/><path d='M7 19h10'/>",
  pizza: "<path d='M12 3 4 19h16z'/><path d='M7.5 12.5h9'/>",
  burger: "<path d='M5 9.5c1-3 13-3 14 0M4.5 13h15M6 16.5c0 1.7 12 1.7 12 0'/>",
  dessert: "<path d='M6.5 10.5h11L15.5 19h-7z'/><path d='M8 10.5a4 4 0 0 1 8 0'/>",
  chinese: "<path d='M4 12h16a8 8 0 0 1-16 0z'/><path d='M10 8l2.5-5'/><path d='M14 8l2.5-5'/>",
  food: "<path d='M7 3v8M7 11v9M5 3v5a2 2 0 0 0 4 0V3M16 3c-1.6 0-2.6 2.4-2.6 5.5 0 1.8 1 2.5 2.6 2.5v9'/>",
};
function glyphSVG(cat: string, color: string, w = 13) {
  return `<svg viewBox='0 0 24 24' width='${w}' height='${w}' fill='none' stroke='${color}' stroke-width='2.1' stroke-linecap='round' stroke-linejoin='round'>${ICONS[cat] || ICONS.food}</svg>`;
}
// ONE badge, two states: lit (worth it now) warms amber; quiet (the rest) recedes deep
function badgeSVG(cat: string, lit: boolean) {
  const fill = lit ? "#D69A4C" : "#15110a";
  const ring = lit ? "rgba(10,8,5,.45)" : "rgba(243,235,217,.07)";
  const g = lit ? "#241606" : "#564a38";
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='46' height='46'><circle cx='12' cy='12' r='9' fill='${fill}' stroke='${ring}' stroke-width='1'/><g transform='translate(4.7 4.7) scale(.61)' fill='none' stroke='${g}' stroke-width='${lit ? 2.3 : 1.9}' stroke-linecap='round' stroke-linejoin='round'>${ICONS[cat]}</g></svg>`;
}
function loadImg(svg: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const i = new Image(46, 46); i.onload = () => res(i); i.onerror = () => res(null);
    try { i.src = "data:image/svg+xml;base64," + btoa(svg); } catch { res(null); }
    setTimeout(() => res(i.complete && i.naturalWidth ? i : null), 1500);
  });
}
const iconExpr = (lit: number[]) => ["concat", ["case", ["in", ["get", "c"], ["literal", lit]], "lit-", "q-"], ["match", ["get", "c"], 0, "coffee", 1, "bar", 2, "dosa", 3, "pizza", 4, "burger", 5, "dessert", 6, "chinese", "food"]];

// silent context: the ONE thing the city's leaning toward right now (felt, never said)
function glowFor(now: Date, rain: boolean): number[] {
  const h = now.getHours();
  if (rain) return [0];               // chai weather
  if (h >= 5 && h < 11) return [0];    // morning — coffee
  if (h >= 11 && h < 16) return [2];   // midday — tiffin/dosa
  if (h >= 16 && h < 20) return [1, 5]; // evening — bars & dessert
  return [1];                         // late — bars
}

export default function Landing() {
  const mapEl = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = useRef<any>(null);
  const navRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const spotRef = useRef<HTMLDivElement | null>(null);
  const focusRef = useRef<((area: string, idx: number) => void) | null>(null);
  const [rain, setRain] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let dead = false; let rafS = 0; let prevKey = ""; let activeArea = "";
    let lit = glowFor(new Date(), false);
    let focus: { lng: number; lat: number } | null = null;

    function applyGlow(m: unknown, g: number[], finale = false) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = m as any; if (!map.getLayer("pl-ico")) return;
      map.setLayoutProperty("pl-ico", "icon-image", iconExpr(g));
      map.setFilter("pl-glow", ["in", ["get", "c"], ["literal", g]]);
      map.setPaintProperty("pl-glow", "circle-opacity", ["interpolate", ["linear"], ["zoom"], 10, finale ? 0.16 : 0.1, 13, finale ? 0.22 : 0.15, 16, 0.2]);
    }

    function positionSpot() {
      const m = map.current, el = spotRef.current; if (!m || !el) return;
      if (!focus) { el.classList.remove("on"); return; }
      const p = m.project([focus.lng, focus.lat]);
      el.style.transform = `translate(${p.x}px, ${p.y}px)`; el.classList.add("on");
    }
    function setFocus(area: string, idx: number) {
      const a = AREAS.find((x) => x.key === area); const s = a?.spots[idx]; const el = spotRef.current;
      document.querySelectorAll<HTMLElement>(`[data-rowarea="${area}"]`).forEach((r) => r.classList.toggle("active", +(r.dataset.rowidx || -1) === idx));
      if (!s || !el) { focus = null; el?.classList.remove("on"); return; }
      el.querySelector(".spot-dot")!.innerHTML = glyphSVG(s.cat, "#231606", 13);
      el.querySelector(".spot-name")!.textContent = s.name;
      focus = { lng: s.lng, lat: s.lat }; positionSpot();
    }
    focusRef.current = setFocus;
    function enterArea(key: string) {
      activeArea = AREAS.some((a) => a.key === key) ? key : "";
      if (activeArea) setFocus(activeArea, 0);
      else { focus = null; spotRef.current?.classList.remove("on"); document.querySelectorAll(".srow.active").forEach((r) => r.classList.remove("active")); }
    }

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (dead || !mapEl.current || map.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m: any = new maplibregl.Map({ container: mapEl.current, style: "https://tiles.openfreemap.org/styles/dark", center: WAY[0].c, zoom: WAY[0].z, pitch: WAY[0].p, bearing: WAY[0].b, interactive: false, attributionControl: false, fadeDuration: 0, maxPitch: 60 });
      map.current = m;

      m.on("load", async () => {
        if (dead) return;
        for (const l of m.getStyle().layers) {
          const sl = l["source-layer"];
          if (l.type === "background") m.setPaintProperty(l.id, "background-color", "#0c0a06");
          else if (l.type === "symbol") m.setLayoutProperty(l.id, "visibility", "none");
          else if (sl === "water") m.setPaintProperty(l.id, "fill-color", "#070808");
          else if (sl === "landcover" || sl === "park" || sl === "landuse") { try { m.setPaintProperty(l.id, "fill-color", "#0e0c07"); m.setPaintProperty(l.id, "fill-opacity", 0.45); } catch { } }
          else if (sl === "building") { try { m.setPaintProperty(l.id, "fill-color", "#120e08"); m.setPaintProperty(l.id, "fill-opacity", 0.5); } catch { } }
          else if (l.type === "line") { try { m.setPaintProperty(l.id, "line-color", "#241c12"); m.setPaintProperty(l.id, "line-opacity", 0.6); } catch { } }
        }
        // one badge per place, in two states (lit / quiet)
        await Promise.all(CATS.flatMap((c) => [["lit-" + c, badgeSVG(c, true)], ["q-" + c, badgeSVG(c, false)]] as const)
          .map(async ([id, svg]) => { try { const img = await loadImg(svg); if (img && !m.hasImage(id)) m.addImage(id, img); } catch { } }));
        const feats = [
          ...PLACES.map(([, c, lng, lat]) => ({ type: "Feature" as const, properties: { c }, geometry: { type: "Point" as const, coordinates: [lng, lat] } })),
          ...AREAS.flatMap((a) => a.spots.map((s) => ({ type: "Feature" as const, properties: { c: CATI[s.cat] }, geometry: { type: "Point" as const, coordinates: [s.lng, s.lat] } }))),
        ];
        m.addSource("places", { type: "geojson", data: { type: "FeatureCollection", features: feats } });
        m.addLayer({ id: "pl-glow", type: "circle", source: "places", filter: ["in", ["get", "c"], ["literal", lit]], paint: { "circle-color": "#D69A4C", "circle-blur": 1.6, "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 6, 15, 15], "circle-opacity": 0.1 } });
        m.addLayer({ id: "pl-ico", type: "symbol", source: "places", layout: { "icon-image": iconExpr(lit), "icon-size": ["interpolate", ["linear"], ["zoom"], 10, 0.24, 13, 0.4, 15, 0.56], "icon-allow-overlap": false, "icon-padding": 9 } });
        applyGlow(m, lit); setReady(true); onScroll();

        try {
          const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=12.97&longitude=77.59&current=weather_code");
          const code = (await r.json())?.current?.weather_code;
          const raining = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);
          if (raining && !dead) { setRain(true); lit = glowFor(new Date(), true); applyGlow(m, activeArea || prevKey === "finale" ? lit : lit); }
        } catch { }
      });

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    })();

    function onScroll() {
      if (rafS) return;
      rafS = requestAnimationFrame(() => {
        rafS = 0; const m = map.current; if (!m) return; const vh = window.innerHeight;
        const f = clamp(window.scrollY / vh, 0, WAY.length - 1);
        const i = Math.floor(f), t = smooth(f - i), a = WAY[i], b = WAY[Math.min(i + 1, WAY.length - 1)];
        m.jumpTo({ center: [lerp(a.c[0], b.c[0], t), lerp(a.c[1], b.c[1], t)], zoom: lerp(a.z, b.z, t), pitch: lerp(a.p, b.p, t), bearing: lerp(a.b, b.b, t) });
        positionSpot();
        let key = NAV[Math.round(f)]?.key ?? "hero";
        if (window.scrollY < vh * 0.5) key = "hero";
        navRefs.current.forEach((nb) => nb && nb.classList.toggle("on", nb.dataset.k === key));
        document.querySelectorAll("[data-sec]").forEach((s) => s.querySelector(".panel")?.classList.toggle("shown", (s as HTMLElement).dataset.sec === key));
        document.querySelector(".scrim-fin")?.classList.toggle("on", key === "finale");
        if (key !== prevKey) { prevKey = key; enterArea(key); }
        if (m.getLayer("pl-ico")) applyGlow(m, key === "finale" ? [0, 1, 2, 3, 4, 5, 6, 7] : lit, key === "finale");
      });
    }

    return () => { dead = true; cancelAnimationFrame(rafS); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); try { map.current?.remove?.(); } catch { } map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jump = (key: string) => { const i = NAV.findIndex((n) => n.key === key); window.scrollTo({ top: i * window.innerHeight, behavior: "smooth" }); };

  return (
    <main>
      <style>{`
        :root{--e-out:cubic-bezier(.23,1,.32,1);}
        .map-stage{position:fixed;inset:0;z-index:0;opacity:0;transition:opacity 1.1s var(--e-out);}
        .map-stage.lit{opacity:1;}
        .maplibregl-map{position:absolute;inset:0;} .maplibregl-canvas{outline:none;}
        .map-vig{position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(125% 105% at 50% 42%,transparent 36%,rgba(5,3,1,.4) 80%,rgba(3,2,1,.9) 100%);}
        .scrim-left{position:fixed;inset:0;z-index:2;pointer-events:none;background:linear-gradient(96deg,rgba(5,3,1,.9) 0%,rgba(5,3,1,.68) 25%,rgba(5,3,1,.18) 47%,transparent 62%);}
        .scrim-fin{position:fixed;inset:0;z-index:2;pointer-events:none;opacity:0;transition:opacity .7s var(--e-out);background:radial-gradient(62% 56% at 50% 50%,rgba(5,3,1,.93) 0%,rgba(5,3,1,.62) 44%,transparent 76%);}
        .scrim-fin.on{opacity:1;}
        .rain{position:fixed;inset:0;z-index:3;pointer-events:none;overflow:hidden;}
        .rain i{position:absolute;top:-12%;width:1.1px;border-radius:1px;background:linear-gradient(transparent,rgba(220,210,185,.4));animation:vrain linear infinite;}
        @keyframes vrain{to{transform:translateY(122vh) skewX(-8deg);}}
        /* the focused pick — lifts off the map with its name (same badge, larger + halo) */
        .spot{position:fixed;left:0;top:0;z-index:4;pointer-events:none;opacity:0;transition:opacity .4s var(--e-out);will-change:transform;}
        .spot.on{opacity:1;}
        .spot-row{display:flex;align-items:center;gap:9px;transform:translate(-14px,-14px);}
        .spot-dot{width:28px;height:28px;flex:none;border-radius:50%;display:grid;place-items:center;background:#E6A23E;box-shadow:0 0 0 4px rgba(230,162,62,.16),0 0 22px 6px rgba(230,162,62,.85);animation:halo 2.2s ease-in-out infinite;}
        @keyframes halo{0%,100%{box-shadow:0 0 0 4px rgba(230,162,62,.14),0 0 18px 5px rgba(230,162,62,.72);}50%{box-shadow:0 0 0 6px rgba(230,162,62,.2),0 0 26px 7px rgba(230,162,62,.95);}}
        .spot-name{white-space:nowrap;font-weight:600;font-size:.82rem;letter-spacing:-.01em;color:var(--ink);background:rgba(11,9,5,.9);border:1px solid var(--accent-line);border-radius:999px;padding:4px 12px;backdrop-filter:blur(8px);box-shadow:0 12px 28px -16px rgba(0,0,0,.95);}
        .chap{position:relative;z-index:5;min-height:100dvh;display:flex;align-items:center;pointer-events:none;}
        .chap.finale{justify-content:center;text-align:center;}
        .panel{margin:0 0 0 clamp(28px,7vw,120px);max-width:470px;pointer-events:auto;}
        .reveal{opacity:0;transform:translateY(22px);transition:opacity .8s var(--e-out),transform .8s var(--e-out);}
        .panel.shown .reveal{opacity:1;transform:none;}
        .reveal.d1{transition-delay:.06s;} .reveal.d2{transition-delay:.12s;} .reveal.d3{transition-delay:.18s;}
        .eyebrow{font-size:.82rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin:0;}
        .listcard{margin-top:22px;background:linear-gradient(168deg,rgba(26,21,13,.62),rgba(10,8,5,.78));border:1px solid var(--line-2);border-radius:var(--r-lg);padding:6px 8px;backdrop-filter:blur(10px);box-shadow:0 34px 64px -42px rgba(0,0,0,.92);}
        .srow{display:flex;gap:12px;padding:12px;border-radius:11px;cursor:default;transition:background .3s var(--e-out);}
        .srow + .srow{border-top:1px solid var(--line);}
        .srow.active{background:rgba(230,162,62,.08);} .srow.active + .srow,.srow.active{border-top-color:transparent;}
        .srow .sdot{flex:none;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;color:rgba(34,22,6,.9);background:#9c7536;box-shadow:0 0 0 1.5px rgba(12,10,7,.5);transition:background .3s var(--e-out),box-shadow .3s var(--e-out),transform .3s var(--e-out);margin-top:1px;}
        .srow.active .sdot{background:#E6A23E;box-shadow:0 0 0 2px rgba(12,10,7,.5),0 0 16px 3px rgba(230,162,62,.7);transform:scale(1.06);}
        .sname{display:block;font-weight:600;font-size:1rem;color:var(--ink);}
        .svo{display:block;font-style:italic;font-size:.86rem;line-height:1.4;color:#C9BCA2;margin-top:2px;transition:color .3s var(--e-out);}
        .srow.active .svo{color:#E8DCC6;}
        .chaprail{position:fixed;right:26px;top:50%;transform:translateY(-50%);z-index:7;display:flex;flex-direction:column;gap:15px;}
        .chaprail button{all:unset;cursor:pointer;display:flex;align-items:center;gap:10px;justify-content:flex-end;color:var(--faint);transition:color .3s var(--e-out);}
        .chaprail button .lbl{font-size:.74rem;opacity:0;transform:translateX(6px);transition:opacity .3s var(--e-out),transform .3s var(--e-out);white-space:nowrap;}
        .chaprail button:hover{color:var(--ink);} .chaprail button:hover .lbl{opacity:1;transform:none;}
        .chaprail button .pip{width:7px;height:7px;border-radius:50%;border:1px solid var(--faint);transition:transform .35s var(--e-out),background .35s var(--e-out),border-color .35s var(--e-out),box-shadow .35s var(--e-out);}
        .chaprail button.on{color:var(--accent);} .chaprail button.on .lbl{opacity:1;transform:none;color:var(--muted);}
        .chaprail button.on .pip{background:var(--accent);border-color:var(--accent);transform:scale(1.25);box-shadow:0 0 12px 3px rgba(230,162,62,.5);}
        @media(max-width:760px){
          .chaprail{display:none;}
          .chap{align-items:flex-end;} .chap.finale{align-items:center;}
          .panel{margin:0;max-width:none;width:100%;padding:0 18px env(safe-area-inset-bottom,26px) 18px;}
          .scrim-left{background:linear-gradient(0deg,rgba(5,3,1,.92) 0%,rgba(5,3,1,.55) 34%,transparent 64%);}
        }
        @media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;}.rain,.spot-dot{animation:none;}}
      `}</style>

      <div className={"map-stage" + (ready ? " lit" : "")}><div ref={mapEl} className="maplibregl-map" /></div>
      <div className="map-vig" />
      <div className="scrim-left" />
      <div className="scrim-fin" />
      {rain && <div className="rain" aria-hidden="true">{Array.from({ length: 60 }).map((_, i) => <i key={i} style={{ left: `${(i * 137) % 100}%`, height: `${42 + (i * 53) % 48}px`, animationDuration: `${0.55 + ((i * 31) % 45) / 100}s`, animationDelay: `${-((i * 47) % 100) / 100}s`, opacity: 0.14 + ((i * 23) % 22) / 100 }} />)}</div>}

      <div ref={spotRef} className="spot"><div className="spot-row"><span className="spot-dot" /><span className="spot-name" /></div></div>

      <nav className="chaprail" aria-label="chapters">
        {NAV.map((n, i) => <button key={n.key} ref={(el) => { navRefs.current[i] = el; }} data-k={n.key} onClick={() => jump(n.key)}><span className="lbl">{n.label}</span><span className="pip" /></button>)}
      </nav>
      <div style={{ position: "fixed", zIndex: 7, top: 26, left: 28 }}><span style={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--ink)", letterSpacing: "-0.02em" }}>vouch<span style={{ color: "var(--accent)" }}>.</span></span></div>

      {/* I — the city */}
      <section className="chap" data-sec="hero">
        <div className="panel" style={{ maxWidth: 600 }}>
          <p className="reveal eyebrow">namma bengaluru</p>
          <h1 className="reveal d1" style={{ fontWeight: 600, fontSize: "clamp(2.3rem,4.8vw,3.6rem)", lineHeight: 1.02, letterSpacing: "-0.03em", color: "var(--ink)", margin: "14px 0 0", maxWidth: "15ch", textShadow: "0 2px 26px rgba(0,0,0,.9)" }}>come, i&apos;ll show you my Bengaluru.</h1>
          <p className="reveal d2" style={{ fontSize: "1.1rem", lineHeight: 1.55, color: "var(--muted)", margin: "16px 0 0", maxWidth: "34ch" }}>the real places i&apos;d actually take you to — not a list off the internet.</p>
          <p className="reveal d3" style={{ fontSize: "0.78rem", color: "var(--faint)", marginTop: 22, display: "flex", alignItems: "center", gap: 8 }}><span style={{ display: "inline-block", width: 34, height: 1, background: "linear-gradient(90deg,var(--accent),transparent)" }} /> scroll — i&apos;ll take you through</p>
        </div>
      </section>

      {/* II — neighbourhoods */}
      {AREAS.map((a) => (
        <section key={a.key} className="chap" data-sec={a.key}>
          <div className="panel">
            <p className="reveal eyebrow" style={{ fontSize: "0.74rem", letterSpacing: "0.14em" }}>{a.kicker}</p>
            <h2 className="reveal d1" style={{ fontWeight: 600, fontSize: "clamp(2.1rem,4.6vw,3.1rem)", lineHeight: 1.01, letterSpacing: "-0.03em", color: "var(--ink)", margin: "8px 0 0", textShadow: "0 2px 26px rgba(0,0,0,.9)" }}>{a.name}.</h2>
          <p className="reveal d1" style={{ fontSize: "1.02rem", color: "var(--muted)", margin: "10px 0 0", maxWidth: "32ch" }}>{a.tag}</p>
            <div className="reveal d2 listcard">
              {a.spots.map((s, idx) => (
                <div key={s.name} className="srow" data-rowarea={a.key} data-rowidx={idx} onPointerEnter={() => focusRef.current?.(a.key, idx)}>
                  <span className="sdot" dangerouslySetInnerHTML={{ __html: glyphSVG(s.cat, "currentColor", 12) }} />
                  <span><span className="sname">{s.name}</span><span className="svo">&ldquo;{s.vo}&rdquo;</span></span>
                </div>
              ))}
            </div>
            <p className="reveal d3" style={{ fontSize: "0.82rem", color: "var(--faint)", marginTop: 16 }}>{a.flavor}</p>
          </div>
        </section>
      ))}

      {/* III — your turn */}
      <section className="chap finale" data-sec="finale">
        <div className="panel" style={{ margin: "0 auto", maxWidth: 640, textAlign: "center" }}>
          <p className="reveal" style={{ fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--faint)", margin: 0 }}>a thousand places. yours are in here somewhere.</p>
          <h2 className="reveal d1" style={{ fontWeight: 600, fontSize: "clamp(2.3rem,5.2vw,3.8rem)", lineHeight: 1.03, letterSpacing: "-0.025em", color: "var(--ink)", margin: "16px 0 0", textShadow: "0 2px 26px rgba(0,0,0,.9)" }}>Light up yours.</h2>
          <p className="reveal d2" style={{ fontSize: "1.14rem", lineHeight: 1.6, color: "var(--muted)", margin: "18px auto 0", maxWidth: "38ch" }}>Pick the ones you&apos;d actually take someone to. Your spots, your voice, your name on every one.</p>
          <div className="reveal d3" style={{ marginTop: 32, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/v3/new" style={{ textDecoration: "none" }}><Button>Make your guide →</Button></a>
            <a href="/v3/g/priya" style={{ textDecoration: "none" }}><Button variant="ghost">see priya&apos;s first</Button></a>
          </div>
          <p className="reveal d3" style={{ fontSize: "0.78rem", color: "var(--faint)", marginTop: 16 }}>free · about two minutes · made in bengaluru</p>
        </div>
      </section>
    </main>
  );
}
