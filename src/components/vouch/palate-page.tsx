"use client";
import { useMemo, useState } from "react";
import { WebShell } from "./web-shell";
import { Avatar } from "./avatar";
import { Button } from "./button";
import { OccasionChip } from "./chip";
import { MapReal, type MapPin } from "./map-real";
import { FOUNDING, findSpot, archetypeFor, DEMO_SESSION, type FoundingPalate } from "./_taste";
import { listGuides } from "./_guides";
import styles from "./palate-page.module.css";

/* J4 — the Palate. A person AND their taste; the follow target (Constitution §4).
   A TASTE MAP, not a profile: leads with WHEN to trust them + strongest occasions,
   never a bio/follower hero. Two modes on one surface: someone else's (decide to
   follow/borrow) and your own (identity + the metagame). Honest taste-match only —
   a counted/named overlap, never a fabricated %. One voice throughout. */

type PalateMeta = { slug: string; handle: string; whenToTrust: string; followers: string; guides: { title: string; slug: string; spots: string[] }[] };

const META: Record<string, PalateMeta> = {
  Aditi: { slug: "aditi", handle: "@aditi", whenToTrust: "When it has to go right — your parents, a first impression, the filter-coffee canon.", followers: "410", guides: [{ title: "Where I take my parents", slug: "parents", spots: ["Karavalli", "Vidyarthi Bhavan", "Koshy’s"] }] },
  Rinkesh: { slug: "rinkesh", handle: "@rinkesh", whenToTrust: "After 11, on a date, or when the table’s big and the night’s long.", followers: "340", guides: [{ title: "Open past midnight — actually worth it", slug: "midnight", spots: ["Empire", "Corner House", "Naru Noodle Bar"] }] },
  Meera: { slug: "meera", handle: "@meera", whenToTrust: "Coffee that matters, a proper negroni, and anywhere she’ll drive 40km for.", followers: "512", guides: [{ title: "Worth crossing town for", slug: "drive", spots: ["Soka", "CTR · Shri Sagar"] }] },
};
const SLUG_TO_NAME: Record<string, string> = { aditi: "Aditi", rinkesh: "Rinkesh", meera: "Meera" };

function pins(spots: { name: string; lat: number; lng: number; line?: string }[], by?: { name: string; ini: string }): MapPin[] {
  return spots.map((s) => ({ id: `${by?.name ?? "me"}:${s.name}`, lat: s.lat, lng: s.lng, name: s.name, line: s.line, kind: by ? "palate" : "mine", by }));
}

