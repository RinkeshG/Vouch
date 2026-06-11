"use client";
import { useEffect, useMemo, useState } from "react";
import { WebShell } from "./web-shell";
import { Avatar } from "./avatar";
import { MapReal } from "./map-real";
import { SEED, FOUNDING, placeTint, monogram, type Spot } from "./_taste";
import { listGuides, slugify, type GuideItem } from "./_guides";
import { loadMe, setStamp as recordStamp, relationship, type Me, type Stamp } from "./_me";
import { AddVouchModal } from "./add-vouch";
import { GuidePicker } from "./guide-picker";
import { getCatalogSpot, type CatalogSpot } from "./_catalog";
import styles from "./spot-page.module.css";

/* The place page (PRD §5.4) — answers "is this for me, and why do people I trust
   rate it?", not logistics. Order: hero (identity in one glance) → the receipt (who
   you trust vouched + their lines) → what to order → demoted practical bits
   + Open in Maps → a sticky Want/Been/Vouch bar. No stars, no persona. */

const HOURS: Record<string, string> = {
  "Naru Noodle Bar": "Tue–Sun · 12–3, 7–11", Empire: "Daily · 11am–1am", Karavalli: "Daily · 12.30–3, 7–11",
  "Vidyarthi Bhavan": "Tue–Sun · 6.30am–12, 2–8", "Brahmin’s Coffee Bar": "Daily · 6.30–11.30am, 3.30–7",
  "CTR · Shri Sagar": "Daily · 7.30am–12.30, 4–8", "Corner House": "Daily · 11am–11.30pm",
  Toit: "Daily · 12pm–11.30pm", Soka: "Tue–Sun · 12–3, 6.30–11", "Shivaji Military Hotel": "Daily · 12.30–3.30 (till it’s gone)",
};

