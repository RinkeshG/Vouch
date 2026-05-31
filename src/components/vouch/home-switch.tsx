import styles from "./home-switch.module.css";

/* Temporary prototype affordance: flip between the three candidate home concepts
   to compare how they feel. Removed once a direction is chosen. */
const ITEMS: { label: string; href: string }[] = [
  { label: "Tonight", href: "/tonight" },
  { label: "Pulse", href: "/pulse" },
  { label: "Taste", href: "/taste" },
  { label: "Map", href: "/map" },
];

export function HomeSwitch({ current }: { current: string }) {
  return (
    <div className={styles.bar} role="group" aria-label="Prototype home concepts">
      <span className={styles.tag}>Home concept</span>
      {ITEMS.map((it) => (
        <a key={it.href} href={it.href} className={current === it.label ? styles.on : styles.link}>{it.label}</a>
      ))}
    </div>
  );
}
