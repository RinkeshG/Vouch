"use client";
import { useEffect, useMemo, useState } from "react";
import { WebShell } from "./web-shell";
import { Avatar } from "./avatar";
import { Button } from "./button";
import { OccasionChip } from "./chip";
import { MapReal, type MapPin } from "./map-real";
import { FOUNDING, findSpot, type FoundingPalate, type Vouch } from "./_taste";
import { listGuides, slugify, type Guide } from "./_guides";
import { useMyMap } from "./_map-context";
import { AddVouchModal } from "./add-vouch";
import styles from "./palate-page.module.css";

/* The Palate (§4) — a taste map, not a profile. Reads REAL data: your own palate
   from your vouches/follows/guides; a founding palate from curated content. Leads
   with WHEN to trust + honest named overlap (never a fabricated %, never an invented
   follower count). Follow persists. */

type PalateMeta = { slug: string; handle: string; whenToTrust: string; guides: { title: string; slug: string; spots: string[] }[] };
const META: Record<string, PalateMeta> = {
  Aditi: { slug: "aditi", handle: "@aditi", whenToTrust: "When it has to go right — your parents, a first impression, the filter-coffee canon.", guides: [{ title: "Where I take my parents", slug: "parents", spots: ["Karavalli", "Vidyarthi Bhavan", "Koshy’s"] }] },
  Rohan: { slug: "rohan", handle: "@rohan", whenToTrust: "After 11, on a date, or when the table’s big and the night’s long.", guides: [{ title: "Open past midnight — actually worth it", slug: "midnight", spots: ["Empire", "Corner House", "Naru Noodle Bar"] }] },
  Meera: { slug: "meera", handle: "@meera", whenToTrust: "Coffee that matters, a proper negroni, and anywhere she’ll drive 40km for.", guides: [{ title: "Worth crossing town for", slug: "drive", spots: ["Soka", "CTR · Shri Sagar"] }] },
};
const SLUG_TO_NAME: Record<string, string> = { aditi: "Aditi", rohan: "Rohan", meera: "Meera" };

function pins(spots: { name: string; lat: number; lng: number; line?: string }[], by?: { name: string; ini: string }): MapPin[] {
  // cuisine keys the glyph-in-dot pin — one pin atom everywhere, never bare circles
  return spots.map((s) => ({ id: `${by?.name ?? "me"}:${s.name}`, lat: s.lat, lng: s.lng, name: s.name, line: s.line, cuisine: findSpot(s.name)?.cuisine, kind: by ? "palate" : "mine", by }));
}

