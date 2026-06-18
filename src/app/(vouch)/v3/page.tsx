"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { Button, Monogram } from "../../../components/v3/kit";

/* The landing.
   ACT I — the living map: real Bengaluru, dense with real places, quietly alive.
   Every moment a random pin glows and says its name. The city, naming itself.
   ACT II — the voice: the product's soul. Real vouches, spoken large, signed by
   real people — a recommendation with a name on it.
   ACT III — your turn. */

const CITY: [string, number, number][] = [
  ["Airlines Hotel", 12.9716, 77.5995], ["Koshy's", 12.9738, 77.6010], ["Third Wave, Lavelle", 12.9692, 77.5975],
  ["Toit", 12.9783, 77.6408], ["Byg Brewski", 13.0358, 77.6403], ["VV Puram", 12.9419, 77.5731],
  ["Corner House", 12.9716, 77.6050], ["Maverick & Farmer", 12.9352, 77.6245], ["Blue Tokai", 12.9340, 77.6270],
  ["MTR", 12.9507, 77.5848], ["CTR", 13.0048, 77.5715], ["Vidyarthi Bhavan", 12.9498, 77.5731],
  ["Truffles", 12.9352, 77.6196], ["Glen's Bakehouse", 12.9719, 77.6412], ["Dyu Art Cafe", 12.9279, 77.6271],
  ["Matteo, Church St", 12.9748, 77.6075], ["The Permit Room", 12.9748, 77.6090], ["Social, Church St", 12.9740, 77.6072],
  ["Burma Burma", 12.9716, 77.6100], ["Karavalli", 12.9609, 77.6005], ["Nagarjuna", 12.9716, 77.6045],
  ["Empire", 12.9750, 77.6110], ["Brahmin's Coffee Bar", 12.9450, 77.5660], ["Asha Sweet Center", 12.9300, 77.5830],
  ["Arbor Brewing", 12.9700, 77.6420], ["Windmills, Whitefield", 12.9500, 77.7000], ["Naru Noodle Bar", 12.9400, 77.5700],
  ["The Rameshwaram Cafe", 12.9719, 77.6900], ["Cafe Azzure", 12.9716, 77.6080], ["Smoke House Deli", 12.9720, 77.6400],
  ["Lazy Suzan", 12.9352, 77.6260], ["Magnolia Bakehouse", 12.9710, 77.6410], ["Anand Sweets", 12.9330, 77.6190],
];

const VOICES = [
  { vo: "Filter coffee under the rain trees at 7am. The one I'd genuinely grieve if it closed.", who: "Priya", ini: "PR", place: "Airlines Hotel" },
  { vo: "A weekday, never a weekend. The Toit Weiss and a wood-fired pizza — you'll thank me.", who: "Ankit", ini: "AK", place: "Toit" },
  { vo: "Go for the sunset off the deck, not the beer. Get there before six.", who: "Meera", ini: "ME", place: "Byg Brewski" },
];

