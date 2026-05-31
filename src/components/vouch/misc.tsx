import type { ReactNode } from "react";
import styles from "./misc.module.css";

/* The ledger leader row — num · name · dotted leader · meta · tail. */
export function LeaderRow({ num, name, meta, tail }: { num?: string; name: ReactNode; meta?: string; tail?: ReactNode }) {
  return (
    <div className={styles.row}>
      {num && <span className={styles.rowNum}>{num}</span>}
      <span className={styles.rowName}>{name}</span>
      <span className={styles.rowDots} aria-hidden="true" />
      {meta && <span className={styles.rowMeta}>{meta}</span>}
      {tail && <span className={styles.rowTail}>{tail}</span>}
    </div>
  );
}

/* Loading — skeletons, never spinners, for content. */
export function SkeletonRow() {
  return (
    <div className={styles.skRow}>
      <span className={`${styles.sk} ${styles.skNum}`} />
      <span className={styles.skBody}><span className={`${styles.sk} ${styles.skLine}`} /><span className={`${styles.sk} ${styles.skLineSm}`} /></span>
    </div>
  );
}
export function SkeletonCard() {
  return (
    <div className={styles.skCard}>
      <span className={`${styles.sk} ${styles.skChip}`} />
      <span className={`${styles.sk} ${styles.skTitle}`} />
      <span className={`${styles.sk} ${styles.skLine}`} />
      <span className={`${styles.sk} ${styles.skLineSm}`} />
    </div>
  );
}

/* Empty state — never a dead end; always points to the next action. */
export function EmptyState({ glyph = "✦", title, body, action }: { glyph?: string; title: string; body: string; action?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyGlyph} aria-hidden="true">{glyph}</span>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyBody}>{body}</p>
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  );
}

/* Toast — delight from meaning ("This reached you through Meera"). */
export function Toast({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" }) {
  return <div className={`${styles.toast} ${tone === "success" ? styles.toastSuccess : ""}`} role="status">{children}</div>;
}
