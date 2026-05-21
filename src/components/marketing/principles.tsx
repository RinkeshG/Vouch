import { Stamp } from "@/components/ui/stamp";
import styles from "./principles.module.css";

const principles = [
  {
    number: "01",
    title: "Real people, real takes",
    body: "Every vouch comes with a personal take — not a star rating, not a template. You hear it the way your friend would say it to you over coffee.",
  },
  {
    number: "02",
    title: "Your circle, your signal",
    body: "You only see recommendations from people you follow. No strangers, no sponsored content, no algorithms deciding what you should eat.",
  },
  {
    number: "03",
    title: "Skin in the game",
    body: "Your profile doesn't go live until you vouch for four places. Everyone who's here has contributed. No lurkers, just tastemakers.",
  },
  {
    number: "04",
    title: "One city at a time",
    body: "We go deep, not wide. Starting with Bangalore — every neighbourhood, every hidden gem, every late-night spot your circle actually goes to.",
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
          Built on a simple belief: the best food recommendations come from
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