export default function Landing() {
  const mapEl = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = useRef<any>(null);
  const pinRefs = useRef<(HTMLDivElement | null)[]>([]);
  const voiceRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let dead = false; let timer = 0;
    function project() {
      const m = map.current; if (!m) return;
      CITY.forEach((c, i) => { const pt = m.latLngToContainerPoint([c[1], c[2]]); const el = pinRefs.current[i]; if (el) { el.style.left = pt.x + "px"; el.style.top = pt.y + "px"; } });
    }
    (async () => {
      const L = (await import("leaflet")).default;
      if (dead || !mapEl.current || map.current) return;
      const m = L.map(mapEl.current, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false, tap: false });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", { subdomains: "abcd", detectRetina: true }).addTo(m);
      m.fitBounds(CITY.map((c) => [c[1], c[2]]) as [number, number][], { padding: [70, 70] });
      map.current = m;
      setTimeout(() => { m.invalidateSize(); m.fitBounds(CITY.map((c) => [c[1], c[2]]) as [number, number][], { padding: [70, 70] }); project(); }, 120);
      setTimeout(project, 700);
      window.addEventListener("resize", project);
      // the city names itself — a random pin glows every beat
      const glow = () => {
        if (dead) return;
        const i = (Math.random() * CITY.length) | 0; const el = pinRefs.current[i];
        if (el && !el.classList.contains("on")) { el.classList.add("on"); el.style.zIndex = "9"; setTimeout(() => { el.classList.remove("on"); el.style.zIndex = "3"; }, 2300); }
        timer = window.setTimeout(glow, 650 + Math.random() * 700);
      };
      timer = window.setTimeout(glow, 600);
    })();

    // ACT II — voices rise as they enter
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) (e.target as HTMLElement).classList.add("shown"); }), { threshold: 0.35 });
    voiceRefs.current.forEach((v) => v && io.observe(v));

    return () => { dead = true; clearTimeout(timer); window.removeEventListener("resize", project); io.disconnect(); try { map.current?.remove?.(); } catch { } map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={{ background: "var(--bg)" }}>
      <style>{`
        .vpin{position:absolute;transform:translate(-50%,-50%);z-index:3;pointer-events:none;}
        .vpin .dot{display:block;width:6px;height:6px;border-radius:50%;background:#6f6244;transition:width .45s var(--eout),height .45s var(--eout),background .45s,box-shadow .45s;}
        .vpin.on .dot{width:11px;height:11px;background:#E6A23E;box-shadow:0 0 16px 5px rgba(230,162,62,.7);}
        .vpin .nm{position:absolute;left:15px;top:50%;transform:translateY(-50%) translateX(-4px);white-space:nowrap;font-size:.8rem;font-weight:500;color:#F3EBD9;opacity:0;transition:opacity .45s,transform .45s var(--eout);text-shadow:0 1px 8px rgba(0,0,0,.9);}
        .vpin.on .nm{opacity:1;transform:translateY(-50%) translateX(0);}
        .voice{opacity:0;transform:translateY(28px);transition:opacity .8s var(--eout),transform .8s var(--eout);}
        .voice.shown{opacity:1;transform:none;}
        @media(prefers-reduced-motion:reduce){.voice{opacity:1;transform:none;}}
      `}</style>

      {/* ACT I — the living map */}
      <section style={{ position: "relative", height: "100dvh", overflow: "hidden" }}>
        <div ref={mapEl} style={{ position: "absolute", inset: 0, zIndex: 0 }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(125% 95% at 50% 40%, rgba(26,19,11,.30) 0%, rgba(10,8,5,.86) 78%, rgba(7,5,3,.96) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "rgba(36,23,10,.24)", mixBlendMode: "multiply", pointerEvents: "none" }} />
        {CITY.map((c, i) => (
          <div key={c[0]} ref={(el) => { pinRefs.current[i] = el; }} className="vpin"><span className="dot" /><span className="nm">{c[0]}</span></div>
        ))}
        <div style={{ position: "absolute", zIndex: 6, top: 26, left: 28 }}><span style={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--ink)", letterSpacing: "-0.02em" }}>vouch<span style={{ color: "var(--accent)" }}>.</span></span></div>
        <div style={{ position: "absolute", zIndex: 6, top: "clamp(82px,16vh,150px)", left: 28, maxWidth: "56%", pointerEvents: "none" }}>
          <p style={{ fontSize: "0.95rem", color: "var(--muted)", margin: 0 }}>bengaluru, right now.</p>
          <h1 style={{ fontWeight: 600, fontSize: "clamp(2rem,4.4vw,3.2rem)", lineHeight: 1.03, letterSpacing: "-0.03em", color: "var(--ink)", margin: "8px 0 0", maxWidth: "15ch" }}>every pin is a place someone swears by.</h1>
        </div>
        <div style={{ position: "absolute", zIndex: 6, bottom: 24, left: "50%", transform: "translateX(-50%)", fontSize: "0.74rem", color: "var(--faint)", pointerEvents: "none" }}>but which ones can you trust? ↓</div>
      </section>

      {/* ACT II — the voice */}
      <section style={{ position: "relative", padding: "clamp(80px,14vh,160px) 28px", maxWidth: 880, margin: "0 auto" }}>
        <div ref={(el) => { voiceRefs.current[0] = el; }} className="voice" style={{ textAlign: "center", marginBottom: "clamp(70px,12vh,130px)" }}>
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", margin: 0 }}>no stars · no strangers</p>
          <h2 style={{ fontWeight: 600, fontSize: "clamp(1.9rem,4vw,2.9rem)", lineHeight: 1.08, letterSpacing: "-0.02em", color: "var(--ink)", margin: "16px auto 0", maxWidth: "20ch" }}>This is what a recommendation sounds like when it has a name on it.</h2>
        </div>
        {VOICES.map((v, i) => (
          <div key={v.place} ref={(el) => { voiceRefs.current[i + 1] = el; }} className="voice" style={{ marginBottom: "clamp(56px,9vh,100px)", textAlign: i % 2 ? "right" : "left" }}>
            <p style={{ fontWeight: 500, fontSize: "clamp(1.5rem,3.4vw,2.4rem)", lineHeight: 1.28, letterSpacing: "-0.015em", color: "var(--ink)", margin: 0, maxWidth: "20ch", marginLeft: i % 2 ? "auto" : 0 }}>
              <span style={{ color: "var(--accent)" }}>“</span>{v.vo}<span style={{ color: "var(--accent)" }}>”</span>
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 11, marginTop: 20, flexDirection: i % 2 ? "row-reverse" : "row" }}>
              <Monogram ini={v.ini} size={38} />
              <span style={{ textAlign: i % 2 ? "right" : "left" }}>
                <span style={{ display: "block", fontWeight: 600, fontSize: "0.95rem", color: "var(--ink)" }}>{v.who}</span>
                <span style={{ display: "block", fontSize: "0.82rem", color: "var(--muted)" }}>on {v.place}</span>
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* ACT III — your turn */}
      <section style={{ position: "relative", minHeight: "78dvh", display: "grid", placeItems: "center", textAlign: "center", padding: "0 28px 80px", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 720, height: 460, top: "2%", left: "50%", transform: "translateX(-50%)", borderRadius: "50%", filter: "blur(120px)", opacity: 0.18, background: "radial-gradient(circle, var(--accent), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 640 }}>
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", margin: 0 }}>your turn</p>
          <h2 style={{ fontWeight: 600, fontSize: "clamp(2.2rem,5vw,3.6rem)", lineHeight: 1.04, letterSpacing: "-0.025em", color: "var(--ink)", margin: "16px 0 0" }}>Put your name on the map.</h2>
          <p style={{ fontSize: "1.12rem", lineHeight: 1.6, color: "var(--muted)", margin: "18px auto 0", maxWidth: "42ch" }}>The next time someone asks where to go, send them the places you'd swear by — in your words, with your name on every one.</p>
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
