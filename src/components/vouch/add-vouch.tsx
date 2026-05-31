"use client";
import { useMemo, useState } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { Tag, OccasionChip } from "./chip";
import { SearchField } from "./input";
import { SEED, OCCASIONS, type Spot, type Vouch } from "./_taste";
import { addVouch, loadMe } from "./_me";
import styles from "./add-vouch.module.css";

/* The add-vouch ritual, available from anywhere (the spine action). Pick a place →
   one line (required, ≤120, wraps) → occasion(s) → it lands in your real store
   (_me) and the caller refreshes. Optionally preset to a specific spot (Spot page
   "Vouch it"). This is what makes ＋Vouch real instead of a dead button. */
export function AddVouchModal({
  open,
  onClose,
  onAdded,
  presetSpot,
}: {
  open: boolean;
  onClose: () => void;
  onAdded?: (v: Vouch) => void;
  presetSpot?: string;
}) {
  const preset = presetSpot ? SEED.find((s) => s.name === presetSpot) ?? null : null;
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Spot | null>(preset);
  const [line, setLine] = useState("");
  const [occ, setOcc] = useState<string[]>([]);

  const taken = useMemo(() => new Set(loadMe().vouches.map((v) => v.spot.name)), [open]);
  const remaining = SEED.filter((s) => !taken.has(s.name));
  const results = q ? remaining.filter((s) => (s.name + s.area + s.cuisine).toLowerCase().includes(q.toLowerCase())) : remaining;
  const toggle = (o: string) => setOcc((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));

  function reset() { setQ(""); setSel(preset); setLine(""); setOcc([]); }
  function close() { reset(); onClose(); }
  function commit() {
    if (!sel || !line.trim() || occ.length === 0) return;
    const v: Vouch = { spot: sel, line: line.trim(), occ };
    addVouch(v);
    onAdded?.(v);
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={close} label="Vouch a place">
      <div className={styles.sheet}>
        {!sel ? (
          <>
            <p className={styles.title}>A place you’d send a friend to — no hesitation.</p>
            <SearchField placeholder="Search a place you love…" value={q} onChange={(e) => setQ(e.target.value)} />
            <ul className={styles.results}>
              {results.slice(0, 6).map((s) => (
                <li key={s.name}>
                  <button type="button" className={styles.result} onClick={() => setSel(s)}>
                    <span className={styles.resultName}>{s.name}</span>
                    <span className={styles.resultMeta}>{s.cuisine} · {s.area} · {s.price}</span>
                  </button>
                </li>
              ))}
              {results.length === 0 && <li className={styles.none}>Everything on the demo set is already on your map.</li>}
            </ul>
          </>
        ) : (
          <>
            <div className={styles.head}>
              <span className={styles.place}>{sel.name}</span>
              {!preset && <button type="button" className={styles.change} onClick={() => setSel(null)}>↺ Change place</button>}
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
