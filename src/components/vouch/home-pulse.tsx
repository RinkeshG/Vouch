"use client";
import { WebShell } from "./web-shell";
import { HomeSwitch } from "./home-switch";
import { Avatar } from "./avatar";
import { Button } from "./button";
import { Tag } from "./chip";
import { FOUNDING, findSpot, archetypeFor, matchPct, DEMO_SESSION } from "./_taste";
import styles from "./home-pulse.module.css";

/* HOME · concept B — "Pulse". The home is the living word-of-mouth of the people
   you trust: what they just vouched, saved, added. One featured vouch leads; the
   stream tightens below. Hierarchy by recency + weight, not a wall of equal cards.
   The right rail keeps the trust graph (your palates) close. */

type Act =
  | { kind: "vouched"; by: string; ini: string; place: string; line: string; occ: string; time: string }
  | { kind: "saved"; by: string; ini: string; place: string; time: string }
  | { kind: "guide"; by: string; ini: string; place: string; guide: string; time: string };

const FEED: Act[] = [
  { kind: "vouched", by: "Aditi", ini: "AS", place: "Karavalli", line: "Take your parents. They’ll talk for months.", occ: "parents", time: "2h" },
  { kind: "saved", by: "Meera", ini: "MK", place: "Soka", time: "4h" },
  { kind: "vouched", by: "Rinkesh", ini: "RG", place: "Empire", line: "Chicken ghee roast at 1am. Undefeated.", occ: "late night", time: "6h" },
  { kind: "guide", by: "Aditi", ini: "AS", place: "Vidyarthi Bhavan", guide: "the morning ritual", time: "1d" },
  { kind: "vouched", by: "Meera", ini: "MK", place: "CTR · Shri Sagar", line: "Benne dosa. Don’t even debate it.", occ: "coffee", time: "1d" },
  { kind: "saved", by: "Rinkesh", ini: "RG", place: "Toit", time: "2d" },
];

export function HomePulse() {
  const { mine, followed } = DEMO_SESSION;
  const featured = FEED[0] as Extract<Act, { kind: "vouched" }>;
  const stream = FEED.slice(1);
  const palates = FOUNDING.filter((f) => followed.includes(f.name));

  return (
    <WebShell active="map" you={{ ini: "RG", name: "You", line: `${archetypeFor(mine).glyph} ${archetypeFor(mine).name}` }}>
      <HomeSwitch current="Pulse" />
      <div className={styles.page}>
        <main className={styles.feed}>
          <header className={styles.head}>
            <p className={styles.eyebrow}>Bengaluru · live</p>
            <h1 className={styles.h1}>What your people are eating.</h1>
          </header>

          <article className={styles.featured}>
            <span className={styles.fBy}><Avatar initials={featured.ini} size={26} /> {featured.by} vouched · {featured.time} ago</span>
            <h2 className={styles.fPlace}>{featured.place}</h2>
            <p className={styles.fLine}>“{featured.line}”</p>
            <div className={styles.fFoot}>
              <Tag>{featured.occ}</Tag>
              <div className={styles.fActions}>
                <Button variant="primary">Save to my map</Button>
                <button type="button" className={styles.ghost}>See {featured.by}’s palate →</button>
              </div>
            </div>
          </article>

          <ul className={styles.stream}>
            {stream.map((a, i) => {
              const s = findSpot(a.place);
              return (
                <li key={i} className={styles.row}>
                  <Avatar initials={a.ini} size={30} />
                  <div className={styles.rowBody}>
                    <p className={styles.rowHead}>
                      <b>{a.by}</b> {a.kind === "vouched" ? "vouched" : a.kind === "saved" ? "saved" : "added"} <span className={styles.rowPlace}>{a.place}</span>
                      {a.kind === "guide" && <> to <i>{a.guide}</i></>}
                    </p>
                    {a.kind === "vouched" && <p className={styles.rowLine}>“{a.line}”</p>}
                    <p className={styles.rowMeta}>{[s?.cuisine, s?.area].filter(Boolean).join(" · ")} · {a.time} ago</p>
                  </div>
                  <button type="button" className={styles.save} aria-label={`Save ${a.place}`}>＋</button>
                </li>
              );
            })}
          </ul>
        </main>

        <aside className={styles.rail}>
          <div className={styles.railCard}>
            <span className={styles.railLabel}>Palates you follow</span>
            {palates.map((p) => (
              <div key={p.name} className={styles.palate}>
                <Avatar initials={p.ini} size={32} />
                <span className={styles.palateText}><b>{p.name}</b><span className={styles.palateMeta}>{matchPct(p, mine)}% your taste</span></span>
              </div>
            ))}
            <a className={styles.railLink} href="/map">Your map · {mine.length} spots →</a>
          </div>
        </aside>
      </div>
    </WebShell>
  );
}
