"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./button.module.css";

type ButtonVariant =
  | "primary"
  | "seal"
  | "secondary"
  | "ghost"
  | "dark"
  | "dark-secondary";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconRight,
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          styles.button,
          styles[variant],
          styles[size],
          fullWidth && styles.fullWidth,
          loading && styles.loading,
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <span className={styles.spinner} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle
                cx="8"
                cy="8"
                r="6.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="32"
                strokeDashoffset="8"
                strokeLinecap="round"
              />
            </svg>
          </span>
        )}
        {!loading && icon && (
          <span className={styles.icon}>{icon}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && iconRight && (
          <span className={styles.icon}>{iconRight}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