export function SpotPage({ slug }: { slug: string }) {
  const [me, setMe] = useState<Me>({ entries: [], follows: [] });
  const [cat, setCat] = useState<CatalogSpot | null | undefined>(undefined);
  const [adding, setAdding] = useState(false);
  const [intent, setIntent] = useState<"been" | "vouched">("vouched");
  const [pending, setPending] = useState<Stamp | null>(null);
  const [editing, setEditing] = useState(false);
  const [picking, setPicking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const seedSpot = useMemo(() => SEED.find((s) => slugify(s.name) === slug), [slug]);
  useEffect(() => { setMe(loadMe()); }, []);
  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(null), 2600); return () => window.clearTimeout(t); }, [toast]);
  useEffect(() => { if (seedSpot) { setCat(null); return; } getCatalogSpot(slug).then(setCat); }, [slug, seedSpot]);

  const myV = me.entries.filter((e) => e.stamp === "vouched" && e.line).map((e) => ({ spot: e.spot, line: e.line as string, occ: e.occ ?? [] }));
  const youLine = myV.length ? `${myV.length} ${myV.length === 1 ? "vouch" : "vouches"} · Bengaluru` : "Your map";

  const spot = seedSpot
    ? { name: seedSpot.name, area: seedSpot.area, cuisine: seedSpot.cuisine, price: seedSpot.price, lat: seedSpot.lat as number | null, lng: seedSpot.lng as number | null, occasions: seedSpot.occasions, vibe: seedSpot.vibe, move: seedSpot.move, cover: seedSpot.cover }
    : cat ? { name: cat.name, area: cat.area, cuisine: cat.cuisine, price: cat.price, lat: cat.lat, lng: cat.lng, occasions: [] as string[], vibe: undefined as string | undefined, move: undefined as string | undefined, cover: undefined as string | undefined } : null;

  if (!seedSpot && cat === undefined) {
    return <WebShell active="search" you={{ ini: "RG", name: "You", line: youLine }}>
      <div className={styles.page}><p className={styles.loadingMsg}>Finding it…</p></div>
    </WebShell>;
  }
  if (!spot) {
    return <WebShell active="search" you={{ ini: "RG", name: "You", line: youLine }}>
      <div className={styles.page}><p className={styles.loadingMsg}>No place here.</p></div>
    </WebShell>;
  }

  const fullSpot: Spot = { name: spot.name, area: spot.area, cuisine: spot.cuisine, price: spot.price, occasions: spot.occasions, lat: spot.lat ?? 12.9716, lng: spot.lng ?? 77.5946 };
  const entry = me.entries.find((e) => e.spot.name === spot.name);
  const cur = entry?.stamp ?? null;

  const RANK: Record<Stamp, number> = { want: 1, been: 2, vouched: 3 };
  function applyStamp(s: Stamp) {
    setEditing(false);
    if (s === "want") { recordStamp(fullSpot, "want"); setMe(loadMe()); return; }
    setIntent(s === "been" ? "been" : "vouched");
    setAdding(true); // been → gut step; vouch → the worded composer (reuses the capture flows)
  }
  function setMy(s: Stamp) {
    if (cur === s) { setEditing(false); return; } // already your relationship
    if (cur && RANK[s] < RANK[cur]) { setPending(s); return; } // moving BACKWARD is lossy — confirm first
    applyStamp(s);
  }
  function confirmDemote() {
    if (!pending) return;
    recordStamp(fullSpot, pending); // demotion keeps the note/gut latent — never re-asks
    setMe(loadMe());
    setPending(null);
    setEditing(false);
  }

  const vouchedBy = FOUNDING.flatMap((f) => f.spots.filter((s) => s.name === spot.name).map((s) => ({ name: f.name, ini: f.ini, line: s.line, slug: f.name.toLowerCase() })));
  const mine = myV.find((v) => v.spot.name === spot.name);
  const inGuides = listGuides().filter((g) => g.items.some((i) => i.name === spot.name)).map((g) => g.title);
  const reachedBy = [
    ...(mine ? ["you vouched it"] : []),
    ...(vouchedBy.length ? [`${vouchedBy.map((v) => v.name).join(" & ")} vouched`] : []),
  ];
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot.name} ${spot.area} Bengaluru`)}`;
  // honest standing — only what we actually know (founding palates + you). Never invented.
  const vouchTotal = vouchedBy.length + (mine ? 1 : 0);
  const rel = relationship(entry);
  const guideItem: GuideItem = { name: spot.name, tags: `${spot.cuisine} · ${spot.area}`, note: mine?.line ?? spot.move ?? "" };

  return (
    <WebShell active="search" onNewVouch={() => { setIntent("vouched"); setAdding(true); }} you={{ ini: "RG", name: "You", line: youLine }}>
      <article className={styles.page}>
        {/* HERO — identity in one glance */}
        <div className={styles.hero} style={spot.cover ? { backgroundImage: `url(${spot.cover})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: placeTint(spot.cuisine) }}>
          {!spot.cover && <span className={styles.heroMono} aria-hidden="true">{monogram(spot.name)}</span>}
          <a className={styles.back} href="/home" aria-label="Back to your map">←</a>
          <div className={styles.heroScrim} aria-hidden="true" />
          <div className={styles.heroText}>
            <span className={styles.heroEyebrow}>{spot.area} · Bengaluru</span>
            <h1 className={styles.name}>{spot.name}</h1>
            {spot.vibe && <p className={styles.vibe}>{spot.vibe}</p>}
          </div>
        </div>

        <div className={styles.body}>
          {(vouchTotal > 0 || inGuides.length > 0) && (
            <div className={styles.standing}>
              {vouchTotal > 0 && <span><b>{vouchTotal}</b> {vouchTotal === 1 ? "vouch" : "vouches"}</span>}
              {inGuides.length > 0 && <span>in <b>{inGuides.length}</b> of your lists</span>}
            </div>
          )}

          {/* VOUCHED BY PEOPLE YOU FOLLOW — renders ONLY when someone you trust has put
              their name here. A cold page is confidence, not apology: the social section
              is simply absent (PRD §7.4), never "0 vouches". */}
          {reachedBy.length > 0 && (
            <section className={styles.receipt}>
              {/* no summary line — the standing stat above gives the count, and a
                  summary that paraphrases the receipts three lines early is noise.
                  The receipts ARE the answer. */}
              <span className={styles.receiptLabel}>Why it reached you</span>
              <ul className={styles.verdicts}>
                {mine && <li className={styles.verdict}><Avatar initials="RG" size={32} /><div><span className={styles.vWho}>You vouched</span><span className={styles.vLine}>“{mine.line}”</span></div></li>}
                {vouchedBy.map((v) => (
                  <li key={v.name} className={styles.verdict}>
                    <Avatar initials={v.ini} size={32} />
                    <div><a className={styles.vWho} href={`/p/${v.slug}`}>{v.name} vouched →</a><span className={styles.vLine}>“{v.line}”</span></div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* WHAT TO GET */}
          {spot.move && (
            <section className={styles.section}>
              <span className={styles.label}>What to order</span>
              <p className={styles.move}>{spot.move}</p>
            </section>
          )}

          {/* GOOD TO KNOW — readable; logistics link out */}
          <section className={styles.details}>
            <span className={styles.label}>Good to know</span>
            <dl className={styles.detailGrid}>
              <div className={styles.detailRow}><dt className={styles.dt}>Cuisine</dt><dd className={styles.dd}>{spot.cuisine}</dd></div>
              <div className={styles.detailRow}><dt className={styles.dt}>Area</dt><dd className={styles.dd}>{spot.area}</dd></div>
              <div className={styles.detailRow}><dt className={styles.dt}>Price</dt><dd className={styles.dd}>{spot.price}</dd></div>
              <div className={styles.detailRow}><dt className={styles.dt}>Hours</dt><dd className={styles.dd}>{HOURS[spot.name] ?? "See Google"}</dd></div>
            </dl>
            {spot.lat != null && spot.lng != null && (
              <div className={styles.mapWrap}>
                <MapReal pins={[{ id: spot.name, lat: spot.lat, lng: spot.lng, name: spot.name, kind: "mine", stamp: cur ?? "want" }]} height={184} tag={`${spot.area} · Bengaluru`} />
              </div>
            )}
            <a className={styles.maps} href={mapsHref} target="_blank" rel="noreferrer">Open in Google Maps →</a>
          </section>

          <button type="button" className={styles.addGuide} onClick={() => setPicking(true)}>＋ Add to a guide</button>
        </div>

        {/* ACTION AREA — reflects your relationship; the chooser only shows when you have none.
            When you open a focused DECISION (change an existing state, or the demote guard),
            a scrim dims the page so the taller panel reads as an intentional overlay — never
            clipping the content behind it. Tapping it cancels back to rest. */}
        {(editing || pending) && <div className={styles.barScrim} onClick={() => { setPending(null); setEditing(false); }} aria-hidden="true" />}
        <div className={`${styles.actionBar} ${(editing || pending) ? styles.actionBarRaised : ""}`}>
          {pending ? (
            <div className={styles.confirm}>
              <p className={styles.confirmText}>
                {cur === "vouched"
                  ? <>Take your vouch off <b>{spot.name}</b>? Your note’s kept — but your name comes off it.</>
                  : <>Move <b>{spot.name}</b> back to want-to-go? You’ve already been.</>}
              </p>
              <div className={styles.confirmRow}>
                <button type="button" className={styles.confirmKeep} onClick={() => { setPending(null); setEditing(false); }}>Keep it as is</button>
                <button type="button" className={styles.confirmGo} onClick={confirmDemote}>{pending === "want" ? "Move to want-to-go" : "Move to been"}</button>
              </div>
            </div>
          ) : (!cur || editing) ? (
            <>
              {editing && <button type="button" className={styles.barBack} onClick={() => setEditing(false)}>← keep it as is</button>}
              <div className={styles.barRow}>
                <button type="button" className={`${styles.act} ${cur === "want" ? styles.actWantOn : ""}`} onClick={() => setMy("want")}>{cur === "want" && <span className={styles.actChk} aria-hidden="true">✓</span>}Want to go</button>
                <button type="button" className={`${styles.act} ${cur === "been" ? styles.actBeenOn : ""}`} onClick={() => setMy("been")}>{cur === "been" && <span className={styles.actChk} aria-hidden="true">✓</span>}Been</button>
                <button type="button" className={`${styles.act} ${styles.actVouch} ${cur === "vouched" ? styles.actVouchOn : ""}`} onClick={() => setMy("vouched")}>{cur === "vouched" && <span className={styles.actChk} aria-hidden="true">✓</span>}{cur === "vouched" ? "Vouched" : "Vouch it"}</button>
              </div>
            </>
          ) : (
            <div className={styles.statusBar}>
              {rel && (
                <span className={`${styles.statusBadge} ${rel.tone === "vouched" ? styles.badgeVouched : rel.tone === "absolutely" ? styles.badgeBeen : rel.tone === "maybe" ? styles.badgeFine : rel.tone === "no" ? styles.badgeNo : styles.badgeWant}`}>
                  {rel.tone === "vouched" && <span aria-hidden="true">✓ </span>}{rel.label}
                </span>
              )}
              <div className={styles.statusActions}>
                {cur === "been" && entry?.gut === "absolutely" && <button type="button" className={styles.statusUp} onClick={() => applyStamp("vouched")}>Vouch it</button>}
                {cur === "want" && <button type="button" className={styles.statusUp} onClick={() => applyStamp("been")}>I’ve been</button>}
                <button type="button" className={styles.statusChange} onClick={() => setEditing(true)}>Change</button>
              </div>
            </div>
          )}
        </div>
      </article>

      <AddVouchModal
        open={adding}
        onClose={() => setAdding(false)}
        presetSpot={{ name: spot.name, area: spot.area, cuisine: spot.cuisine, price: spot.price, lat: spot.lat, lng: spot.lng }}
        presetStamp={intent}
        onCaptured={() => { setMe(loadMe()); setEditing(false); }}
      />
      <GuidePicker open={picking} onClose={() => setPicking(false)} item={guideItem} onAdded={(t) => setToast(`Added to “${t}”`)} />
      {toast && <div className={styles.toastWrap}><span className={styles.toast}>{toast}</span></div>}
    </WebShell>
  );
}
