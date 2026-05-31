import { Tag, OccasionChip, StatusChip } from "./chip";
import styles from "./spot.module.css";

/* The Spot (place) — leads with the trusted verdict + the Receipt, never
   Google-Maps chrome (Constitution §4, §7). This is the place-page hero block;
   the Receipt + actions sit below it on the page. */
export function SpotHeader({
  name,
  tags,
  verdict,
  verdictBy,
  occasions,
  distance,
}: {
  name: string;
  tags: string;
  verdict: string;
  verdictBy: string;
  occasions: string[];
  distance?: string;
}) {
  return (
    <header className={styles.head}>
      <div className={styles.top}>
        <span className={styles.label}>On your map · tonight</span>
        {distance && <StatusChip tone="saffron">{distance}</StatusChip>}
      </div>
      <h1 className={styles.name}>{name}</h1>
      <div className={styles.tags}><Tag>{tags}</Tag></div>

      <p className={styles.verdict}>“{verdict}”<span className={styles.verdictBy}>— {verdictBy}</span></p>

      <div className={styles.occasions}>
        <span className={styles.occLabel}>Best for</span>
        {occasions.map((o) => <OccasionChip key={o}>{o}</OccasionChip>)}
      </div>
    </header>
  );
}
