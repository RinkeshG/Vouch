import styles from "./wordmark.module.css";

/* The wordmark + seal mark. Identity is settled (brand.md §6). */
export function Wordmark({ size = 1.4 }: { size?: number }) {
  return (
    <span className={styles.brand} style={{ fontSize: `${size}rem` }}>
      <Mark />
      Vouch
    </span>
  );
}

export function Mark({ size = 25 }: { size?: number }) {
  return (
    <svg className={styles.mark} width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="0.7" y="0.7" width="24.6" height="24.6" rx="4" stroke="currentColor" strokeWidth="1.3" opacity="0.5" />
      <path d="M7 8.5l6 9 6-9" stroke="#f6a82b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
