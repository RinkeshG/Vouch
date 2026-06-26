"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import s from "./landing.module.css";

/* Reveal-on-scroll — content is visible by default (SSR/no-JS safe); below-the-
   fold blocks rise + fade in as they enter. Respects reduced motion. */
export function Reveal({
  children, as: Tag = "div", className = "", delay = 0,
}: { children: ReactNode; as?: ElementType; className?: string; delay?: number }) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setSeen(true);
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) { setSeen(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`${s.reveal} ${seen ? s.revealIn : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
