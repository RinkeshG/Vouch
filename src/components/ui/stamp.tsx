"use client";

import { cn } from "@/lib/utils";
import styles from "./stamp.module.css";

interface StampProps {
  size?: number;
  variant?: "filled" | "outline" | "dark";
  animated?: boolean;
  className?: string;
}

export function Stamp({
  size = 32,
  variant = "filled",
  animated = false,
  className,
}: StampProps) {
  const fontSize = size * 0.52;

  return (
    <span
      className={cn(
        styles.stamp,
        styles[variant],
        animated && styles.animated,
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className={styles.letter}
        style={{ fontSize, lineHeight: 1 }}
      >
        V
      </span>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(styles.wordmark, className)}
      aria-label="Vouch"
    >
      vouch
    </span>
  );
}

export function Lockup({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn(styles.lockup, className)}>
      <Stamp size={size} />
      <Wordmark />
    </span>
  );
}
