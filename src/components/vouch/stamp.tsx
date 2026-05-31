import styles from "./stamp.module.css";

export type StampState = "want" | "been" | "vouched";
const LABELS: Record<StampState, string> = {
  want: "Want to go",
  been: "Been",
  vouched: "Vouched",
};

/* The three vouch stamps (brand-critical, components.md §3.1). Colour = meaning;
   Vouched is the glowing hero state. `animate` lands the stamp (delight on post). */
export function Stamp({
  state,
  animate = false,
  size = "md",
}: {
  state: StampState;
  animate?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <span className={`${styles.stamp} ${styles[state]} ${styles[size]} ${animate ? styles.land : ""}`}>
      <i className={styles.dot} aria-hidden="true" />
      {LABELS[state]}
    </span>
  );
}
