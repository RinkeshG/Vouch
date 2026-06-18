"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { CAT_LABEL, SEED } from "../../../components/v2/data";
import { Button } from "../../../components/v3/kit";

/* The landing as a journey, not a page.
   The real city. A glowing line — a friend drawing you the route — travels
   through her places in order. A light leads; each place rises and tells you
   why; the city's light turns morning → night as the route unspools. Then it
   hands you the pen: now trace your own. */

const PLACES = SEED.places.map((p) => ({ name: p.name, vo: p.note, ct: CAT_LABEL[p.cat] + (p.when ? " · " + p.when : ""), lat: p.lat, lng: p.lng }));

export default function Landing() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const mapEl = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = useRef<any>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const skyRef = useRef<HTMLDivElement | null>(null);
  const pinRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let dead = false, raf = 0, start = 0;
    const pts: { x: number; y: number }[] = PLACES.map(() => ({ x: 0, y: 0 }));
    const segCum: number[] = []; let total = 0;
    const DUR = 7200;
    // dawn → golden → night, lerped along the journey
    const sky = [[44, 28, 12, 0.30], [62, 40, 16, 0.30], [40, 26, 14, 0.42], [14, 11, 8, 0.66]];
    function lerpSky(p: number) {
      const seg = Math.min(sky.length - 2, Math.floor(p * (sky.length - 1)));
      const f = p * (sky.length - 1) - seg; const a = sky[seg], b = sky[seg + 1];
      const c = a.map((v, i) => v + (b[i] - v) * f);
      return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${c[3].toFixed(3)})`;
    }
    function project() {
      const m = map.current; if (!m) return;
      PLACES.forEach((p, i) => { const pt = m.latLngToContainerPoint([p.lat, p.lng]); pts[i] = { x: pt.x, y: pt.y }; const el = pinRefs.current[i]; if (el) { el.style.left = pt.x + "px"; el.style.top = pt.y + "px"; } const c = cardRefs.current[i]; if (c) { c.style.left = pt.x + "px"; c.style.top = pt.y + "px"; } });
      // build path + cumulative lengths
      let d = `M ${pts[0].x} ${pts[0].y}`; segCum.length = 0; segCum.push(0); total = 0;
      for (let i = 1; i < pts.length; i++) { d += ` L ${pts[i].x} ${pts[i].y}`; total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); segCum.push(total); }
      const path = pathRef.current; if (path) { path.setAttribute("d", d); path.style.strokeDasharray = String(total); path.style.strokeDashoffset = String(total); }
    }
    function pointAt(len: number) {
      for (let i = 1; i < pts.length; i++) { if (len <= segCum[i]) { const f = (len - segCum[i - 1]) / (segCum[i] - segCum[i - 1] || 1); return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f }; } }
      return pts[pts.length - 1];
    }

    (async () => {
      const L = (await import("leaflet")).default;
      if (dead || !mapEl.current || map.current) return;
      const m = L.map(mapEl.current, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false, tap: false });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", { subdomains: "abcd", detectRetina: true }).addTo(m);
      m.fitBounds(PLACES.map((p) => [p.lat, p.lng]) as [number, number][], { padding: [90, 90] });
      map.current = m;
      setTimeout(() => { m.invalidateSize(); m.fitBounds(PLACES.map((p) => [p.lat, p.lng]) as [number, number][], { padding: [90, 90] }); project(); start = performance.now(); }, 120);
      setTimeout(project, 700);
      window.addEventListener("resize", project);

      function loop(now: number) {
        if (dead) return;
        if (!start) { raf = requestAnimationFrame(loop); return; }
        const raw = Math.min(1, (now - start) / DUR);
        const e = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
        const traveled = e * total;
        const path = pathRef.current; if (path) path.style.strokeDashoffset = String(total - traveled);
        const d = pointAt(traveled); const dot = dotRef.current; if (dot) { dot.style.left = d.x + "px"; dot.style.top = d.y + "px"; }
        if (skyRef.current) skyRef.current.style.background = `radial-gradient(120% 95% at 50% 38%, ${lerpSky(e)} 0%, rgba(9,7,4,.9) 95%)`;
        PLACES.forEach((p, i) => {
          const reached = traveled >= segCum[i] - 3;
          const pin = pinRefs.current[i]; if (pin) { pin.style.opacity = reached ? "1" : "0.28"; pin.style.transform = `translate(-50%,-50%) scale(${reached ? 1 : 0.7})`; pin.style.boxShadow = reached ? "0 0 16px 5px rgba(230,162,62,.6)" : "none"; }
          const card = cardRefs.current[i]; if (card) {
            const justNow = reached && traveled < segCum[i] + (segCum[i + 1] ? (segCum[i + 1] - segCum[i]) : 9999) * 0.6 || (i === PLACES.length - 1 && raw > 0.98);
            card.style.opacity = reached ? (justNow ? "1" : "0") : "0";
            card.style.pointerEvents = "none";
          }
        });
        raf = requestAnimationFrame(loop);
      }
      raf = requestAnimationFrame(loop);
    })();
    return () => { dead = true; cancelAnimationFrame(raf); window.removeEventListener("resize", project); try { map.current?.remove?.(); } catch { } map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={{ background: "var(--bg)" }}>
      <section ref={heroRef} style={{ position: "relative", height: "100dvh", overflow: "hidden" }}>
        <div ref={mapEl} style={{ position: "absolute", inset: 0, zIndex: 0 }} />
        <div ref={skyRef} style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(120% 95% at 50% 38%, rgba(44,28,12,.3), rgba(9,7,4,.9) 95%)" }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "rgba(36,23,10,.22)", mixBlendMode: "multiply", pointerEvents: "none" }} />
        {/* the route */}
        <svg style={{ position: "absolute", inset: 0, zIndex: 2, width: "100%", height: "100%", pointerEvents: "none" }}>
          <path ref={pathRef} fill="none" stroke="#E6A23E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 6px rgba(230,162,62,.6))" }} />
        </svg>
        {/* pins */}
        {PLACES.map((p, i) => <div key={"p" + i} ref={(el) => { pinRefs.current[i] = el; }} style={{ position: "absolute", zIndex: 3, width: 12, height: 12, borderRadius: "50%", background: "var(--accent)", transform: "translate(-50%,-50%)", opacity: 0.28, pointerEvents: "none" }} />)}
        {/* the traveling light */}
        <div ref={dotRef} style={{ position: "absolute", zIndex: 4, width: 12, height: 12, borderRadius: "50%", transform: "translate(-50%,-50%)", background: "#FCE3AE", boxShadow: "0 0 22px 8px rgba(246,208,138,.85)", pointerEvents: "none" }} />
        {/* place cards (rise as the light arrives) */}
        {PLACES.map((p, i) => (
          <div key={"c" + i} ref={(el) => { cardRefs.current[i] = el; }} style={{ position: "absolute", zIndex: 5, width: 218, transform: "translate(-50%, calc(-100% - 22px))", opacity: 0, transition: "opacity .5s ease", pointerEvents: "none" }}>
            <div style={{ background: "linear-gradient(165deg, rgba(31,26,17,.96), rgba(17,14,8,.96))", border: "1px solid var(--line-2)", borderRadius: "var(--r-lg)", padding: "13px 15px", boxShadow: "0 22px 44px -22px rgba(0,0,0,.85)", backdropFilter: "blur(4px)" }}>
              <div style={{ fontSize: "0.56rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)" }}>{String(i + 1).padStart(2, "0")} · {p.ct}</div>
              <div style={{ fontWeight: 600, fontSize: "1.02rem", color: "var(--ink)", margin: "5px 0 0" }}>{p.name}</div>
              <div style={{ fontStyle: "italic", fontSize: "0.82rem", lineHeight: 1.4, color: "#E8DCC6", marginTop: 5 }}>“{p.vo}”</div>
            </div>
          </div>
        ))}
        {/* foreground */}
        <div style={{ position: "absolute", zIndex: 6, top: 26, left: 28 }}><span style={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--ink)", letterSpacing: "-0.02em" }}>vouch<span style={{ color: "var(--accent)" }}>.</span></span></div>
        <div style={{ position: "absolute", zIndex: 6, top: "clamp(80px,15vh,150px)", left: 28, maxWidth: "56%", pointerEvents: "none" }}>
          <p style={{ fontSize: "0.95rem", color: "var(--muted)", margin: 0 }}>a day in bengaluru, by priya.</p>
          <h1 style={{ fontWeight: 600, fontSize: "clamp(2rem,4.4vw,3.2rem)", lineHeight: 1.03, letterSpacing: "-0.03em", color: "var(--ink)", margin: "8px 0 0", maxWidth: "15ch" }}>this is the way I'd take you.</h1>
        </div>
        <div style={{ position: "absolute", zIndex: 6, bottom: 24, left: "50%", transform: "translateX(-50%)", fontSize: "0.74rem", color: "var(--faint)", pointerEvents: "none" }}>scroll ↓</div>
      </section>

      {/* hand-off */}
      <section style={{ position: "relative", minHeight: "92dvh", display: "grid", placeItems: "center", textAlign: "center", padding: "0 28px", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 700, height: 460, top: "8%", left: "50%", transform: "translateX(-50%)", borderRadius: "50%", filter: "blur(110px)", opacity: 0.18, background: "radial-gradient(circle, var(--accent), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 640 }}>
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", margin: 0 }}>your turn</p>
          <h2 style={{ fontWeight: 600, fontSize: "clamp(2.2rem,5vw,3.6rem)", lineHeight: 1.04, letterSpacing: "-0.025em", color: "var(--ink)", margin: "16px 0 0" }}>Now trace your own.</h2>
          <p style={{ fontSize: "1.12rem", lineHeight: 1.6, color: "var(--muted)", margin: "18px auto 0", maxWidth: "42ch" }}>The next time someone asks where to go, take them the way you would. Your places, your order, your name on every one.</p>
          <div style={{ marginTop: 30, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/v3/new" style={{ textDecoration: "none" }}><Button>Make your guide →</Button></a>
            <a href="/v3/g/priya" style={{ textDecoration: "none" }}><Button variant="ghost">see one first</Button></a>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--faint)", marginTop: 14 }}>free · about two minutes · no app to download</p>
        </div>
      </section>
    </main>
  );
}
