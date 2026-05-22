"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./top-bar.module.css";

interface TopBarProps {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
}

export function TopBar({ title, left, right, className }: TopBarProps) {
  return (
    <header className={cn(styles.bar, className)}>
      <div className={styles.left}>
        {left}
        <h1 className={styles.title}>{title}</h1>
      </div>
      {right && <div className={styles.right}>{right}</div>}
    </header>
  );
}

export function TopBarIconButton({
  children,
  onClick,
  label,
  showDot,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  label: string;
  showDot?: boolean;
  className?: string;
}) {
  return (
    <button
      className={cn(styles.iconBtn, className)}
      onClick={onClick}
      aria-label={label}
    >
      {children}
      {showDot && <span className={styles.notifDot} />}
    </button>
  );
}
