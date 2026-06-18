"use client";
import { useEffect, useState } from "react";
import { MapReal, type MapPin } from "../../../../components/vouch/map-real";
import { loadSaved, toggleSaved, type Saved } from "../../../../components/v2/data";
import { CatIcon, Eyebrow, Monogram } from "../../../../components/v2/kit";

/* PHASE 6 — my map (the borrow payoff).
   JTBD (viewer): "keep what i trust — and remember who sent me." Every saved
   place keeps its provenance ("via Priya"); that attribution is the one thing a
   Google Maps save throws away, and it's what makes this a trust graph. */

export default function MyMap() {
  const [saved, setSaved] = useState<Saved[] | null>(null);
  const [mapReady, setMapReady] = useState(false);
  useEffect(() => { setSaved(loadSaved()); }, []);

  const remove = (s: Saved) => setSaved(toggleSaved(s));

  if (saved === null) return null;
  const pins: MapPin[] = saved.map((s, i) => ({ id: `${i}`, lat: s.lat, lng: s.lng, name: s.name, line: s.note, occasion: `via ${s.via}`, kind: "palate", by: { name: s.via, ini: s.viaIni } }));

  return (
    <main style={{ minHeight: "100dvh" }}>
      <header style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--line)" }}>
        <a href="/v2" style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "1.05rem", color: "var(--ink)", textDecoration: "none" }}>vouch<span style={{ color: "var(--accent)" }}>.</span></a>
        <a href="/v2" style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", color: "var(--mut)", textDecoration: "none" }}>← your guides</a>
      </header>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "44px 28px 18px" }}>
        <Eyebrow>// my map</Eyebrow>
        <h1 style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "clamp(1.9rem,3.6vw,2.6rem)", letterSpacing: "-0.025em", color: "var(--ink)", margin: "12px 0 0" }}>places people i trust vouched for.</h1>
        <p style={{ fontFamily: "var(--sans)", fontSize: "1.05rem", color: "var(--mut)", margin: "12px 0 0" }}>{saved.length ? `${saved.length} saved · each one still carries whose pick it was.` : "the places you save from a guide land here — with the name attached."}</p>
      </div>

      {saved.length === 0 ? (
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "10px 28px 90px" }}>
          <div style={{ border: "1px dashed var(--line2)", borderRadius: "var(--r-xl)", padding: "56px 32px", textAlign: "center" }}>
            <div style={{ display: "inline-grid", placeItems: "center", width: 60, height: 60, borderRadius: "50%", background: "var(--accent-dim)", border: "1px solid var(--accent-line)", color: "var(--accent)", marginBottom: 16 }}><CatIcon cat="coffee" size={28} /></div>
            <h2 style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "1.4rem", color: "var(--ink)", margin: 0 }}>nothing saved yet.</h2>
            <p style={{ fontFamily: "var(--sans)", fontSize: "1rem", color: "var(--mut)", margin: "10px auto 0", maxWidth: "40ch", lineHeight: 1.5 }}>open a guide from someone you trust and tap <b style={{ color: "var(--read)", fontWeight: 500 }}>save</b> — it&apos;ll show up here, on your map, with their name on it.</p>
            <a href="/v2/g/priya" style={{ display: "inline-block", marginTop: 22, fontFamily: "var(--mono)", fontSize: "0.75rem", color: "var(--accent-ink)", background: "var(--accent)", borderRadius: "var(--r-md)", padding: "12px 20px", textDecoration: "none" }}>open an example guide →</a>
          </div>
        </div>
      ) : (
        <div className="v2-mapsplit v2-pad" style={{ maxWidth: 1080, margin: "0 auto", padding: "10px 28px 80px" }}>
          <div className="v2-mapbox" style={{ position: "relative", height: "72dvh", borderRadius: "var(--r-xl)", overflow: "hidden", border: "1px solid var(--line2)" }}>
            <div className={`v2-skeleton${mapReady ? " ready" : ""}`}><span style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.08em", color: "var(--faint)" }}>drawing your map…</span></div>
            <MapReal pins={pins} height="100%" labelMode="hover" onReady={() => setMapReady(true)} tag="my map · bengaluru" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {saved.map((s, i) => (
              <div key={i} style={{ background: "var(--s2)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "14px 15px", display: "flex", alignItems: "center", gap: 13 }}>
                <span style={{ color: "var(--accent)", flex: "none" }}><CatIcon cat={s.cat} size={22} /></span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: "block", fontFamily: "var(--sans)", fontWeight: 600, fontSize: "1rem", color: "var(--ink)" }}>{s.name}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, fontFamily: "var(--mono)", fontSize: "0.62rem", color: "var(--mut)" }}>
                    <Monogram ini={s.viaIni} size={16} /> via {s.via} <span style={{ color: "var(--faint)" }}>· {s.area}</span>
                  </span>
                </span>
                <button type="button" onClick={() => remove(s)} aria-label="remove" style={{ flex: "none", width: 28, height: 28, borderRadius: "var(--r-sm)", border: "1px solid var(--line2)", background: "none", color: "var(--faint)", cursor: "pointer" }}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
