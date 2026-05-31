"use client";
import { useState } from "react";
import { WebShell } from "./web-shell";
import { Button } from "./button";
import { GuideArtifact } from "./guide-artifact";
import { archetypeFor, DEMO_SESSION } from "./_taste";
import type { GuideData, GuideItem } from "./guide";
import styles from "./guide-build.module.css";

/* J3 — building a guide. The Knower makes something they're proud of: name it like
   you'd text it, pick from your own vouches, watch the shareable artifact form
   live beside you (inside == outside). Not data-entry — authoring. */

const CANDIDATES: GuideItem[] = [
  { name: "Empire", tags: "Kebabs · Indiranagar · ₹₹", note: "Chicken ghee roast at 1am. Undefeated." },
  { name: "Corner House", tags: "Ice cream · Koramangala · ₹", note: "Death by Chocolate. Non-negotiable." },
  { name: "Naru Noodle Bar", tags: "Ramen · Indiranagar · ₹₹₹", note: "Wine + ramen at the counter. Book ahead." },
  { name: "Soka", tags: "Small plates · Indiranagar · ₹₹₹", note: "Negroni, then stay for the plates." },
  { name: "Toit", tags: "Brewpub · Indiranagar · ₹₹₹", note: "Tintin Toit + the patio. Go early." },
];

const PROMPTS = ["Open past midnight — actually worth it", "Where I take my parents", "First date, no cringe", "Worth crossing town for"];

export function GuideBuild() {
  const arch = archetypeFor(DEMO_SESSION.mine);
  const [title, setTitle] = useState(PROMPTS[0]);
  const [picked, setPicked] = useState<string[]>(["Empire", "Corner House", "Naru Noodle Bar"]);

  const toggle = (n: string) => setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
  const items: GuideItem[] = picked.map((n) => CANDIDATES.find((c) => c.name === n)!).filter(Boolean);
  const guide: GuideData = { title, by: "You", ini: "RG", count: items.length, note: "your call", anchor: "Bengaluru · your names", items };

  return (
    <WebShell active="guides" you={{ ini: "RG", name: "You", line: `${arch.glyph} ${arch.name}` }}>
      <div className={styles.page}>
        <section className={styles.compose}>
          <p className={styles.eyebrow}>Build a guide</p>
          <h1 className={styles.h1}>Name it like you’d text it.</h1>

          <label className={styles.fieldLabel}>Title — a point of view, never a category</label>
          <input className={styles.titleInput} value={title} maxLength={48} onChange={(e) => setTitle(e.target.value)} placeholder="Open past midnight — actually worth it" />
          <div className={styles.prompts}>
            {PROMPTS.map((p) => <button key={p} type="button" className={styles.prompt} onClick={() => setTitle(p)}>{p}</button>)}
          </div>

          <label className={styles.fieldLabel}>Pick from your vouches</label>
          <ul className={styles.spots}>
            {CANDIDATES.map((c) => {
              const on = picked.includes(c.name);
              return (
                <li key={c.name}>
                  <button type="button" className={`${styles.spot} ${on ? styles.spotOn : ""}`} onClick={() => toggle(c.name)}>
                    <span className={styles.check} aria-hidden="true">{on ? "✓" : "＋"}</span>
                    <span className={styles.spotBody}>
                      <span className={styles.spotName}>{c.name}</span>
                      <span className={styles.spotNote}>“{c.note}”</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className={styles.actions}>
            <Button variant="primary" disabled={items.length === 0}>↗ Share this guide</Button>
            <span className={styles.hint}>{items.length} {items.length === 1 ? "place" : "places"} · drop in your one-liners, reorder anytime</span>
          </div>
        </section>

        <aside className={styles.previewPane}>
          <span className={styles.previewLabel}>What your friends will get</span>
          <GuideArtifact guide={guide} whenToTrust={`Trust them for ${arch.name.replace("The ", "").toLowerCase()} calls.`} />
        </aside>
      </div>
    </WebShell>
  );
}
