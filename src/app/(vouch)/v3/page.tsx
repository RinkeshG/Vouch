"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { CATS, PLACES } from "./places";

/* The landing — Vouch v1. The product is simple: you create a GUIDE — a set of
   places you love, each with a note in your voice and your name on it — and you
   share it with the world. A guide is a thing you can hold: cards, covers, notes.
   So the page is told through that artifact, not the map alone.
     1. what it is  — one plain line; the city alive, a real guide previewing.
     2. see one     — scroll Priya's Bengaluru: her picks, as cards, on the map.
     3. make yours  — a guide card builds itself: a place, a note, by you.
     4. share it    — a whole world of guides; yours is the one that's missing.
   One recurring object: the guide card. One motion: the warm-up. A silent
   context engine warms whatever is good in Bengaluru right now. */

type Spot = { name: string; cat: string; vo: string; lng: number; lat: number };
type Area = { key: string; kicker: string; name: string; tag: string; flavor: string; spots: Spot[] };

const CATI: Record<string, number> = { coffee: 0, bar: 1, dosa: 2, pizza: 3, burger: 4, dessert: 5, chinese: 6, food: 7 };
const TINT: Record<string, string> = { coffee: "#C98A4B", bar: "#B0705A", dosa: "#CBA24B", pizza: "#C27A48", burger: "#B98C4A", dessert: "#C681A2", chinese: "#B58A4A", food: "#CBA24B" };

/* hero — Priya's signature picks; the focus cycles through these so the city is
   never one static pin. Short notes, because on desktop the line shows on the map. */
const HERO_PICKS: Spot[] = [
  { name: "Koshy's", cat: "food", vo: "a window seat, a cold coffee. two unhurried hours.", lng: 77.6010, lat: 12.9738 },
  { name: "Vidyarthi Bhavan", cat: "dosa", vo: "masala dose, crisp at the edges. since '43, maga.", lng: 77.5731, lat: 12.9498 },
  { name: "Toit", cat: "bar", vo: "toit weiss + a wood-fired pizza. weekdays only.", lng: 77.6408, lat: 12.9783 },
  { name: "Third Wave", cat: "coffee", vo: "single-origin, black. no laptop, no lingering.", lng: 77.5975, lat: 12.9692 },
];

