"use client";

import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./tag.module.css";

type TagVariant = "default" | "active" | "outline" | "dark" | "dark-active";

interface TagProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TagVariant;
  as?: "button" | "span";
}

export function Tag({
  variant = "default",
  as: Element = "button",
  children,
  className,
  ...props
}: TagProps) {
  return (
    <Element
      className={cn(styles.tag, styles[variant], className)}
      {...(Element === "button" ? props : {})}
    >
      {children}
    </Element>
  );
}
