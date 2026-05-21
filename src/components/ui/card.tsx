import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./card.module.css";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "article" | "section";
  interactive?: boolean;
}

export function Card({
  as: Element = "div",
  interactive = false,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <Element
      className={cn(
        styles.card,
        interactive && styles.interactive,
        className
      )}
      {...props}
    >
      {children}
    </Element>
  );
}
