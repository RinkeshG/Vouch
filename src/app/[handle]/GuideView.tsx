"use client";

import { useState } from "react";
import s from "./guide.module.css";
import mc from "./map.module.css";
import GuideMapView from "./GuideMapView";
import { ThemeToggle } from "../_theme";
import { type Guide, categoriesOf, mapsUrl } from "../lib/guides";
import { hasMap } from "../lib/geo";

function Pin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s6.5-5 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 16 12 21 12 21Z" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="10.2" r="2.3" fill="currentColor" />
    </svg>
  );
}

export default function GuideView({ guide, preview = false }: { guide: Guide; preview?: boolean }) {
  const cats = categoriesOf(guide);
  const [active, setActive] = useState<string>("All");
  const [view, setView] = useState<"cards" | "map">("cards");
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(false);
  const mapped = hasMap(guide);
  const first = guide.curator.name.split(" ")[0];
  const showFilter = cats.length > 2;
  const places = active === "All" ? guide.places : guide.places.filter((p) => p.category === active);

  async function onShare() {
    if (preview) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data = { title: guide.title, text: `${guide.title} — a Hotlist by ${guide.curator.name}`, url };
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share(data); return; } catch { /* cancelled */ }
    }
    try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
    setToast(true);
    setTimeout(() => setToast(false), 1900);
  }

  return (
    <>
      {!preview && (
        <header className={s.topbar}>
          <a href="/" className={s.brand}><span className={s.brandDot} aria-hidden="true" />Hotlist</a>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <ThemeToggle className="themeBtn" />
            <a href="/new" className={s.topMake}>Make yours</a>
          </span>
        </header>
      )}

      <main className={s.page}>
        <section className={s.head}>
          <p className={s.eyebrow}>a hotlist · {guide.curator.city}</p>
          <h1 className={s.headTitle}>{guide.title}</h1>
          <p className={s.headIntro}>{guide.intro}</p>
          <div className={s.headMeta}>
            <span className={s.byline}>
              <span className={s.bylineAv} style={{ background: guide.curator.tint }}>{guide.curator.initial}</span>
              <span>
                <span className={s.bylineName}>{guide.curator.name}</span>
                <span className={s.bylineSub}>@{guide.handle} · sent {guide.sent}×</span>
              </span>
            </span>
            <span className={s.headActions}>
              <button className={s.actShare} onClick={onShare}>Share <span aria-hidden="true">↗</span></button>
              <button className={`${s.actSave} ${saved ? s.actSaveOn : ""}`} onClick={() => setSaved((v) => !v)} aria-pressed={saved}>
                {saved ? "Saved ♥" : "Save ♡"}
              </button>
            </span>
          </div>
        </section>

        <div className={s.controls}>
          {mapped ? (
            <div className={mc.toggle} role="tablist" aria-label="Cards or map">
              <button className={`${mc.toggleBtn} ${view === "cards" ? mc.toggleOn : ""}`} onClick={() => setView("cards")}>Cards</button>
              <button className={`${mc.toggleBtn} ${view === "map" ? mc.toggleOn : ""}`} onClick={() => setView("map")}>Map</button>
            </div>
          ) : <span />}
          <span className={s.count}>{guide.places.length} places</span>
        </div>

        {mapped && view === "map" ? (
          <GuideMapView guide={guide} />
        ) : (
          <>
            {showFilter && (
              <nav className={s.filters} aria-label="Filter by category">
                <button className={`${s.chip} ${active === "All" ? s.chipOn : ""}`} onClick={() => setActive("All")}>All</button>
                {cats.map((c) => (
                  <button key={c} className={`${s.chip} ${active === c ? s.chipOn : ""}`} onClick={() => setActive(c)}>{c}</button>
                ))}
              </nav>
            )}
            <div className={s.grid}>
              {places.map((p, i) => (
                <article className={s.card} key={`${p.name}-${i}`}>
                  <div className={s.cardTop}>
                    <span className={s.cardIndex}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={s.cardCat}>{p.category}</span>
                  </div>
                  <h3 className={s.cardName}>{p.name}</h3>
                  <a className={s.cardWhere} href={mapsUrl(p, guide.curator.city)} target="_blank" rel="noopener noreferrer">
                    <Pin /> {p.area} <span aria-hidden="true">↗</span>
                  </a>
                  <p className={s.cardTake}>{p.take}</p>
                  {p.order && (
                    <div className={s.cardOrder}>
                      <span className={s.cardOrderLabel}>Order</span>
                      <span className={s.cardOrderVal}>{p.order}</span>
                    </div>
                  )}
                </article>
              ))}
              {places.length === 0 && <p className={s.empty}>Nothing in this category yet.</p>}
            </div>
          </>
        )}

        <section className={s.viral}>
          <p className={s.viralNote}>your turn</p>
          <h2 className={s.viralTitle}>{first} made this in {guide.minutes} minutes. <em>Now make yours.</em></h2>
          <a className={s.viralCta} href="/new">Make your Hotlist <span aria-hidden="true">→</span></a>
          <span className={s.viralMeta}>free · two minutes · no app</span>
        </section>

        <footer className={s.gfoot}>
          <span>a Hotlist, made in {guide.curator.city}</span>
          <a href="/">hotlist.to <span aria-hidden="true">→</span></a>
        </footer>
      </main>

      <div className={`${s.toast} ${toast ? s.toastOn : ""}`} role="status" aria-live="polite">link copied ✓</div>
    </>
  );
}
