"use client";

import { useState } from "react";
import s from "./guide.module.css";
import { type Guide, categoriesOf, mapsUrl } from "../lib/guides";

const TILE = "https://a.basemaps.cartocdn.com/light_all/12/2931/1899@2x.png";
const COVER_PINS = [
  { top: "42%", left: "22%" }, { top: "30%", left: "55%" }, { top: "60%", left: "70%" },
  { top: "52%", left: "40%" }, { top: "68%", left: "30%" }, { top: "36%", left: "82%" },
];

export default function GuideView({ guide, preview = false }: { guide: Guide; preview?: boolean }) {
  const cats = categoriesOf(guide);
  const [active, setActive] = useState<string>("All");
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(false);
  const first = guide.curator.name.split(" ")[0];
  const places = active === "All" ? guide.places : guide.places.filter((p) => p.category === active);

  async function onShare() {
    if (preview) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data = { title: guide.title, text: `${guide.title} — a Hotlist by ${guide.curator.name}`, url };
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share(data); return; } catch { /* cancelled — fall through to copy */ }
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
          <a href="/new" className={s.topMake}>Make yours</a>
        </header>
      )}

      <main className={s.page}>
        <div className={s.cover}>
          <div className={s.coverImg} style={{ backgroundImage: `url("${TILE}")` }} />
          <div className={s.coverTint} />
          <div className={s.coverWash} />
          {COVER_PINS.map((p, i) => (
            <span key={i} className={s.coverPin} style={{ top: p.top, left: p.left }} />
          ))}
          <span className={s.coverStamp}>{guide.curator.city} · {guide.places.length} spots</span>
        </div>

        <section className={s.head}>
          <div className={s.headTop}>
            <span className={s.headAv} style={{ background: guide.curator.tint }}>{guide.curator.initial}</span>
            <span className={s.headWho}>
              <span className={s.headName}>{guide.curator.name}</span>
              <span className={s.headHandle}>hotlist.to/{guide.handle}</span>
            </span>
          </div>
          <h1 className={s.headTitle}>{guide.title}</h1>
          <p className={s.headIntro}>{guide.intro}</p>
          <div className={s.headStats}>
            <span>sent <b>{guide.sent}×</b></span>
            <span>saved by <b>{guide.saved}</b></span>
            <span>updated {guide.updated}</span>
          </div>
          <div className={s.headActions}>
            <button className={s.actShare} onClick={onShare}>Share <span aria-hidden="true">↗</span></button>
            <button className={`${s.actSave} ${saved ? s.actSaveOn : ""}`} onClick={() => setSaved((v) => !v)} aria-pressed={saved}>
              {saved ? "Saved ♥" : "Save ♡"}
            </button>
          </div>
        </section>

        <nav className={s.filters} aria-label="Filter by category">
          <button className={`${s.chip} ${active === "All" ? s.chipOn : ""}`} onClick={() => setActive("All")}>All</button>
          {cats.map((c) => (
            <button key={c} className={`${s.chip} ${active === c ? s.chipOn : ""}`} onClick={() => setActive(c)}>{c}</button>
          ))}
        </nav>

        <div className={s.list}>
          {places.map((p, i) => (
            <div className={s.item} key={`${p.name}-${i}`}>
              <div className={s.itemHead}>
                <span className={s.itemIndex}>{String(i + 1).padStart(2, "0")}</span>
                <span className={s.itemName}>{p.name}</span>
                <span className={s.itemCat}>{p.category}</span>
              </div>
              <div className={s.itemArea}>{p.area}</div>
              <p className={s.itemTake}>{p.take}</p>
              <a className={s.itemGo} href={mapsUrl(p, guide.curator.city)} target="_blank" rel="noopener noreferrer">
                Directions <span aria-hidden="true">↗</span>
              </a>
            </div>
          ))}
          {places.length === 0 && <p className={s.empty}>Your spots will land here.</p>}
        </div>

        <section className={s.viral}>
          <p className={s.viralNote}>your turn</p>
          <h2 className={s.viralTitle}>{first} made this in {guide.minutes} minutes. <em>Now make yours.</em></h2>
          <a className={s.viralCta} href="/new">Make your Hotlist <span aria-hidden="true">→</span></a>
          <span className={s.viralMeta}>free · two minutes · no app</span>
        </section>

        <footer className={s.gfoot}>
          a <a href="/">Hotlist</a> · made with ♥ in {guide.curator.city}
        </footer>
      </main>

      <div className={`${s.toast} ${toast ? s.toastOn : ""}`} role="status" aria-live="polite">link copied ✓</div>
    </>
  );
}