export function PalatePage({ slug }: { slug?: string }) {
  const me = DEMO_SESSION;
  const myOcc = useMemo(() => new Set(me.mine.flatMap((v) => v.spot.occasions.concat(v.occ))), [me]);
  const myArch = archetypeFor(me.mine);

  // resolve the palate we're viewing
  const name = slug ? SLUG_TO_NAME[slug] : null;
  const founding: FoundingPalate | undefined = name ? FOUNDING.find((f) => f.name === name) : undefined;
  const own = !slug;

  const [following, setFollowing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  function follow() {
    setFollowing((v) => !v);
    setToast(following ? `Unfollowed ${name}` : `Following ${name} — their vouches now reach your map.`);
    window.setTimeout(() => setToast(null), 2800);
  }

  if (slug && !founding) {
    return (
      <WebShell active="palate" you={{ ini: "RG", name: "You", line: `${myArch.glyph} ${myArch.name}` }}>
        <div className={styles.page}><p className={styles.eyebrow}>Palate</p><h1 className={styles.notFound}>No palate here.</h1></div>
      </WebShell>
    );
  }

  // build the spec
  const meta = founding ? META[founding.name] : null;
  const occasions = own ? Array.from(myOcc) : founding!.occasions;
  const overlap = own ? [] : founding!.occasions.filter((o) => myOcc.has(o));
  const signature = own
    ? me.mine.map((v) => ({ name: v.spot.name, line: v.line }))
    : founding!.spots.map((s) => ({ name: s.name, line: s.line }));
  const mapPins = own
    ? pins(me.mine.map((v) => ({ name: v.spot.name, lat: v.spot.lat, lng: v.spot.lng, line: v.line })))
    : pins(founding!.spots, { name: founding!.name, ini: founding!.ini });
  const ownGuides = own ? listGuides() : [];
  const otherGuides = meta?.guides ?? [];
  const borrowedTotal = own ? ownGuides.reduce((n, g) => n + (g.borrows || 0), 0) : 0;

  const display = own ? "You" : founding!.name;
  const ini = own ? "RG" : founding!.ini;
  const handle = own ? "@you" : meta!.handle;
  const whenToTrust = own ? myArch.line : meta!.whenToTrust;

  return (
    <WebShell active="palate" you={{ ini: "RG", name: "You", line: `${myArch.glyph} ${myArch.name}` }}>
      <div className={styles.page}>
        <p className={styles.eyebrow}>{own ? "Your palate" : "A palate"}</p>

        <header className={styles.hero}>
          <div className={styles.heroTop}>
            <Avatar initials={ini} size={64} />
            <div className={styles.idCol}>
              <h1 className={styles.name}>{own ? <>You — {myArch.glyph} {myArch.name}</> : display}</h1>
              <span className={styles.handle}>{handle} · Bengaluru</span>
            </div>
            <div className={styles.heroAction}>
              {own ? (
                <a href="/guides"><Button variant="ghost">Your guides →</Button></a>
              ) : (
                <Button variant={following ? "ghost" : "primary"} onClick={follow}>{following ? "Following ✓" : "Follow"}</Button>
              )}
            </div>
          </div>

          <p className={styles.trust}><span className={styles.trustLabel}>{own ? "What you’re known for" : `When to trust ${display}`}</span>{whenToTrust}</p>

          {!own && (
            <p className={styles.match}>
              {overlap.length
                ? <>You both live for <b>{overlap.join(", ")}</b>.</>
                : <>Covers what you don’t — your call for <b>{founding!.occasions.slice(0, 2).join(" & ")}</b>.</>}
            </p>
          )}

          <div className={styles.signals}>
            {own
              ? <><span><b>{meta?.followers ?? "37"}</b> follow you</span><i>·</i><span><b>{ownGuides.length}</b> guides</span><i>·</i><span>borrowed <b>{borrowedTotal}×</b></span></>
              : <><span><b>{meta!.followers}</b> follow</span><i>·</i><span><b>{otherGuides.length}</b> {otherGuides.length === 1 ? "guide" : "guides"}</span><i>·</i><span><b>{signature.length}</b> vouches</span></>}
          </div>
        </header>

        <section className={styles.section}>
          <span className={styles.label}>Strongest on</span>
          <div className={styles.occ}>{occasions.map((o) => <OccasionChip key={o}>{o}</OccasionChip>)}</div>
        </section>

        <div className={styles.split}>
          <div className={styles.col}>
            <section className={styles.section}>
              <span className={styles.label}>{own ? "What you’d stake your name on" : `What ${display}’s known for`}</span>
              <ol className={styles.sig}>
                {signature.map((s, i) => {
                  const spot = findSpot(s.name);
                  return (
                    <li key={s.name} className={styles.sigRow}>
                      <span className={styles.sigNum}>{String(i + 1).padStart(2, "0")}</span>
                      <span className={styles.sigBody}>
                        <span className={styles.sigName}>{s.name}</span>
                        {s.line && <span className={styles.sigLine}>“{s.line}”</span>}
                        {spot && <span className={styles.sigTags}>{spot.cuisine} · {spot.area}</span>}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className={styles.section}>
              <span className={styles.label}>{own ? "Your guides" : `${display}’s guides`}</span>
              {own ? (
                ownGuides.length ? ownGuides.map((g) => (
                  <a key={g.id} href="/guides" className={styles.guide}>
                    <span className={styles.guideTitle}>{g.title}</span>
                    <span className={styles.guideMeta}>{g.items.length} spots · borrowed {g.borrows || 0}×</span>
                  </a>
                )) : <a href="/guides" className={styles.guideEmpty}>You haven’t made a guide yet — make the one people keep asking you for →</a>
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

          <aside className={styles.mapCol}>
            <span className={styles.label}>{own ? "Your Bengaluru" : `${display}’s Bengaluru`}</span>
            <div className={styles.mapWrap}><MapReal pins={mapPins} height={300} labelMode="hover" recede tag={own ? "Your map · Bengaluru" : `${display}’s map`} /></div>
          </aside>
        </div>

        {!own && <p className={styles.gate}>Vouch is invite-only · Bengaluru. Follow {display} to borrow their map — every spot with their name on it.</p>}
      </div>

      {toast && <div className={styles.toastWrap}><span className={styles.toast}>{toast}</span></div>}
    </WebShell>
  );
}
