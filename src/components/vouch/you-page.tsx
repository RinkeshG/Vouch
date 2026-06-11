"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { WebShell } from "./web-shell";
import { Avatar } from "./avatar";
import { AddVouchModal } from "./add-vouch";
import { MapReal, type MapPin } from "./map-real";
import { useMyMap } from "./_map-context";
import { type Entry, type Gut, firstWantedAt } from "./_me";
import { PlaceRow, TakeEntry, MixBar } from "./atoms";
import { findSpot } from "./_taste";
import { cleanArea, distKm, fmtDist } from "./_catalog";
import { slugify } from "./_guides";
import styles from "./you-page.module.css";

/* YOU — an overview into three rooms, each with its own visual identity
   (mobile-craft-audit Part 2):
   · Overview — identity + one nudge + doors that PREVIEW each room's visual DNA.
   · Vouched  — the portfolio: featured lead take, tiled take-entries.
   · Been     — the diary: verdict MixBar (summary = filter), bounded chronology,
                collapsed Earlier, sticky labels.
   · Want     — the radar: the mini-map leads, near-you acts, the queue groups by area.
   Scale law: sections bound at 8, Earlier collapses to month groups, find at >10. */

type View = "overview" | "vouched" | "been" | "want";
type BeenLens = "recent" | "area";
type Pick = { name: string; area: string; cuisine: string; price: string; lat: number | null; lng: number | null };

const DAY = 86_400_000;
const BOUND = 8; // max rows a section shows before "All N →"
const GUT_LABEL: Record<Gut, string> = { absolutely: "Absolutely", maybe: "Maybe", no: "No" };

function toPick(e: Entry): Pick {
  const s = e.spot, seed = findSpot(s.name);
  return { name: s.name, area: s.area || seed?.area || "", cuisine: s.cuisine || seed?.cuisine || "", price: s.price || seed?.price || "", lat: s.lat, lng: s.lng };
}
function cuisineOf(e: Entry): string { return e.spot.cuisine || findSpot(e.spot.name)?.cuisine || "—"; }
function metaOf(e: Entry): string {
  return [cuisineOf(e), cleanArea(e.spot.area || findSpot(e.spot.name)?.area || "")].filter((x) => x && x !== "—").join(" · ");
}
function areaOf(e: Entry): string { return cleanArea(e.spot.area || findSpot(e.spot.name)?.area || "") || "Elsewhere"; }
function agingOf(name: string): string | null {
  const t = firstWantedAt(name);
  if (!t) return null;
  const d = Math.floor((Date.now() - t) / DAY);
  if (d < 7) return null;
  if (d < 30) { const w = Math.floor(d / 7); return `${w}w`; }
  return `${Math.floor(d / 30)}mo`;
}
function monthOf(at: number): string {
  if (!at) return "Older";
  return new Date(at).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}
