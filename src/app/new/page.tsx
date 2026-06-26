"use client";

import { useEffect, useState } from "react";
import b from "./builder.module.css";
import GuideView from "../[handle]/GuideView";
import { type Draft, EMPTY_DRAFT, loadDraft, saveDraft, draftToGuide, handleFromName } from "../lib/draft";
import { publishDraft } from "../lib/published";
import { ThemeToggle } from "../_theme";
import { searchPlaces, CATEGORIES, type PlaceSuggestion } from "../lib/places";
import type { Guide } from "../lib/guides";

export default function BuilderPage() {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [focusTake, setFocusTake] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [published, setPublished] = useState<Guide | null>(null);

  useEffect(() => { setDraft(loadDraft()); setLoaded(true); }, []);
  useEffect(() => { if (loaded) saveDraft(draft); }, [draft, loaded]);
  useEffect(() => {
    if (focusTake == null) return;
    const el = document.getElementById(`take-${focusTake}`) as HTMLTextAreaElement | null;
    el?.focus();
    setFocusTake(null);
  }, [focusTake]);

  // debounced real search (keyless Photon via /api/places)
  useEffect(() => {
    const q = query.trim();
    if (!q) { setSuggestions([]); setSearching(false); return; }
    setSearching(true);
    const id = setTimeout(() => {
      searchPlaces(q, draft.places.map((p) => p.name)).then((res) => { setSuggestions(res); setSearching(false); });
    }, 220);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, draft.places.length]);

  const guide = draftToGuide(draft);
  const ready = draft.places.length >= 1 && draft.name.trim() !== "";

  function addPlace(p: PlaceSuggestion) {
    setDraft((d) => ({ ...d, places: [...d.places, { name: p.name, area: p.area, category: p.category, take: "", lat: p.lat, lng: p.lng }] }));
    setQuery("");
    setSuggestions([]);
    setFocusTake(draft.places.length);
  }
  function addManual() {
    const name = query.trim();
    if (!name) return;
    addPlace({ name, area: "", category: "Casual" });
  }
  function patchPlace(i: number, patch: Partial<Draft["places"][number]>) {
    setDraft((d) => ({ ...d, places: d.places.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) }));
  }
  function removePlace(i: number) {
    setDraft((d) => ({ ...d, places: d.places.filter((_, idx) => idx !== i) }));
  }
  function move(i: number, dir: -1 | 1) {
    setDraft((d) => {
      const a = [...d.places];
      const j = i + dir;
      if (j < 0 || j >= a.length) return d;
      [a[i], a[j]] = [a[j], a[i]];
      return { ...d, places: a };
    });
  }
  function publish() {
    if (!ready) return;
    setPublished(publishDraft(draft));
  }
  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2400); }
  function linkFor(h: string) { return (typeof window !== "undefined" ? window.location.origin : "") + "/" + h; }
  async function copyLink() {
    if (!published) return;
    try { await navigator.clipboard.writeText(linkFor(published.handle)); flash("link copied ✓"); } catch { /* ignore */ }
  }
  async function shareLink() {
    if (!published) return;
    const url = linkFor(published.handle);
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: published.title, text: `${published.title} — a Hotlist`, url }); return; } catch { /* fall through */ }
    }
    copyLink();
  }

  return (
    <div className={b.shell}>
      <header className={b.bar}>
        <a href="/" className={b.brand}><span className={b.brandDot} aria-hidden="true" />Hotlist</a>
        <div className={b.barRight}>
          <ThemeToggle className="themeBtn" />
          <div className={b.tabs} role="tablist">
            <button className={`${b.tab} ${tab === "edit" ? b.tabOn : ""}`} onClick={() => setTab("edit")}>Edit</button>
            <button className={`${b.tab} ${tab === "preview" ? b.tabOn : ""}`} onClick={() => setTab("preview")}>Preview</button>
          </div>
          <button className={b.publish} onClick={publish} disabled={!ready}>Publish <span aria-hidden="true">→</span></button>
        </div>
      </header>

      <div className={b.body}>
        <section className={`${b.editor} ${tab === "preview" ? b.hide : ""}`}>
          <span className={b.klabel}>your hotlist</span>
          <input
            className={b.titleInput}
            placeholder="Name your list…"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            aria-label="List title"
          />
          <div className={b.metaRow}>
            <div className={b.field}>
              <input className={b.input} placeholder="Your name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} aria-label="Your name" />
            </div>
            <div className={b.field}>
              <input className={b.input} placeholder="City" value={draft.city} onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))} aria-label="City" />
            </div>
          </div>
          <textarea className={b.introInput} placeholder="One line about this list (optional). e.g. 'where I actually send people who ask.'" value={draft.intro} onChange={(e) => setDraft((d) => ({ ...d, intro: e.target.value }))} aria-label="Intro" />
          <p className={b.handlePeek}>your link will be <b>hotlist.to/{handleFromName(draft.name)}</b></p>

          <div className={b.sep} />

          <span className={b.klabel}>add a place</span>
          <div className={b.addWrap}>
            <span className={b.addIcon} aria-hidden="true">⌕</span>
            <input
              className={b.addInput}
              placeholder="Search a spot — or type any name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (suggestions[0]) addPlace(suggestions[0]); else addManual(); } }}
              aria-label="Add a place"
            />
            {query.trim() !== "" && (
              <div className={b.addMenu}>
                {searching && suggestions.length === 0 && (
                  <div className={b.addOpt} style={{ color: "var(--muted)", cursor: "default" }}><span className={b.addPin} aria-hidden="true" />searching places…</div>
                )}
                {!searching && suggestions.length === 0 && (
                  <div className={b.addOpt} style={{ color: "var(--muted)", cursor: "default", fontSize: "0.82rem" }}>Not on the map? Add it by name &mdash;</div>
                )}
                {suggestions.map((p, i) => (
                  <button key={`${p.name}-${p.area}-${i}`} className={b.addOpt} onClick={() => addPlace(p)}>
                    <span className={b.addPin} aria-hidden="true" />
                    <span><span className={b.addOptName}>{p.name}</span> <span className={b.addOptArea}>· {p.area}</span></span>
                    <span className={b.addOptCat}>{p.category}</span>
                  </button>
                ))}
                <button className={`${b.addOpt} ${b.addManual}`} onClick={addManual}>
                  <span className={b.addPin} aria-hidden="true" />
                  <span className={b.addOptName}>Add &ldquo;{query.trim()}&rdquo;</span>
                </button>
              </div>
            )}
          </div>

          {draft.places.length === 0 ? (
            <p className={b.emptyHint}>Start with the one place you&rsquo;d <b>always</b> recommend.<br />The rest will come easy.</p>
          ) : (
            <div className={b.places}>
              {draft.places.map((p, i) => (
                <div className={b.pcard} key={`${p.name}-${i}`}>
                  <div className={b.pcHead}>
                    <span className={b.pcIndex}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={b.pcName}>{p.name}</span>
                    {p.area && <span className={b.pcArea}>· {p.area}</span>}
                    <select className={b.pcCat} value={p.category} onChange={(e) => patchPlace(i, { category: e.target.value })} aria-label="Category">
                      {[p.category, ...CATEGORIES.filter((c) => c !== p.category)].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <textarea
                    id={`take-${i}`}
                    className={b.pcTake}
                    placeholder="your take — why should they go? the one line only you'd write."
                    value={p.take}
                    onChange={(e) => patchPlace(i, { take: e.target.value })}
                    rows={2}
                  />
                  <div className={b.pcActions}>
                    <button className={b.pcBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                    <button className={b.pcBtn} onClick={() => move(i, 1)} disabled={i === draft.places.length - 1} aria-label="Move down">↓</button>
                    <button className={`${b.pcBtn} ${b.pcDel}`} onClick={() => removePlace(i)} aria-label="Remove">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className={`${b.previewPane} ${tab === "preview" ? b.show : ""}`}>
          <div className={b.previewSticky}>
            <p className={b.previewCap}>live preview · this is your page</p>
            <div className={b.previewFrame}>
              <GuideView guide={guide} preview />
            </div>
          </div>
        </aside>
      </div>

      {published && (
        <div className={b.scrim} onClick={() => setPublished(null)}>
          <div className={b.modal} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <p className={b.modalNote}>you&rsquo;re live ✦</p>
            <h2 className={b.modalTitle}>{published.title} is published.</h2>
            <p className={b.modalSub}>Anyone with the link can open it. Send it the next time someone asks where to eat.</p>
            <div className={b.modalLink}><span className={b.modalUrl}>hotlist.to/</span><b>{published.handle}</b></div>
            <div className={b.modalRow}>
              <button className={b.modalCopy} onClick={copyLink}>Copy link</button>
              <button className={b.modalShare} onClick={shareLink}>Share <span aria-hidden="true">↗</span></button>
            </div>
            <a className={b.modalView} href={`/${published.handle}`}>View your page <span aria-hidden="true">→</span></a>
          </div>
        </div>
      )}

      <div className={`${b.toastWrap} ${toast ? b.toastOn : ""}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}
