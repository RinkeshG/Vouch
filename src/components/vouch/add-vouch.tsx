"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Modal } from "./modal";
import { Tag } from "./chip";
import { SearchField } from "./input";
import { type Spot, type Vouch } from "./_taste";
import { searchCatalog, nearestCatalog, fmtDist, type CatalogSpot } from "./_catalog";
import { type Stamp, type Gut } from "./_me";
import { useMyMap } from "./_map-context";
import { RelChip } from "./rel-chip";
import styles from "./add-vouch.module.css";

/* The capture sheet (M2: walking out — 5 seconds or it's lost). Opens PRE-POPULATED
   with the 5 nearest places (PRD §7.2): the common case is two taps, place → state,
   zero typing. Search sits above as the fallback. The three acts are deliberately
   NOT equal-weight:
     · Want to go — one tap. The sheet closes itself; the ghost pin IS the confirmation.
     · Been      — one honest answer to "Go back?" (Absolutely / Maybe / No). Private.
     · Vouch     — the worded, public act. Costs a line + a hold. Your name on it. */

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
      onContextMenu={(e) => e.preventDefault()}   /* the long-press IS the gesture — no callout (PRD §9.2) */
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
  const [near, setNear] = useState<(CatalogSpot & { km: number })[] | null>(null);
  const [locating, setLocating] = useState(false);
  const [sel, setSel] = useState<Pick | null>(presetSpot ?? null);
  const [step, setStep] = useState<Step>(initialStep(presetSpot));
  const [line, setLine] = useState("");
  const [done, setDone] = useState<{ stamp: Stamp; gut?: Gut; name: string; count: number } | null>(null);

  // reset to the preset (or blank) whenever the modal opens
  useEffect(() => {
    if (open) { setSel(presetSpot ?? null); setStep(initialStep(presetSpot)); setQ(""); setLine(""); setDone(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, presetSpot, presetStamp]);

  // Nearest-first (PRD §7.2): on open, one foreground location check (a cached fix is
  // fine — maximumAge 5 min) → the 5 nearest places. Denied / slow / out of the city →
  // fall back to search, silently and honestly. Never a nag.
  useEffect(() => {
    if (!open || presetSpot || typeof navigator === "undefined" || !navigator.geolocation) return;
    let dead = false;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (dead) return;
        nearestCatalog(pos.coords.latitude, pos.coords.longitude, 5).then((r) => {
          if (dead) return;
          // a "nearest" 50 km away means you're not in the city — that's not near
          setNear(r.length && r[0].km <= 25 ? r : null);
          setLocating(false);
        });
      },
      () => { if (!dead) { setNear(null); setLocating(false); } },
      { enableHighAccuracy: false, timeout: 3500, maximumAge: 300000 },
    );
    return () => { dead = true; };
  }, [open, presetSpot]);

  // the success moment holds for a beat, then closes — the weight of the moment
  // scales with the act (vouch lingers; a been logs and gets out of your way)
  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => { setDone(null); onClose(); }, done.stamp === "vouched" ? 2200 : 1800);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  // live search the real catalog. Places already on your map stay in the results,
  // wearing their state chip (PRD §7.2) — you go back to places you vouch for most.
  useEffect(() => {
    if (!open || sel) return;
    let dead = false;
    setLoading(true);
    searchCatalog(q).then((r) => { if (!dead) { setResults(r.slice(0, 8)); setLoading(false); } });
    return () => { dead = true; };
  }, [q, open, sel]);

  const spotFrom = (p: Pick): Spot => ({ name: p.name, area: p.area, cuisine: p.cuisine, price: p.price, occasions: [], lat: p.lat ?? BLR.lat, lng: p.lng ?? BLR.lng });

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
    setStamp(spot, "want");
    onCaptured?.({ spot, stamp: "want" });
    onClose(); // no done-screen: the ghost pin floating onto the map IS the confirmation (PRD §10)
  }
  function chooseGut(gut: Gut) {
    if (!sel) return;
    const spot = spotFrom(sel);
    const next = setStamp(spot, "been", { gut });
    finish(spot, "been", vouchCount(next), gut); // just log it — no pushy "turn this into a vouch" interstitial
  }
  function commitVouch() {
    if (!sel || !line.trim()) return;
    const spot = spotFrom(sel);
    const v: Vouch = { spot, line: line.trim(), occ: [] };
    const next = addVouch(v);
    onAdded?.(v);
    finish(spot, "vouched", vouchCount(next));
  }

  const existing = sel ? getEntry(sel.name) : undefined; // already on your map?

  // one row everywhere a place can be picked — distance leads when we know it,
  // and a place already on your map wears its state chip (PRD §7.2).
  const placeRow = (s: CatalogSpot, km?: number) => {
    const ex = getEntry(s.name);
    return (
      <li key={s.slug}>
        <button type="button" className={styles.result} onClick={() => pickResult(s)}>
          <span className={styles.resultMain}>
            <span className={styles.resultName}>{s.name}</span>
            <span className={styles.resultMeta}>{km != null ? `${fmtDist(km)} · ` : ""}{s.cuisine} · {s.area} · {s.price}</span>
          </span>
          {ex && <RelChip stamp={ex.stamp} gut={ex.gut} className={styles.resultChip} />}
        </button>
      </li>
    );
  };

  // adding a place is about adding something NEW: lead with places you haven't
  // marked yet; the ones already on your map drop below a divider (still pickable,
  // never the headline). (P2-3)
  const placeList = (list: (CatalogSpot & { km?: number })[], showKm = false) => {
    const fresh = list.filter((s) => !getEntry(s.name));
    const marked = list.filter((s) => getEntry(s.name));
    const row = (s: CatalogSpot & { km?: number }) => placeRow(s, showKm ? s.km : undefined);
    return (
      <>
        {fresh.map(row)}
        {marked.length > 0 && <li className={styles.onMapLabel} aria-hidden="true">Already on your map</li>}
        {marked.map(row)}
      </>
    );
  };

  return (
    /* initialFocus="none": the sheet leads with the tappable nearest list — popping
       the keyboard over it would defeat the whole zero-typing flow */
    <Modal open={open} onClose={onClose} label="Add a place" initialFocus="none">
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
            ) : (
              <>
                <div className={`${styles.seal} ${styles.sealBeen}`} aria-hidden="true"><span className={styles.sealMark} aria-hidden="true">✓</span></div>
                <p className={styles.doneTitle}>{done.gut === "absolutely" ? "Logged. You’d go back." : done.gut === "no" ? "Logged. You wouldn’t." : "Logged."}</p>
                <p className={styles.donePlace}>{done.name}</p>
                <Link href="/you" className={styles.doneLink}>It’s in your diary now →</Link>
              </>
            )}
          </div>
        ) : !sel ? (
          <>
            <p className={styles.title}>Add a place to your map.</p>
            <SearchField placeholder="Search any place you know…" value={q} onChange={(e) => setQ(e.target.value)} />
            <ul className={styles.results}>
              {q.trim() ? (
                loading && results.length === 0 ? (
                  <li className={styles.none}>Searching the city…</li>
                ) : results.length === 0 ? (
                  <li className={styles.none}>Nothing matching “{q}”.</li>
                ) : results.map((s) => placeRow(s))
              ) : near && near.length > 0 ? (
                <>
                  <li className={styles.nearLabel} aria-hidden="true">Near you</li>
                  {placeList(near, true)}
                </>
              ) : locating ? (
                <li className={styles.none}>Finding what’s near you…</li>
              ) : results.length > 0 ? (
                placeList(results)
              ) : (
                <li className={styles.none}>Start typing a place.</li>
              )}
            </ul>
          </>
        ) : (
          <>
            <div className={styles.head}>
              <span className={styles.place}>{sel.name}</span>
              {!presetSpot && <button type="button" className={styles.change} onClick={changePlace}>↺ Change</button>}
            </div>
            <span className={styles.tags}><Tag>{sel.cuisine} · {sel.area} · {sel.price}</Tag>{existing && <RelChip stamp={existing.stamp} gut={existing.gut} className={styles.headChip} />}</span>

            <div className={styles.stepBody}>
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
                <p className={styles.prompt}>Go back?</p>
                <div className={styles.gut}>
                  <button type="button" className={styles.gutBtn} onClick={() => chooseGut("absolutely")}>
                    <span className={`${styles.moveDot} ${styles.dAbsolutely}`} aria-hidden="true" /> Absolutely
                  </button>
                  <button type="button" className={styles.gutBtn} onClick={() => chooseGut("maybe")}>
                    <span className={`${styles.moveDot} ${styles.dMaybe}`} aria-hidden="true" /> Maybe
                  </button>
                  <button type="button" className={styles.gutBtn} onClick={() => chooseGut("no")}>
                    <span className={`${styles.moveDot} ${styles.dNo}`} aria-hidden="true" /> No
                  </button>
                </div>
                <p className={styles.stepFoot}>{"// stays in your diary — only a vouch is public"}</p>
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
                <HoldButton disabled={!line.trim()} onComplete={commitVouch}>Hold to put your name on it</HoldButton>
                <p className={styles.holdHint}>A vouch is forever until you take it back. Hold to mean it.</p>
              </>
            )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