const mapsHref = (name: string, area: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${cleanArea(area)} Bengaluru`)}`;

export function YouPage() {
  const { entries, follows, ready } = useMyMap();
  const [view, setView] = useState<View>("overview");
  const [beenLens, setBeenLens] = useState<BeenLens>("recent");
  const [gutFilter, setGutFilter] = useState<Gut | null>(null);
  const [earlierOpen, setEarlierOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [preset, setPreset] = useState<{ spot: Pick; stamp: "been" | "vouched" } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [myPos, setMyPos] = useState<{ lat: number; lng: number } | null>(null);

  const vouched = useMemo(() => entries.filter((e) => e.stamp === "vouched").sort((a, b) => (b.at || 0) - (a.at || 0)), [entries]);
  const been = useMemo(() => entries.filter((e) => e.stamp === "been").sort((a, b) => (b.at || 0) - (a.at || 0)), [entries]);
  const want = useMemo(() => entries.filter((e) => e.stamp === "want").sort((a, b) => (b.at || 0) - (a.at || 0)), [entries]);
  const total = entries.length;

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

  const gutCounts = useMemo(() => ({
    absolutely: been.filter((e) => e.gut === "absolutely").length,
    maybe: been.filter((e) => e.gut === "maybe").length,
    no: been.filter((e) => e.gut === "no").length,
  }), [been]);

  const topCuisines = useMemo(() => {
    const tally: Record<string, number> = {};
    const src = vouched.length ? vouched : been.filter((e) => e.gut === "absolutely");
    src.forEach((e) => { const c = cuisineOf(e); if (c !== "—") tally[c] = (tally[c] || 0) + 1; });
    return Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([c]) => c);
  }, [vouched, been]);

  function openCapture(spot: Pick, stamp: "been" | "vouched") { setPreset({ spot, stamp }); setAdding(true); }
  function flash(msg: string) { setToast(msg); window.setTimeout(() => setToast(null), 2600); }
  function open(v: View) { setView(v); setExpanded(new Set()); setEarlierOpen(false); setGutFilter(null); setQuery(""); window.scrollTo(0, 0); }
  const youLine = vouched.length ? `${vouched.length} ${vouched.length === 1 ? "vouch" : "vouches"} · Bengaluru` : total ? "Building your map" : "You";

  /* ── BEEN: filter → group → bound ─────────────────────────────────────────── */
  const q = query.trim().toLowerCase();
  const beenShown = been
    .filter((e) => (gutFilter ? e.gut === gutFilter : true))
    .filter((e) => (q ? (e.spot.name + " " + metaOf(e)).toLowerCase().includes(q) : true));

  type Group = { key: string; rows: Entry[]; collapsed?: boolean };
  const beenGroups: Group[] = (() => {
    if (beenLens === "area") {
      const by: Record<string, Entry[]> = {};
      beenShown.forEach((e) => { (by[areaOf(e)] ||= []).push(e); });
      return Object.entries(by).sort((a, b) => b[1].length - a[1].length).map(([key, rows]) => ({ key, rows }));
    }
    const now = Date.now();
    const week = beenShown.filter((e) => e.at && now - e.at < 7 * DAY);
    const month = beenShown.filter((e) => e.at && now - e.at >= 7 * DAY && now - e.at < 31 * DAY);
    const earlier = beenShown.filter((e) => !e.at || now - e.at >= 31 * DAY);
    const groups: Group[] = [];
    if (week.length) groups.push({ key: "This week", rows: week });
    if (month.length) groups.push({ key: "This month", rows: month });
    if (earlier.length) {
      if (!earlierOpen && (week.length || month.length)) groups.push({ key: "Earlier", rows: earlier, collapsed: true });
      else {
        const by: Record<string, Entry[]> = {};
        earlier.forEach((e) => { (by[monthOf(e.at)] ||= []).push(e); });
        Object.entries(by).forEach(([key, rows]) => groups.push({ key, rows }));
      }
    }
    return groups;
  })();

  const bounded = (g: Group): { rows: Entry[]; more: number } => {
    if (expanded.has(g.key) || g.rows.length <= BOUND) return { rows: g.rows, more: 0 };
    return { rows: g.rows.slice(0, BOUND), more: g.rows.length - BOUND };
  };

  /* ── VOUCHED: featured lead + (≤12 flat | >12 cuisine groups). Grouping must
     CONDENSE: if your vouches don't cluster by cuisine (≈1 per group), groups
     fragment worse than a flat list — fall back to one bounded run instead. ── */
  const [featured, ...restVouched] = vouched;
  const vouchedGroups: Group[] | null = restVouched.length > 11
    ? (() => {
        const by: Record<string, Entry[]> = {};
        restVouched.forEach((e) => { (by[cuisineOf(e)] ||= []).push(e); });
        const gs = Object.entries(by).sort((a, b) => b[1].length - a[1].length).map(([key, rows]) => ({ key, rows }));
        return gs.length <= restVouched.length / 2 ? gs : [{ key: "", rows: restVouched }];
      })()
    : null;

  /* ── WANT: near-you + area-grouped queue ──────────────────────────────────── */
  const queueWants = useMemo(() => {
    const near = new Set(nearWants.map((x) => x.e.spot.name));
    return want.filter((e) => !near.has(e.spot.name));
  }, [want, nearWants]);
  const wantGroups: Group[] = (() => {
    const by: Record<string, Entry[]> = {};
    queueWants.forEach((e) => { (by[areaOf(e)] ||= []).push(e); });
    return Object.entries(by).sort((a, b) => b[1].length - a[1].length).map(([key, rows]) => ({ key, rows }));
  })();
  const radarPins: MapPin[] = want.map((e) => ({ id: `w:${e.spot.name}`, lat: e.spot.lat, lng: e.spot.lng, name: e.spot.name, kind: "mine", stamp: "want", cuisine: e.spot.cuisine }));

  /* ── the one nudge ────────────────────────────────────────────────────────── */
  const nudge = (() => {
    if (nearWants.length) {
      const x = nearWants[0];
      return { node: <>You&rsquo;re <b>{fmtDist(x.km)}</b> from <b>{x.e.spot.name}</b> &mdash; the place you wanted to try.</>, href: mapsHref(x.e.spot.name, x.e.spot.area) };
    }
    if (gutCounts.absolutely) return { node: <><b>{gutCounts.absolutely}</b> {gutCounts.absolutely === 1 ? "place you'd" : "places you'd"} go back to &mdash; turn one into a vouch.</>, onClick: () => { open("been"); setGutFilter("absolutely"); } };
    if (want.length) return { node: <><b>{want.length}</b> on your radar &mdash; line up your next one.</>, onClick: () => open("want") };
    if (been.length) return { node: <>Your diary&rsquo;s underway &mdash; <b>{been.length}</b> logged so far.</>, onClick: () => open("been") };
    return { node: <>Mark a place &mdash; it starts your map.</>, onClick: () => { setPreset(null); setAdding(true); } };
  })();

  const backBtn = <button type="button" className={`tLabel ${styles.back}`} onClick={() => open("overview")}><span aria-hidden="true">←</span> You</button>;
  const groupHead = (g: { key: string; rows: Entry[] }) => (
    <div className={styles.groupHead}><span className={`tLabel ${styles.groupLabel}`}>{g.key}</span><span className={`tMeta ${styles.groupCount}`}>{g.rows.length}</span></div>
  );
  const moreBtn = (g: Group, more: number) => (
    <button type="button" className={`tActionQuiet ${styles.more}`} onClick={() => setExpanded((s) => new Set(s).add(g.key))}>All {g.rows.length} →</button>
  );

  return (
    <WebShell active="you" onNewVouch={() => { setPreset(null); setAdding(true); }} you={{ ini: "RG", name: "You", line: youLine }}>
      <div className={styles.page}>

        {/* ═══ OVERVIEW ═══ */}
        {view === "overview" && (
          <div>
            <header className={styles.idRow}>
              <Avatar initials="RG" size={56} />
              <div className={styles.idCol}>
                <h1 className={`tTitle ${styles.name}`}>You</h1>
                <span className={`tMeta ${styles.handle}`}>@you · Bengaluru</span>
              </div>
            </header>

            {ready && total > 0 && (
              <p className={styles.signature}>
                {topCuisines.length > 0 && <b>{topCuisines.join(" & ")}, mostly.</b>}{" "}
                {vouched.length
                  ? <><span className={styles.sigNum}>{vouched.length}</span> {vouched.length === 1 ? "place carries" : "places carry"} your name.</>
                  : <><span className={styles.sigNum}>{been.length}</span> in your diary, so far.</>}
              </p>
            )}

            {ready && total === 0 ? (
              <div className={styles.cold}>
                <p className={styles.coldTitle}>Your map&rsquo;s empty.</p>
                <p className={`tSupport ${styles.coldBody}`}>Mark a place &mdash; want to go, been, or put your name on it &mdash; and your taste starts taking shape here.</p>
                <button type="button" className={styles.coldBtn} onClick={() => { setPreset(null); setAdding(true); }}>Add your first place →</button>
              </div>
            ) : (
              <>
                {nudge.href
                  ? <a className={styles.nudge} href={nudge.href} target="_blank" rel="noreferrer"><span className={styles.nudgeText}>{nudge.node}</span><span className={styles.nudgeArrow} aria-hidden="true">→</span></a>
                  : <button type="button" className={styles.nudge} onClick={nudge.onClick}><span className={styles.nudgeText}>{nudge.node}</span><span className={styles.nudgeArrow} aria-hidden="true">→</span></button>}

                {/* the doors preview each room's VISUAL, not more text */}
                <div className={styles.doors}>
                  <button type="button" className={styles.door} onClick={() => open("vouched")} disabled={!vouched.length}>
                    <span className={styles.doorTop}>
                      <span className={`tLabel ${styles.doorSaffron}`}>Vouched</span>
                      <span className="tNum">{vouched.length}</span>
                      <span className={styles.doorChev} aria-hidden="true">›</span>
                    </span>
                    {vouched[0]?.line
                      ? <span className={styles.doorTake}>&ldquo;{vouched[0].line}&rdquo;<i className={`tMeta ${styles.doorTakeBy}`}> — {vouched[0].spot.name}</i></span>
                      : <span className={`tSupport ${styles.doorHint}`}>{vouched.length ? "You'd stake your word on these" : "Your absolutelys are where this starts"}</span>}
                  </button>

                  <button type="button" className={styles.door} onClick={() => open("been")} disabled={!been.length}>
                    <span className={styles.doorTop}>
                      <span className="tLabel">Been</span>
                      <span className="tNum">{been.length}</span>
                      <span className={styles.doorChev} aria-hidden="true">›</span>
                    </span>
                    {been.length
                      ? <MixBar counts={gutCounts} mini />
                      : <span className={`tSupport ${styles.doorHint}`}>Your honest diary</span>}
                  </button>

                  <button type="button" className={styles.door} onClick={() => open("want")} disabled={!want.length}>
                    <span className={styles.doorTop}>
                      <span className="tLabel">Want</span>
                      <span className="tNum">{want.length}</span>
                      <span className={styles.doorChev} aria-hidden="true">›</span>
                    </span>
                    <span className={styles.doorWantLine}>
                      <i className={styles.ghostRing} aria-hidden="true" />
                      <span className={`tSupport ${nearWants.length ? styles.doorLive : ""}`}>{nearWants.length ? `${nearWants.length} near you right now` : want.length ? "Saved for the right night" : "Your radar's empty"}</span>
                    </span>
                  </button>
                </div>
              </>
            )}

            <div className={styles.foot}>
              <Link href="/palate" className={`tActionQuiet ${styles.footLink}`}>Your palate →</Link>
              <Link href="/guides" className={`tActionQuiet ${styles.footLink}`}>Your guides →</Link>
              {follows.length > 0 && <span className={`tMeta ${styles.following}`}>Following {follows.length}</span>}
            </div>
          </div>
        )}

        {/* ═══ VOUCHED — the portfolio ═══ */}
        {view === "vouched" && (
          <div>
            {backBtn}
            <h1 className={`tTitle ${styles.regTitle}`}>Your name&rsquo;s on these</h1>
            <p className={`tLabel ${styles.regSub}`}>{vouched.length} you&rsquo;d stake your word on</p>

            {vouched.length === 0 ? (
              <p className={`tSupport ${styles.regEmpty}`}>Nothing carries your name yet. The places you mark <b>absolutely</b> in your diary are where a vouch begins.</p>
            ) : (
              <>
                <ul className={styles.list}>
                  {featured && <TakeEntry featured take={featured.line} name={featured.spot.name} meta={metaOf(featured)} cuisine={cuisineOf(featured)} href={`/spot/${slugify(featured.spot.name)}`} />}
                  {!vouchedGroups && restVouched.map((e) => (
                    <TakeEntry key={e.spot.name} take={e.line} name={e.spot.name} meta={metaOf(e)} cuisine={cuisineOf(e)} href={`/spot/${slugify(e.spot.name)}`} />
                  ))}
                </ul>
                {vouchedGroups?.map((g) => (
                  <section key={g.key || "all"} className={styles.group}>
                    {g.key && groupHead(g)}
                    <ul className={styles.list}>
                      {bounded(g).rows.map((e) => (
                        <TakeEntry key={e.spot.name} take={e.line} name={e.spot.name} meta={areaOf(e)} cuisine={cuisineOf(e)} href={`/spot/${slugify(e.spot.name)}`} />
                      ))}
                    </ul>
                    {bounded(g).more > 0 && moreBtn(g, bounded(g).more)}
                  </section>
                ))}
                <div className={styles.folioActions}>
                  <Link href="/guides" className={styles.primaryBtn}>Build a guide from these</Link>
                  <Link href="/palate" className={`tActionQuiet ${styles.centerLink}`}>See how these read to others →</Link>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══ BEEN — the diary ═══ */}
        {view === "been" && (
          <div>
            {backBtn}
            <h1 className={`tTitle ${styles.regTitle}`}>Your diary</h1>
            <p className={`tLabel ${styles.regSub}`}>{been.length} {been.length === 1 ? "place" : "places"} · how they actually were</p>

            {been.length === 0 ? (
              <p className={`tSupport ${styles.regEmpty}`}>Nothing logged yet. The first time you mark somewhere <b>been</b>, your honest answer — go back? — lands here.</p>
            ) : (
              <>
                {/* the summary IS the filter — your honesty as an object */}
                <div className={styles.mixWrap}>
                  <MixBar counts={gutCounts} active={gutFilter} onSelect={setGutFilter} />
                </div>

                {been.length > 10 && (
                  <div className={styles.find}>
                    <span className={styles.findIcon} aria-hidden="true">⌕</span>
                    <input className={styles.findInput} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a place…" aria-label="Find a place in your diary" />
                  </div>
                )}

                <div className={styles.lenses} role="tablist" aria-label="Group the diary">
                  {(["recent", "area"] as BeenLens[]).map((l) => (
                    <button key={l} type="button" role="tab" aria-selected={beenLens === l} className={`${styles.lens} ${beenLens === l ? styles.lensOn : ""}`} onClick={() => { setBeenLens(l); setExpanded(new Set()); }}>
                      {l === "recent" ? "Recent" : "Area"}
                    </button>
                  ))}
                </div>

                {beenGroups.length === 0 ? (
                  <p className={`tSupport ${styles.regEmpty}`}>No matches{q ? ` for “${query.trim()}”` : ""}.</p>
                ) : beenGroups.map((g) => g.collapsed ? (
                  <button key={g.key} type="button" className={styles.earlier} onClick={() => setEarlierOpen(true)}>
                    <span className={`tLabel ${styles.groupLabel}`}>Earlier</span>
                    <span className={`tMeta ${styles.groupCount}`}>{g.rows.length}</span>
                    <span className={`tActionQuiet ${styles.earlierOpen}`}>Show →</span>
                  </button>
                ) : (
                  <section key={g.key} className={styles.group}>
                    {groupHead(g)}
                    <ul className={styles.list}>
                      {bounded(g).rows.map((e) => (
                        <PlaceRow key={e.spot.name} name={e.spot.name} cuisine={cuisineOf(e)} mark={e.gut ?? "maybe"}
                          meta={beenLens === "area" ? cuisineOf(e) : metaOf(e)}
                          href={`/spot/${slugify(e.spot.name)}`}
                          right={!gutFilter && e.gut ? <span className={`tMeta ${styles[`vw_${e.gut}`]}`}>{GUT_LABEL[e.gut]}</span> : undefined}
                        />
                      ))}
                    </ul>
                    {bounded(g).more > 0 && moreBtn(g, bounded(g).more)}
                  </section>
                ))}
              </>
            )}
          </div>
        )}

        {/* ═══ WANT — the radar ═══ */}
        {view === "want" && (
          <div>
            {backBtn}
            <h1 className={`tTitle ${styles.regTitle}`}>On your radar</h1>
            <p className={`tLabel ${styles.regSub}`}>{want.length} saved for the right night</p>

            {want.length === 0 ? (
              <p className={`tSupport ${styles.regEmpty}`}>Nothing saved yet. When a place catches your eye, mark it <b>want to go</b> — it lands here, and on your map.</p>
            ) : (
              <>
                {/* the radar itself — a glance, tap opens the live map */}
                <div className={styles.radar}>
                  <MapReal pins={radarPins} height={170} interactive={false} labelMode="hover" recede tag="Your radar" />
                  <Link href="/home" className={styles.radarLink} aria-label="Open your radar on the map" />
                </div>

                {nearWants.length > 0 && (
                  <section className={styles.group}>
                    <div className={styles.groupHead}><span className={`tLabel ${styles.liveLabel}`}>Near you now</span></div>
                    <ul className={styles.list}>
                      {nearWants.map(({ e, km }) => (
                        <PlaceRow key={e.spot.name} highlight name={e.spot.name} cuisine={cuisineOf(e)} mark="want"
                          meta={<>{metaOf(e)} · <span className={styles.liveText}>{fmtDist(km)}</span></>}
                          href={`/spot/${slugify(e.spot.name)}`}
                          right={<a className={`tAction ${styles.go}`} href={mapsHref(e.spot.name, e.spot.area)} target="_blank" rel="noreferrer">Go →</a>}
                        />
                      ))}
                    </ul>
                  </section>
                )}

                {wantGroups.map((g) => (
                  <section key={g.key} className={styles.group}>
                    {groupHead(g)}
                    <ul className={styles.list}>
                      {bounded(g).rows.map((e) => {
                        const aging = agingOf(e.spot.name);
                        return (
                          <PlaceRow key={e.spot.name} name={e.spot.name} cuisine={cuisineOf(e)} mark="want"
                            meta={<>{cuisineOf(e)}{aging ? <> · <span className={styles.agingText}>wanted {aging}</span></> : null}</>}
                            href={`/spot/${slugify(e.spot.name)}`}
                            right={<button type="button" className={`tActionQuiet ${styles.logBtn}`} onClick={() => openCapture(toPick(e), "been")}>Been here? →</button>}
                          />
                        );
                      })}
                    </ul>
                    {bounded(g).more > 0 && moreBtn(g, bounded(g).more)}
                  </section>
                ))}
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
