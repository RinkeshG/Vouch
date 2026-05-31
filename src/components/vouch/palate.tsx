import { Avatar } from "./avatar";
import { OccasionChip } from "./chip";
import { Button } from "./button";
import styles from "./palate.module.css";

/* The Palate — a person AND their taste; the follow target. A taste map, not a
   profile (Constitution §4): what they know, WHEN to trust them, strongest
   occasions, guides/vouches counts. No bio/followers chrome as the hero. */
export function PalateHeader({
  name,
  handle,
  ini,
  whenToTrust,
  occasions,
  stats,
}: {
  name: string;
  handle: string;
  ini: string;
  whenToTrust: string;
  occasions: string[];
  stats: { guides: number; vouches: number; followers: string };
}) {
  return (
    <header className={styles.head}>
      <div className={styles.top}>
        <Avatar initials={ini} size={56} />
        <div className={styles.id}>
          <h1 className={styles.name}>{name}</h1>
          <span className={styles.handle}>{handle} · {stats.guides} guides · {stats.vouches} vouches · {stats.followers} follow</span>
        </div>
        <div className={styles.actions}>
          <Button variant="primary">Follow</Button>
        </div>
      </div>

      <p className={styles.trust}><span className={styles.trustLabel}>When to trust {name.split(" ")[0]}</span>{whenToTrust}</p>

      <div className={styles.occasions}>
        <span className={styles.occLabel}>Strongest on</span>
        {occasions.map((o) => <OccasionChip key={o}>{o}</OccasionChip>)}
      </div>
    </header>
  );
}
