"use client";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { Tag, OccasionChip } from "./chip";
import { SearchField } from "./input";
import { OCCASIONS, type Spot, type Vouch } from "./_taste";
import { searchCatalog, type CatalogSpot } from "./_catalog";
import { addVouch, loadMe } from "./_me";
import styles from "./add-vouch.module.css";

/* The add-vouch ritual, available from anywhere (the spine action). Now searches the
   REAL Bengaluru catalog (Supabase `places`) — you can vouch for any place, not the
   ~14 seed spots. Pick → one line (≤120) → occasion(s) → it lands in your store
   (_me). Optionally preset to a specific place (Spot page "Vouch it"). */

type Pick = { name: string; area: string; cuisine: string; price: string; lat: number | null; lng: number | null };
const BLR = { lat: 12.9716, lng: 77.5946 };

export function AddVouchModal({
  open,
  onClose,
  onAdded,
  presetSpot,
}: {
  open: boolean;
  onClose: () => void;
  onAdded?: (v: Vouch) => void;
  presetSpot?: Pick;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<CatalogSpot[]>([]);
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState<Pick | null>(presetSpot ?? null);
  const [line, setLine] = useState("");
  const [occ, setOcc] = useState<string[]>([]);

  const taken = useMemo(() => new Set(loadMe().vouches.map((v) => v.spot.name)), [open]);

  // reset to the preset (or blank) whenever the modal opens
  useEffect(() => { if (open) { setSel(presetSpot ?? null); setQ(""); setLine(""); setOcc([]); } }, [open, presetSpot]);

  // live search the real catalog
  useEffect(() => {
    if (!open || sel) return;
    let dead = false;
    setLoading(true);
    searchCatalog(q).then((r) => { if (!dead) { setResults(r.filter((s) => !taken.has(s.name)).slice(0, 8)); setLoading(false); } });
    return () => { dead = true; };
  }, [q, open, sel, taken]);

  const toggle = (o: string) => setOcc((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));
  function close() { onClose(); }
  function commit() {
    if (!sel || !line.trim() || occ.length === 0) return;
    const spot: Spot = { name: sel.name, area: sel.area, cuisine: sel.cuisine, price: sel.price, occasions: occ, lat: sel.lat ?? BLR.lat, lng: sel.lng ?? BLR.lng };
    const v: Vouch = { spot, line: line.trim(), occ };
    addVouch(v);
    onAdded?.(v);
    onClose();
  }

  return (
    <Modal open={open} onClose={close} label="Vouch a place">
      <div className={styles.sheet}>
        {!sel ? (
          <>
            <p className={styles.title}>A place you’d send a friend to — no hesitation.</p>
            <SearchField placeholder="Search Bengaluru — any place you love…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
            <ul className={styles.results}>
              {loading && results.length === 0 ? (
                <li className={styles.none}>Searching the city…</li>
              ) : results.length === 0 ? (
                <li className={styles.none}>{q ? `Nothing matching “${q}”.` : "Start typing a place."}</li>
              ) : results.map((s) => (
                <li key={s.slug}>
                  <button type="button" className={styles.result} onClick={() => setSel(s)}>
                    <span className={styles.resultName}>{s.name}</span>
                    <span className={styles.resultMeta}>{s.cuisine} · {s.area} · {s.price}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className={styles.head}>
              <span className={styles.place}>{sel.name}</span>
              {!presetSpot && <button type="button" className={styles.change} onClick={() => setSel(null)}>↺ Change place</button>}
            </div>
            <span className={styles.tags}><Tag>{sel.cuisine} · {sel.area} · {sel.price}</Tag></span>
            <label className={styles.fieldLabel}>One line — why you’d send them</label>
            <div className={styles.lineWrap}>
              <textarea
                className={styles.lineInput}
                value={line}
                maxLength={120}
                rows={2}
                autoFocus
                placeholder="Best bowl in the city. Go at 6 sharp."
                onChange={(e) => setLine(e.target.value.replace(/\n/g, " "))}
                onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = `${t.scrollHeight}px`; }}
              />
              <span className={styles.count}>{line.length}/120</span>
            </div>
            <label className={styles.fieldLabel}>Best for</label>
            <div className={styles.occ}>{OCCASIONS.map((o) => <OccasionChip key={o} selected={occ.includes(o)} onToggle={() => toggle(o)}>{o}</OccasionChip>)}</div>
            <Button variant="primary" full disabled={!line.trim() || occ.length === 0} onClick={commit}>Put my name on it ↵</Button>
          </>
        )}
      </div>
    </Modal>
  );
}
