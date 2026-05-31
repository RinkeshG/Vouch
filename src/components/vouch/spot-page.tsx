"use client";
import { useEffect, useMemo, useState } from "react";
import { WebShell } from "./web-shell";
import { Avatar } from "./avatar";
import { Button } from "./button";
import { OccasionChip } from "./chip";
import { MapReal } from "./map-real";
import { SEED, FOUNDING, archetypeFor } from "./_taste";
import { listGuides, slugify } from "./_guides";
import { loadMe, type Me } from "./_me";
import { AddVouchModal } from "./add-vouch";
import styles from "./spot-page.module.css";

/* The Spot page (Constitution §7.2) — leads with the RECEIPT (who vouched, why it
   reached you), then the named one-line verdicts (the only "review" here), best
   occasion, what to order. Practical chrome (price/area/hours) sits quiet at the
   bottom — never the hero. No stars. Answers "can I trust this for THIS occasion?" */

const ORDERS: Record<string, string> = {
  "Naru Noodle Bar": "The shoyu ramen, a counter seat.",
  Empire: "Chicken ghee roast + rumali roti.",
  Karavalli: "Kane fry, appam, the prawn curry.",
  "Vidyarthi Bhavan": "Masala dosa, one-by-two filter coffee.",
  "Brahmin’s Coffee Bar": "Idli, kara bath, filter coffee.",
  "CTR · Shri Sagar": "Benne masala dosa. That’s the order.",
  "Corner House": "Death by Chocolate. Non-negotiable.",
  Toit: "Tintin Toit + a wood-fired pizza.",
  Soka: "Small plates and a negroni.",
  "Shivaji Military Hotel": "Mutton donne biryani, kheema.",
};
const HOURS: Record<string, string> = {
  "Naru Noodle Bar": "Tue–Sun · 12–3, 7–11", Empire: "Daily · 11am–1am", Karavalli: "Daily · 12.30–3, 7–11",
  "Vidyarthi Bhavan": "Tue–Sun · 6.30am–12, 2–8", "Brahmin’s Coffee Bar": "Daily · 6.30–11.30am, 3.30–7",
  "CTR · Shri Sagar": "Daily · 7.30am–12.30, 4–8", "Corner House": "Daily · 11am–11.30pm",
  Toit: "Daily · 12pm–11.30pm", Soka: "Tue–Sun · 12–3, 6.30–11", "Shivaji Military Hotel": "Daily · 12.30–3.30 (till it’s gone)",
};

type Stamp = "want" | "been" | "vouched";

