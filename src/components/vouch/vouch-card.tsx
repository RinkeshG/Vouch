import type { ReactNode } from "react";
import { Avatar } from "./avatar";
import { Stamp, type StampState } from "./stamp";
import { OccasionChip, Tag } from "./chip";
import styles from "./vouch-card.module.css";

/* The Vouch — the atomic unit. One place · one line · one name · one occasion.
   A stamp, not a post (Constitution §1). Variants: full · compact. */
export function VouchCard({
  place,
  tags,
  line,
  palate,
  stamp = "vouched",
  occasions = [],
  variant = "full",
  receipt,
  actions,
}: {
  place: string;
  tags?: string;
  line: string;
  palate: { name: string; ini: string };
  stamp?: StampState;
  occasions?: string[];
  variant?: "full" | "compact";
  receipt?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <article className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.head}>
        <span className={styles.by}>
          <Avatar initials={palate.ini} size={variant === "compact" ? 24 : 28} />
          <span className={styles.byName}>Vouched by <b>{palate.name}</b></span>
        </span>
        <Stamp state={stamp} size={variant === "compact" ? "sm" : "md"} />
      </div>

      <h3 className={styles.place}>{place}</h3>
      {tags && <div className={styles.tags}><Tag>{tags}</Tag></div>}

      <p className={styles.line}>“{line}”</p>

      {occasions.length > 0 && (
        <div className={styles.occasions}>
          {occasions.map((o) => <OccasionChip key={o}>{o}</OccasionChip>)}
        </div>
      )}

      {receipt && <div className={styles.receipt}>{receipt}</div>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </article>
  );
}

export function CardActions({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
