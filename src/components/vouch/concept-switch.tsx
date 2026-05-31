import styles from "./concept-switch.module.css";

/* Prototype affordance: flip between the v2 home directions to feel them. */
const ITEMS: { label: string; href: string }[] = [
  { label: "Over To You", href: "/over-to-you" },
  { label: "The Round", href: "/the-round" },
  { label: "Producer's Home", href: "/producers-home" },
  { label: "The Ledger", href: "/the-ledger" },
];

export function ConceptSwitch({ current }: { current: string }) {
  return (
    <div className={styles.bar} role="group" aria-label="Home direction prototypes">
      <span className={styles.tag}>Direction</span>
      {ITEMS.map((it) => (
        <a key={it.href} href={it.href} className={current === it.label ? styles.on : styles.link}>{it.label}</a>
      ))}
    </div>
  );
}
