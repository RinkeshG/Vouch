"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Modal } from "./modal";
import { Tag, OccasionChip } from "./chip";
import { SearchField } from "./input";
import { OCCASIONS, type Spot, type Vouch } from "./_taste";
import { searchCatalog, type CatalogSpot } from "./_catalog";
import { type Stamp, type Gut } from "./_me";
import { useMyMap } from "./_map-context";
import { RelChip } from "./rel-chip";
import styles from "./add-vouch.module.css";

/* The capture sheet, available from anywhere (the spine action). Search the REAL
   Bengaluru catalog (Supabase `places`), pick a place, then choose your MOVE — the
   three are deliberately NOT equal-weight (Constitution §1, speech acts):
     · Want to go — one tap, no words. A note to your future self.
     · Been      — one honest gut reaction (loved / fine / no). Your private diary.
     · Vouch     — the worded, public act. Costs a line + occasion. Your name on it.
   Friction matches meaning. Loved-it nudges toward a vouch, but never auto-vouches. */

type Pick = { name: string; area: string; cuisine: string; price: string; lat: number | null; lng: number | null };
type Step = "choose" | "been" | "vouch";
const BLR = { lat: 12.9716, lng: 77.5946 };

/* Hold to vouch — the deliberate "moment of hold" the act deserves (PRD §5.6): a tap
   won't do it, you press and hold to put your name down. Keyboard activates directly. */
function HoldButton({ disabled, onComplete, children }: { disabled?: boolean; onComplete: () => void; children: ReactNode }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<number | null>(null);
  function start() {
    if (disabled || timer.current) return;
    setHolding(true);
    timer.current = window.setTimeout(() => { timer.current = null; setHolding(false); onComplete(); }, 850);
  }
  function cancel() {
    if (timer.current) { window.clearTimeout(timer.current); timer.current = null; }
    setHolding(false);
  }
  return (
    <button
      type="button"
      disabled={disabled}
      className={`${styles.hold} ${holding ? styles.holding : ""}`}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={(e) => { if (!disabled && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onComplete(); } }}
    >
      <span className={styles.holdFill} aria-hidden="true" />
      <span className={styles.holdLabel}>{children}</span>
    </button>
  );
}

