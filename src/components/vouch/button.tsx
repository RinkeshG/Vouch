import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./button.module.css";

type Variant = "primary" | "ghost" | "compact";

/* The three button roles (components.md §1). Always sans, sentence case —
   mono UPPERCASE is for labels, never actions. */
export function Button({
  variant = "primary",
  full = false,
  className = "",
  children,
  ...rest
}: {
  variant?: Variant;
  full?: boolean;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${full ? styles.full : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
