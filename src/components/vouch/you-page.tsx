"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { WebShell } from "./web-shell";
import { Avatar } from "./avatar";
import { AddVouchModal } from "./add-vouch";
import { useMyMap } from "./_map-context";
import { type Entry, type Gut, firstWantedAt } from "./_me";
import { findSpot } from "./_taste";
import { cleanArea, distKm, fmtDist } from "./_catalog";
import { slugify } from "./_guides";
import styles from "./you-page.module.css";

/* YOU — your own taste, three rooms behind one overview. Not a ledger of identical
   rows: each register does a different job, so each gets its own page.
   · Overview  — who you are + the one thing worth doing now + three doors.
   · Vouched   — a portfolio: your takes set like an editor's picks.
   · Been      — a diary you can navigate (find · lens · groups).
   · Want      — a backlog you knock down (near-you → go, the rest → log it). */

type View = "overview" | "vouched" | "been" | "want";
type BeenLens = "recent" | "verdict" | "area";
type Pick = { name: string; area: string; cuisine: string; price: string; lat: number | null; lng: number | null };

const DAY = 86_400_000;
const GUT_LABEL: Record<Gut, string> = { absolutely: "Absolutely", maybe: "Maybe", no: "No" };
const GUT_CLASS: Record<Gut, string> = { absolutely: "vAbsolutely", maybe: "vMaybe", no: "vNo" };

