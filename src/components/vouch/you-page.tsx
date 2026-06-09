"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { WebShell } from "./web-shell";
import { Avatar } from "./avatar";
import { AddVouchModal } from "./add-vouch";
import { useMyMap } from "./_map-context";
import { type Entry, type Gut } from "./_me";
import { RelChip } from "./rel-chip";
import { findSpot } from "./_taste";
import { cleanArea } from "./_catalog";
import { slugify } from "./_guides";
import styles from "./you-page.module.css";

/* YOU — your private ledger (the chronological lens; the map is the spatial one).
   The been DIARY is the star: your honest gut reactions over time, the most truthful
   layer in the product. Want is the radar; Vouched is what carries your name. This is
   inward-facing — how it reads to OTHERS lives on /palate, one tap away. */

type GutFilter = "all" | Gut;
type Pick = { name: string; area: string; cuisine: string; price: string; lat: number | null; lng: number | null };

const DAY = 24 * 60 * 60 * 1000;
function bucketOf(at: number, now: number): string {
  if (!at) return "Earlier";
  const d = now - at;
  if (d < 7 * DAY) return "This week";
  if (d < 31 * DAY) return "This month";
  return "Earlier";
}
const BUCKETS = ["This week", "This month", "Earlier"];

function toPick(e: Entry): Pick {
  const s = e.spot, seed = findSpot(s.name);
  return { name: s.name, area: s.area || seed?.area || "", cuisine: s.cuisine || seed?.cuisine || "", price: s.price || seed?.price || "", lat: s.lat, lng: s.lng };
}
function meta(e: Entry): string {
  const s = e.spot, seed = findSpot(s.name);
  const cuisine = s.cuisine || seed?.cuisine;
  const area = cleanArea(s.area || seed?.area || "");
  return [cuisine, area].filter(Boolean).join(" · ");
}

const GUT_FILTERS: { key: GutFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "loved", label: "Loved" },
  { key: "fine", label: "Fine" },
  { key: "no", label: "Not for me" },
];

