"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./modal.module.css";

/* Dialog on desktop, bottom-sheet on mobile. Scroll-lock · Esc · focus-trap.
   `initialFocus="none"` keeps focus on the sheet itself — for sheets that lead with
   a tappable list (the nearest-5 capture), where auto-focusing an input would pop
   the keyboard over the very thing the user came to tap. */
export function Modal({
  open,
  onClose,
  label,
  initialFocus = "field",
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  initialFocus?: "field" | "none";
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Keyboard-aware: iOS shrinks only the VISUAL viewport when the keyboard opens, so a
  // bottom sheet on `position: fixed` stays buried underneath. Track visualViewport and
  // lift the sheet above the keyboard, capping its height to the space that's left.
  const [vp, setVp] = useState({ kb: 0, vh: 0 });
  useEffect(() => {
    if (!open || typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    const update = () => setVp({ kb: Math.max(0, window.innerHeight - vv.height - vv.offsetTop), vh: vv.height });
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => { vv.removeEventListener("resize", update); vv.removeEventListener("scroll", update); };
  }, [open]);
  // The sheet pushes a history state so the browser BACK button closes it instead of
  // leaving the site (PRD §7.2 web mechanics — the #1 mobile-web rage moment).
  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    let poppedByUser = false;
    const onPop = () => { poppedByUser = true; onCloseRef.current(); };
    window.history.pushState({ vouchSheet: true }, "");
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      // closed by ✕ / Esc / scrim → consume the state we pushed so back stays sane
      if (!poppedByUser) window.history.back();
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onCloseRef.current(); return; }
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const prevFocus = document.activeElement as HTMLElement | null;
    // focus the first real field (textarea/input), not the ✕ close button — unless the
    // sheet leads with a list, in which case focus the sheet (no keyboard pop).
    const t = window.setTimeout(() => {
      if (initialFocus === "none") { ref.current?.focus(); return; }
      ref.current?.querySelector<HTMLElement>("textarea, input, button, a[href]")?.focus();
    }, 40);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      prevFocus?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  if (!open) return null;
  return (
    <div className={styles.scrim} style={vp.kb ? { paddingBottom: vp.kb } : undefined} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} tabIndex={-1} className={styles.sheet} role="dialog" aria-modal="true" aria-label={label} style={vp.kb ? { maxHeight: `${vp.vh - 16}px` } : undefined}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">✕</button>
        {children}
      </div>
    </div>
  );
}
