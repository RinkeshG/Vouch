"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { Button } from "../../../components/v3/kit";

/* The landing — one map, flown across Namma Bengaluru.
   The city, wide and alive. Scroll and a friend takes you neighbourhood by
   neighbourhood — Koramangala, Indiranagar, the old city, golden-hour rooftops —
   each lighting up its spots in place, in her voice. Then: light your own. */

type Spot = { name: string; lat: number; lng: number; vo: string };
type Area = { key: string; kicker: string; name: string; tag: string; flavor: string; center: [number, number]; zoom: number; spots: Spot[] };

const AREAS: Area[] = [
  {
    key: "koramangala", kicker: "the young heart", name: "Koramangala", tag: "where the city actually hangs out", flavor: "all walkable. sakkath, every one.",
    center: [12.9345, 77.6225], zoom: 14.4, spots: [
      { name: "Truffles", lat: 12.9347, lng: 77.6205, vo: "the bird's eye chilli burger. there'll be a wait — worth it." },
      { name: "Maverick & Farmer", lat: 12.9352, lng: 77.6245, vo: "best coffee, food and vibe in town. i work from here." },
      { name: "Dyu Art Cafe", lat: 12.9279, lng: 77.6271, vo: "the courtyard, a book, an afternoon gone." },
      { name: "The Black Pearl", lat: 12.9352, lng: 77.6180, vo: "a medieval feast, hands only. go hungry." },
    ],
  },
  {
    key: "indiranagar", kicker: "100 ft road & the lanes off it", name: "Indiranagar", tag: "dressed up, but still ours", flavor: "park once, walk the rest.",
    center: [12.9735, 77.6410], zoom: 14.4, spots: [
      { name: "Toit", lat: 12.9783, lng: 77.6408, vo: "toit weiss + a wood-fired pizza. weekday, never weekend." },
      { name: "Glen's Bakehouse", lat: 12.9719, lng: 77.6412, vo: "the red velvet. don't offer to share." },
      { name: "Arbor Brewing", lat: 12.9700, lng: 77.6420, vo: "the bagsy brown, up on the terrace." },
      { name: "Sodabottleopenerwala", lat: 12.9716, lng: 77.6411, vo: "berry pulao and a raspberry soda. obviously." },
    ],
  },
  {
    key: "basavanagudi", kicker: "the old city", name: "Basavanagudi", tag: "real filter kaapi, since forever", flavor: "cash only. worth the queue.",
    center: [12.9460, 77.5740], zoom: 14.2, spots: [
      { name: "Vidyarthi Bhavan", lat: 12.9498, lng: 77.5731, vo: "masala dose, crisp at the edges, since 1943." },
      { name: "Brahmin's Coffee Bar", lat: 12.9450, lng: 77.5660, vo: "idli-vada, one filter kaapi by two. 7am sharp." },
      { name: "VV Puram Food Street", lat: 12.9419, lng: 77.5731, vo: "walk it twice. end on the holige." },
      { name: "MTR, Lalbagh", lat: 12.9507, lng: 77.5848, vo: "rava idli, then the chandrahara. bring patience." },
    ],
  },
  {
    key: "golden", kicker: "an occasion, not a place", name: "Golden hour", tag: "up high, before the sun goes", flavor: "be there by six. trust me.",
    center: [12.9950, 77.6050], zoom: 12.4, spots: [
      { name: "Byg Brewski, Hennur", lat: 13.0358, lng: 77.6403, vo: "go for the sunset off the deck, not the beer." },
      { name: "Skyye, UB City", lat: 12.9716, lng: 77.5965, vo: "a martini as the city switches its lights on." },
      { name: "High Ultra Lounge", lat: 12.9850, lng: 77.5950, vo: "31 floors up. the whole of bengaluru below you." },
    ],
  },
];
const HERO_POINTS = [
  { name: "Airlines Hotel", lat: 12.9716, lng: 77.5995, vo: "filter coffee under the rain trees. we start here." },
  { name: "Koshy's", lat: 12.9738, lng: 77.6010, vo: "a window seat. two hours. nowhere to be." },
  { name: "Byg Brewski", lat: 13.0358, lng: 77.6403, vo: "go for the sunset, not the beer." },
  { name: "Vidyarthi Bhavan", lat: 12.9498, lng: 77.5731, vo: "masala dose, since 1943. cash only." },
];
const ALL = AREAS.flatMap((a) => a.spots.map((s) => ({ ...s, area: a.key })));