export function YouPage() {
  const { entries, follows, ready } = useMyMap();
  const [adding, setAdding] = useState(false);
  const [preset, setPreset] = useState<{ spot: Pick; stamp: "been" | "vouched" } | null>(null);
  const [gutFilter, setGutFilter] = useState<GutFilter>("all");
  const [toast, setToast] = useState<string | null>(null);

  const been = useMemo(() => entries.filter((e) => e.stamp === "been").sort((a, b) => (b.at || 0) - (a.at || 0)), [entries]);
  const want = useMemo(() => entries.filter((e) => e.stamp === "want").sort((a, b) => (b.at || 0) - (a.at || 0)), [entries]);
  const vouched = useMemo(() => entries.filter((e) => e.stamp === "vouched").sort((a, b) => (b.at || 0) - (a.at || 0)), [entries]);

  const gutCounts = {
    all: been.length,
    loved: been.filter((e) => e.gut === "loved").length,
    fine: been.filter((e) => e.gut === "fine").length,
    no: been.filter((e) => e.gut === "no").length,
  };

  // group the (filtered) diary by recency, preserving the newest-first order
  const now = Date.now();
  const shownBeen = gutFilter === "all" ? been : been.filter((e) => e.gut === gutFilter);
  const grouped = BUCKETS.map((b) => ({ bucket: b, rows: shownBeen.filter((e) => bucketOf(e.at, now) === b) })).filter((g) => g.rows.length);

  function openCapture(spot: Pick, stamp: "been" | "vouched") { setPreset({ spot, stamp }); setAdding(true); }
  function flash(msg: string) { setToast(msg); window.setTimeout(() => setToast(null), 2600); }

  const total = entries.length;
  const youLine = vouched.length ? `${vouched.length} ${vouched.length === 1 ? "vouch" : "vouches"} · Bengaluru` : total ? "Building your map" : "Your ledger";

  return (
    <WebShell active="you" onNewVouch={() => { setPreset(null); setAdding(true); }} you={{ ini: "RG", name: "You", line: youLine }}>
      <div className={styles.page}>
        <p className={styles.eyebrow}>Your ledger</p>

        <header className={styles.hero}>
          <Avatar initials="RG" size={56} />
          <div className={styles.idCol}>
            <h1 className={styles.name}>You</h1>
            <span className={styles.handle}>@you · Bengaluru</span>
          </div>
        </header>

        {ready && total > 0 && (
          <div className={styles.stats}>
            <span><b>{vouched.length}</b> vouched</span><i>·</i>
            <span><b>{been.length}</b> been</span><i>·</i>
            <span><b>{want.length}</b> want to go</span>
            {follows.length > 0 && <><i>·</i><span>following <b>{follows.length}</b></span></>}
          </div>
        )}
        <div className={styles.heroLinks}>
          <Link href="/palate" className={styles.heroLink}>Preview your palate →</Link>
          <Link href="/guides" className={styles.heroLink}>Your guides →</Link>
        </div>

        {ready && total === 0 ? (
          <div className={styles.cold}>
            <p className={styles.coldTitle}>Your ledger is empty.</p>
            <p className={styles.coldBody}>Mark a place — want to go, been, or put your name on it — and it starts filling in here, in your words.</p>
            <button type="button" className={styles.coldBtn} onClick={() => { setPreset(null); setAdding(true); }}>Add your first place →</button>
          </div>
        ) : (
          <>
            {/* THE DIARY — the star */}
            <section className={styles.section}>
              <div className={styles.secHead}>
                <h2 className={styles.secTitle}>Your diary</h2>
                <p className={styles.secSub}>Every place you’ve been, and how it actually was.</p>
              </div>

              {been.length === 0 ? (
                <p className={styles.empty}>Nothing logged yet. The first time you mark somewhere <b>been</b>, your honest read lands here — loved it, fine, or not for you.</p>
              ) : (
                <>
                  <div className={styles.filter}>
                    {GUT_FILTERS.map((f) => (
                      <button key={f.key} type="button" className={`${styles.filterChip} ${gutFilter === f.key ? styles.filterOn : ""}`} onClick={() => setGutFilter(f.key)} aria-pressed={gutFilter === f.key}>
                        {f.label} <b>{gutCounts[f.key]}</b>
                      </button>
                    ))}
                  </div>

                  {grouped.length === 0 ? (
                    <p className={styles.empty}>No “{GUT_FILTERS.find((f) => f.key === gutFilter)?.label.toLowerCase()}” entries.</p>
                  ) : grouped.map((g) => (
                    <div key={g.bucket} className={styles.group}>
                      <span className={styles.groupLabel}>{g.bucket}</span>
                      <ul className={styles.rows}>
                        {g.rows.map((e) => (
                          <li key={e.spot.name} className={styles.row}>
                            <RelChip stamp="been" gut={e.gut} className={styles.rowChip} />
                            <Link className={styles.rowBody} href={`/spot/${slugify(e.spot.name)}`}>
                              <span className={styles.rowName}>{e.spot.name}</span>
                              <span className={styles.rowMeta}>{meta(e)}</span>
                            </Link>
                            {e.gut === "loved" && (
                              <button type="button" className={styles.onramp} onClick={() => openCapture(toPick(e), "vouched")}>
                                Put your name on it →
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </>
              )}
            </section>

            {/* WANT — the radar */}
            {want.length > 0 && (
              <section className={styles.section}>
                <div className={styles.secHead}>
                  <h2 className={styles.secTitle}>On your radar</h2>
                  <p className={styles.secSub}>Saved for the right night.</p>
                </div>
                <ul className={styles.rows}>
                  {want.map((e) => (
                    <li key={e.spot.name} className={styles.row}>
                      <RelChip stamp="want" className={styles.rowChip} />
                      <Link className={styles.rowBody} href={`/spot/${slugify(e.spot.name)}`}>
                        <span className={styles.rowName}>{e.spot.name}</span>
                        <span className={styles.rowMeta}>{meta(e)}</span>
                      </Link>
                      <button type="button" className={styles.onramp} onClick={() => openCapture(toPick(e), "been")}>Been here? Log it →</button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* VOUCHED — what carries your name */}
            {vouched.length > 0 && (
              <section className={styles.section}>
                <div className={styles.secHead}>
                  <h2 className={styles.secTitle}>Your name’s on these</h2>
                  <p className={styles.secSub}>The ones you’d stake your word on.</p>
                </div>
                <ul className={styles.rows}>
                  {vouched.map((e) => (
                    <li key={e.spot.name} className={`${styles.row} ${styles.rowVouched}`}>
                      <RelChip stamp="vouched" className={styles.rowChip} />
                      <Link className={styles.rowBody} href={`/spot/${slugify(e.spot.name)}`}>
                        <span className={styles.rowName}>{e.spot.name}</span>
                        {e.line && <span className={styles.rowTake}>“{e.line}”</span>}
                        <span className={styles.rowMeta}>{meta(e)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/palate" className={styles.secFoot}>See how these read to others →</Link>
              </section>
            )}
          </>
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