function toPick(e: Entry): Pick {
  const s = e.spot, seed = findSpot(s.name);
  return { name: s.name, area: s.area || seed?.area || "", cuisine: s.cuisine || seed?.cuisine || "", price: s.price || seed?.price || "", lat: s.lat, lng: s.lng };
}
function metaOf(e: Entry): string {
  const s = e.spot, seed = findSpot(s.name);
  return [s.cuisine || seed?.cuisine, cleanArea(s.area || seed?.area || "")].filter(Boolean).join(" · ");
}
function areaOf(e: Entry): string {
  return cleanArea(e.spot.area || findSpot(e.spot.name)?.area || "") || "Elsewhere";
}
function agingOf(name: string): string | null {
  const t = firstWantedAt(name);
  if (!t) return null;
  const d = Math.floor((Date.now() - t) / DAY);
  if (d < 7) return null;
  if (d < 30) { const w = Math.floor(d / 7); return `${w} week${w > 1 ? "s" : ""}`; }
  const m = Math.floor(d / 30);
  return `${m} month${m > 1 ? "s" : ""}`;
}
const mapsHref = (name: string, area: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${cleanArea(area)} Bengaluru`)}`;

export function YouPage() {
  const { entries, follows, ready } = useMyMap();
  const [view, setView] = useState<View>("overview");
  const [beenLens, setBeenLens] = useState<BeenLens>("recent");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [preset, setPreset] = useState<{ spot: Pick; stamp: "been" | "vouched" } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [myPos, setMyPos] = useState<{ lat: number; lng: number } | null>(null);

  const vouched = useMemo(() => entries.filter((e) => e.stamp === "vouched").sort((a, b) => (b.at || 0) - (a.at || 0)), [entries]);
  const been = useMemo(() => entries.filter((e) => e.stamp === "been").sort((a, b) => (b.at || 0) - (a.at || 0)), [entries]);
  const want = useMemo(() => entries.filter((e) => e.stamp === "want").sort((a, b) => (b.at || 0) - (a.at || 0)), [entries]);
  const total = entries.length;

  // near-you needs location — asked by permission, cached grant means no re-prompt.
  useEffect(() => {
    if (want.length === 0 || typeof navigator === "undefined" || !navigator.geolocation) return;
    let dead = false;
    navigator.geolocation.getCurrentPosition(
      (p) => { if (!dead) setMyPos({ lat: p.coords.latitude, lng: p.coords.longitude }); },
      () => {},
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 300_000 },
    );
    return () => { dead = true; };
  }, [want.length]);

  const nearWants = useMemo(
    () => (myPos ? want.map((e) => ({ e, km: distKm(myPos.lat, myPos.lng, e.spot.lat, e.spot.lng) })).filter((x) => x.km <= 2.5).sort((a, b) => a.km - b.km) : []),
    [myPos, want],
  );
  const restWants = useMemo(() => {
    const near = new Set(nearWants.map((x) => x.e.spot.name));
    return want
      .filter((e) => !near.has(e.spot.name))
      .map((e) => ({ e, aging: agingOf(e.spot.name), since: firstWantedAt(e.spot.name) ?? e.at }))
      .sort((a, b) => (a.since || 0) - (b.since || 0));
  }, [want, nearWants]);

  const absolutely = useMemo(() => been.filter((e) => e.gut === "absolutely").length, [been]);
  const topCuisines = useMemo(() => {
    const tally: Record<string, number> = {};
    const src = vouched.length ? vouched : been.filter((e) => e.gut === "absolutely");
    src.forEach((e) => { const c = e.spot.cuisine || findSpot(e.spot.name)?.cuisine; if (c) tally[c] = (tally[c] || 0) + 1; });
    return Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([c]) => c);
  }, [vouched, been]);

  function openCapture(spot: Pick, stamp: "been" | "vouched") { setPreset({ spot, stamp }); setAdding(true); }
  function flash(msg: string) { setToast(msg); window.setTimeout(() => setToast(null), 2600); }
  const youLine = vouched.length ? `${vouched.length} ${vouched.length === 1 ? "vouch" : "vouches"} · Bengaluru` : total ? "Building your map" : "You";

  // ── the diary, grouped by the active lens ──────────────────────────────────
  const q = query.trim().toLowerCase();
  const beenShown = q ? been.filter((e) => (e.spot.name + " " + metaOf(e)).toLowerCase().includes(q)) : been;
  const beenGroups: { key: string; rows: Entry[] }[] = (() => {
    if (beenLens === "verdict") {
      return (["absolutely", "maybe", "no"] as Gut[])
        .map((g) => ({ key: GUT_LABEL[g], rows: beenShown.filter((e) => e.gut === g) }))
        .filter((g) => g.rows.length);
    }
    if (beenLens === "area") {
      const by: Record<string, Entry[]> = {};
      beenShown.forEach((e) => { (by[areaOf(e)] ||= []).push(e); });
      return Object.entries(by).sort((a, b) => b[1].length - a[1].length).map(([key, rows]) => ({ key, rows }));
    }
    const now = Date.now();
    const bucket = (at: number) => (!at ? "Earlier" : now - at < 7 * DAY ? "This week" : now - at < 31 * DAY ? "This month" : "Earlier");
    return ["This week", "This month", "Earlier"].map((b) => ({ key: b, rows: beenShown.filter((e) => bucket(e.at) === b) })).filter((g) => g.rows.length);
  })();

  // a diary row — verdict shown as a word EXCEPT in the verdict lens (the header says it once)
  const diaryRow = (e: Entry, showVerdict: boolean) => (
    <li key={e.spot.name} className={styles.row}>
      <Link className={styles.rowBody} href={`/spot/${slugify(e.spot.name)}`}>
        <span className={styles.rowName}>{e.spot.name}</span>
        <span className={styles.rowMeta}>{beenLens === "area" ? (e.spot.cuisine || findSpot(e.spot.name)?.cuisine || "") : metaOf(e)}</span>
      </Link>
      {showVerdict && e.gut && <span className={`${styles.verdict} ${styles[GUT_CLASS[e.gut]]}`}>{GUT_LABEL[e.gut]}</span>}
    </li>
  );

  // ── the one nudge the overview surfaces, chosen by your state ───────────────
  const nudge = (() => {
    if (nearWants.length) {
      const x = nearWants[0];
      return { node: <>You&rsquo;re <b>{fmtDist(x.km)}</b> from <b>{x.e.spot.name}</b> &mdash; the place you wanted to try.</>, href: mapsHref(x.e.spot.name, x.e.spot.area) };
    }
    if (absolutely) return { node: <><b>{absolutely}</b> {absolutely === 1 ? "place you'd" : "places you'd"} go back to &mdash; turn one into a vouch.</>, onClick: () => { setBeenLens("verdict"); setView("been"); } };
    if (want.length) return { node: <><b>{want.length}</b> on your radar &mdash; line up your next one.</>, onClick: () => setView("want") };
    if (been.length) return { node: <>Your diary&rsquo;s underway &mdash; <b>{been.length}</b> logged so far.</>, onClick: () => setView("been") };
    return { node: <>Mark a place &mdash; it starts your map.</>, onClick: () => { setPreset(null); setAdding(true); } };
  })();

  const back = (
    <button type="button" className={styles.back} onClick={() => setView("overview")}>
      <span aria-hidden="true">←</span> You
    </button>
  );

  return (
    <WebShell active="you" onNewVouch={() => { setPreset(null); setAdding(true); }} you={{ ini: "RG", name: "You", line: youLine }}>
      <div className={styles.page}>

        {/* ═══ OVERVIEW ═══ */}
        {view === "overview" && (
          <div className={styles.overview}>
            <header className={styles.idRow}>
              <Avatar initials="RG" size={56} />
              <div className={styles.idCol}>
                <h1 className={styles.name}>You</h1>
                <span className={styles.handle}>@you · Bengaluru</span>
              </div>
            </header>

            {ready && total > 0 && (
              <p className={styles.signature}>
                {topCuisines.length > 0 && <span className={styles.sigStrong}>{topCuisines.join(" & ")}, mostly.</span>}{" "}
                {vouched.length
                  ? <>{topCuisines.length ? "" : <span className={styles.sigStrong}>Your taste.</span>} <b className={styles.sigCount}>{vouched.length}</b> {vouched.length === 1 ? "place carries" : "places carry"} your name.</>
                  : <><b className={styles.sigCount}>{been.length}</b> in your diary, so far.</>}
              </p>
            )}

            {ready && total === 0 ? (
              <div className={styles.cold}>
                <p className={styles.coldTitle}>Your map&rsquo;s empty.</p>
                <p className={styles.coldBody}>Mark a place &mdash; want to go, been, or put your name on it &mdash; and your taste starts taking shape here.</p>
                <button type="button" className={styles.coldBtn} onClick={() => { setPreset(null); setAdding(true); }}>Add your first place →</button>
              </div>
            ) : (
              <>
                {nudge.href ? (
                  <a className={styles.nudge} href={nudge.href} target="_blank" rel="noreferrer"><span className={styles.nudgeText}>{nudge.node}</span><span className={styles.nudgeArrow} aria-hidden="true">→</span></a>
                ) : (
                  <button type="button" className={styles.nudge} onClick={nudge.onClick}><span className={styles.nudgeText}>{nudge.node}</span><span className={styles.nudgeArrow} aria-hidden="true">→</span></button>
                )}

                <div className={styles.doors}>
                  <button type="button" className={styles.door} onClick={() => setView("vouched")} disabled={!vouched.length}>
                    <span className={`${styles.doorMark} ${styles.markVouched}`} aria-hidden="true" />
                    <span className={styles.doorBody}>
                      <span className={styles.doorTop}><span className={`${styles.doorLabel} ${styles.labelVouched}`}>Vouched</span><span className={styles.doorCount}>{vouched.length}</span></span>
                      <span className={styles.doorPeek}>{vouched.length ? (vouched[0].line ? <em>&ldquo;{vouched[0].line}&rdquo; &mdash; {vouched[0].spot.name}</em> : `${vouched.length} you'd stake your word on`) : "Nothing yet — your absolutelys are the start"}</span>
                    </span>
                    <span className={styles.doorChev} aria-hidden="true">›</span>
                  </button>

                  <button type="button" className={styles.door} onClick={() => setView("been")} disabled={!been.length}>
                    <span className={`${styles.doorMark} ${styles.markBeen}`} aria-hidden="true" />
                    <span className={styles.doorBody}>
                      <span className={styles.doorTop}><span className={styles.doorLabel}>Been</span><span className={styles.doorCount}>{been.length}</span></span>
                      <span className={styles.doorPeek}>{been.length ? <>last: {been[0].spot.name}{been[0].gut === "absolutely" ? " — you'd go back" : been[0].gut === "no" ? " — you wouldn't" : ""}</> : "Your honest diary — nothing logged yet"}</span>
                    </span>
                    <span className={styles.doorChev} aria-hidden="true">›</span>
                  </button>

                  <button type="button" className={styles.door} onClick={() => setView("want")} disabled={!want.length}>
                    <span className={`${styles.doorMark} ${styles.markWant}`} aria-hidden="true" />
                    <span className={styles.doorBody}>
                      <span className={styles.doorTop}><span className={styles.doorLabel}>Want</span><span className={styles.doorCount}>{want.length}</span></span>
                      <span className={`${styles.doorPeek} ${nearWants.length ? styles.peekLive : ""}`}>{nearWants.length ? `${nearWants.length} near you right now` : want.length ? "Saved for the right night" : "Your radar's empty"}</span>
                    </span>
                    <span className={styles.doorChev} aria-hidden="true">›</span>
                  </button>
                </div>
              </>
            )}

            <div className={styles.overviewFoot}>
              <Link href="/palate" className={styles.footLink}>Your palate →</Link>
              <Link href="/guides" className={styles.footLink}>Your guides →</Link>
              {follows.length > 0 && <span className={styles.following}>Following {follows.length}</span>}
            </div>
          </div>
        )}

        {/* ═══ VOUCHED — the portfolio ═══ */}
        {view === "vouched" && (
          <div className={styles.register}>
            {back}
            <h1 className={styles.regTitle}>Your name&rsquo;s on these</h1>
            <p className={styles.regSub}>{vouched.length} you&rsquo;d stake your word on</p>

            {vouched.length === 0 ? (
              <p className={styles.regEmpty}>Nothing carries your name yet. The places you mark <b>absolutely</b> in your diary are where a vouch begins.</p>
            ) : (
              <>
                <ol className={styles.folio}>
                  {vouched.map((e, i) => (
                    <li key={e.spot.name} className={styles.folioItem}>
                      <span className={styles.folioNum} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                      <Link className={styles.folioBody} href={`/spot/${slugify(e.spot.name)}`}>
                        {e.line && <p className={styles.folioTake}>&ldquo;{e.line}&rdquo;</p>}
                        <span className={styles.folioAttr}>
                          <span className={styles.folioSeal} aria-hidden="true" />
                          <span className={styles.folioName}>{e.spot.name}</span>
                        </span>
                        <span className={styles.folioMeta}>{metaOf(e)}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
                <div className={styles.folioActions}>
                  <Link href="/guides" className={styles.folioPrimary}>Build a guide from these</Link>
                  <Link href="/palate" className={styles.folioSecondary}>See how these read to others →</Link>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══ BEEN — the diary ═══ */}
        {view === "been" && (
          <div className={styles.register}>
            {back}
            <h1 className={styles.regTitle}>Your diary</h1>
            <p className={styles.regSub}>{been.length} {been.length === 1 ? "place" : "places"} · how they actually were</p>

            {been.length === 0 ? (
              <p className={styles.regEmpty}>Nothing logged yet. The first time you mark somewhere <b>been</b>, your honest answer — go back? absolutely, maybe, or no — lands here.</p>
            ) : (
              <>
                <div className={styles.find}>
                  <span className={styles.findIcon} aria-hidden="true">⌕</span>
                  <input className={styles.findInput} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a place…" aria-label="Find a place in your diary" />
                </div>

                <div className={styles.lenses} role="tablist" aria-label="Group the diary">
                  {(["recent", "verdict", "area"] as BeenLens[]).map((l) => (
                    <button key={l} type="button" role="tab" aria-selected={beenLens === l} className={`${styles.lens} ${beenLens === l ? styles.lensOn : ""}`} onClick={() => setBeenLens(l)}>
                      {l === "recent" ? "Recent" : l === "verdict" ? "Verdict" : "Area"}
                    </button>
                  ))}
                </div>

                {absolutely > 0 && beenLens !== "verdict" && (
                  <button type="button" className={styles.vouchNudge} onClick={() => setBeenLens("verdict")}>
                    <b>{absolutely}</b> you&rsquo;d go back to — turn one into a vouch →
                  </button>
                )}

                {beenGroups.length === 0 ? (
                  <p className={styles.regEmpty}>No matches{q ? ` for “${query.trim()}”` : ""}.</p>
                ) : beenGroups.map((g) => (
                  <section key={g.key} className={styles.group}>
                    <div className={styles.groupHead}>
                      <span className={`${styles.groupLabel} ${beenLens === "verdict" ? styles[`gh_${g.key.toLowerCase()}`] || "" : ""}`}>{g.key}</span>
                      <span className={styles.groupCount}>{g.rows.length}</span>
                    </div>
                    <ul className={styles.rows}>{g.rows.map((e) => diaryRow(e, beenLens !== "verdict"))}</ul>
                  </section>
                ))}
              </>
            )}
          </div>
        )}

        {/* ═══ WANT — the backlog ═══ */}
        {view === "want" && (
          <div className={styles.register}>
            {back}
            <h1 className={styles.regTitle}>On your radar</h1>
            <p className={styles.regSub}>{want.length} saved for the right night</p>

            {want.length === 0 ? (
              <p className={styles.regEmpty}>Nothing saved yet. When a place catches your eye, mark it <b>want to go</b> — it lands here, and on your map.</p>
            ) : (
              <>
                {nearWants.length > 0 && (
                  <section className={styles.group}>
                    <span className={`${styles.groupLabel} ${styles.nearLabel}`}>● Near you now</span>
                    <ul className={styles.wantList}>
                      {nearWants.map(({ e, km }) => (
                        <li key={e.spot.name} className={`${styles.wantRow} ${styles.wantNear}`}>
                          <span className={styles.wantRing} aria-hidden="true" />
                          <Link className={styles.rowBody} href={`/spot/${slugify(e.spot.name)}`}>
                            <span className={styles.rowName}>{e.spot.name}</span>
                            <span className={styles.rowMeta}>{metaOf(e)} · <span className={styles.live}>{fmtDist(km)}</span></span>
                          </Link>
                          <a className={styles.wantGo} href={mapsHref(e.spot.name, e.spot.area)} target="_blank" rel="noreferrer">Go →</a>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {restWants.length > 0 && (
                  <section className={styles.group}>
                    {nearWants.length > 0 && <span className={styles.groupLabel}>Longest on your list</span>}
                    <ul className={styles.wantList}>
                      {restWants.map(({ e, aging }) => (
                        <li key={e.spot.name} className={styles.wantRow}>
                          <span className={styles.wantRing} aria-hidden="true" />
                          <Link className={styles.rowBody} href={`/spot/${slugify(e.spot.name)}`}>
                            <span className={styles.rowName}>{e.spot.name}</span>
                            <span className={styles.rowMeta}>{metaOf(e)}{aging ? <> · <span className={styles.aging}>wanted {aging}</span></> : ""}</span>
                          </Link>
                          <button type="button" className={styles.wantLog} onClick={() => openCapture(toPick(e), "been")}>Been here? →</button>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <AddVouchModal
        open={adding}
        presetSpot={preset?.spot}
        presetStamp={preset?.stamp}
        onClose={() => { setAdding(false); setPreset(null); }}
        onCaptured={(r) => flash(r.stamp === "vouched" ? `Your name’s on it. ${r.spot.name}.` : r.stamp === "want" ? `Saved. ${r.spot.name}’s on your radar.` : `Logged. ${r.spot.name}’s in your diary.`)}
      />
      {toast && <div className={styles.toastWrap}><span className={styles.toast}>{toast}</span></div>}
    </WebShell>
  );
}