export default function Landing() {
  const mapEl = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = useRef<any>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const heroDotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const voiceRef = useRef<HTMLDivElement | null>(null);
  const activeArea = useRef<string>("hero");

  useEffect(() => {
    let dead = false; let timer = 0; let pIdx = -1; const hc = HERO_POINTS.map(() => ({ x: 0, y: 0 }));
    function project() {
      const m = map.current; if (!m) return;
      ALL.forEach((s, i) => { const p = m.latLngToContainerPoint([s.lat, s.lng]); const el = dotRefs.current[i]; if (el) { el.style.left = p.x + "px"; el.style.top = p.y + "px"; } });
      HERO_POINTS.forEach((s, i) => { const p = m.latLngToContainerPoint([s.lat, s.lng]); hc[i] = { x: p.x, y: p.y }; const el = heroDotRefs.current[i]; if (el) { el.style.left = p.x + "px"; el.style.top = p.y + "px"; } });
    }
    function setArea(key: string) {
      activeArea.current = key;
      ALL.forEach((s, i) => { const el = dotRefs.current[i]; if (el) el.classList.toggle("lit", s.area === key); });
      heroDotRefs.current.forEach((el) => el && (el.style.display = key === "hero" ? "block" : "none"));
      const v = voiceRef.current; if (v && key !== "hero") v.style.opacity = "0";
    }
    (async () => {
      const L = (await import("leaflet")).default;
      if (dead || !mapEl.current || map.current) return;
      const m = L.map(mapEl.current, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false, tap: false, zoomSnap: 0.1 });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", { subdomains: "abcd", detectRetina: true }).addTo(m);
      m.setView([12.962, 77.605], 11.6);
      map.current = m;
      m.on("move zoom moveend", project);
      setTimeout(() => { m.invalidateSize(); m.setView([12.962, 77.605], 11.6); project(); }, 120);
      setTimeout(project, 700);
      window.addEventListener("resize", project);
      // hero: a friend points across the whole city
      const point = () => {
        if (dead || activeArea.current !== "hero") { timer = window.setTimeout(point, 1200); return; }
        if (pIdx >= 0 && heroDotRefs.current[pIdx]) heroDotRefs.current[pIdx]!.classList.remove("pointed");
        pIdx = (pIdx + 1) % HERO_POINTS.length;
        const el = heroDotRefs.current[pIdx]; const v = voiceRef.current;
        if (el) el.classList.add("pointed");
        if (v && el) { v.querySelector(".q")!.textContent = "“" + HERO_POINTS[pIdx].vo + "”"; v.querySelector(".nm")!.textContent = HERO_POINTS[pIdx].name + "  ·  priya"; v.style.left = hc[pIdx].x + "px"; v.style.top = hc[pIdx].y + "px"; v.style.opacity = "1"; }
        window.setTimeout(() => { if (voiceRef.current && activeArea.current === "hero") voiceRef.current.style.opacity = "0"; }, 3000);
        timer = window.setTimeout(point, 3900);
      };
      timer = window.setTimeout(point, 1400);
      // scroll → fly the city
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        const key = (e.target as HTMLElement).dataset.area!;
        if (key === "hero") { m.flyTo([12.962, 77.605], 11.6, { duration: 1.4 }); setArea("hero"); }
        else { const a = AREAS.find((x) => x.key === key); if (a) { m.flyTo(a.center, a.zoom, { duration: 1.6 }); setArea(key); } }
      }), { threshold: 0.55 });
      document.querySelectorAll("[data-area]").forEach((s) => io.observe(s));
    })();
    return () => { dead = true; clearTimeout(timer); window.removeEventListener("resize", project); try { map.current?.remove?.(); } catch { } map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main>
      <style>{`
        .city-map{position:fixed;inset:0;z-index:0;}
        .city-atmo{position:fixed;inset:0;z-index:1;pointer-events:none;}
        .city-lights{position:fixed;inset:0;z-index:2;pointer-events:none;}
        .dot{position:absolute;transform:translate(-50%,-50%);}
        .dot .c{display:block;width:6px;height:6px;border-radius:50%;background:#5e5236;transition:all .6s var(--eout);}
        .dot.lit .c{width:12px;height:12px;background:#E6A23E;box-shadow:0 0 18px 5px rgba(230,162,62,.6);}
        .dot .l{position:absolute;left:14px;top:50%;transform:translateY(-50%) translateX(-4px);white-space:nowrap;font-size:.72rem;font-weight:500;color:#F3EBD9;opacity:0;transition:opacity .5s,transform .5s var(--eout);text-shadow:0 1px 8px rgba(0,0,0,.95);}
        .dot.lit .l{opacity:1;transform:translateY(-50%);}
        .hdot{position:absolute;transform:translate(-50%,-50%);}
        .hdot .c{display:block;width:7px;height:7px;border-radius:50%;background:#E6A23E;box-shadow:0 0 12px 3px rgba(230,162,62,.4);animation:breathe 3s ease-in-out infinite;}
        .hdot.pointed .c{width:15px;height:15px;background:#FCE3AE;box-shadow:0 0 26px 9px rgba(246,208,138,.85);animation:none;}
        @keyframes breathe{0%,100%{opacity:.5;transform:scale(.9);}50%{opacity:1;transform:scale(1.12);}}
        .vbubble{position:absolute;z-index:3;max-width:250px;transform:translate(-50%,calc(-100% - 20px));opacity:0;transition:opacity .8s ease;text-align:center;}
        .vbubble .q{font-style:italic;font-weight:500;font-size:1.05rem;line-height:1.4;color:#F6EAD2;text-shadow:0 2px 16px rgba(0,0,0,.95);}
        .vbubble .nm{font-size:.72rem;color:#E6A23E;margin-top:6px;}
        .chap{position:relative;z-index:5;min-height:100dvh;display:flex;align-items:center;}
        .panel{margin:0 0 0 clamp(28px,7vw,110px);max-width:430px;}
        .panel.shown .reveal{opacity:1;transform:none;}
        .reveal{opacity:0;transform:translateY(22px);transition:opacity .7s var(--eout),transform .7s var(--eout);}
        .reveal.d1{transition-delay:.08s;} .reveal.d2{transition-delay:.16s;} .reveal.d3{transition-delay:.24s;}
        .spotrow{display:flex;gap:12px;padding:11px 0;border-top:1px solid var(--line);}
        @media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;}.hdot .c{animation:none;}}
      `}</style>

      <div ref={mapEl} className="city-map" />
      <div className="city-atmo" style={{ background: "radial-gradient(120% 75% at 50% 6%, rgba(232,150,60,.16) 0%, transparent 42%), radial-gradient(130% 100% at 50% 48%, transparent 34%, rgba(8,6,3,.55) 80%, rgba(6,4,2,.9) 100%)" }} />
      <div className="city-atmo" style={{ background: "rgba(40,25,10,.24)", mixBlendMode: "multiply" }} />
      <div className="city-lights">
        {ALL.map((s, i) => <div key={s.area + s.name} ref={(el) => { dotRefs.current[i] = el; }} className="dot"><span className="c" /><span className="l">{s.name}</span></div>)}
        {HERO_POINTS.map((s, i) => <div key={"h" + s.name} ref={(el) => { heroDotRefs.current[i] = el; }} className="hdot"><span className="c" /></div>)}
        <div ref={voiceRef} className="vbubble"><div className="q" /><div className="nm" /></div>
      </div>

      <div style={{ position: "fixed", zIndex: 6, top: 26, left: 28 }}><span style={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--ink)", letterSpacing: "-0.02em" }}>vouch<span style={{ color: "var(--accent)" }}>.</span></span></div>

      {/* I — the whole city */}
      <section className="chap" data-area="hero">
        <div className="panel" style={{ maxWidth: 560 }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", margin: 0 }}>namma bengaluru</p>
          <h1 style={{ fontWeight: 600, fontSize: "clamp(2.2rem,4.6vw,3.4rem)", lineHeight: 1.03, letterSpacing: "-0.03em", color: "var(--ink)", margin: "12px 0 0", maxWidth: "15ch", textShadow: "0 2px 24px rgba(0,0,0,.7)" }}>come here — let me show you my city.</h1>
          <p style={{ fontSize: "1.05rem", color: "var(--muted)", margin: "14px 0 0", maxWidth: "34ch" }}>the places i&apos;d actually take you. not a list — the real ones. scroll, we&apos;ll go neighbourhood by neighbourhood. ↓</p>
        </div>
      </section>

      {/* II — neighbourhood by neighbourhood */}
      {AREAS.map((a) => (
        <Chapter key={a.key} a={a} />
      ))}

      {/* III — your turn */}
      <section className="chap" data-area="golden" style={{ justifyContent: "center", textAlign: "center" }}>
        <div className="panel" style={{ margin: "0 auto", maxWidth: 620, textAlign: "center" }}>
          <div className="reveal-wrap" />
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--faint)", margin: 0 }}>your city&apos;s still dark</p>
          <h2 style={{ fontWeight: 600, fontSize: "clamp(2.2rem,5vw,3.6rem)", lineHeight: 1.04, letterSpacing: "-0.025em", color: "var(--ink)", margin: "16px 0 0", textShadow: "0 2px 24px rgba(0,0,0,.7)" }}>Light it up.</h2>
          <p style={{ fontSize: "1.12rem", lineHeight: 1.6, color: "var(--muted)", margin: "18px auto 0", maxWidth: "40ch" }}>Show someone the way you&apos;d take them — your spots, your voice, your name on every one. Maadi.</p>
          <div style={{ marginTop: 30, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/v3/new" style={{ textDecoration: "none" }}><Button>Make your guide →</Button></a>
            <a href="/v3/g/priya" style={{ textDecoration: "none" }}><Button variant="ghost">walk priya&apos;s first</Button></a>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--faint)", marginTop: 14 }}>free · about two minutes</p>
        </div>
      </section>
    </main>
  );
}

