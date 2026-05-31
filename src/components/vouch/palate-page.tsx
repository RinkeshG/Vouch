"use client";
import { useEffect, useMemo, useState } from "react";
import { WebShell } from "./web-shell";
import { Avatar } from "./avatar";
import { Button } from "./button";
import { OccasionChip } from "./chip";
import { MapReal, type MapPin } from "./map-real";
import { FOUNDING, findSpot, archetypeFor, type FoundingPalate, type Vouch } from "./_taste";
import { listGuides, slugify, type Guide } from "./_guides";
import { loadMe, toggleFollow, type Me } from "./_me";
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
  return spots.map((s) => ({ id: `${by?.name ?? "me"}:${s.name}`, lat: s.lat, lng: s.lng, name: s.name, line: s.line, kind: by ? "palate" : "mine", by }));
}

export function PalatePage({ slug }: { slug?: string }) {
  const name = slug ? SLUG_TO_NAME[slug] : null;
  const founding: FoundingPalate | undefined = name ? FOUNDING.find((f) => f.name === name) : undefined;
  const own = !slug;

  const [me, setMe] = useState<Me>({ vouches: [], follows: [] });
  const [ownGuides, setOwnGuides] = useState<Guide[]>([]);
  const [following, setFollowing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const m = loadMe();
    setMe(m);
    if (own) setOwnGuides(listGuides());
    if (name) setFollowing(m.follows.includes(name));
  }, [name, own]);

  const myOcc = useMemo(() => new Set(me.vouches.flatMap((v) => v.spot.occasions.concat(v.occ))), [me]);
  const myArch = archetypeFor(me.vouches);

  function follow() {
    if (!name) return;
    const m = toggleFollow(name);
    setMe(m);
    const now = m.follows.includes(name);
    setFollowing(now);
    setToast(now ? `Following ${name} — their vouches now reach your map.` : `Unfollowed ${name}`);
    window.setTimeout(() => setToast(null), 2800);
  }

  if (slug && !founding) {
    return <WebShell active="palate" you={{ ini: "RG", name: "You", line: "Your palate" }}>
      <div className={styles.page}><p className={styles.eyebrow}>Palate</p><h1 className={styles.notFound}>No palate here.</h1></div>
    </WebShell>;
  }

  const meta = founding ? META[founding.name] : null;
  const occasions = own ? Array.from(myOcc) : founding!.occasions;
  const overlap = own ? [] : founding!.occasions.filter((o) => myOcc.has(o));
  const signature = own ? me.vouches.map((v) => ({ name: v.spot.name, line: v.line })) : founding!.spots.map((s) => ({ name: s.name, line: s.line }));
  const mapPins = own
    ? pins(me.vouches.map((v) => ({ name: v.spot.name, lat: v.spot.lat, lng: v.spot.lng, line: v.line })))
    : pins(founding!.spots, { name: founding!.name, ini: founding!.ini });
  const otherGuides = meta?.guides ?? [];

  const display = own ? "You" : founding!.name;
  const ini = own ? "RG" : founding!.ini;
  const handle = own ? "@you" : meta!.handle;
  const hasTaste = me.vouches.length > 0;
  const whenToTrust = own ? (hasTaste ? myArch.line : "Vouch a few places you love and your taste becomes legible right here.") : meta!.whenToTrust;

  return (
    <WebShell active="palate" onNewVouch={() => setAdding(true)} you={{ ini: "RG", name: "You", line: hasTaste ? `${myArch.glyph} ${myArch.name}` : "Your palate" }}>
      <div className={styles.page}>
        <p className={styles.eyebrow}>{own ? "Your palate" : "A palate"}</p>

        <header className={styles.hero}>
          <div className={styles.heroTop}>
            <Avatar initials={ini} size={64} />
            <div className={styles.idCol}>
              <h1 className={styles.name}>{own ? (hasTaste ? <>You — {myArch.glyph} {myArch.name}</> : "You") : display}</h1>
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
              ? <><span><b>{me.vouches.length}</b> {me.vouches.length === 1 ? "vouch" : "vouches"}</span><i>·</i><span><b>{ownGuides.length}</b> {ownGuides.length === 1 ? "guide" : "guides"}</span><i>·</i><span>following <b>{me.follows.length}</b></span></>
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
                    <span className={styles.guideMeta}>{g.items.length} spots · borrowed {g.borrows || 0}×</span>
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
              <div className={styles.mapWrap}><MapReal pins={mapPins} height={300} labelMode="hover" recede tag={own ? "Your map · Bengaluru" : `${display}’s map`} /></div>
            </aside>
          )}
        </div>

        {!own && <p className={styles.gate}>Vouch is invite-only · Bengaluru. Follow {display} to borrow their map — every spot with their name on it.</p>}
      </div>

      <AddVouchModal open={adding} onClose={() => setAdding(false)} onAdded={(v) => { setMe(loadMe()); setToast(`Your name’s on it. ${v.spot.name} is on your map.`); window.setTimeout(() => setToast(null), 2800); }} />
      {toast && <div className={styles.toastWrap}><span className={styles.toast}>{toast}</span></div>}
    </WebShell>
  );
}
