import { relationship, type Stamp, type Gut } from "./_me";
import styles from "./rel-chip.module.css";

/* The one chip that shows your relationship to a place — used on search results,
   cards, map popups, and the place page so the language and colour never drift. */
export function RelChip({ stamp, gut, className = "" }: { stamp: Stamp; gut?: Gut; className?: string }) {
  const r = relationship({ stamp, gut });
  if (!r) return null;
  return (
    <span className={`${styles.chip} ${styles[r.tone]} ${className}`}>
      {r.tone === "vouched" && <span className={styles.tick} aria-hidden="true">✓</span>}
      {r.label}
    </span>
  );
}
