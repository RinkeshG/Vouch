"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { CAT_LABEL, SEED } from "../../../components/v2/data";
import { Button } from "../../../components/v3/kit";

/* The landing as an experience, not a page.
   A real dark map of the city at night. The places someone loves glow like warm
   windows. Your cursor is a lantern — sweep it and the good places wake, bloom,
   and whisper why to go. It resolves into the hand-off: now light up your city. */

const PLACES = SEED.places.map((p) => ({ name: p.name, vo: p.note, ct: CAT_LABEL[p.cat] + (p.when ? " · " + p.when : ""), lat: p.lat, lng: p.lng }));

export default function Landing() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const mapEl = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = useRef<any>(null);
  const lanternRef = useRef<HTMLDivElement | null>(null);
  const curRef = useRef<HTMLDivElement | null>(null);
  const bloomRef = useRef<HTMLDivElement | null>(null);
  const lightRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let dead = false; let raf = 0;
    const coords = PLACES.map(() => ({ x: -999, y: -999 }));
    let px = 0, py = 0, idle = true, t = 0, lastMove = 0, started = false;

    function project() {
      const m = map.current; if (!m) return;
      PLACES.forEach((p, i) => {
        const pt = m.latLngToContainerPoint([p.lat, p.lng]);
        coords[i] = { x: pt.x, y: pt.y };
        const el = lightRefs.current[i];
        if (el) { el.style.left = pt.x + "px"; el.style.top = pt.y + "px"; }
      });
    }

    (async () => {
      const L = (await import("leaflet")).default;
      if (dead || !mapEl.current || map.current) return;
      const m = L.map(mapEl.current, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false, tap: false }).setView([12.966, 77.602], 12);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", { subdomains: "abcd", detectRetina: true }).addTo(m);
      map.current = m;
      const hero = heroRef.current!;
      px = hero.clientWidth * 0.5; py = hero.clientHeight * 0.45;
      setTimeout(() => { m.invalidateSize(); project(); }, 90);
      setTimeout(project, 500);
      window.addEventListener("resize", project);

      const R = 230, BR = 70;
      function loop() {
        if (dead) return;
        const hero = heroRef.current; if (!hero) { raf = requestAnimationFrame(loop); return; }
        const w = hero.clientWidth, h = hero.clientHeight;
        if (idle) { t += 0.01; px = w * (0.5 + 0.32 * Math.sin(t)); py = h * (0.46 + 0.26 * Math.sin(t * 1.4 + 1)); }
        if (lanternRef.current) { lanternRef.current.style.left = px + "px"; lanternRef.current.style.top = py + "px"; }
        if (curRef.current) { curRef.current.style.left = px + "px"; curRef.current.style.top = py + "px"; curRef.current.style.opacity = idle ? "0" : "1"; }
        let best = -1, bestB = 0;
        for (let i = 0; i < PLACES.length; i++) {
          const c = coords[i]; const d = Math.hypot(c.x - px, c.y - py); let b = Math.max(0, 1 - d / R); b = b * b;
          const el = lightRefs.current[i]; if (!el) continue;
          el.style.opacity = String(0.2 + 0.8 * b);
          el.style.transform = "translate(-50%,-50%) scale(" + (1 + 1.6 * b) + ")";
          el.style.boxShadow = "0 0 " + (7 + 30 * b) + "px " + (2 + 9 * b) + "px rgba(230,162,62," + (0.3 + 0.6 * b) + ")";
          if (b > bestB) { bestB = b; best = i; }
        }
        const bloom = bloomRef.current;
        if (bloom) {
          if (best >= 0 && bestB > 0.28) {
            const p = PLACES[best]; const c = coords[best];
            (bloom.querySelector(".nm") as HTMLElement).textContent = p.name;
            (bloom.querySelector(".vo") as HTMLElement).textContent = "“" + p.vo + "”";
            (bloom.querySelector(".ct") as HTMLElement).textContent = p.ct;
            bloom.style.left = c.x + "px"; bloom.style.top = c.y + "px";
            bloom.style.opacity = "1"; bloom.style.transform = c.y < 150 ? "translate(-50%, 20px)" : "translate(-50%, calc(-100% - 20px))";
          } else bloom.style.opacity = "0";
        }
        raf = requestAnimationFrame(loop);
      }
      raf = requestAnimationFrame(loop);

      const onMove = (x: number, y: number) => { const r = hero.getBoundingClientRect(); px = x - r.left; py = y - r.top; idle = false; lastMove = Date.now(); if (!started) { started = true; hero.classList.add("v3-explored"); } };
      hero.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
      hero.addEventListener("touchmove", (e) => { if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
      hero.addEventListener("mouseleave", () => { idle = true; });
      const idleTimer = setInterval(() => { if (Date.now() - lastMove > 2400) idle = true; }, 700);
      (hero as unknown as { _it?: number })._it = idleTimer as unknown as number;
    })();

    return () => { dead = true; cancelAnimationFrame(raf); window.removeEventListener("resize", project); try { map.current?.remove?.(); } catch { } map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={{ background: "var(--bg)" }}>
      {/* ACT I — the dark city, lit by the lantern */}
      <section ref={heroRef} style={{ position: "relative", height: "100dvh", overflow: "hidden", cursor: "none" }}>
        <div ref={mapEl} style={{ position: "absolute", inset: 0, zIndex: 0 }} />
        {/* night + warmth over the cool map */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "radial-gradient(120% 90% at 50% 42%, rgba(20,15,8,.45) 0%, rgba(11,9,5,.82) 70%, rgba(8,6,3,.95) 100%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "rgba(38,24,10,.34)", mixBlendMode: "multiply", pointerEvents: "none" }} />
        {/* the lantern */}
        <div ref={lanternRef} style={{ position: "absolute", zIndex: 2, width: 460, height: 460, borderRadius: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle, rgba(230,162,62,.22), rgba(230,162,62,.08) 38%, transparent 66%)", mixBlendMode: "screen", filter: "blur(8px)", pointerEvents: "none" }} />
        {/* the place lights */}
        {PLACES.map((p, i) => (
          <div key={p.name} ref={(el) => { lightRefs.current[i] = el; }} style={{ position: "absolute", zIndex: 3, width: 14, height: 14, borderRadius: "50%", background: "var(--accent)", transform: "translate(-50%,-50%)", opacity: 0.2, pointerEvents: "none", willChange: "transform,opacity" }} />
        ))}
        {/* the whisper */}
        <div ref={bloomRef} style={{ position: "absolute", zIndex: 4, maxWidth: 250, opacity: 0, transition: "opacity .25s ease", pointerEvents: "none" }}>
          <div className="nm" style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--ink)", letterSpacing: "-0.01em" }} />
          <div className="vo" style={{ fontStyle: "italic", fontSize: "0.88rem", lineHeight: 1.45, color: "#EADCC2", marginTop: 4 }} />
          <div className="ct" style={{ fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginTop: 8 }} />
        </div>
        <div ref={curRef} style={{ position: "absolute", zIndex: 6, width: 9, height: 9, borderRadius: "50%", transform: "translate(-50%,-50%)", background: "#F6D08A", boxShadow: "0 0 16px 5px rgba(230,162,62,.7)", pointerEvents: "none", opacity: 0 }} />
        {/* foreground */}
        <div style={{ position: "absolute", zIndex: 5, top: 26, left: 28, pointerEvents: "auto" }}>
          <span style={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--ink)", letterSpacing: "-0.02em" }}>vouch<span style={{ color: "var(--accent)" }}>.</span></span>
        </div>
        <div style={{ position: "absolute", zIndex: 5, top: "clamp(80px,16vh,160px)", left: 28, maxWidth: "62%", pointerEvents: "none" }}>
          <p style={{ fontSize: "1rem", color: "var(--muted)", margin: 0 }}>you're going to bengaluru.</p>
          <h1 style={{ fontWeight: 600, fontSize: "clamp(2rem,4.6vw,3.4rem)", lineHeight: 1.02, letterSpacing: "-0.03em", color: "var(--ink)", margin: "8px 0 0", maxWidth: "16ch" }}>here's where i'd actually go.</h1>
          <p className="v3-explore-hint" style={{ fontSize: "0.82rem", color: "var(--faint)", marginTop: 22 }}>↪ sweep the dark — the good places light up</p>
        </div>
        <div style={{ position: "absolute", zIndex: 5, bottom: 24, left: "50%", transform: "translateX(-50%)", fontSize: "0.74rem", color: "var(--faint)", pointerEvents: "none" }}>scroll ↓</div>
        <style>{`.v3-explored .v3-explore-hint{opacity:0;transition:opacity .6s;}`}</style>
      </section>

      {/* ACT II — the hand-off: now it's your turn */}
      <section style={{ position: "relative", minHeight: "92dvh", display: "grid", placeItems: "center", textAlign: "center", padding: "0 28px", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 700, height: 480, top: "8%", left: "50%", transform: "translateX(-50%)", borderRadius: "50%", filter: "blur(110px)", opacity: 0.18, background: "radial-gradient(circle, var(--accent), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 640 }}>
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", margin: 0 }}>your turn</p>
          <h2 style={{ fontWeight: 600, fontSize: "clamp(2.2rem,5vw,3.6rem)", lineHeight: 1.04, letterSpacing: "-0.025em", color: "var(--ink)", margin: "16px 0 0" }}>Now light up your city.</h2>
          <p style={{ fontSize: "1.12rem", lineHeight: 1.6, color: "var(--muted)", margin: "18px auto 0", maxWidth: "42ch" }}>The next time a friend asks where to go, hand them the lantern. Your places, in your words, with your name on every one.</p>
          <div style={{ marginTop: 30, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/v3/new" style={{ textDecoration: "none" }}><Button>Make your guide →</Button></a>
            <a href="/v3/g/priya" style={{ textDecoration: "none" }}><Button variant="ghost">see one first</Button></a>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--faint)", marginTop: 14 }}>free · about two minutes · no app to download</p>
        </div>
        <span style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", fontSize: "0.74rem", color: "var(--faint)" }}>vouch · the recommendations worth keeping</span>
      </section>
    </main>
  );
}
