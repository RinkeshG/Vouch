import { Stamp } from "@/components/ui/stamp";
import styles from "./principles.module.css";

const principles = [
  {
    number: "01",
    title: "Curation over reviews",
    body: "No star ratings, no anonymous reviews. Just curated lists from real people who actually eat there. Your taste, organized beautifully.",
  },
  {
    number: "02",
    title: "Beautiful by default",
    body: "Every list you publish looks stunning. Pick a color, add an emoji, write a note — share something people actually want to screenshot.",
  },
  {
    number: "03",
    title: "Frictionless creation",
    body: "Name your list, search, tap to add. No forms, no required fields, no friction. Building a list feels like making a playlist.",
  },
  {
    number: "04",
    title: "One city, done right",
    body: "Starting with Bangalore — every neighbourhood, every hidden gem, every late-night spot. Going deep before going wide.",
  },
];

export function Principles() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <Stamp size={24} variant="outline" />
          <h2 className={styles.heading}>Why Vouch</h2>
        </div>
        <p className={styles.intro}>
          Built on a simple belief: the best recommendations come from
          people whose taste you trust, not the internet at large.
        </p>

        <div className={styles.grid}>
          {principles.map((p) => (
            <article key={p.number} className={styles.card}>
              <span className={styles.number}>{p.number}</span>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardBody}>{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
