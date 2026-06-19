"use client";
import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { CATS, PLACES } from "./places";

/* The landing — Priya's Bengaluru, the product made live.
   One signature object: the VOUCH (a place + her voice + her name). One signature
   motion: the WARM-UP (an amber bloom + a breath), reused on wake, on focus, on the
   call to act. Underneath, an always-on context engine reads the city's real time,
   weather and season and silently warms the right places. You walk her picks by
   scrolling; each surfaces in turn. Then: light up yours. */

type Spot = { name: string; cat: string; vo: string; lng: number; lat: number };
type Area = { key: string; kicker: string; name: string; tag: string; flavor: string; spots: Spot[] };

const CATI: Record<string, number> = { coffee: 0, bar: 1, dosa: 2, pizza: 3, burger: 4, dessert: 5, chinese: 6, food: 7 };
const HERO_PICK: Spot = { name: "Koshy's", cat: "coffee", vo: "a window seat. two hours. nowhere to be.", lng: 77.6010, lat: 12.9738 };

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

// sections, in vh units — area sections are tall so you WALK the picks by scrolling
type Sec = { key: string; vh: number; c: [number, number]; z: number; p: number; b: number; area?: number };
const SECS: Sec[] = [
  { key: "hero", vh: 1.0, c: [77.600, 12.962], z: 10.7, p: 0, b: 0 },
  { key: "koramangala", vh: 1.9, c: [77.6235, 12.9340], z: 14.4, p: 36, b: -12, area: 0 },
  { key: "indiranagar", vh: 1.9, c: [77.6400, 12.9745], z: 14.4, p: 36, b: 10, area: 1 },
  { key: "basavanagudi", vh: 1.9, c: [77.5745, 12.9465], z: 14.2, p: 32, b: -8, area: 2 },
  { key: "golden", vh: 1.7, c: [77.6080, 13.0010], z: 12.6, p: 24, b: 6, area: 3 },
  { key: "finale", vh: 1.15, c: [77.600, 12.980], z: 10.9, p: 0, b: 0 },
];
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

/* The intelligence — always reading Bengaluru's real time, season, and weather, and
   warming the categories that fit the moment. Silent: the only output is which
   places glow. (codes: open-meteo WMO weather codes.) */
function contextLit(now: Date, code: number | null, temp: number | null): number[] {
  const h = now.getHours(), day = now.getDay(), mon = now.getMonth();
  const wkndEve = day === 5 || day === 6;
  const rain = code != null && [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);
  const cold = temp != null && temp < 19;                 // a Bengaluru-cool morning / dec–feb
  const hot = temp != null && temp >= 31;                  // peak summer afternoon
  const winter = mon === 11 || mon === 0 || mon === 1;
  if (rain) return [0, 2];                                  // chai, hot tiffin, pakoda
  if (h >= 5 && h < 11) return cold || winter ? [0, 2] : [0];   // morning — coffee (+ warm tiffin if cold)
  if (h >= 11 && h < 16) return hot ? [5, 0] : [2, 7];          // midday — lunch, or cool things when it's blazing
  if (h >= 16 && h < 20) return wkndEve ? [1, 5] : [7, 1];      // evening — out, or dinner
  return wkndEve ? [1] : [1, 7];                            // late — bars
}