export function PalatePage({ slug }: { slug?: string }) {
  const name = slug ? SLUG_TO_NAME[slug] : null;
  const founding: FoundingPalate | undefined = name ? FOUNDING.find((f) => f.name === name) : undefined;
  const own = !slug;

  const { entries, follows, toggleFollow } = useMyMap();
  const [ownGuides, setOwnGuides] = useState<Guide[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => { if (own) setOwnGuides(listGuides()); }, [own]);
  const following = name ? follows.includes(name) : false;

  const myV = useMemo(() => entries.filter((e) => e.stamp === "vouched" && e.line).map((e) => ({ spot: e.spot, line: e.line as string, occ: e.occ ?? [] })), [entries]);
  const myOcc = useMemo(() => new Set(myV.flatMap((v) => v.spot.occasions.concat(v.occ))), [myV]);
  // EVIDENCE OVER ASSERTION — your "known for" is read from what you actually vouch
  // for (your top cuisines), never an assigned persona.
  const knownForLine = useMemo(() => {
    const tally: Record<string, number> = {};
    myV.forEach((v) => { const c = v.spot.cuisine; if (c) tally[c] = (tally[c] || 0) + 1; });
    const top = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([c]) => c);
    return top.length ? `${top.join(" and ")} — that’s what gets your name.` : "";
  }, [myV]);

  function follow() {
    if (!name) return;
    const m = toggleFollow(name);
    const nowF = m.follows.includes(name);
    setToast(nowF ? `Following ${name} — their vouches now reach your map.` : `Unfollowed ${name}`);
    window.setTimeout(() => setToast(null), 2800);
  }

  if (slug && !founding) {
    return <WebShell active="you" you={{ ini: "RG", name: "You", line: "Your palate" }}>
      <div className={styles.page}><p className={styles.eyebrow}>Palate</p><h1 className={styles.notFound}>No palate here.</h1></div>
    </WebShell>;
  }

  const meta = founding ? META[founding.name] : null;
  const occasions = own ? Array.from(myOcc) : founding!.occasions;
  const overlap = own ? [] : founding!.occasions.filter((o) => myOcc.has(o));
  const signature = own ? myV.map((v) => ({ name: v.spot.name, line: v.line })) : founding!.spots.map((s) => ({ name: s.name, line: s.line }));
  const mapPins = own
    ? pins(myV.map((v) => ({ name: v.spot.name, lat: v.spot.lat, lng: v.spot.lng, line: v.line })))
    : pins(founding!.spots, { name: founding!.name, ini: founding!.ini });
  const otherGuides = meta?.guides ?? [];

  const display = own ? "You" : founding!.name;
  const ini = own ? "RG" : founding!.ini;
  const handle = own ? "@you" : meta!.handle;
  const hasTaste = myV.length > 0;
  const whenToTrust = own ? (hasTaste ? knownForLine : "Vouch a few places you love and your taste becomes legible right here.") : meta!.whenToTrust;

  return (
    <WebShell active="you" onNewVouch={() => setAdding(true)} you={{ ini: "RG", name: "You", line: myV.length ? `${myV.length} ${myV.length === 1 ? "vouch" : "vouches"} · Bengaluru` : "Your palate" }}>
      <div className={styles.page}>
        {own && <a className={styles.backLink} href="/you">← Back to your ledger</a>}
        <p className={styles.eyebrow}>{own ? "How your palate reads" : "A palate"}</p>
        {own && (
          <p className={styles.previewNote}>What someone sees before trusting your taste.</p>
        )}

        <header className={styles.hero}>
          <div className={styles.heroTop}>
            <Avatar initials={ini} size={64} />
            <div className={styles.idCol}>
              <h1 className={styles.name}>{own ? "You" : display}</h1>
              <span className={styles.handle}>{handle} · Bengaluru</span>
            </div>
            <div className={styles.heroAction}>
              {own
                ? <a href="/guides"><Button variant="ghost">Your guides →</Button></a>
                : <Button variant={following ? "ghost" : "primary"} onClick={follow}>{following ? "Following ✓" : "Follow"}</Button>}
            </div>
          </div>

          <p className={styles.trust}><span className={styles.trustLabel}>{own ? "What you’re known for" : `When to trust ${display}`}</span>{whenToTrust}</p>

          {!own && (
            <p className={styles.match}>
              {overlap.length
                ? <>You both live for <b>{overlap.join(", ")}</b>.</>
                : hasTaste
                  ? <>Covers what you don’t — your call for <b>{founding!.occasions.slice(0, 2).join(" & ")}</b>.</>
                  : <>Strong on <b>{founding!.occasions.slice(0, 2).join(" & ")}</b>.</>}
            </p>
          )}

          <div className={styles.signals}>
            {own
              ? <><span><b>{myV.length}</b> {myV.length === 1 ? "vouch" : "vouches"}</span><i>·</i><span><b>{ownGuides.length}</b> {ownGuides.length === 1 ? "guide" : "guides"}</span><i>·</i><span>following <b>{follows.length}</b></span></>
              : <><span><b>{otherGuides.length}</b> {otherGuides.length === 1 ? "guide" : "guides"}</span><i>·</i><span><b>{signature.length}</b> vouches</span></>}
          </div>
        </header>

        {occasions.length > 0 && (
          <section className={styles.section}>
            <span className={styles.label}>Strongest on</span>
            <div className={styles.occ}>{occasions.map((o) => <OccasionChip key={o}>{o}</OccasionChip>)}</div>
          </section>
        )}

        <div className={styles.split}>
          <div className={styles.col}>
            <section className={styles.section}>
              <span className={styles.label}>{own ? "What you’d stake your name on" : `What ${display}’s known for`}</span>
              {signature.length === 0 ? (
                <a href="/start" className={styles.guideEmpty}>You haven’t vouched for anywhere yet — start your map →</a>
              ) : (
                <ol className={styles.sig}>
                  {signature.map((s, i) => {
                    const spot = findSpot(s.name);
                    return (
                      <li key={s.name} className={styles.sigRow}>
                        <span className={styles.sigNum}>{String(i + 1).padStart(2, "0")}</span>
                        <a className={styles.sigBody} href={`/spot/${slugify(s.name)}`}>
                          <span className={styles.sigName}>{s.name}</span>
                          {s.line && <span className={styles.sigLine}>“{s.line}”</span>}
                          {spot && <span className={styles.sigTags}>{spot.cuisine} · {spot.area}</span>}
                        </a>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            <section className={styles.section}>
              <span className={styles.label}>{own ? "Your guides" : `${display}’s guides`}</span>
              {own ? (
                ownGuides.length ? ownGuides.map((g) => (
                  <a key={g.id} href="/guides" className={styles.guide}>
                    <span className={styles.guideTitle}>{g.title}</span>
                    <span className={styles.guideMeta}>{g.items.length} {g.items.length === 1 ? "place" : "places"}</span>
                  </a>
                )) : <a href="/guides" className={styles.guideEmpty}>No guides yet — make the one people keep asking you for →</a>
              ) : (
                otherGuides.map((g) => (
                  <a key={g.slug} href={g.slug === "parents" ? "/guide/parents" : "/guides"} className={styles.guide}>
                    <span className={styles.guideTitle}>{g.title}</span>
                    <span className={styles.guideMeta}>{g.spots.length} spots · {g.spots.slice(0, 2).join(", ")}…</span>
                  </a>
                ))
              )}
            </section>
          </div>

          {mapPins.length > 0 && (
            <aside className={styles.mapCol}>
              <span className={styles.label}>{own ? "Your Bengaluru" : `${display}’s Bengaluru`}</span>
              <div className={styles.mapWrap}><MapReal pins={mapPins} height={300} labelMode="hover" recede interactive={false} tag={own ? "Your map" : `${display}’s map`} /></div>
            </aside>
          )}
        </div>

        {!own && <p className={styles.gate}>Follow {display} and their vouches land on your map — every place with their name on it, not a star.</p>}
      </div>

      <AddVouchModal open={adding} onClose={() => setAdding(false)} onCaptured={(r) => { setToast(r.stamp === "vouched" ? `Your name’s on it. ${r.spot.name} is on your map.` : r.stamp === "want" ? `Saved. ${r.spot.name}’s on your want-to-go.` : `Logged. ${r.spot.name}’s in your diary.`); window.setTimeout(() => setToast(null), 2800); }} />
      {toast && <div className={styles.toastWrap}><span className={styles.toast}>{toast}</span></div>}
    </WebShell>
  );
}
