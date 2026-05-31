"use client";
import { useEffect, useMemo, useState } from "react";
import { WebShell } from "./web-shell";
import { Button } from "./button";
import { type GuideData } from "./guide";
import { GuideArtifact } from "./guide-artifact";
import { archetypeFor } from "./_taste";
import {
  listGuides, getGuide, upsertGuide, deleteGuide, slugify, uid,
  type Guide, type GuideItem,
} from "./_guides";
import { loadMe } from "./_me";
import { AddVouchModal } from "./add-vouch";
import styles from "./guides-app.module.css";

/* The Guides workspace — a real, persisted feature (CRUD). One client surface with
   four states: list · build · edit · view. Backed by localStorage (_guides.ts).
   Composed from the guide kit; the artifact is the live preview AND the view. */

type View = { kind: "list" } | { kind: "build" } | { kind: "edit"; id: string } | { kind: "view"; id: string };

const toData = (g: { title: string; note?: string; anchor?: string; items: GuideItem[] }): GuideData => ({
  title: g.title, by: "You", ini: "RG", count: g.items.length, note: g.note, anchor: g.anchor, items: g.items,
});

export function GuidesApp() {
  const [view, setView] = useState<View>({ kind: "list" });
  const [guides, setGuides] = useState<Guide[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [arch, setArch] = useState(() => archetypeFor([]));
  const [seed, setSeed] = useState<GuideItem[]>([]);

  useEffect(() => {
    setGuides(listGuides());
    setArch(archetypeFor(loadMe().vouches));
    // a Spot's "Add to a guide" hands off the place here
    try {
      const raw = window.sessionStorage.getItem("vouch:guide-seed");
      if (raw) { setSeed([JSON.parse(raw) as GuideItem]); setView({ kind: "build" }); window.sessionStorage.removeItem("vouch:guide-seed"); }
    } catch { /* ignore */ }
  }, []);
  const refresh = () => setGuides(listGuides());
  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(null), 2600); return () => window.clearTimeout(t); }, [toast]);

  function handleSave(g: Guide) { upsertGuide(g); refresh(); setView({ kind: "view", id: g.id }); setToast(`“${g.title}” is ready to send`); }
  function handleDelete(id: string) { deleteGuide(id); refresh(); setView({ kind: "list" }); setToast("Guide deleted"); }
  function share(g: Guide) {
    const url = `${window.location.origin}/g/${g.slug}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    setToast("Link copied — drop it in the group chat");
  }

  return (
    <WebShell active="guides" onNewVouch={() => setAdding(true)} you={{ ini: "RG", name: "You", line: `${arch.glyph} ${arch.name}` }}>
      {view.kind === "list" && (
        <GuideList guides={guides} onNew={() => setView({ kind: "build" })} onOpen={(id) => setView({ kind: "view", id })} />
      )}
      {view.kind === "build" && (
        <GuideEditor seedItems={seed} onCancel={() => setView({ kind: "list" })} onSave={handleSave} />
      )}
      {view.kind === "edit" && (
        <GuideEditor initial={getGuide(view.id) ?? undefined} onCancel={() => setView({ kind: "view", id: view.id })} onSave={handleSave} />
      )}
      {view.kind === "view" && (() => {
        const g = getGuide(view.id);
        if (!g) return <GuideList guides={guides} onNew={() => setView({ kind: "build" })} onOpen={(id) => setView({ kind: "view", id })} />;
        return (
          <OwnerView
            guide={g}
            onBack={() => setView({ kind: "list" })}
            onEdit={() => setView({ kind: "edit", id: g.id })}
            onShare={() => share(g)}
            onDelete={() => handleDelete(g.id)}
          />
        );
      })()}

      <AddVouchModal open={adding} onClose={() => setAdding(false)} onAdded={(v) => setToast(`Your name’s on it. ${v.spot.name} is on your map.`)} />
      {toast && <div className={styles.toastWrap}><span className={styles.toast}>{toast}</span></div>}
    </WebShell>
  );
}

/* ── list / empty — a field-guide contents page, not a card grid ──────────── */
function lifeSignal(g: Guide): string {
  const spots = `${g.items.length} ${g.items.length === 1 ? "spot" : "spots"}`;
  return g.borrows > 0 ? `${spots} · borrowed ${g.borrows}×` : `${spots} · not sent yet`;
}

function GuideList({ guides, onNew, onOpen }: { guides: Guide[]; onNew: () => void; onOpen: (id: string) => void }) {
  if (guides.length === 0) {
    return (
      <div className={styles.page}>
        <p className={styles.eyebrow}>Your guides</p>
        <div className={styles.empty}>
          <h1 className={styles.emptyH1}>Be the friend with the spots.</h1>
          <p className={styles.emptyLine}>A guide is the answer you hand over when someone asks where to go — a few places you’d put your name on, titled like you’d text it. Make the one people keep asking you for.</p>
          <Button variant="primary" onClick={onNew}>Start a guide →</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.listHead}>
        <div>
          <p className={styles.eyebrow}>Your guides</p>
          <h1 className={styles.h1}>The answers you’re known for.</h1>
          <p className={styles.listSub}>Group the spots you’d vouch for. Send the one people keep asking you for.</p>
        </div>
        <Button variant="primary" onClick={onNew}>Start a guide</Button>
      </header>

      <ol className={styles.contents}>
        {guides.map((g, i) => (
          <li key={g.id}>
            <button type="button" className={styles.entry} onClick={() => onOpen(g.id)}>
              <span className={styles.entryIdx}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.entryBody}>
                <span className={styles.entryTitle}>{g.title}</span>
                <span className={styles.entryTease}>{g.items.slice(0, 3).map((it) => it.name).join("  ·  ")}{g.items.length > 3 ? `  +${g.items.length - 3}` : ""}</span>
                <span className={styles.entryMeta}>by you · {lifeSignal(g)}</span>
              </span>
              <span className={styles.entryOpen} aria-hidden="true">open →</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ── owner view ───────────────────────────────────────────────────────────── */
function OwnerView({ guide, onBack, onEdit, onShare, onDelete }: { guide: Guide; onBack: () => void; onEdit: () => void; onShare: () => void; onDelete: () => void }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className={styles.viewPage}>
      <div className={styles.viewBar}>
        <button type="button" className={styles.back} onClick={onBack}>← Your guides</button>
        <div className={styles.viewActions}>
          <button type="button" className={styles.toolBtn} onClick={onEdit}>Edit</button>
          <button type="button" className={styles.toolBtn} onClick={onShare}>↗ Share</button>
          {confirm ? (
            <>
              <span className={styles.confirmText}>Delete?</span>
              <button type="button" className={styles.toolDanger} onClick={onDelete}>Yes, delete</button>
              <button type="button" className={styles.toolBtn} onClick={() => setConfirm(false)}>Keep</button>
            </>
          ) : (
            <button type="button" className={styles.toolBtn} onClick={() => setConfirm(true)}>Delete</button>
          )}
        </div>
      </div>
      <div className={styles.viewBody}>
        <GuideArtifact guide={toData(guide)} linkSpots />
      </div>
    </div>
  );
}

/* ── editor (build + edit) ────────────────────────────────────────────────── */
const PROMPTS = ["Open past midnight — actually worth it", "Where I take my parents", "First date, no cringe", "Worth crossing town for"];

function GuideEditor({ initial, seedItems, onSave, onCancel }: { initial?: Guide; seedItems?: GuideItem[]; onSave: (g: Guide) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [items, setItems] = useState<GuideItem[]>(initial?.items ?? seedItems ?? []);
  const [q, setQ] = useState("");

  const myVouches: GuideItem[] = useMemo(() => loadMe().vouches.map((v) => ({ name: v.spot.name, tags: `${v.spot.cuisine} · ${v.spot.area} · ${v.spot.price}`, note: v.line })), []);
  const have = useMemo(() => new Set(items.map((i) => i.name)), [items]);
  const pool = useMemo(() => myVouches.filter((v) => !have.has(v.name) && (q ? v.name.toLowerCase().includes(q.toLowerCase()) || v.tags.toLowerCase().includes(q.toLowerCase()) : true)), [myVouches, have, q]);

  const add = (it: GuideItem) => setItems((p) => [...p, { ...it }]);
  const remove = (name: string) => setItems((p) => p.filter((i) => i.name !== name));
  const setNote = (name: string, note: string) => setItems((p) => p.map((i) => (i.name === name ? { ...i, note } : i)));
  const move = (idx: number, dir: -1 | 1) => setItems((p) => {
    const j = idx + dir; if (j < 0 || j >= p.length) return p;
    const n = [...p]; [n[idx], n[j]] = [n[j], n[idx]]; return n;
  });

  const canSave = title.trim().length > 0 && items.length > 0;
  function save() {
    if (!canSave) return;
    const now = Date.now();
    onSave({
      id: initial?.id ?? uid(),
      slug: initial?.slug ?? `${slugify(title)}-${uid().slice(0, 4)}`,
      title: title.trim(), items,
      borrows: initial?.borrows ?? 0,
      createdAt: initial?.createdAt ?? now, updatedAt: now,
    });
  }

  return (
    <div className={styles.editor}>
      <section className={styles.compose}>
        <div className={styles.composeTop}>
          <button type="button" className={styles.back} onClick={onCancel}>← Cancel</button>
          <p className={styles.eyebrow}>{initial ? "Edit guide" : "Build a guide"}</p>
        </div>
        <h1 className={styles.h1}>Name it like you’d text it.</h1>

        <label className={styles.fieldLabel}>Title — a point of view, never a category</label>
        <input className={styles.titleInput} value={title} maxLength={52} autoFocus onChange={(e) => setTitle(e.target.value)} placeholder="Open past midnight — actually worth it" />
        {!initial && (
          <div className={styles.prompts}>{PROMPTS.map((p) => <button key={p} type="button" className={styles.prompt} onClick={() => setTitle(p)}>{p}</button>)}</div>
        )}

        <label className={styles.fieldLabel}>In this guide{items.length ? ` · ${items.length}` : ""}</label>
        {items.length === 0 ? (
          <p className={styles.hintRow}>Add places below — they’ll line up here, each with your one-line.</p>
        ) : (
          <ul className={styles.inList}>
            {items.map((it, i) => (
              <li key={it.name} className={styles.inItem}>
                <span className={styles.inNum}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.inBody}>
                  <span className={styles.inName}>{it.name}</span>
                  <input className={styles.noteInput} value={it.note} maxLength={120} placeholder="why you’d send them — one line" onChange={(e) => setNote(it.name, e.target.value)} />
                </span>
                <span className={styles.inMove}>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
                  <button type="button" onClick={() => remove(it.name)} aria-label="Remove">×</button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <label className={styles.fieldLabel}>Add from your vouches</label>
        <input className={styles.search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find one of your vouches…" />
        <ul className={styles.pool}>
          {pool.slice(0, 6).map((v) => (
            <li key={v.name}>
              <button type="button" className={styles.poolItem} onClick={() => add(v)}>
                <span className={styles.poolPlus} aria-hidden="true">＋</span>
                <span className={styles.poolBody}><span className={styles.poolName}>{v.name}</span><span className={styles.poolTags}>{v.tags}</span></span>
              </button>
            </li>
          ))}
          {pool.length === 0 && <li className={styles.poolNone}>{myVouches.length === 0 ? "Vouch a few places first — then build a guide from them." : q ? "No match in your vouches." : "Every spot is already in this guide."}</li>}
        </ul>

        <div className={styles.actions}>
          <Button variant="primary" disabled={!canSave} onClick={save}>{initial ? "Save changes" : "Save guide"}</Button>
          <span className={styles.hint}>{!title.trim() ? "Give it a title" : items.length === 0 ? "Add at least one place" : `${items.length} ${items.length === 1 ? "place" : "places"} · ready`}</span>
        </div>
      </section>

      <aside className={styles.previewPane}>
        <span className={styles.previewLabel}>What lands in the group chat</span>
        <GuideArtifact guide={toData({ title, items })} />
      </aside>
    </div>
  );
}
