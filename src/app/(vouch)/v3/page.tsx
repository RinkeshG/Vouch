"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { Button } from "../../../components/v3/kit";

/* The landing — one world, three chapters, in the warm dark.
   I — show me your city: a living dusk map; a friend points out places one at a
       time, in their voice. II — start here: the friend leans into one place,
       up close. III — now light your own: your city is still dark.
   No sections. The same scene, going deeper. */

const PICKS: { name: string; lat: number; lng: number; vo: string }[] = [
  { name: "Airlines Hotel", lat: 12.9716, lng: 77.5995, vo: "filter coffee under the rain trees. we start here." },
  { name: "Koshy's", lat: 12.9738, lng: 77.6010, vo: "a window seat. two hours. nowhere to be." },
  { name: "Third Wave", lat: 12.9692, lng: 77.5975, vo: "black, single-origin. in and out." },
  { name: "Corner House", lat: 12.9716, lng: 77.6050, vo: "death by chocolate. don't argue." },
  { name: "Matteo", lat: 12.9748, lng: 77.6075, vo: "cold brew, by the window, late afternoon." },
  { name: "Empire", lat: 12.9750, lng: 77.6110, vo: "2am, after everything. the kebabs." },
];

export default function Landing() {
  const heroMapEl = useRef<HTMLDivElement | null>(null);
  const closeMapEl = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const heroMap = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const closeMap = useRef<any>(null);
  const lightRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lightsLayer = useRef<HTMLDivElement | null>(null);
  const voiceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let dead = false; let timer = 0; let active = -1; let mx = 0, my = 0, tmx = 0, tmy = 0, raf = 0;
    const coords = PICKS.map(() => ({ x: 0, y: 0 }));
    function project() {
      const m = heroMap.current; if (!m) return;
      PICKS.forEach((p, i) => { const pt = m.latLngToContainerPoint([p.lat, p.lng]); coords[i] = { x: pt.x, y: pt.y }; const el = lightRefs.current[i]; if (el) { el.style.left = pt.x + "px"; el.style.top = pt.y + "px"; } });
    }
    (async () => {
      const L = (await import("leaflet")).default;
      if (dead) return;
      const tiles = () => L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", { subdomains: "abcd", detectRetina: true });
      // hero map
      if (heroMapEl.current && !heroMap.current) {
        const m = L.map(heroMapEl.current, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false, tap: false });
        tiles().addTo(m); m.fitBounds(PICKS.map((p) => [p.lat, p.lng]) as [number, number][], { padding: [120, 120] });
        heroMap.current = m;
        setTimeout(() => { m.invalidateSize(); m.fitBounds(PICKS.map((p) => [p.lat, p.lng]) as [number, number][], { padding: [120, 120] }); project(); }, 120);
        setTimeout(project, 700);
      }
      // close-up map (Act II)
      if (closeMapEl.current && !closeMap.current) {
        const m2 = L.map(closeMapEl.current, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false, tap: false }).setView([PICKS[0].lat, PICKS[0].lng], 15);
        tiles().addTo(m2); closeMap.current = m2; setTimeout(() => m2.invalidateSize(), 200);
      }
      window.addEventListener("resize", project);
      // the friend points — one place at a time, in their voice
      const point = () => {
        if (dead) return;
        if (active >= 0 && lightRefs.current[active]) lightRefs.current[active]!.classList.remove("pointed");
        active = (active + 1) % PICKS.length;
        const el = lightRefs.current[active]; const v = voiceRef.current;
        if (el) el.classList.add("pointed");
        if (v && el) { v.querySelector(".q")!.textContent = "“" + PICKS[active].vo + "”"; v.querySelector(".nm")!.textContent = PICKS[active].name + "  ·  priya"; v.style.left = coords[active].x + "px"; v.style.top = coords[active].y + "px"; v.style.opacity = "1"; }
        timer = window.setTimeout(() => { if (voiceRef.current) voiceRef.current.style.opacity = "0"; }, 3000);
        timer = window.setTimeout(point, 4000);
      };
      timer = window.setTimeout(point, 1300);
    })();
    // parallax — the city has weight
    function onMove(e: MouseEvent) { const w = window.innerWidth, h = window.innerHeight; tmx = (e.clientX / w - 0.5); tmy = (e.clientY / h - 0.5); }
    window.addEventListener("mousemove", onMove);
    function tick() { if (dead) return; mx += (tmx - mx) * 0.06; my += (tmy - my) * 0.06; const lay = lightsLayer.current; if (lay) lay.style.transform = `translate(${mx * 22}px, ${my * 16}px)`; raf = requestAnimationFrame(tick); }
    raf = requestAnimationFrame(tick);
    return () => { dead = true; clearTimeout(timer); cancelAnimationFrame(raf); window.removeEventListener("resize", project); window.removeEventListener("mousemove", onMove); try { heroMap.current?.remove?.(); closeMap.current?.remove?.(); } catch { } heroMap.current = null; closeMap.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const atmosphere = (
    <>
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(110% 80% at 50% 8%, rgba(232,150,60,.20) 0%, rgba(150,80,30,.06) 26%, transparent 50%)" }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(125% 100% at 50% 46%, transparent 30%, rgba(8,6,3,.55) 78%, rgba(6,4,2,.92) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "rgba(40,25,10,.26)", mixBlendMode: "multiply" }} />
    </>
  );

  return (
    <main style={{ background: "#0a0805" }}>
      <style>{`
        .glow{position:absolute;transform:translate(-50%,-50%);z-index:3;pointer-events:none;}
        .glow .d{display:block;width:8px;height:8px;border-radius:50%;background:#E6A23E;box-shadow:0 0 12px 3px rgba(230,162,62,.45);animation:breathe var(--bd,3s) ease-in-out infinite;}
        .glow.pointed .d{width:15px;height:15px;background:#FCE3AE;box-shadow:0 0 26px 9px rgba(246,208,138,.8);animation:none;}
        @keyframes breathe{0%,100%{opacity:.5;transform:scale(.9);}50%{opacity:1;transform:scale(1.12);}}
        .vbubble{position:absolute;z-index:5;max-width:250px;transform:translate(-50%,calc(-100% - 20px));opacity:0;transition:opacity .8s ease;pointer-events:none;text-align:center;}
        .vbubble .q{font-style:italic;font-weight:500;font-size:1.08rem;line-height:1.4;color:#F6EAD2;text-shadow:0 2px 16px rgba(0,0,0,.95);}
        .vbubble .nm{font-size:.72rem;color:#E6A23E;margin-top:7px;letter-spacing:.03em;}
        @media(prefers-reduced-motion:reduce){.glow .d{animation:none;}.lights-layer{transform:none!important;}}
      `}</style>

      {/* CHAPTER I — show me your city */}
      <section style={{ position: "relative", height: "100dvh", overflow: "hidden" }}>
        <div ref={heroMapEl} style={{ position: "absolute", inset: 0, zIndex: 0 }} />
        {atmosphere}
        <div ref={lightsLayer} className="lights-layer" style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
          {PICKS.map((p, i) => <div key={p.name} ref={(el) => { lightRefs.current[i] = el; }} className="glow" style={{ "--bd": `${2.6 + (i % 4) * 0.5}s` } as React.CSSProperties}><span className="d" /></div>)}
          <div ref={voiceRef} className="vbubble"><div className="q" /><div className="nm" /></div>
        </div>
        <div style={{ position: "absolute", zIndex: 6, top: 26, left: 28 }}><span style={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--ink)", letterSpacing: "-0.02em" }}>vouch<span style={{ color: "var(--accent)" }}>.</span></span></div>
        <div style={{ position: "absolute", zIndex: 6, top: "clamp(78px,15vh,150px)", left: 28, maxWidth: "60%", pointerEvents: "none" }}>
          <h1 style={{ fontWeight: 600, fontSize: "clamp(2rem,4.4vw,3.2rem)", lineHeight: 1.04, letterSpacing: "-0.03em", color: "var(--ink)", margin: 0, maxWidth: "16ch", textShadow: "0 2px 24px rgba(0,0,0,.6)" }}>come here — let me show you my city.</h1>
          <p style={{ fontSize: "1rem", color: "var(--muted)", margin: "12px 0 0" }}>the places i&apos;d actually take you. not a list — the real ones.</p>
        </div>
        <div style={{ position: "absolute", zIndex: 6, bottom: 24, left: "50%", transform: "translateX(-50%)", fontSize: "0.74rem", color: "var(--faint)", pointerEvents: "none" }}>scroll — we&apos;ll start somewhere good ↓</div>
      </section>

      {/* CHAPTER II — start here (up close) */}
      <section style={{ position: "relative", height: "100dvh", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center" }} className="v3-close">
        <div ref={closeMapEl} style={{ position: "absolute", inset: 0, zIndex: 0 }} />
        {atmosphere}
        <div style={{ position: "absolute", zIndex: 3, top: "50%", left: "75%", transform: "translate(-50%,-50%)", width: 18, height: 18, borderRadius: "50%", background: "#FCE3AE", boxShadow: "0 0 30px 11px rgba(246,208,138,.8)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 5, padding: "0 clamp(28px,6vw,90px)", maxWidth: 560 }}>
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", margin: 0 }}>01 · the morning</p>
          <h2 style={{ fontWeight: 600, fontSize: "clamp(2rem,4.4vw,3rem)", lineHeight: 1.04, letterSpacing: "-0.025em", color: "var(--ink)", margin: "12px 0 0" }}>Airlines Hotel.</h2>
          <p style={{ fontStyle: "italic", fontWeight: 500, fontSize: "clamp(1.2rem,2.4vw,1.6rem)", lineHeight: 1.4, color: "#F6EAD2", margin: "18px 0 0", maxWidth: "22ch" }}>“filter coffee under the rain trees at 7am, poured by men who&apos;ve done it thirty years. the one i&apos;d grieve if it closed.”</p>
          <div style={{ display: "flex", gap: 28, marginTop: 24 }}>
            <div><div style={{ fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--faint)" }}>order</div><div style={{ fontSize: "0.95rem", color: "var(--ink)", marginTop: 4 }}>filter coffee, by the half</div></div>
            <div><div style={{ fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--faint)" }}>go</div><div style={{ fontSize: "0.95rem", color: "var(--ink)", marginTop: 4 }}>7–9am, before it&apos;s loud</div></div>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--faint)", marginTop: 26 }}>· five more, the way the day wants them ·</p>
        </div>
      </section>

      {/* CHAPTER III — now light your own */}
      <section style={{ position: "relative", minHeight: "100dvh", display: "grid", placeItems: "center", textAlign: "center", padding: "0 28px", overflow: "hidden", background: "#08060300" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(100% 70% at 50% 92%, rgba(232,150,60,.16) 0%, transparent 55%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "30%", left: "50%", transform: "translateX(-50%)", width: 9, height: 9, borderRadius: "50%", background: "#7a6a48", boxShadow: "0 0 10px 2px rgba(122,106,72,.5)", animation: "breathe 3.2s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 620 }}>
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--faint)", margin: 0 }}>your city&apos;s still dark</p>
          <h2 style={{ fontWeight: 600, fontSize: "clamp(2.2rem,5vw,3.6rem)", lineHeight: 1.04, letterSpacing: "-0.025em", color: "var(--ink)", margin: "16px 0 0" }}>Light it up.</h2>
          <p style={{ fontSize: "1.12rem", lineHeight: 1.6, color: "var(--muted)", margin: "18px auto 0", maxWidth: "40ch" }}>The next time someone asks where to go, show them the way you would — your places, your voice, your name on every one.</p>
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
