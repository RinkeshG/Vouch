"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MapReal, type MapPin } from "../../../../../components/vouch/map-real";
import { CAT_LABEL, getGuide, loadSaved, toggleSaved, type Place } from "../../../../../components/v2/data";
import { Button, Curator, Eyebrow, Lede, LinkButton, LostIcon, Monogram, PlaceCard, PlaceDetail, Seal, StatePanel, Title, Toggle } from "../../../../../components/v2/kit";

function useCountUp(target: number, ms = 650) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / ms); setN(Math.round(target * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

/* PHASE 2 — published guide (viewer) · PHASE 4 — share moment · PHASE 6 — save w/ provenance. */

const MapIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" /></svg>;
const GridIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></svg>;

export default function PublishedGuide() {
  const params = useParams<{ slug: string }>();
  const guide = useMemo(() => getGuide(params.slug), [params.slug]);
  const [view, setView] = useState<"cards" | "map">("cards");
  const [sel, setSel] = useState<string>(guide?.places[0]?.id ?? "");
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [share, setShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const count = useCountUp(guide?.places.length ?? 0);

  useEffect(() => {
    if (!guide) return;
    setUrl(`${window.location.origin}/v2/g/${guide.slug}`);
    setSavedKeys(new Set(loadSaved().filter((s) => s.guideSlug === guide.slug).map((s) => s.name)));
    if (new URLSearchParams(window.location.search).get("just") === "1") setShare(true);
  }, [guide]);

  if (!guide) return (
    <main>
      <StatePanel icon={<LostIcon />} title="this guide has wandered off." body="the link may be old, or it lived only on someone else's device. you can always start your own." actions={<><LinkButton href="/v2/new">make a guide →</LinkButton><LinkButton href="/v2/g/priya" variant="ghost">see an example</LinkButton></>} />
    </main>
  );

  const pins: MapPin[] = guide.places.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, name: p.name, line: p.note, occasion: p.when, kind: "palate", by: { name: p.by ?? guide.curator.name, ini: p.ini ?? guide.curator.ini } }));
  const selected = guide.places.find((p) => p.id === sel) ?? guide.places[0];
  const selRank = guide.places.findIndex((p) => p.id === selected.id) + 1;

  const save = (p: Place) => {
    const adding = !savedKeys.has(p.name);
    toggleSaved({ ...p, via: guide.curator.name, viaIni: guide.curator.ini, guideSlug: guide.slug, guideTitle: guide.title });
    setSavedKeys((prev) => { const n = new Set(prev); n.has(p.name) ? n.delete(p.name) : n.add(p.name); return n; });
    if (adding) { setToast(`stamped on your map · via ${guide.curator.name.toLowerCase()}`); window.setTimeout(() => setToast(null), 2300); }
  };
  const copy = () => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); };

  const SaveBtn = ({ p }: { p: Place }) => {
    const on = savedKeys.has(p.name);
    return (
      <button key={`${p.name}-${on}`} type="button" onClick={() => save(p)} className={`v2-btn ${on ? "v2-pop" : ""}`} style={{ marginTop: 16, background: on ? "var(--accent-dim)" : "none", border: `1px solid ${on ? "var(--accent-line)" : "var(--line2)"}`, borderRadius: "var(--r-md)", padding: "9px 14px", cursor: "pointer", fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.04em", color: on ? "var(--accent)" : "var(--read)" }}>
        {on ? "✓ saved to my map" : "+ save to my map"}
      </button>
    );
  };

  return (
    <main style={{ minHeight: "100dvh" }}>
      <header style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--line)" }}>
        <a href="/v2" style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "1.05rem", color: "var(--ink)", textDecoration: "none" }}>vouch<span style={{ color: "var(--accent)" }}>.</span></a>
        <Button variant="ghost" onClick={() => setShare(true)}>share ↗</Button>
      </header>

      <div className="v2-pad" style={{ position: "relative", maxWidth: 1080, margin: "0 auto", padding: "48px 28px 18px" }}>
        <div className="v2-glow" style={{ top: -30, left: -40 }} aria-hidden="true" />
        <div style={{ position: "relative" }}>
          <Eyebrow>// a guide by {guide.curator.name.toLowerCase()}</Eyebrow>
          <Title>{guide.title}.</Title>
          <Lede>{guide.intro}</Lede>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
            <Curator name={guide.curator.name} ini={guide.curator.ini} bio={guide.curator.bio} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[...new Set(guide.places.map((p) => p.cat))].slice(0, 4).map((c) => (
                <span key={c} style={{ fontFamily: "var(--mono)", fontSize: "0.58rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--mut)", border: "1px solid var(--line2)", borderRadius: "var(--r-pill)", padding: "4px 10px" }}>{CAT_LABEL[c]}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", justifyContent: "space-between", marginTop: 28 }}>
            <Toggle value={view} onChange={setView} options={[{ key: "cards", label: "Cards", icon: <GridIcon /> }, { key: "map", label: "Map", icon: <MapIcon /> }]} />
            <span style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", color: "var(--mut)" }}><b style={{ color: "var(--accent)", fontWeight: 500 }}>{count}</b> places · {guide.sortLabel}</span>
          </div>
        </div>
      </div>

      {view === "cards" ? (
        <div className="v2-fade v2-pad" style={{ maxWidth: 1080, margin: "0 auto", padding: "10px 28px 96px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 22 }}>
            {guide.places.map((p, i) => (
              <div key={p.id} style={i === 0 ? { gridColumn: "1 / -1" } : undefined}>
                <PlaceCard place={p} rank={i + 1} featured={i === 0} saved={savedKeys.has(p.name)} onSave={() => save(p)} onOpen={() => { setView("map"); setSel(p.id); }} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="v2-mapsplit v2-fade v2-pad" style={{ maxWidth: 1080, margin: "0 auto", padding: "10px 28px 64px" }}>
          <div className="v2-mapbox" style={{ position: "relative", height: "70dvh", borderRadius: "var(--r-xl)", overflow: "hidden", border: "1px solid var(--line2)" }}>
            <div className={`v2-skeleton${mapReady ? " ready" : ""}`}><span style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.08em", color: "var(--faint)" }}>finding the places…</span></div>
            <MapReal pins={pins} height="100%" labelMode="hover" focusId={sel} onSelect={setSel} onReady={() => setMapReady(true)} route tag={`${guide.curator.name.toLowerCase()}'s bengaluru`} />
          </div>
          <PlaceDetail place={selected} rank={selRank} footer={<SaveBtn p={selected} />} />
        </div>
      )}

      <footer style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 28px 56px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
          <span style={{ opacity: 0.9 }}><Seal ini={guide.curator.ini} name={guide.curator.name} size={78} /></span>
          <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "0.95rem", color: "var(--ink)" }}>vouched by {guide.curator.name}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: "0.64rem", color: "var(--mut)" }}>{guide.curator.bio}</span>
          </span>
        </span>
        <a href="/v2/new" style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", color: "var(--accent)", textDecoration: "none" }}>make your own →</a>
      </footer>

      {toast && (
        <div className="v2-toast" style={{ background: "var(--s2)", border: "1px solid var(--accent-line)", borderRadius: "var(--r-pill)", padding: "10px 18px", display: "flex", alignItems: "center", gap: 10, boxShadow: "var(--shadow-lift)" }}>
          <span style={{ color: "var(--accent)", display: "grid", placeItems: "center" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>
          <span style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.02em", color: "var(--read)" }}>{toast}</span>
        </div>
      )}
      {share && (
        <div onClick={() => setShare(false)} className="v2-scrim" style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(8,8,7,.74)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} className="v2-sheet" style={{ width: "min(460px, 100%)", background: "var(--s2)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-lift)", padding: "26px 26px 28px" }}>
            <p style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--live)", margin: 0 }}><span className="v2-livedot" /> live</p>
            <h2 style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "1.45rem", letterSpacing: "-0.02em", color: "var(--ink)", margin: "8px 0 0" }}>your guide is live. send it.</h2>
            <p style={{ fontFamily: "var(--sans)", fontSize: "0.95rem", color: "var(--mut)", margin: "8px 0 0", lineHeight: 1.5 }}>this is how it&apos;ll land in a chat — no caption needed.</p>

            {/* the unfurl preview — the link's own little advertisement */}
            <div style={{ marginTop: 18, border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", overflow: "hidden", background: "var(--bg)" }}>
              <div style={{ height: 96, background: guide.places[0]?.img ? `center/cover no-repeat url("${guide.places[0].img}")` : "var(--media-bg)", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "flex-end", padding: 13 }}>
                <Monogram ini={guide.curator.ini} size={34} />
              </div>
              <div style={{ padding: "13px 15px 14px" }}>
                <p style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--mut)", margin: 0 }}>vouch · a guide by {guide.curator.name.toLowerCase()}</p>
                <h3 style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "1.12rem", letterSpacing: "-0.015em", color: "var(--ink)", margin: "6px 0 0", lineHeight: 1.15 }}>{guide.title}</h3>
                <p style={{ fontFamily: "var(--mono)", fontSize: "0.64rem", color: "var(--faint)", margin: "8px 0 0" }}>{guide.places.length} places · bengaluru · vouch.to/{guide.slug}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", background: "var(--bg)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", padding: "0 12px", fontFamily: "var(--mono)", fontSize: "0.72rem", color: "var(--read)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>vouch.to/{guide.slug}</div>
              <button type="button" onClick={copy} style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", fontWeight: 500, border: "none", borderRadius: "var(--r-md)", padding: "11px 16px", cursor: "pointer", background: copied ? "var(--live)" : "var(--accent)", color: "var(--accent-ink)" }}>{copied ? "copied ✓" : "copy link"}</button>
            </div>
            <button type="button" onClick={() => setShare(false)} style={{ width: "100%", marginTop: 12, background: "none", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", padding: "10px", cursor: "pointer", fontFamily: "var(--mono)", fontSize: "0.72rem", color: "var(--mut)" }}>view the guide</button>
          </div>
        </div>
      )}
    </main>
  );
}
