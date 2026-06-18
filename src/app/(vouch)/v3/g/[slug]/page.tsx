"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MapReal, type MapPin } from "../../../../../components/vouch/map-real";
import { CAT_LABEL, getGuide, loadSaved, toggleSaved, type Place } from "../../../../../components/v2/data";
import { Button, Chip, Curator, Eyebrow, Lede, Monogram, PlaceCard, PlaceDetail, Title, Toggle } from "../../../../../components/v3/kit";

const MapIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" /></svg>;
const GridIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></svg>;

export default function GuideV3() {
  const params = useParams<{ slug: string }>();
  const guide = useMemo(() => getGuide(params.slug), [params.slug]);
  const [view, setView] = useState<"cards" | "map">("cards");
  const [sel, setSel] = useState(guide?.places[0]?.id ?? "");
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [mapReady, setMapReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { if (guide) setSavedKeys(new Set(loadSaved().filter((s) => s.guideSlug === guide.slug).map((s) => s.name))); }, [guide]);

  if (!guide) return <main style={{ maxWidth: 600, margin: "0 auto", padding: "16vh 28px", textAlign: "center" }}><Eyebrow>// not found</Eyebrow><Title>this guide has wandered off.</Title></main>;

  const pins: MapPin[] = guide.places.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, name: p.name, line: p.note, occasion: p.when, kind: "palate", by: { name: p.by ?? guide.curator.name, ini: p.ini ?? guide.curator.ini } }));
  const selected = guide.places.find((p) => p.id === sel) ?? guide.places[0];
  const selRank = guide.places.findIndex((p) => p.id === selected.id) + 1;
  const save = (p: Place) => {
    const adding = !savedKeys.has(p.name);
    toggleSaved({ ...p, via: guide.curator.name, viaIni: guide.curator.ini, guideSlug: guide.slug, guideTitle: guide.title });
    setSavedKeys((prev) => { const n = new Set(prev); n.has(p.name) ? n.delete(p.name) : n.add(p.name); return n; });
    if (adding) { setToast(`stamped on your map · via ${guide.curator.name.toLowerCase()}`); window.setTimeout(() => setToast(null), 2300); }
  };

  return (
    <main style={{ minHeight: "100dvh" }}>
      <header style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--line)" }}>
        <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--ink)", letterSpacing: "-0.02em" }}>vouch<span style={{ color: "var(--accent)" }}>.</span></span>
        <Button variant="ghost">share ↗</Button>
      </header>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 28px 16px" }}>
        <Eyebrow>a guide by {guide.curator.name.toLowerCase()}</Eyebrow>
        <Title>{guide.title}.</Title>
        <Lede>{guide.intro}</Lede>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
          <Curator name={guide.curator.name} ini={guide.curator.ini} bio={guide.curator.bio} />
          <span style={{ display: "flex", gap: 6 }}>{[...new Set(guide.places.map((p) => p.cat))].slice(0, 3).map((c) => <Chip key={c}>{CAT_LABEL[c]}</Chip>)}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", marginTop: 26 }}>
          <Toggle value={view} onChange={setView} options={[{ key: "cards", label: "Cards", icon: <GridIcon /> }, { key: "map", label: "Map", icon: <MapIcon /> }]} />
          <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}><b style={{ color: "var(--accent)", fontWeight: 600 }}>{guide.places.length}</b> places · {guide.sortLabel}</span>
        </div>
      </div>

      {view === "cards" ? (
        <div className="v3-fade" style={{ maxWidth: 1080, margin: "0 auto", padding: "12px 28px 90px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(282px, 338px))", justifyContent: "start", gap: 20 }}>
            {guide.places.map((p, i) => <PlaceCard key={p.id} place={p} rank={i + 1} saved={savedKeys.has(p.name)} onSave={() => save(p)} onOpen={() => { setView("map"); setSel(p.id); }} />)}
          </div>
        </div>
      ) : (
        <div className="v3-fade" style={{ maxWidth: 1080, margin: "0 auto", padding: "12px 28px 64px", display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: 18, alignItems: "start" }}>
          <div style={{ position: "relative", height: "70dvh", borderRadius: "var(--r-xl)", overflow: "hidden", border: "1px solid var(--line-2)" }}>
            {!mapReady && <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "grid", placeItems: "center", background: "linear-gradient(100deg,#16110b 30%,#221a10 50%,#16110b 70%)", backgroundSize: "900px 100%", color: "var(--faint)", fontSize: "0.74rem" }}>finding the places…</div>}
            <MapReal pins={pins} height="100%" labelMode="hover" focusId={sel} onSelect={setSel} onReady={() => setMapReady(true)} route tag={`${guide.curator.name.toLowerCase()}'s bengaluru`} />
          </div>
          <PlaceDetail place={selected} rank={selRank} footer={
            <button type="button" onClick={() => save(selected)} className="v3-btn" style={{ width: "100%", marginTop: 15, border: "none", borderRadius: "var(--r-md)", padding: "11px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem", fontWeight: 600, color: savedKeys.has(selected.name) ? "var(--accent)" : "var(--accent-ink)", background: savedKeys.has(selected.name) ? "var(--accent-dim)" : "linear-gradient(140deg,var(--accent-2),var(--accent))", borderTop: savedKeys.has(selected.name) ? "1px solid var(--accent-line)" : "none" }}>{savedKeys.has(selected.name) ? "✓ saved to my map" : "+ save to my map"}</button>
          } />
        </div>
      )}

      <footer style={{ maxWidth: 1080, margin: "0 auto", padding: "30px 28px 56px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: "0.78rem", color: "var(--muted)" }}><Monogram ini={guide.curator.ini} size={26} /> vouched by {guide.curator.name}</span>
        <a href="/v3/new" style={{ fontSize: "0.78rem", color: "var(--accent)", textDecoration: "none" }}>make your own →</a>
      </footer>

      {toast && <div className="v3-fade" style={{ position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)", zIndex: 70, background: "var(--surface)", border: "1px solid var(--accent-line)", borderRadius: "var(--r-pill)", padding: "10px 18px", display: "flex", alignItems: "center", gap: 10, boxShadow: "var(--shadow-lift)" }}><span style={{ color: "var(--accent)" }}>✓</span><span style={{ fontSize: "0.78rem", color: "var(--ink)" }}>{toast}</span></div>}
    </main>
  );
}
