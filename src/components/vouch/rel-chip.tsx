import { relationship, relationshipState, type Stamp, type Gut } from "./_me";
import styles from "./rel-chip.module.css";

/* The one chip that shows your relationship to a place — used on search results,
   cards, map popups, and the place page so the language and colour never drift.

   mode    — "verdict" (default) speaks the diary register (Absolutely/Maybe/No);
             "state" speaks the index register (Want to go/Been/Vouched). Index
             surfaces never leak verdicts — the question isn't in view there.
   variant — "tag" (default) is the tinted label; "quiet" is a register dot + mono
             label (the map legend's language) for ledger-row columns. */
export function RelChip({ stamp, gut, mode = "verdict", variant = "tag", className = "" }: {
  stamp: Stamp; gut?: Gut; mode?: "verdict" | "state"; variant?: "tag" | "quiet"; className?: string;
}) {
  const r = mode === "state" ? relationshipState({ stamp }) : relationship({ stamp, gut });
  if (!r) return null;
  if (variant === "quiet") {
    return (
      <span className={`${styles.quiet} ${styles[r.tone]} ${className}`}>
        <i className={styles.qDot} aria-hidden="true" />
        {r.label}
      </span>
    );
  }
  return (
    <span className={`${styles.chip} ${styles[r.tone]} ${className}`}>
      {r.tone === "vouched" && <span className={styles.tick} aria-hidden="true">✓</span>}
      {r.label}
    </span>
  );
}