export function SpotPage({ slug }: { slug: string }) {
  const [me, setMe] = useState<Me>({ vouches: [], follows: [] });
  useEffect(() => { setMe(loadMe()); }, []);
  const myArch = archetypeFor(me.vouches);
  const spot = useMemo(() => SEED.find((s) => slugify(s.name) === slug), [slug]);
  const [stamp, setStamp] = useState<Stamp | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  function flash(t: string) { setToast(t); window.setTimeout(() => setToast(null), 2800); }
  function setMy(s: Stamp) {
    if (s === "vouched") { setAdding(true); return; } // open the real ritual
    setStamp(s);
    flash(s === "want" ? "Saved for the night you’re nearby." : "Logged — it’s in your diary.");
  }

  if (!spot) {
    return <WebShell active="search" you={{ ini: "RG", name: "You", line: `${myArch.glyph} ${myArch.name}` }}>
      <div className={styles.page}><p className={styles.eyebrow}>Spot</p><h1 className={styles.notFound}>No spot here.</h1></div>
    </WebShell>;
  }

  const vouchedBy = FOUNDING.flatMap((f) => f.spots.filter((s) => s.name === spot.name).map((s) => ({ name: f.name, ini: f.ini, line: s.line, slug: f.name.toLowerCase() })));
  const mine = me.vouches.find((v) => v.spot.name === spot.name);
  const inGuides = listGuides().filter((g) => g.items.some((i) => i.name === spot.name)).map((g) => g.title);
  const order = ORDERS[spot.name];

  // the receipt sentence — derived, never stored
  const reachedBy = [
    ...(mine ? ["you vouched it"] : []),
    ...(vouchedBy.length ? [`${vouchedBy.map((v) => v.name).join(" & ")} vouched`] : []),
  ];

  return (
    <WebShell active="search" onNewVouch={() => setAdding(true)} you={{ ini: "RG", name: "You", line: `${myArch.glyph} ${myArch.name}` }}>
      <div className={styles.page}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Spot · Bengaluru</p>
          <h1 className={styles.name}>{spot.name}</h1>
          <div className={styles.occ}>{spot.occasions.map((o) => <OccasionChip key={o}>{o}</OccasionChip>)}</div>
        </header>

        {/* THE RECEIPT — the hero */}
        <section className={styles.receipt}>
          {reachedBy.length ? (
            <>
              <span className={styles.receiptLabel}>Why it reached you</span>
              <p className={styles.receiptLine}>{reachedBy.join(" · ")}{inGuides.length ? ` · in your “${inGuides[0]}”` : ""}</p>
              <ul className={styles.verdicts}>
                {mine && <li className={styles.verdict}><Avatar initials="RG" size={30} /><div><span className={styles.vWho}>You vouched</span><span className={styles.vLine}>“{mine.line}”</span></div></li>}
                {vouchedBy.map((v) => (
                  <li key={v.name} className={styles.verdict}>
                    <Avatar initials={v.ini} size={30} />
                    <div><a className={styles.vWho} href={`/p/${v.slug}`}>{v.name} vouched →</a><span className={styles.vLine}>“{v.line}”</span></div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <span className={styles.receiptLabel}>Why it reached you</span>
              <p className={styles.receiptEmpty}>No one you follow has put their name here yet. If you’d vouch for it — be the first.</p>
            </>
          )}
        </section>

        <div className={styles.split}>
          <div className={styles.col}>
            {order && (
              <section className={styles.section}>
                <span className={styles.label}>The order</span>
                <p className={styles.order}>{order}</p>
              </section>
            )}

            <section className={styles.section}>
              <span className={styles.label}>Your move</span>
              <div className={styles.stamps}>
                {(["want", "been", "vouched"] as Stamp[]).map((s) => (
                  <button key={s} type="button" className={`${styles.stamp} ${stamp === s ? styles.stampOn : ""}`} onClick={() => setMy(s)}>
                    {s === "want" ? "Want to go" : s === "been" ? "Been" : "Vouch it"}
                  </button>
                ))}
                <a className={styles.addGuide} href="/guides" onClick={() => { try { window.sessionStorage.setItem("vouch:guide-seed", JSON.stringify({ name: spot.name, tags: `${spot.cuisine} · ${spot.area} · ${spot.price}`, note: mine?.line ?? order ?? "" })); } catch { /* ignore */ } }}>＋ Add to a guide</a>
              </div>
            </section>

            <section className={styles.practical}>
              <span className={styles.label}>The practical bits</span>
              <p className={styles.practicalLine}>{spot.cuisine} · {spot.area} · {spot.price}</p>
              <p className={styles.practicalLine}>{HOURS[spot.name] ?? "Hours on Google"}</p>
            </section>
          </div>

          <aside className={styles.mapCol}>
            <span className={styles.label}>Where</span>
            <div className={styles.mapWrap}>
              <MapReal pins={[{ id: spot.name, lat: spot.lat, lng: spot.lng, name: spot.name, kind: "mine" }]} height={260} recede tag={`${spot.area} · Bengaluru`} />
            </div>
          </aside>
        </div>
      </div>

      <AddVouchModal open={adding} onClose={() => setAdding(false)} presetSpot={spot.name} onAdded={(v) => { setMe(loadMe()); setStamp("vouched"); flash(`Your name’s on it. ${v.spot.name} is on your map.`); }} />
      {toast && <div className={styles.toastWrap}><span className={styles.toast}>{toast}</span></div>}
    </WebShell>
  );
}
