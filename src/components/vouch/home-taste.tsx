"use client";
import { WebShell } from "./web-shell";
import { HomeSwitch } from "./home-switch";
import { Avatar } from "./avatar";
import { Button } from "./button";
import { MapReal } from "./map-real";
import { FOUNDING, findSpot, archetypeFor, occasionsOf, DEMO_SESSION } from "./_taste";
import styles from "./home-taste.module.css";

/* HOME · concept C — "Taste, evolving". The home is YOU: your palate identity, the
   map filling, the metagame of building taste. The archetype is the hero; the
   network (what just landed) and creation (guides) feed it. Profile-as-home. */

const LOCK_AT = 5;

export function HomeTaste() {
  const { mine, followed } = DEMO_SESSION;
  const arch = archetypeFor(mine);
  const areas = new Set(mine.map((v) => v.spot.area)).size;
  const toLock = Math.max(0, LOCK_AT - mine.length);
  const pct = Math.min(100, Math.round((mine.length / LOCK_AT) * 100));

  const mineNames = new Set(mine.map((v) => v.spot.name));
  const landed = FOUNDING.filter((f) => followed.includes(f.name)).flatMap((f) =>
    f.spots.filter((sp) => !mineNames.has(sp.name)).map((sp) => ({ key: `${f.name}:${sp.name}`, by: f.name, ini: f.ini, name: sp.name, line: sp.line })),
  ).slice(0, 3);

  const pins = mine.map((v) => ({ id: `me:${v.spot.name}`, lat: v.spot.lat, lng: v.spot.lng, name: v.spot.name, line: v.line, occasion: v.occ[0], kind: "mine" as const, by: { name: "You", ini: "RG" } }));

  return (
    <WebShell active="palate" you={{ ini: "RG", name: "You", line: `${arch.glyph} ${arch.name}` }}>
      <HomeSwitch current="Taste" />
      <div className={styles.page}>
        <header className={styles.hero}>
          <span className={styles.glyph} aria-hidden="true">{arch.glyph}</span>
          <p className={styles.kicker}>Your palate is</p>
          <h1 className={styles.archetype}>{arch.name}</h1>
          <p className={styles.archLine}>{arch.line}</p>
          <div className={styles.stats}>
            <span><b>{mine.length}</b> vouches</span><i>·</i>
            <span><b>{areas}</b> neighbourhoods</span><i>·</i>
            <span><b>{followed.length}</b> palates followed</span>
          </div>
          <div className={styles.progress}>
            <div className={styles.bar}><span style={{ width: `${pct}%` }} /></div>
            <span className={styles.progressText}>{toLock > 0 ? `${toLock} more vouch${toLock > 1 ? "es" : ""} to lock your palate` : "Your palate is locked in — keep sharpening it"}</span>
          </div>
        </header>

        <div className={styles.grid}>
          <section className={styles.landed}>
            <span className={styles.label}>Just landed · enriching your map</span>
            {landed.map((l) => (
              <article key={l.key} className={styles.landCard}>
                <Avatar initials={l.ini} size={30} />
                <div className={styles.landBody}>
                  <span className={styles.landPlace}>{l.name}</span>
                  <span className={styles.landLine}>“{l.line}”</span>
                  <span className={styles.landBy}><b>{l.by}</b> vouched · {findSpot(l.name)?.area}</span>
                </div>
                <button type="button" className={styles.add} aria-label={`Save ${l.name}`}>＋</button>
              </article>
            ))}
          </section>

          <aside className={styles.side}>
            <a className={styles.mapCard} href="/map">
              <div className={styles.mapThumb}><MapReal pins={pins} height={150} labelMode="hover" bleed /></div>
              <span className={styles.mapText}>Your map · {mine.length} spots →</span>
            </a>
            <div className={styles.guideCard}>
              <span className={styles.guideKicker}>Taste, set in type</span>
              <span className={styles.guideTitle}>Start a guide.</span>
              <span className={styles.guideSub}>“Where I take my parents”, “midnight runs”. Group your spots, share in a tap.</span>
              <Button variant="ghost">Build a guide →</Button>
            </div>
          </aside>
        </div>

        <div className={styles.addStrip}>
          <span className={styles.addText}>Your next vouch sharpens your palate.</span>
          <Button variant="primary">＋ Vouch a place</Button>
        </div>
      </div>
    </WebShell>
  );
}
