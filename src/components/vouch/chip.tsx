import type { ReactNode } from "react";
import styles from "./chip.module.css";

/* Occasion chip — the controlled vocabulary (Constitution §4). Two modes:
   a selectable filter (button, `onToggle`) or a static label. */
export function OccasionChip({
  children,
  selected = false,
  onToggle,
}: {
  children: ReactNode;
  selected?: boolean;
  onToggle?: () => void;
}) {
  const cls = `${styles.occasion} ${selected ? styles.on : ""}`;
  if (onToggle) {
    return (
      <button type="button" className={cls} aria-pressed={selected} onClick={onToggle}>
        {children}
      </button>
    );
  }
  return <span className={cls}>{children}</span>;
}

/* Meta tag — cuisine · area · ₹. Mono, quiet. */
export function Tag({ children }: { children: ReactNode }) {
  return <span className={styles.tag}>{children}</span>;
}

/* Status chip — "live", "near you" with a pulsing dot. */
export function StatusChip({ children, tone = "jade" }: { children: ReactNode; tone?: "jade" | "saffron" }) {
  return (
    <span className={`${styles.status} ${tone === "saffron" ? styles.statusSaffron : ""}`}>
      <i aria-hidden="true" />
      {children}
    </span>
  );
}
