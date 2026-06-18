"use client";
import { useEffect, useState } from "react";
import { loadSaved, myGuides, type Guide } from "../../../components/v2/data";
import { CatIcon, Eyebrow, Monogram } from "../../../components/v2/kit";

/* PHASE 5 — home / your guides.
   JTBD: "let me start, or get back to my guide, and feel it's mine." Drafts and
   published live together; the cold-start is a warm invitation, not a void;
   identity is light (the published guide is the real profile in v0.1). */

export default function Home() {
  const [guides, setGuides] = useState<Guide[] | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => { setGuides(myGuides()); setSavedCount(loadSaved().length); }, []);

  return (
    <main style={{ minHeight: "100dvh" }}>
      <header style={{ maxWidth: 1040, margin: "0 auto", padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--line)" }}>
        <span style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "1.05rem", color: "var(--ink)" }}>vouch<span style={{ color: "var(--accent)" }}>.</span></span>
        <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/v2/saved" style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", color: "var(--mut)", textDecoration: "none" }}>my map{savedCount ? ` · ${savedCount}` : ""} ↗</a>
          <Monogram ini="YO" size={28} />
        </span>
      </header>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "48px 28px 90px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <Eyebrow>// your guides</Eyebrow>
            <h1 style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "clamp(1.9rem,3.6vw,2.6rem)", letterSpacing: "-0.025em", color: "var(--ink)", margin: "12px 0 0" }}>the places you vouch for.</h1>
          </div>
          <a href="/v2/new" style={{ fontFamily: "var(--mono)", fontSize: "0.75rem", fontWeight: 500, color: "var(--accent-ink)", background: "var(--accent)", borderRadius: "var(--r-md)", padding: "12px 18px", textDecoration: "none" }}>+ new guide</a>
        </div>

        {guides === null ? null : guides.length === 0 ? (
          <div style={{ marginTop: 40, border: "1px dashed var(--line2)", borderRadius: "var(--r-xl)", padding: "56px 32px", textAlign: "center" }}>
            <div style={{ display: "inline-grid", placeItems: "center", width: 64, height: 64, borderRadius: "50%", background: "var(--accent-dim)", border: "1px solid var(--accent-line)", color: "var(--accent)", marginBottom: 18 }}><CatIcon cat="coffee" size={30} /></div>
            <h2 style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "1.5rem", color: "var(--ink)", margin: 0, letterSpacing: "-0.02em" }}>you haven&apos;t made one yet.</h2>
            <p style={{ fontFamily: "var(--sans)", fontSize: "1.05rem", color: "var(--mut)", margin: "10px auto 0", maxWidth: "42ch", lineHeight: 1.5 }}>the next time a friend asks where to go, send them a page instead of a paragraph. start with five places you love.</p>
            <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/v2/new" style={{ fontFamily: "var(--mono)", fontSize: "0.75rem", fontWeight: 500, color: "var(--accent-ink)", background: "var(--accent)", borderRadius: "var(--r-md)", padding: "12px 20px", textDecoration: "none" }}>make your first guide →</a>
              <a href="/v2/g/priya" style={{ fontFamily: "var(--mono)", fontSize: "0.75rem", color: "var(--read)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", padding: "12px 20px", textDecoration: "none" }}>see an example</a>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 34, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
            {guides.map((g) => <GuideCard key={g.slug} g={g} />)}
            <a href="/v2/new" style={{ display: "grid", placeItems: "center", minHeight: 220, border: "1px dashed var(--line2)", borderRadius: "var(--r-xl)", textDecoration: "none", color: "var(--mut)", fontFamily: "var(--mono)", fontSize: "0.8rem" }}>+ new guide</a>
          </div>
        )}
      </div>
    </main>
  );
}

function GuideCard({ g }: { g: Guide }) {
  const href = g.published ? `/v2/g/${g.slug}` : `/v2/edit/${g.slug}`;
  const cat = g.places[0]?.cat ?? "coffee";
  return (
    <a href={href} className="v2-card" style={{ display: "block", textDecoration: "none", background: "linear-gradient(165deg, var(--s2), #100e0a)", border: "1px solid var(--line)", borderRadius: "var(--r-xl)", overflow: "hidden", boxShadow: "0 24px 54px -38px rgba(0,0,0,.9)" }}>
      <div style={{ position: "relative", height: 116, display: "grid", placeItems: "center", background: "var(--media-bg)", borderBottom: "1px solid var(--line)" }}>
        <span style={{ position: "absolute", top: 12, left: 12, fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 9px", borderRadius: "var(--r-pill)", border: `1px solid ${g.published ? "var(--accent-line)" : "var(--line2)"}`, color: g.published ? "var(--accent)" : "var(--mut)", background: g.published ? "var(--accent-dim)" : "transparent" }}>{g.published ? "live" : "draft"}</span>
        <CatIcon cat={cat} size={32} />
      </div>
      <div style={{ padding: "15px 17px 17px" }}>
        <h3 style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "1.18rem", letterSpacing: "-0.015em", color: "var(--ink)", margin: 0, lineHeight: 1.15 }}>{g.title}</h3>
        <p style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", color: "var(--mut)", margin: "10px 0 0" }}>{g.places.length} {g.places.length === 1 ? "place" : "places"} · {g.published ? "open ↗" : "continue editing →"}</p>
      </div>
    </a>
  );
}
