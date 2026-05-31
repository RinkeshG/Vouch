import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./input.module.css";

/* Base text input. */
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={styles.input} {...props} />;
}

/* Search field — place / palate search (the add flow starts here). */
export function SearchField({ icon = "⌕", ...props }: { icon?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={styles.search}>
      <span className={styles.searchIcon} aria-hidden="true">{icon}</span>
      <input className={styles.searchInput} {...props} />
    </div>
  );
}

/* The one-line composer field — "the whole review". Dashed, with a caret.
   `value` shows typed copy; `placeholder` coaches. Presentational. */
export function ComposerField({ value, placeholder, caret = true }: { value?: ReactNode; placeholder?: string; caret?: boolean }) {
  return (
    <div className={styles.composer}>
      {value ? <span>{value}</span> : <span className={styles.placeholder}>{placeholder}</span>}
      {caret && <span className={styles.caret} aria-hidden="true" />}
    </div>
  );
}