const AREAS: Area[] = [
  {
    key: "koramangala", kicker: "the young heart", name: "Koramangala", tag: "where the city actually hangs out", flavor: "all walkable — every one a sakkath.",
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
      { name: "Toit", cat: "bar", vo: "toit weiss + a wood-fired pizza. never a weekend.", lng: 77.6408, lat: 12.9783 },
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

/* Beat 3 — a guide building itself, in your voice (generic, "by you") */
const DEMO: Spot[] = [
  { name: "the corner café", cat: "coffee", vo: "the window table. order whatever they're known for.", lng: 77.6090, lat: 12.9690 },
  { name: "sunday breakfast", cat: "dosa", vo: "no plans, no rush — the one i bring everyone to.", lng: 77.5950, lat: 12.9560 },
  { name: "the rooftop", cat: "bar", vo: "go for the sky, not the cocktails. before sunset.", lng: 77.6250, lat: 12.9810 },
];

/* Beat 4 — guides people have shared (placeholder, believable; swap for real ones) */
type Guide = { name: string; ini: string; city: string; title: string; n: number; cat: string; lng: number; lat: number };
const WORLD: Guide[] = [
  { name: "Priya", ini: "P", city: "Bengaluru", title: "where i actually take people", n: 6, cat: "coffee", lng: 77.59, lat: 12.97 },
  { name: "Arjun", ini: "A", city: "Goa", title: "the Goa that isn't the beach clubs", n: 8, cat: "bar", lng: 73.83, lat: 15.49 },
  { name: "Meera", ini: "M", city: "Lisbon", title: "miradouros & pastéis, my order", n: 7, cat: "dessert", lng: -9.14, lat: 38.72 },
  { name: "Kenji", ini: "K", city: "Tokyo", title: "ten counters worth the queue", n: 10, cat: "dosa", lng: 139.69, lat: 35.68 },
  { name: "Sara", ini: "S", city: "Lagos", title: "Lagos after dark, done right", n: 6, cat: "bar", lng: 3.38, lat: 6.52 },
  { name: "Diego", ini: "D", city: "México City", title: "tacos i'd cross the city for", n: 9, cat: "food", lng: -99.13, lat: 19.43 },
  { name: "Aylin", ini: "A", city: "İstanbul", title: "the Bosphorus, slowly", n: 7, cat: "coffee", lng: 28.97, lat: 41.01 },
  { name: "Noah", ini: "N", city: "New York", title: "coffee & slices, downtown", n: 8, cat: "pizza", lng: -74.0, lat: 40.71 },
];

type Sec = { key: string; vh: number; c: [number, number]; z: number; p: number; b: number; area?: number; demo?: boolean; world?: boolean };
const SECS: Sec[] = [
  { key: "hero", vh: 1.0, c: [77.600, 12.962], z: 10.7, p: 0, b: 0 },
  { key: "koramangala", vh: 1.9, c: [77.6235, 12.9340], z: 14.4, p: 36, b: -12, area: 0 },
  { key: "indiranagar", vh: 1.9, c: [77.6400, 12.9745], z: 14.4, p: 36, b: 10, area: 1 },
  { key: "basavanagudi", vh: 1.9, c: [77.5745, 12.9465], z: 14.2, p: 32, b: -8, area: 2 },
  { key: "golden", vh: 1.7, c: [77.6080, 13.0010], z: 12.6, p: 24, b: 6, area: 3 },
  { key: "make", vh: 1.9, c: [77.600, 12.962], z: 10.5, p: 0, b: 0, demo: true },
  { key: "finale", vh: 1.5, c: [38, 24], z: 1.5, p: 0, b: 0, world: true },
];
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

/* a real crop of the dark map where a place is — the product's native cover */
const TILE = (lat: number, lng: number, z: number) => {
  const n = 2 ** z, x = Math.floor(((lng + 180) / 360) * n);
  const r = (lat * Math.PI) / 180, y = Math.floor(((1 - Math.asinh(Math.tan(r)) / Math.PI) / 2) * n);
  return `https://a.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}@2x.png`;
};
function coverStyle(cat: string, lat: number, lng: number, z: number): CSSProperties {
  const t = TINT[cat] || "#CBA24B";
  return { backgroundImage: `url("${TILE(lat, lng, z)}"), linear-gradient(150deg, ${t}40, #0e0a06)`, backgroundSize: "cover", backgroundPosition: "center" };
}
function thumbStyle(cat: string): CSSProperties {
  return { background: `linear-gradient(150deg, ${(TINT[cat] || "#CBA24B")}33, #15100a)` };
}

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

function contextLit(now: Date, code: number | null, temp: number | null): number[] {
  const h = now.getHours(), day = now.getDay(), mon = now.getMonth();
  const wkndEve = day === 5 || day === 6;
  const rain = code != null && [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);
  const cold = temp != null && temp < 19;
  const hot = temp != null && temp >= 31;
  const winter = mon === 11 || mon === 0 || mon === 1;
  if (rain) return [0, 2];
  if (h >= 5 && h < 11) return cold || winter ? [0, 2] : [0];
  if (h >= 11 && h < 16) return hot ? [5, 0] : [2, 7];
  if (h >= 16 && h < 20) return wkndEve ? [1, 5] : [7, 1];
  return wkndEve ? [1] : [1, 7];
}
function warmUp(el: Element | null, big = false) {
  if (!el || typeof (el as HTMLElement).animate !== "function") return;
  (el as HTMLElement).animate(
    [{ transform: "scale(.78)", opacity: 0 }, { transform: `scale(${big ? 1.06 : 1.05})`, opacity: 1, offset: 0.55 }, { transform: "scale(1)", opacity: 1 }],
    { duration: big ? 620 : 520, easing: "cubic-bezier(.23,1,.32,1)", fill: "both" }
  );
}

export default function Landing() {
  const mapEl = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = useRef<any>(null);
  const navRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const vouchRef = useRef<HTMLDivElement | null>(null);
  const msheetRef = useRef<HTMLDivElement | null>(null);
  const focusRef = useRef<((area: string, idx: number) => void) | null>(null);
  const [ready, setReady] = useState(false);
  const [rain, setRain] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let dead = false; let rafS = 0; let prevKey = ""; let curArea = ""; let curIdx = -1; let heroIdx = 0;
    let lit = contextLit(new Date(), null, null);
    let focus: { lng: number; lat: number } | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function applyGlow(m: any, g: number[]) {
      if (!m.getLayer("pl-ico")) return;
      m.setLayoutProperty("pl-ico", "icon-image", iconExpr(g));
      m.setFilter("pl-glow", ["in", ["get", "c"], ["literal", g]]);
      m.setPaintProperty("pl-glow", "circle-opacity", ["interpolate", ["linear"], ["zoom"], 10, 0.1, 13, 0.15, 16, 0.2]);
    }
    function positionVouch() {
      const m = map.current, el = vouchRef.current; if (!m || !el) return;
      if (!focus) { el.classList.remove("on"); return; }
      const pt = m.project([focus.lng, focus.lat]);
      el.style.transform = `translate(${pt.x}px, ${pt.y}px)`; el.classList.add("on");
    }
    function setFocus(area: string, idx: number) {
      let s: Spot | undefined, by = "", full = false, label = "", n = 0;
      if (area === "hero") { const k = ((idx % HERO_PICKS.length) + HERO_PICKS.length) % HERO_PICKS.length; s = HERO_PICKS[k]; by = "priya"; full = true; }
      else { const a = AREAS.find((x) => x.key === area); s = a?.spots[idx]; label = a?.name ?? ""; n = a?.spots.length ?? 0; }
      const el = vouchRef.current;
      document.querySelectorAll<HTMLElement>(`[data-rowarea="${area}"]`).forEach((r) => r.classList.toggle("active", +(r.dataset.rowidx || -1) === idx));
      if (!s || !el) { focus = null; el?.classList.remove("on"); msheetRef.current?.classList.remove("on"); return; }
      const changed = area !== curArea || idx !== curIdx; curArea = area; curIdx = idx;
      el.querySelector(".vchpin-dot")!.innerHTML = glyphSVG(s.cat, "#231606", 13);
      el.querySelector(".vchpin-line")!.textContent = "“" + s.vo + "”";
      el.querySelector(".vchpin-place")!.textContent = s.name;
      el.querySelector(".vchpin-by")!.textContent = by ? "— " + by : "";
      el.classList.toggle("full", full);
      // mobile bottom sheet — one place at a time, voice as the centrepiece
      const ms = msheetRef.current;
      if (ms) { if (label) { ms.querySelector(".ms-kicker")!.textContent = label; ms.querySelector(".ms-prog")!.textContent = `${idx + 1} / ${n}`; ms.querySelector(".ms-line")!.textContent = "“" + s.vo + "”"; ms.querySelector(".ms-place")!.textContent = by ? `${s.name} · ${by}` : s.name; ms.classList.add("on"); } else ms.classList.remove("on"); }
      focus = { lng: s.lng, lat: s.lat }; positionVouch();
      if (changed) { warmUp(el.querySelector(".vchpin-dot"), full); el.querySelector(".vchpin-card")?.animate([{ opacity: 0, transform: "translateX(-6px)" }, { opacity: 1, transform: "none" }], { duration: 460, easing: "cubic-bezier(.23,1,.32,1)", fill: "both" }); }
    }
    focusRef.current = setFocus;

    // the make beat — a guide card builds itself, place by place
    function buildMake(localP: number) {
      vouchRef.current?.classList.remove("on"); msheetRef.current?.classList.remove("on"); focus = null;
      const sp = clamp((localP - 0.12) / 0.78);
      const shown = clamp(Math.ceil(sp * (DEMO.length + 0.001)), 0, DEMO.length);
      document.querySelectorAll<HTMLElement>(".makecard .grow").forEach((r) => {
        const di = +(r.dataset.mk || 0);
        r.classList.toggle("revealed", di < shown);
        r.classList.toggle("active", di === shown - 1 && shown > 0);
      });
      const cnt = document.querySelector(".makecount"); if (cnt) cnt.textContent = `${shown} place${shown === 1 ? "" : "s"}`;
      document.querySelector(".makecard")?.classList.toggle("alive", shown > 0);
    }

    function onScroll() {
      if (rafS) return;
      rafS = requestAnimationFrame(() => {
        rafS = 0; const m = map.current; if (!m) return; const vh = window.innerHeight; const y = window.scrollY;
        setScrolled(y > vh * 0.6);
        let acc = 0, i = 0, localP = 0;
        for (; i < SECS.length; i++) { const hh = SECS[i].vh * vh; if (y < acc + hh || i === SECS.length - 1) { localP = clamp((y - acc) / hh); break; } acc += hh; }
        const sec = SECS[i], prev = SECS[Math.max(0, i - 1)];
        const arrive = smooth(clamp(localP / 0.28));
        const mob = window.innerWidth < 760;
        m.jumpTo({ center: [lerp(prev.c[0], sec.c[0], arrive), lerp(prev.c[1], sec.c[1], arrive)], zoom: lerp(prev.z, sec.z, arrive), pitch: lerp(prev.p, sec.p, arrive) * (mob ? 0.4 : 1), bearing: lerp(prev.b, sec.b, arrive) * (mob ? 0.45 : 1), padding: mob && !sec.world ? { top: 0, right: 0, bottom: Math.round(vh * 0.42), left: 0 } : { top: 0, right: 0, bottom: 0, left: 0 } });
        positionVouch();
        const key = y < vh * 0.5 ? "hero" : sec.key;
        navRefs.current.forEach((nb) => nb && nb.classList.toggle("on", nb.dataset.k === key));
        document.querySelectorAll("[data-sec]").forEach((s) => s.querySelector(".panel")?.classList.toggle("shown", (s as HTMLElement).dataset.sec === key));
        document.querySelector(".finale-scrim")?.classList.toggle("on", key === "finale");
        document.querySelector(".worldwrap")?.classList.toggle("shown", key === "finale");
        document.querySelector(".walktag")?.classList.toggle("on", sec.area != null && key !== "hero");
        // focus / the guide being read or made, per beat
        if (key === "hero") setFocus("hero", heroIdx);
        else if (sec.area != null) { const nn = AREAS[sec.area].spots.length; const sp = clamp((localP - 0.28) / 0.7); setFocus(sec.key, clamp(Math.floor(sp * nn), 0, nn - 1)); }
        else if (sec.demo) buildMake(localP);
        else if (sec.world) { focus = null; vouchRef.current?.classList.remove("on"); msheetRef.current?.classList.remove("on"); }
        if (!sec.demo) document.querySelector(".makecard")?.classList.remove("alive");
        if (key !== prevKey) { prevKey = key; m.getLayer && m.getLayer("pl-ico") && applyGlow(m, (sec.demo || sec.world) ? [] : lit); }
      });
    }

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (dead || !mapEl.current || map.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m: any = new maplibregl.Map({ container: mapEl.current, style: "https://tiles.openfreemap.org/styles/dark", center: SECS[0].c, zoom: SECS[0].z, pitch: SECS[0].p, bearing: SECS[0].b, interactive: false, attributionControl: false, fadeDuration: 0, maxPitch: 60, renderWorldCopies: false });
      map.current = m;

      m.on("load", async () => {
        if (dead) return;
        try {
          for (const l of m.getStyle().layers) {
            const sl = l["source-layer"];
            if (l.type === "background") m.setPaintProperty(l.id, "background-color", "#0c0a06");
            else if (l.type === "symbol") m.setLayoutProperty(l.id, "visibility", "none");
            else if (sl === "water") m.setPaintProperty(l.id, "fill-color", "#070808");
            else if (sl === "landcover" || sl === "park" || sl === "landuse") { try { m.setPaintProperty(l.id, "fill-color", "#0e0c07"); m.setPaintProperty(l.id, "fill-opacity", 0.45); } catch { } }
            else if (sl === "building") { try { m.setPaintProperty(l.id, "fill-color", "#120e08"); m.setPaintProperty(l.id, "fill-opacity", 0.5); } catch { } }
            else if (l.type === "line") { try { m.setPaintProperty(l.id, "line-color", "#241c12"); m.setPaintProperty(l.id, "line-opacity", 0.6); } catch { } }
          }
          await Promise.all(CATS.flatMap((c) => [["lit-" + c, badgeSVG(c, true)], ["q-" + c, badgeSVG(c, false)]] as const)
            .map(async ([id, svg]) => { try { const img = await loadImg(svg); if (img && !m.hasImage(id)) m.addImage(id, img); } catch { } }));
          const feats = [
            ...PLACES.map(([, c, lng, lat]) => ({ type: "Feature" as const, properties: { c }, geometry: { type: "Point" as const, coordinates: [lng, lat] } })),
            ...AREAS.flatMap((a) => a.spots.map((s) => ({ type: "Feature" as const, properties: { c: CATI[s.cat] }, geometry: { type: "Point" as const, coordinates: [s.lng, s.lat] } }))),
          ];
          m.addSource("places", { type: "geojson", data: { type: "FeatureCollection", features: feats } });
          m.addLayer({ id: "pl-glow", type: "circle", source: "places", filter: ["in", ["get", "c"], ["literal", lit]], paint: { "circle-color": "#D69A4C", "circle-blur": 1.6, "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 6, 15, 15], "circle-opacity": 0, "circle-opacity-transition": { duration: 1400, delay: 500 } } });
          m.addLayer({ id: "pl-ico", type: "symbol", source: "places", layout: { "icon-image": iconExpr(lit), "icon-size": ["interpolate", ["linear"], ["zoom"], 10, 0.24, 13, 0.4, 15, 0.56], "icon-allow-overlap": false, "icon-padding": 9 }, paint: { "icon-opacity": 0, "icon-opacity-transition": { duration: 1300, delay: 250 } } });
          applyGlow(m, lit);
          setReady(true);
          requestAnimationFrame(() => { m.setPaintProperty("pl-ico", "icon-opacity", 1); m.setPaintProperty("pl-glow", "circle-opacity", ["interpolate", ["linear"], ["zoom"], 10, 0.1, 13, 0.15, 16, 0.2]); });
          setTimeout(() => { if (!dead && window.scrollY < window.innerHeight * 0.5) setFocus("hero", heroIdx); }, 950);
          onScroll();
          const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=12.97&longitude=77.59&current=weather_code,temperature_2m");
          const cur = (await r.json())?.current; const code = cur?.weather_code ?? null; const temp = cur?.temperature_2m ?? null;
          if (!dead) { setRain(code != null && [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)); lit = contextLit(new Date(), code, temp); if (prevKey !== "make" && prevKey !== "finale") applyGlow(m, lit); }
        } catch { /* never leave the map half-built on a transient error */ }
      });

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    })();

    // hero is alive — the focus walks Priya's signature picks, never one static pin
    const heroTimer = window.setInterval(() => {
      if (dead) return;
      if (window.scrollY < window.innerHeight * 0.5 && map.current?.getLayer?.("pl-ico")) { heroIdx++; setFocus("hero", heroIdx); }
    }, 3400);

    return () => { dead = true; cancelAnimationFrame(rafS); clearInterval(heroTimer); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); try { map.current?.remove?.(); } catch { } map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jump = (key: string) => { let acc = 0; for (const s of SECS) { if (s.key === key) break; acc += s.vh * window.innerHeight; } window.scrollTo({ top: acc + 4, behavior: "smooth" }); };

  return (
    <main>
      <style>{`
        :root{--e-out:cubic-bezier(.23,1,.32,1);}
        main{background:#0c0a06;min-height:100dvh;}
        .map-stage{position:fixed;inset:0;z-index:0;opacity:0;filter:blur(14px);transform:scale(1.05);transition:opacity 1.2s var(--e-out),filter 1.4s var(--e-out),transform 1.8s var(--e-out);}
        .map-stage.lit{opacity:1;filter:blur(0);transform:none;}
        .maplibregl-map{position:absolute;inset:0;} .maplibregl-canvas{outline:none;}
        .map-vig{position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(125% 105% at 50% 42%,transparent 36%,rgba(5,3,1,.4) 80%,rgba(3,2,1,.9) 100%);}
        .scrim-left{position:fixed;inset:0;z-index:2;pointer-events:none;background:linear-gradient(96deg,rgba(5,3,1,.9) 0%,rgba(5,3,1,.66) 25%,rgba(5,3,1,.16) 47%,transparent 62%);}
        .finale-scrim{position:fixed;inset:0;z-index:2;pointer-events:none;opacity:0;transition:opacity .8s var(--e-out);background:radial-gradient(80% 74% at 50% 50%,rgba(5,3,1,.92) 0%,rgba(5,3,1,.6) 52%,rgba(5,3,1,.2) 86%);}
        .finale-scrim.on{opacity:1;}
        .rain{position:fixed;inset:0;z-index:3;pointer-events:none;overflow:hidden;}
        .rain i{position:absolute;top:-12%;width:1.1px;border-radius:1px;background:linear-gradient(transparent,rgba(220,210,185,.4));animation:vrain linear infinite;}
        @keyframes vrain{to{transform:translateY(122vh) skewX(-8deg);}}
        /* THE VOUCH ON THE MAP — a place + a note + a name (the active card, pinned) */
        .vchpin{position:fixed;left:0;top:0;z-index:4;pointer-events:none;opacity:0;transition:opacity .45s var(--e-out);will-change:transform;}
        .vchpin.on{opacity:1;}
        .vchpin-inner{display:flex;align-items:center;gap:11px;transform:translate(-15px,-15px);}
        .vchpin-dot{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#E6A23E;box-shadow:0 0 0 4px rgba(230,162,62,.15),0 0 24px 6px rgba(230,162,62,.85),0 7px 16px rgba(0,0,0,.5);}
        .vchpin-card{max-width:min(64vw,300px);}
        .vchpin-line{display:none;font-style:italic;font-size:1.02rem;line-height:1.32;color:#F6EAD2;text-shadow:0 2px 14px rgba(0,0,0,.95);margin:0;}
        .vchpin.full .vchpin-line{display:block;}
        .vchpin-place{display:block;font-weight:600;font-size:.82rem;letter-spacing:-.01em;color:var(--ink);margin:0;}
        .vchpin-by{display:none;font-size:.78rem;color:var(--muted);margin:2px 0 0;}
        .vchpin.full .vchpin-place{margin-top:6px;color:var(--accent);}
        .vchpin.full .vchpin-by{display:block;}
        .vchpin:not(.full) .vchpin-place{background:rgba(11,9,5,.9);border:1px solid var(--accent-line);border-radius:999px;padding:4px 12px;backdrop-filter:blur(8px);box-shadow:0 12px 28px -16px rgba(0,0,0,.95);}
        @media(max-width:760px){.vchpin-line{display:block !important;}.vchpin:not(.full) .vchpin-place{background:none;border:none;padding:0;margin-top:5px;color:var(--accent);}}
        /* persistent way-in */
        .cta-pill{position:fixed;top:24px;right:26px;z-index:8;display:inline-flex;align-items:center;gap:7px;font-size:.82rem;font-weight:600;color:var(--accent-ink);background:linear-gradient(140deg,var(--accent-2),var(--accent));border-radius:999px;padding:9px 16px;text-decoration:none;box-shadow:0 10px 30px -10px rgba(230,162,62,.6);opacity:0;transform:translateY(-8px);pointer-events:none;transition:opacity .5s var(--e-out),transform .5s var(--e-out);}
        .cta-pill.on{opacity:1;transform:none;pointer-events:auto;}
        .cta-pill:active{transform:scale(.97);}
        /* the demo, tagged as an example */
        .walktag{position:fixed;top:26px;left:50%;transform:translateX(-50%) translateY(-8px);z-index:7;font-size:.72rem;letter-spacing:.06em;color:var(--muted);background:rgba(12,10,6,.6);border:1px solid var(--line-2);border-radius:999px;padding:6px 13px;backdrop-filter:blur(8px);opacity:0;transition:opacity .5s var(--e-out),transform .5s var(--e-out);pointer-events:none;}
        .walktag.on{opacity:1;transform:translateX(-50%);}
        .walktag b{color:var(--accent);font-weight:600;}
        .chap{position:relative;z-index:5;pointer-events:none;}
        .chap.hero{min-height:100dvh;display:flex;align-items:center;}
        .stick{position:sticky;top:0;height:100dvh;display:flex;align-items:center;}
        .panel{margin:0 0 0 clamp(28px,7vw,120px);max-width:480px;pointer-events:auto;}
        .reveal{opacity:0;transform:translateY(22px);transition:opacity .8s var(--e-out),transform .8s var(--e-out);}
        .panel.shown .reveal{opacity:1;transform:none;}
        .reveal.d1{transition-delay:.06s;} .reveal.d2{transition-delay:.12s;} .reveal.d3{transition-delay:.18s;} .reveal.d4{transition-delay:.24s;}
        .eyebrow{font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin:0;}
        h1.hero-h{font-weight:600;font-size:clamp(2.2rem,4.4vw,3.3rem);line-height:1.04;letter-spacing:-.03em;color:var(--ink);margin:14px 0 0;max-width:18ch;text-shadow:0 2px 26px rgba(0,0,0,.9);}
        .clarity{font-size:1.06rem;line-height:1.5;color:var(--muted);margin:16px 0 0;max-width:36ch;}
        .clarity b{color:var(--ink);font-weight:600;}
        .hero-cta{margin-top:26px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
        .btn-primary{display:inline-flex;align-items:center;gap:8px;font-size:.92rem;font-weight:600;color:var(--accent-ink);background:linear-gradient(140deg,var(--accent-2),var(--accent));border:none;border-radius:var(--r-pill);padding:12px 20px;text-decoration:none;box-shadow:0 14px 36px -12px rgba(230,162,62,.55);transition:transform .14s var(--e-out);}
        .btn-primary:active{transform:scale(.97);}
        .btn-ghost{font-size:.88rem;color:var(--muted);text-decoration:none;border-bottom:1px solid transparent;transition:color .2s,border-color .2s;}
        .btn-ghost:hover{color:var(--ink);border-color:var(--line-2);}
        .cue{font-size:.78rem;color:var(--faint);margin-top:22px;display:flex;align-items:center;gap:8px;}
        .cue span{display:inline-block;width:34px;height:1px;background:linear-gradient(90deg,var(--accent),transparent);}
        .big{font-size:clamp(1.4rem,2.7vw,1.9rem);font-weight:600;color:var(--ink);margin:16px 0 0;letter-spacing:-.02em;}
        /* THE GUIDE CARD — the artifact. used in the walk (Priya's picks) and make (yours). */
        .guidecard{margin-top:20px;width:min(380px,100%);background:linear-gradient(168deg,rgba(28,21,12,.94),rgba(15,11,7,.95));border:1px solid rgba(243,235,217,.1);border-radius:18px;padding:6px 6px 8px;backdrop-filter:blur(12px);box-shadow:0 34px 80px -36px rgba(0,0,0,.9),0 2px 0 rgba(243,235,217,.04) inset;}
        .gc-head{display:flex;align-items:center;gap:10px;padding:11px 12px 12px;}
        .gc-mono{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:.78rem;color:var(--accent-ink);background:linear-gradient(140deg,var(--accent-2),var(--accent));}
        .gc-head b{display:block;font-weight:600;font-size:.9rem;color:var(--ink);letter-spacing:-.01em;}
        .gc-head i{display:block;font-style:normal;font-size:.72rem;color:var(--faint);margin-top:1px;}
        .grows{display:flex;flex-direction:column;}
        .grow{display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:12px;position:relative;transition:background .3s var(--e-out);}
        .grow-thumb{flex:none;width:38px;height:38px;border-radius:10px;display:grid;place-items:center;border:1px solid rgba(243,235,217,.08);}
        .grow-b{min-width:0;}
        .grow-place{display:block;font-weight:600;font-size:.92rem;color:var(--ink);letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .grow-note{display:block;font-style:italic;font-size:.8rem;line-height:1.35;color:var(--muted);margin-top:2px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
        .grow.active{background:linear-gradient(100deg,rgba(230,162,62,.16),rgba(230,162,62,.04));}
        .grow.active .grow-place{color:var(--accent);}
        .grow.active::before{content:"";position:absolute;left:0;top:8px;bottom:8px;width:3px;border-radius:3px;background:var(--accent);box-shadow:0 0 10px 1px rgba(230,162,62,.6);}
        /* make: rows hidden until the guide is built, one by one */
        .makecard .grow{opacity:0;transform:translateY(10px);transition:opacity .55s var(--e-out),transform .55s var(--e-out),background .3s var(--e-out);}
        .makecard .grow.revealed{opacity:1;transform:none;}
        .makecard .gc-mono{background:linear-gradient(140deg,#3a2c18,#241a0c);color:var(--faint);transition:background .5s var(--e-out),color .5s var(--e-out);}
        .makecard.alive .gc-mono{background:linear-gradient(140deg,var(--accent-2),var(--accent));color:var(--accent-ink);}
        .chaprail{position:fixed;right:26px;top:50%;transform:translateY(-50%);z-index:7;display:flex;flex-direction:column;gap:14px;}
        .chaprail button{all:unset;cursor:pointer;display:flex;align-items:center;gap:10px;justify-content:flex-end;color:var(--faint);transition:color .3s var(--e-out);}
        .chaprail button .lbl{font-size:.74rem;opacity:0;transform:translateX(6px);transition:opacity .3s var(--e-out),transform .3s var(--e-out);white-space:nowrap;}
        .chaprail button:hover{color:var(--ink);} .chaprail button:hover .lbl{opacity:1;transform:none;}
        .chaprail button .pip{width:7px;height:7px;border-radius:50%;border:1px solid var(--faint);transition:transform .35s var(--e-out),background .35s var(--e-out),border-color .35s var(--e-out),box-shadow .35s var(--e-out);}
        .chaprail button.on{color:var(--accent);} .chaprail button.on .lbl{opacity:1;transform:none;color:var(--muted);}
        .chaprail button.on .pip{background:var(--accent);border-color:var(--accent);transform:scale(1.25);box-shadow:0 0 12px 3px rgba(230,162,62,.5);}
        /* THE WORLD OF GUIDES — a wall of real guide cards */
        .chap.finale{height:auto;}
        .finale-stick{position:sticky;top:0;min-height:100dvh;display:flex;align-items:center;justify-content:center;z-index:5;}
        .worldwrap{pointer-events:auto;width:min(960px,92vw);margin:0 auto;text-align:center;padding:24px 0;}
        .worldwrap .rf{opacity:0;transform:translateY(18px);transition:opacity .7s var(--e-out),transform .7s var(--e-out);}
        .worldwrap.shown .rf{opacity:1;transform:none;}
        .worldwrap .rf.r2{transition-delay:.08s;} .worldwrap .rf.r3{transition-delay:.16s;}
        .wsub{font-size:1.04rem;line-height:1.6;color:var(--muted);margin:16px auto 0;max-width:46ch;}
        .wsub b{color:var(--ink);font-weight:600;}
        .wgrid{margin:30px auto 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(158px,1fr));gap:14px;}
        .gcard{position:relative;display:block;text-align:left;border-radius:15px;overflow:hidden;text-decoration:none;background:linear-gradient(168deg,#1a140c,#100c07);border:1px solid rgba(243,235,217,.1);box-shadow:0 26px 54px -30px rgba(0,0,0,.9);opacity:0;transform:translateY(22px) scale(.96);transition:opacity .6s var(--e-out),transform .6s var(--e-out),border-color .25s,box-shadow .25s;}
        .worldwrap.shown .gcard{opacity:1;transform:none;}
        .worldwrap.shown .gcard:nth-child(1){transition-delay:.10s} .worldwrap.shown .gcard:nth-child(2){transition-delay:.16s} .worldwrap.shown .gcard:nth-child(3){transition-delay:.22s} .worldwrap.shown .gcard:nth-child(4){transition-delay:.28s} .worldwrap.shown .gcard:nth-child(5){transition-delay:.34s} .worldwrap.shown .gcard:nth-child(6){transition-delay:.40s} .worldwrap.shown .gcard:nth-child(7){transition-delay:.46s} .worldwrap.shown .gcard:nth-child(8){transition-delay:.52s} .worldwrap.shown .gcard:nth-child(9){transition-delay:.58s}
        a.gcard:hover{border-color:var(--accent-line);box-shadow:0 30px 60px -28px rgba(0,0,0,.95),0 0 0 1px var(--accent-line);transform:translateY(-3px);}
        .gcard-cover{height:92px;position:relative;}
        .gcard-cover::after{content:"";position:absolute;inset:0;background:linear-gradient(178deg,rgba(20,14,7,.05) 30%,rgba(15,11,7,.9));}
        .gcard-pin{position:absolute;top:50%;left:50%;width:13px;height:13px;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle at 38% 32%,#FDEBC0,#E6A23E 64%);box-shadow:0 0 16px 4px rgba(230,162,62,.6),0 0 0 4px rgba(230,162,62,.16);z-index:1;}
        .gcard-n{position:absolute;top:9px;right:9px;z-index:2;font-size:.62rem;font-weight:600;color:var(--ink);background:rgba(12,9,5,.66);border:1px solid var(--line-2);border-radius:999px;padding:2px 8px;backdrop-filter:blur(3px);}
        .gcard-body{padding:11px 13px 13px;}
        .gcard-title{font-weight:600;font-size:.88rem;line-height:1.28;color:var(--ink);letter-spacing:-.01em;}
        .gcard-meta{display:flex;align-items:center;gap:8px;margin-top:11px;}
        .gcard-mono{flex:none;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:.6rem;color:var(--accent-ink);background:linear-gradient(140deg,var(--accent-2),var(--accent));}
        .gcard-who{font-size:.74rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .gcard-who b{color:var(--ink);font-weight:600;}
        .gcard.ghost{border-style:dashed;border-color:var(--accent-line);background:rgba(230,162,62,.05);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:178px;text-align:center;}
        .gcard.ghost .gp{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;border:1.5px solid var(--accent);color:var(--accent);font-size:1.3rem;font-weight:400;line-height:1;}
        .gcard.ghost .gt{font-weight:600;font-size:.9rem;color:var(--ink);}
        .gcard.ghost .gs{font-size:.74rem;color:var(--accent);}
        .wcta{margin-top:30px;display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;}
        @media(max-width:760px){
          .chaprail{display:none;}
          .cta-pill{top:16px;bottom:auto;right:14px;left:auto;transform:translateY(-8px);padding:8px 14px;font-size:.78rem;box-shadow:0 8px 22px -8px rgba(230,162,62,.55);} .cta-pill.on{transform:none;}
          .walktag{top:14px;}
          .scrim-left{background:linear-gradient(0deg,rgba(6,4,2,.95) 0%,rgba(6,4,2,.6) 28%,transparent 54%);}
          .chap.hero{align-items:flex-end;} .stick{align-items:flex-end;}
          .panel{margin:0;max-width:none;width:100%;}
          .chap.hero .panel,.chap.make .panel{padding:0 20px calc(env(safe-area-inset-bottom,16px) + 24px);}
          h1.hero-h{font-size:2.05rem;line-height:1.06;max-width:none;margin-top:10px;}
          .clarity{font-size:1rem;margin-top:12px;max-width:none;}
          .hero-cta{margin-top:18px;} .cue{display:none;}
          /* walk uses the bottom sheet on mobile; make keeps its building card */
          .chap:not(.hero):not(.finale):not(.make) .panel{display:none;}
          .guidecard{width:100%;margin-top:16px;}
          .makecard .grow-note{-webkit-line-clamp:1;}
          .finale-stick{position:static;min-height:auto;padding:74px 0;}
          .worldwrap{width:100%;padding:0 16px;}
          .wgrid{grid-template-columns:repeat(2,1fr);gap:11px;margin-top:24px;}
          .gcard-cover{height:74px;} .gcard-title{font-size:.8rem;} .gcard.ghost{min-height:150px;}
          .finale h2{font-size:2.2rem !important;}
          .vchpin-card{display:none !important;} .vchpin-dot{width:24px;height:24px;}
          .msheet{display:block;position:fixed;left:0;right:0;bottom:0;z-index:6;padding:22px 22px calc(env(safe-area-inset-bottom,16px) + 20px);pointer-events:none;background:linear-gradient(180deg,transparent,rgba(7,5,2,.8) 22%,rgba(7,5,2,.97) 58%);opacity:0;transform:translateY(14px);transition:opacity .5s var(--e-out),transform .5s var(--e-out);}
          .msheet.on{opacity:1;transform:none;}
          .ms-top{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:11px;}
          .ms-kicker{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);}
          .ms-prog{font-size:.72rem;color:var(--faint);font-variant-numeric:tabular-nums;letter-spacing:.05em;}
          .ms-line{font-style:italic;font-size:1.28rem;line-height:1.34;color:#F8EDD6;margin:0;text-shadow:0 2px 16px rgba(0,0,0,.95);}
          .ms-place{font-weight:600;font-size:.9rem;color:var(--accent);margin:11px 0 0;}
        }
        .msheet{display:none;}
        @media(prefers-reduced-motion:reduce){.reveal,.worldwrap .rf,.gcard,.makecard .grow{opacity:1 !important;transform:none !important;transition:none;}.rain{display:none;}.map-stage{filter:none;transform:none;}}
      `}</style>

      <div className={"map-stage" + (ready ? " lit" : "")}><div ref={mapEl} className="maplibregl-map" /></div>
      <div className="map-vig" />
      <div className="scrim-left" />
      <div className="finale-scrim" />
      {rain && <div className="rain" aria-hidden="true">{Array.from({ length: 60 }).map((_, i) => <i key={i} style={{ left: `${(i * 137) % 100}%`, height: `${42 + (i * 53) % 48}px`, animationDuration: `${0.55 + ((i * 31) % 45) / 100}s`, animationDelay: `${-((i * 47) % 100) / 100}s`, opacity: 0.14 + ((i * 23) % 22) / 100 }} />)}</div>}

      <div ref={vouchRef} className="vchpin"><div className="vchpin-inner"><span className="vchpin-dot" /><div className="vchpin-card"><p className="vchpin-line" /><p className="vchpin-place" /><p className="vchpin-by" /></div></div></div>
      <div ref={msheetRef} className="msheet"><div className="ms-top"><span className="ms-kicker" /><span className="ms-prog" /></div><p className="ms-line" /><p className="ms-place" /></div>

      <div className="walktag"><span>a guide · <b>by Priya</b> · Bengaluru</span></div>
      <a className={"cta-pill" + (scrolled ? " on" : "")} href="/v3/new">make a guide →</a>
      <nav className="chaprail" aria-label="chapters">
        {SECS.map((n, i) => <button key={n.key} ref={(el) => { navRefs.current[i] = el; }} data-k={n.key} onClick={() => jump(n.key)}><span className="lbl">{n.key === "hero" ? "the city" : n.key === "make" ? "your turn" : n.key === "finale" ? "the world" : AREAS[n.area!]?.name}</span><span className="pip" /></button>)}
      </nav>
      <div style={{ position: "fixed", zIndex: 8, top: 26, left: 28 }}><span style={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--ink)", letterSpacing: "-0.02em" }}>vouch<span style={{ color: "var(--accent)" }}>.</span></span></div>

      {/* I — what it is */}
      <section className="chap hero" data-sec="hero">
        <div className="panel" style={{ maxWidth: 620 }}>
          <p className="reveal eyebrow">vouch</p>
          <h1 className="reveal d1 hero-h">Create a guide to the places you love — and share it with the world.</h1>
          <p className="reveal d2 clarity">Your places, your notes, your name on each one. Here&apos;s a real one — scroll it.</p>
          <div className="reveal d3 hero-cta"><a className="btn-primary" href="/v3/new">Make a guide — free, 2 min</a></div>
          <p className="reveal d4 cue"><span /> scroll — here&apos;s one</p>
        </div>
      </section>

      {/* II — see one: a real guide (Priya's), her picks as cards on the map */}
      {AREAS.map((a, ai) => (
        <section key={a.key} className="chap" data-sec={a.key} style={{ height: `${SECS[ai + 1].vh * 100}vh` }}>
          <div className="stick">
            <div className="panel">
              <p className="reveal eyebrow" style={{ fontSize: "0.74rem", letterSpacing: "0.14em" }}>{a.kicker}</p>
              <h2 className="reveal d1" style={{ fontWeight: 600, fontSize: "clamp(2.1rem,4.6vw,3.1rem)", lineHeight: 1.01, letterSpacing: "-0.03em", color: "var(--ink)", margin: "8px 0 0", textShadow: "0 2px 26px rgba(0,0,0,.9)" }}>{a.name}.</h2>
              <p className="reveal d1" style={{ fontSize: "1.02rem", color: "var(--muted)", margin: "10px 0 0", maxWidth: "32ch" }}>{a.tag}</p>
              <div className="reveal d2 guidecard">
                <div className="gc-head"><span className="gc-mono">PR</span><span><b>Priya&apos;s picks</b><i>{a.flavor}</i></span></div>
                <div className="grows">
                  {a.spots.map((s, i) => (
                    <div className="grow" data-rowarea={a.key} data-rowidx={i} key={s.name}>
                      <span className="grow-thumb" style={thumbStyle(s.cat)} dangerouslySetInnerHTML={{ __html: glyphSVG(s.cat, TINT[s.cat] || "#CBA24B", 17) }} />
                      <span className="grow-b"><span className="grow-place">{s.name}</span><span className="grow-note">“{s.vo}”</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* III — make yours: a guide card builds itself, place by place */}
      <section className="chap make" data-sec="make" style={{ height: `${SECS[5].vh * 100}vh` }}>
        <div className="stick">
          <div className="panel">
            <p className="reveal eyebrow">your turn</p>
            <h2 className="reveal d1" style={{ fontWeight: 600, fontSize: "clamp(2.1rem,4.6vw,3.1rem)", lineHeight: 1.02, letterSpacing: "-0.03em", color: "var(--ink)", margin: "8px 0 0", textShadow: "0 2px 26px rgba(0,0,0,.9)" }}>Yours is still empty.</h2>
            <p className="reveal d1 clarity">Add a place you love. Say why, in a line. Put your name on it.</p>
            <div className="reveal d2 guidecard makecard">
              <div className="gc-head"><span className="gc-mono">YO</span><span><b>your guide</b><i><span className="makecount">0 places</span> · by you</i></span></div>
              <div className="grows">
                {DEMO.map((s, i) => (
                  <div className="grow" data-mk={i} key={s.name}>
                    <span className="grow-thumb" style={thumbStyle(s.cat)} dangerouslySetInnerHTML={{ __html: glyphSVG(s.cat, TINT[s.cat] || "#CBA24B", 17) }} />
                    <span className="grow-b"><span className="grow-place">{s.name}</span><span className="grow-note">“{s.vo}”</span></span>
                  </div>
                ))}
              </div>
            </div>
            <p className="reveal d3 big">That&apos;s a guide.</p>
          </div>
        </div>
      </section>

      {/* IV — share it with the world: a wall of real guides */}
      <section className="chap finale" data-sec="finale" style={{ minHeight: `${SECS[6].vh * 100}vh` }}>
        <div className="finale-stick">
          <div className="worldwrap">
            <p className="rf eyebrow" style={{ color: "var(--accent)" }}>a world of guides</p>
            <h2 className="rf" style={{ fontWeight: 600, fontSize: "clamp(2.1rem,4.8vw,3.4rem)", lineHeight: 1.04, letterSpacing: "-0.025em", color: "var(--ink)", margin: "12px 0 0", textShadow: "0 2px 26px rgba(0,0,0,.9)" }}>Yours is the one that&apos;s missing.</h2>
            <p className="rf r2 wsub">People are sharing the places they love — city by city. Add the one <b>you</b> know by heart.</p>
            <div className="wgrid">
              {WORLD.map((g) => (
                <div className="gcard" key={g.city}>
                  <div className="gcard-cover" style={coverStyle(g.cat, g.lat, g.lng, 11)}><span className="gcard-pin" /><span className="gcard-n">{g.n} places</span></div>
                  <div className="gcard-body">
                    <div className="gcard-title">{g.title}</div>
                    <div className="gcard-meta"><span className="gcard-mono">{g.ini}</span><span className="gcard-who"><b>{g.name}</b> · {g.city}</span></div>
                  </div>
                </div>
              ))}
              <a className="gcard ghost" href="/v3/new"><span className="gp">+</span><span className="gt">your guide</span><span className="gs">start one →</span></a>
            </div>
            <div className="rf r3 wcta">
              <a className="btn-primary" href="/v3/new">Create a guide — free, 2 min</a>
              <a className="btn-ghost" href="/v3/g/priya">open Priya&apos;s →</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