function Chapter({ a }: { a: Area }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) el.querySelector(".panel")!.classList.add("shown"); }), { threshold: 0.5 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <section className="chap" data-area={a.key} ref={ref}>
      <div className="panel">
        <p className="reveal" style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", margin: 0 }}>{a.kicker}</p>
        <h2 className="reveal d1" style={{ fontWeight: 600, fontSize: "clamp(2rem,4.4vw,3rem)", lineHeight: 1.02, letterSpacing: "-0.03em", color: "var(--ink)", margin: "10px 0 0", textShadow: "0 2px 24px rgba(0,0,0,.7)" }}>{a.name}.</h2>
        <p className="reveal d1" style={{ fontSize: "1.05rem", color: "var(--muted)", margin: "10px 0 0" }}>{a.tag}</p>
        <div className="reveal d2" style={{ marginTop: 22, background: "linear-gradient(165deg, rgba(31,26,17,.82), rgba(17,14,8,.82))", border: "1px solid var(--line-2)", borderRadius: "var(--r-lg)", padding: "6px 16px 14px", backdropFilter: "blur(6px)" }}>
          {a.spots.map((s) => (
            <div key={s.name} className="spotrow">
              <span style={{ flex: "none", width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 10px 2px rgba(230,162,62,.5)", marginTop: 7 }} />
              <span><span style={{ display: "block", fontWeight: 600, fontSize: "0.98rem", color: "var(--ink)" }}>{s.name}</span><span style={{ display: "block", fontStyle: "italic", fontSize: "0.85rem", lineHeight: 1.4, color: "#E8DCC6", marginTop: 2 }}>“{s.vo}”</span></span>
            </div>
          ))}
        </div>
        <p className="reveal d3" style={{ fontSize: "0.8rem", color: "var(--faint)", marginTop: 14 }}>{a.flavor}</p>
      </div>
    </section>
  );
}