export function AddVouchModal({
  open,
  onClose,
  onAdded,
  onCaptured,
  presetSpot,
  presetStamp,
}: {
  open: boolean;
  onClose: () => void;
  onAdded?: (v: Vouch) => void;
  onCaptured?: (r: { spot: Spot; stamp: Stamp; gut?: Gut }) => void;
  presetSpot?: Pick;
  presetStamp?: "been" | "vouched";
}) {
  const { setStamp, addVouch, getEntry, entries } = useMyMap();
  const initialStep = (p?: Pick): Step => (p ? (presetStamp === "been" ? "been" : "vouch") : "choose");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<CatalogSpot[]>([]);
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState<Pick | null>(presetSpot ?? null);
  const [step, setStep] = useState<Step>(initialStep(presetSpot));
  const [line, setLine] = useState("");
  const [occ, setOcc] = useState<string[]>([]);
  const [done, setDone] = useState<{ stamp: Stamp; gut?: Gut; name: string; count: number } | null>(null);

  // snapshot of places already vouched, taken when the sheet opens (so it doesn't
  // churn the result list mid-session); used to hide them from search.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const taken = useMemo(() => new Set(entries.filter((e) => e.stamp === "vouched" && e.line).map((e) => e.spot.name)), [open]);

  // reset to the preset (or blank) whenever the modal opens
  useEffect(() => {
    if (open) { setSel(presetSpot ?? null); setStep(initialStep(presetSpot)); setQ(""); setLine(""); setOcc([]); setDone(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, presetSpot, presetStamp]);

  // the success moment holds for a beat, then closes — long enough to feel it land
  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => { setDone(null); onClose(); }, 2200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  // live search the real catalog
  useEffect(() => {
    if (!open || sel) return;
    let dead = false;
    setLoading(true);
    searchCatalog(q).then((r) => { if (!dead) { setResults(r.filter((s) => !taken.has(s.name)).slice(0, 8)); setLoading(false); } });
    return () => { dead = true; };
  }, [q, open, sel, taken]);

  const toggle = (o: string) => setOcc((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));
  const spotFrom = (p: Pick, occasions: string[] = []): Spot => ({ name: p.name, area: p.area, cuisine: p.cuisine, price: p.price, occasions, lat: p.lat ?? BLR.lat, lng: p.lng ?? BLR.lng });

  function pickResult(s: CatalogSpot) { setSel(s); setStep("choose"); }
  function changePlace() { setSel(null); setStep("choose"); setQ(""); }

  // record fired the capture; the success moment confirms it landed, then closes.
  // `count` is read from the mutator's returned Me (context state hasn't flushed yet).
  const vouchCount = (m: { entries: typeof entries }) => m.entries.filter((e) => e.stamp === "vouched" && e.line).length;
  function finish(spot: Spot, stamp: Stamp, count: number, gut?: Gut) {
    onCaptured?.({ spot, stamp, gut });
    setDone({ stamp, gut, name: spot.name, count });
  }
  function chooseWant() {
    if (!sel) return;
    const spot = spotFrom(sel);
    const next = setStamp(spot, "want");
    finish(spot, "want", vouchCount(next));
  }
  function chooseGut(gut: Gut) {
    if (!sel) return;
    const spot = spotFrom(sel);
    const next = setStamp(spot, "been", { gut });
    finish(spot, "been", vouchCount(next), gut); // just log it — no pushy "turn this into a vouch" interstitial
  }
  function commitVouch() {
    if (!sel || !line.trim() || occ.length === 0) return;
    const spot = spotFrom(sel, occ);
    const v: Vouch = { spot, line: line.trim(), occ };
    const next = addVouch(v);
    onAdded?.(v);
    finish(spot, "vouched", vouchCount(next));
  }

  const existing = sel ? getEntry(sel.name) : undefined; // already on your map?

  return (
    <Modal open={open} onClose={onClose} label="Add a place">
      <div className={styles.sheet}>
        {done ? (
          <div className={styles.done}>
            {done.stamp === "vouched" ? (
              <>
                <div className={styles.seal}><span className={styles.sealMark} aria-hidden="true">✓</span></div>
                <p className={styles.doneTitle}>Your name’s on it.</p>
                <p className={styles.donePlace}>{done.name}</p>
                <p className={styles.doneMeta}>{done.count} {done.count === 1 ? "place carries" : "places carry"} your name now.</p>
              </>
            ) : done.stamp === "want" ? (
              <>
                <div className={`${styles.seal} ${styles.sealWant}`} aria-hidden="true" />
                <p className={styles.doneTitle}>On your radar.</p>
                <p className={styles.donePlace}>{done.name}</p>
                <p className={styles.doneMeta}>Saved for the night you’re nearby.</p>
              </>
            ) : (
              <>
                <div className={`${styles.seal} ${styles.sealBeen}`} aria-hidden="true"><span className={styles.sealMark} aria-hidden="true">✓</span></div>
                <p className={styles.doneTitle}>{done.gut === "loved" ? "Loved it — logged." : done.gut === "no" ? "Logged. Not for me." : "Logged."}</p>
                <p className={styles.donePlace}>{done.name}</p>
                <Link href="/you" className={styles.doneLink}>It’s in your diary now →</Link>
              </>
            )}
          </div>
        ) : !sel ? (
          <>
            <p className={styles.title}>Add a place to your map.</p>
            <SearchField placeholder="Search Bengaluru — any place you know…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
            <ul className={styles.results}>
              {loading && results.length === 0 ? (
                <li className={styles.none}>Searching the city…</li>
              ) : results.length === 0 ? (
                <li className={styles.none}>{q ? `Nothing matching “${q}”.` : "Start typing a place."}</li>
              ) : results.map((s) => (
                <li key={s.slug}>
                  <button type="button" className={styles.result} onClick={() => pickResult(s)}>
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
              {!presetSpot && <button type="button" className={styles.change} onClick={changePlace}>↺ Change place</button>}
            </div>
            <span className={styles.tags}><Tag>{sel.cuisine} · {sel.area} · {sel.price}</Tag>{existing && <RelChip stamp={existing.stamp} gut={existing.gut} className={styles.headChip} />}</span>

            {step === "choose" && (
              <>
                <p className={styles.prompt}>{existing ? "Already on your map — change it?" : "What’s it to you?"}</p>
                <div className={styles.moves}>
                  <button type="button" className={`${styles.move} ${styles.moveWant}`} onClick={chooseWant}>
                    <span className={`${styles.moveDot} ${styles.dWant}`} aria-hidden="true" />
                    <span className={styles.moveText}><span className={styles.moveName}>Want to go</span><span className={styles.moveHint}>Save it for later. One tap, no words.</span></span>
                  </button>
                  <button type="button" className={`${styles.move} ${styles.moveBeen}`} onClick={() => setStep("been")}>
                    <span className={`${styles.moveDot} ${styles.dBeen}`} aria-hidden="true" />
                    <span className={styles.moveText}><span className={styles.moveName}>I’ve been</span><span className={styles.moveHint}>Log it, and how it actually was.</span></span>
                  </button>
                  <button type="button" className={`${styles.move} ${styles.moveVouch}`} onClick={() => setStep("vouch")}>
                    <span className={`${styles.moveDot} ${styles.dVouch}`} aria-hidden="true" />
                    <span className={styles.moveText}><span className={styles.moveName}>Vouch for it</span><span className={styles.moveHint}>Put your name on it. The one that counts.</span></span>
                  </button>
                </div>
              </>
            )}

            {step === "been" && (
              <>
                <button type="button" className={styles.back} onClick={() => setStep("choose")}>← back</button>
                <p className={styles.prompt}>Been here. Would you go back?</p>
                <div className={styles.gut}>
                  <button type="button" className={styles.gutBtn} onClick={() => chooseGut("loved")}>
                    <span className={`${styles.moveDot} ${styles.dBeen}`} aria-hidden="true" /> Loved it
                  </button>
                  <button type="button" className={styles.gutBtn} onClick={() => chooseGut("fine")}>
                    <span className={`${styles.moveDot} ${styles.dFine}`} aria-hidden="true" /> It was fine
                  </button>
                  <button type="button" className={styles.gutBtn} onClick={() => chooseGut("no")}>
                    <span className={`${styles.moveDot} ${styles.dNo}`} aria-hidden="true" /> Not for me
                  </button>
                </div>
              </>
            )}

            {step === "vouch" && (
              <>
                {!presetSpot && <button type="button" className={styles.back} onClick={() => setStep("choose")}>← back</button>}
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
                <HoldButton disabled={!line.trim() || occ.length === 0} onComplete={commitVouch}>Hold to put your name on it</HoldButton>
                <p className={styles.holdHint}>A vouch is forever until you take it back. Hold to mean it.</p>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