// the signature motion: a bloom + a breath. one curve, reused everywhere.
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
  const focusRef = useRef<((area: string, idx: number) => void) | null>(null);
  const [ready, setReady] = useState(false);
  const [rain, setRain] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let dead = false; let rafS = 0; let prevKey = ""; let curArea = ""; let curIdx = -1;
    let lit = contextLit(new Date(), null, null);
    let focus: { lng: number; lat: number } | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function applyGlow(m: any, g: number[], finale = false) {
      if (!m.getLayer("pl-ico")) return;
      m.setLayoutProperty("pl-ico", "icon-image", iconExpr(g));
      m.setFilter("pl-glow", ["in", ["get", "c"], ["literal", g]]);
      m.setPaintProperty("pl-glow", "circle-opacity", ["interpolate", ["linear"], ["zoom"], 10, finale ? 0.16 : 0.1, 13, finale ? 0.22 : 0.15, 16, 0.2]);
    }
    function positionVouch() {
      const m = map.current, el = vouchRef.current; if (!m || !el) return;
      if (!focus) { el.classList.remove("on"); return; }
      const pt = m.project([focus.lng, focus.lat]);
      el.style.transform = `translate(${pt.x}px, ${pt.y}px)`; el.classList.add("on");
    }
    function setFocus(area: string, idx: number) {
      const s = area === "hero" ? HERO_PICK : AREAS.find((a) => a.key === area)?.spots[idx];
      const el = vouchRef.current;
      document.querySelectorAll<HTMLElement>(`[data-rowarea="${area}"]`).forEach((r) => r.classList.toggle("active", +(r.dataset.rowidx || -1) === idx));
      if (!s || !el) { focus = null; el?.classList.remove("on"); return; }
      const changed = area !== curArea || idx !== curIdx; curArea = area; curIdx = idx;
      el.querySelector(".vchpin-dot")!.innerHTML = glyphSVG(s.cat, "#231606", 13);
      el.querySelector(".vchpin-line")!.textContent = "“" + s.vo + "”";
      el.querySelector(".vchpin-place")!.textContent = s.name;
      el.classList.toggle("full", area === "hero");
      focus = { lng: s.lng, lat: s.lat }; positionVouch();
      if (changed) { warmUp(el.querySelector(".vchpin-dot"), area === "hero"); el.querySelector(".vchpin-card")?.animate([{ opacity: 0, transform: "translateX(-6px)" }, { opacity: 1, transform: "none" }], { duration: 460, easing: "cubic-bezier(.23,1,.32,1)", fill: "both" }); }
    }
    focusRef.current = setFocus;

    function onScroll() {
      if (rafS) return;
      rafS = requestAnimationFrame(() => {
        rafS = 0; const m = map.current; if (!m) return; const vh = window.innerHeight; const y = window.scrollY;
        setScrolled(y > vh * 0.6);
        // find current section + local progress across variable heights
        let acc = 0, i = 0, localP = 0;
        for (; i < SECS.length; i++) { const hh = SECS[i].vh * vh; if (y < acc + hh || i === SECS.length - 1) { localP = clamp((y - acc) / hh); break; } acc += hh; }
        const sec = SECS[i], prev = SECS[Math.max(0, i - 1)];
        // arrive in the first 28% of a section, then hold — fly-in, then walk
        const arrive = smooth(clamp(localP / 0.28));
        m.jumpTo({ center: [lerp(prev.c[0], sec.c[0], arrive), lerp(prev.c[1], sec.c[1], arrive)], zoom: lerp(prev.z, sec.z, arrive), pitch: lerp(prev.p, sec.p, arrive), bearing: lerp(prev.b, sec.b, arrive) });
        positionVouch();
        const key = y < vh * 0.5 ? "hero" : sec.key;
        navRefs.current.forEach((nb) => nb && nb.classList.toggle("on", nb.dataset.k === key));
        document.querySelectorAll("[data-sec]").forEach((s) => s.querySelector(".panel")?.classList.toggle("shown", (s as HTMLElement).dataset.sec === key));
        document.querySelector(".finale-scrim")?.classList.toggle("on", key === "finale");
        // focus: hero leads with Koshy's; in a neighbourhood, scroll WALKS the picks
        if (key === "hero") setFocus("hero", 0);
        else if (sec.area != null) { const n = AREAS[sec.area].spots.length; const sp = clamp((localP - 0.28) / 0.7); setFocus(sec.key, clamp(Math.floor(sp * n), 0, n - 1)); }
        else if (key === "finale") { focus = null; vouchRef.current?.classList.remove("on"); }
        if (key !== prevKey) { prevKey = key; m.getLayer && m.getLayer("pl-ico") && applyGlow(m, key === "finale" ? [0, 1, 2, 3, 4, 5, 6, 7] : lit, key === "finale"); }
      });
    }

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (dead || !mapEl.current || map.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m: any = new maplibregl.Map({ container: mapEl.current, style: "https://tiles.openfreemap.org/styles/dark", center: SECS[0].c, zoom: SECS[0].z, pitch: SECS[0].p, bearing: SECS[0].b, interactive: false, attributionControl: false, fadeDuration: 0, maxPitch: 60 });
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
        // ── the city wakes: stage reveals, places warm in, then her first vouch ──
        setReady(true);
        requestAnimationFrame(() => { m.setPaintProperty("pl-ico", "icon-opacity", 1); m.setPaintProperty("pl-glow", "circle-opacity", ["interpolate", ["linear"], ["zoom"], 10, 0.1, 13, 0.15, 16, 0.2]); });
        setTimeout(() => { if (!dead && window.scrollY < window.innerHeight * 0.5) setFocus("hero", 0); }, 950);
        onScroll();

        try {
          const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=12.97&longitude=77.59&current=weather_code,temperature_2m");
          const cur = (await r.json())?.current; const code = cur?.weather_code ?? null; const temp = cur?.temperature_2m ?? null;
          if (!dead) { setRain(code != null && [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)); lit = contextLit(new Date(), code, temp); if (prevKey !== "finale") applyGlow(m, lit); }
        } catch { }
      });

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    })();

    return () => { dead = true; cancelAnimationFrame(rafS); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); try { map.current?.remove?.(); } catch { } map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jump = (key: string) => { let acc = 0; for (const s of SECS) { if (s.key === key) break; acc += s.vh * window.innerHeight; } window.scrollTo({ top: acc + 4, behavior: "smooth" }); };
  const share = async () => {
    const data = { title: "Priya's Bengaluru · Vouch", text: "the places i'd actually take you — in my voice, with my name on them.", url: typeof window !== "undefined" ? window.location.href : "" };
    try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.url); } } catch { }
  };

  return (
    <main>
      <style>{`
        :root{--e-out:cubic-bezier(.23,1,.32,1);}
        .map-stage{position:fixed;inset:0;z-index:0;opacity:0;filter:blur(14px);transform:scale(1.05);transition:opacity 1.2s var(--e-out),filter 1.4s var(--e-out),transform 1.8s var(--e-out);}
        .map-stage.lit{opacity:1;filter:blur(0);transform:none;}
        .maplibregl-map{position:absolute;inset:0;} .maplibregl-canvas{outline:none;}
        .map-vig{position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(125% 105% at 50% 42%,transparent 36%,rgba(5,3,1,.4) 80%,rgba(3,2,1,.9) 100%);}
        .scrim-left{position:fixed;inset:0;z-index:2;pointer-events:none;background:linear-gradient(96deg,rgba(5,3,1,.9) 0%,rgba(5,3,1,.66) 25%,rgba(5,3,1,.16) 47%,transparent 62%);}
        .finale-scrim{position:fixed;inset:0;z-index:2;pointer-events:none;opacity:0;transition:opacity .8s var(--e-out);background:radial-gradient(64% 58% at 50% 50%,rgba(5,3,1,.92) 0%,rgba(5,3,1,.6) 44%,transparent 78%);}
        .finale-scrim.on{opacity:1;}
        .rain{position:fixed;inset:0;z-index:3;pointer-events:none;overflow:hidden;}
        .rain i{position:absolute;top:-12%;width:1.1px;border-radius:1px;background:linear-gradient(transparent,rgba(220,210,185,.4));animation:vrain linear infinite;}
        @keyframes vrain{to{transform:translateY(122vh) skewX(-8deg);}}
        /* THE VOUCH — the signature object: her badge, her line, her name */
        .vchpin{position:fixed;left:0;top:0;z-index:4;pointer-events:none;opacity:0;transition:opacity .45s var(--e-out);will-change:transform;}
        .vchpin.on{opacity:1;}
        .vchpin-inner{display:flex;align-items:center;gap:11px;transform:translate(-15px,-15px);}
        .vchpin-dot{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#E6A23E;box-shadow:0 0 0 4px rgba(230,162,62,.15),0 0 24px 6px rgba(230,162,62,.85),0 7px 16px rgba(0,0,0,.5);}
        .vchpin-card{max-width:min(64vw,300px);}
        .vchpin-line{display:none;font-style:italic;font-size:1.02rem;line-height:1.32;color:#F6EAD2;text-shadow:0 2px 14px rgba(0,0,0,.95);margin:0;}
        .vchpin.full .vchpin-line{display:block;}
        .vchpin-place{display:block;font-weight:600;font-size:.82rem;letter-spacing:-.01em;color:var(--ink);margin:0;}
        .vchpin.full .vchpin-place{margin-top:6px;color:var(--accent);}
        .vchpin.full .vchpin-place::after{content:" · priya";color:var(--muted);font-weight:400;}
        .vchpin:not(.full) .vchpin-place{background:rgba(11,9,5,.9);border:1px solid var(--accent-line);border-radius:999px;padding:4px 12px;backdrop-filter:blur(8px);box-shadow:0 12px 28px -16px rgba(0,0,0,.95);}
        @media(max-width:760px){.vchpin-line{display:block !important;}.vchpin:not(.full) .vchpin-place{background:none;border:none;padding:0;margin-top:5px;color:var(--accent);}}
        /* persistent way-in */
        .cta-pill{position:fixed;top:24px;right:26px;z-index:8;display:inline-flex;align-items:center;gap:7px;font-size:.82rem;font-weight:600;color:var(--accent-ink);background:linear-gradient(140deg,var(--accent-2),var(--accent));border-radius:999px;padding:9px 16px;text-decoration:none;box-shadow:0 10px 30px -10px rgba(230,162,62,.6);opacity:0;transform:translateY(-8px);pointer-events:none;transition:opacity .5s var(--e-out),transform .5s var(--e-out);}
        .cta-pill.on{opacity:1;transform:none;pointer-events:auto;}
        .cta-pill:active{transform:scale(.97);}
        .chap{position:relative;z-index:5;pointer-events:none;}
        .chap.hero{min-height:100dvh;display:flex;align-items:center;}
        .stick{position:sticky;top:0;height:100dvh;display:flex;align-items:center;}
        .panel{margin:0 0 0 clamp(28px,7vw,120px);max-width:470px;pointer-events:auto;}
        .reveal{opacity:0;transform:translateY(22px);transition:opacity .8s var(--e-out),transform .8s var(--e-out);}
        .panel.shown .reveal{opacity:1;transform:none;}
        .reveal.d1{transition-delay:.06s;} .reveal.d2{transition-delay:.12s;} .reveal.d3{transition-delay:.18s;} .reveal.d4{transition-delay:.24s;}
        .eyebrow{font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin:0;}
        h1.hero-h{font-weight:600;font-size:clamp(2.3rem,4.8vw,3.6rem);line-height:1.02;letter-spacing:-.03em;color:var(--ink);margin:14px 0 0;max-width:15ch;text-shadow:0 2px 26px rgba(0,0,0,.9);}
        .clarity{font-size:1.06rem;line-height:1.5;color:var(--muted);margin:16px 0 0;max-width:34ch;}
        .clarity b{color:var(--ink);font-weight:600;}
        .hero-cta{margin-top:26px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
        .btn-primary{display:inline-flex;align-items:center;gap:8px;font-size:.92rem;font-weight:600;color:var(--accent-ink);background:linear-gradient(140deg,var(--accent-2),var(--accent));border:none;border-radius:var(--r-pill);padding:12px 20px;text-decoration:none;box-shadow:0 14px 36px -12px rgba(230,162,62,.55);transition:transform .14s var(--e-out);}
        .btn-primary:active{transform:scale(.97);}
        .btn-ghost{font-size:.88rem;color:var(--muted);text-decoration:none;border-bottom:1px solid transparent;transition:color .2s,border-color .2s;}
        .btn-ghost:hover{color:var(--ink);border-color:var(--line-2);}
        .cue{font-size:.78rem;color:var(--faint);margin-top:22px;display:flex;align-items:center;gap:8px;}
        .cue span{display:inline-block;width:34px;height:1px;background:linear-gradient(90deg,var(--accent),transparent);}
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
        .finale{min-height:100dvh;display:flex;align-items:center;justify-content:center;text-align:center;position:relative;z-index:5;}
        .made{display:flex;align-items:center;justify-content:center;gap:0;margin:26px 0 0;}
        .made .m{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:.7rem;font-weight:700;color:var(--accent-ink);background:linear-gradient(135deg,var(--accent-2),var(--accent));border:2px solid var(--bg);margin-left:-8px;box-shadow:0 4px 12px -4px rgba(0,0,0,.6);}
        .made .m:first-child{margin-left:0;}
        .madecap{font-size:.78rem;color:var(--muted);margin-top:12px;}
        @media(max-width:760px){
          .chaprail{display:none;} .cta-pill{top:auto;bottom:22px;right:50%;transform:translateX(50%) translateY(8px);} .cta-pill.on{transform:translateX(50%);}
          .chap.hero{align-items:flex-end;} .stick{align-items:flex-end;}
          .panel{margin:0;max-width:none;width:100%;padding:0 18px env(safe-area-inset-bottom,90px) 18px;}
          .scrim-left{background:linear-gradient(0deg,rgba(5,3,1,.94) 0%,rgba(5,3,1,.6) 36%,transparent 66%);}
          .listcard{display:none;}
        }
        @media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;}.rain{display:none;}.map-stage{filter:none;transform:none;}}
      `}</style>

      <div className={"map-stage" + (ready ? " lit" : "")}><div ref={mapEl} className="maplibregl-map" /></div>
      <div className="map-vig" />
      <div className="scrim-left" />
      <div className="finale-scrim" />
      {rain && <div className="rain" aria-hidden="true">{Array.from({ length: 60 }).map((_, i) => <i key={i} style={{ left: `${(i * 137) % 100}%`, height: `${42 + (i * 53) % 48}px`, animationDuration: `${0.55 + ((i * 31) % 45) / 100}s`, animationDelay: `${-((i * 47) % 100) / 100}s`, opacity: 0.14 + ((i * 23) % 22) / 100 }} />)}</div>}

      <div ref={vouchRef} className="vchpin"><div className="vchpin-inner"><span className="vchpin-dot" /><div className="vchpin-card"><p className="vchpin-line" /><p className="vchpin-place" /></div></div></div>

      <a className={"cta-pill" + (scrolled ? " on" : "")} href="/v3/new">make yours →</a>
      <nav className="chaprail" aria-label="chapters">
        {SECS.map((n, i) => <button key={n.key} ref={(el) => { navRefs.current[i] = el; }} data-k={n.key} onClick={() => jump(n.key)}><span className="lbl">{n.key === "hero" ? "the city" : n.key === "finale" ? "your turn" : AREAS[n.area!]?.name}</span><span className="pip" /></button>)}
      </nav>
      <div style={{ position: "fixed", zIndex: 8, top: 26, left: 28 }}><span style={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--ink)", letterSpacing: "-0.02em" }}>vouch<span style={{ color: "var(--accent)" }}>.</span></span></div>

      {/* I — the fold: what it is (plain), a vouch shown assembling, a way in */}
      <section className="chap hero" data-sec="hero">
        <div className="panel" style={{ maxWidth: 600 }}>
          <p className="reveal eyebrow">namma bengaluru</p>
          <h1 className="reveal d1 hero-h">come, i&apos;ll show you my Bengaluru.</h1>
          <p className="reveal d2 clarity">This is <b>Priya&apos;s Vouch</b> — the places she&apos;d actually take you, in her voice. Scroll it. Then make one for the city <b>you</b> know.</p>
          <div className="reveal d3 hero-cta">
            <a className="btn-primary" href="/v3/new">Make your vouch →</a>
            <a className="btn-ghost" href="/v3/g/priya">open priya&apos;s</a>
          </div>
          <p className="reveal d4 cue"><span /> scroll — she&apos;ll walk you through</p>
        </div>
      </section>

      {/* II — walk her picks (scroll surfaces them one at a time) */}
      {AREAS.map((a, ai) => (
        <section key={a.key} className="chap" data-sec={a.key} style={{ height: `${SECS[ai + 1].vh * 100}vh` }}>
          <div className="stick">
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
          </div>
        </section>
      ))}

      {/* III — your turn */}
      <section className="chap finale" data-sec="finale" style={{ height: `${SECS[5].vh * 100}vh` }}>
        <div className="panel" style={{ margin: "0 auto", maxWidth: 660, textAlign: "center" }}>
          <p className="reveal eyebrow" style={{ color: "var(--faint)" }}>you&apos;ve seen hers</p>
          <h2 className="reveal d1" style={{ fontWeight: 600, fontSize: "clamp(2.3rem,5.2vw,3.8rem)", lineHeight: 1.03, letterSpacing: "-0.025em", color: "var(--ink)", margin: "14px 0 0", textShadow: "0 2px 26px rgba(0,0,0,.9)" }}>Now light up yours.</h2>
          <p className="reveal d2" style={{ fontSize: "1.14rem", lineHeight: 1.6, color: "var(--muted)", margin: "18px auto 0", maxWidth: "40ch" }}>Your spots, your voice, your name on every one — a guide you&apos;d actually send to someone you love. Two minutes, free.</p>
          <div className="reveal d3 hero-cta" style={{ justifyContent: "center", marginTop: 30 }}>
            <a className="btn-primary" href="/v3/new">Make your vouch →</a>
            <button className="btn-ghost" type="button" onClick={share} style={{ background: "none", border: "none", borderBottom: "1px solid transparent", cursor: "pointer", fontFamily: "inherit" }}>send this to someone ↗</button>
          </div>
          <div className="reveal d4 made"><span className="m">P</span><span className="m">A</span><span className="m">M</span><span className="m">R</span></div>
          <p className="reveal d4 madecap">guides people are making — for Bengaluru, Goa, Lisbon, the cities they know by heart.</p>
        </div>
      </section>
    </main>
  );
}
