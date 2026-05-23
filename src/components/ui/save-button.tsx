"use client";

import {
  useState,
  useRef,
  useCallback,
  useTransition,
  type MouseEvent,
} from "react";
import { cn } from "@/lib/utils";
import { toggleSave } from "@/app/(app)/actions/save";
import { useToast } from "./toast";
import styles from "./save-button.module.css";

interface SaveButtonProps {
  listId: string;
  initialSaved: boolean;
  initialCount: number;
  size?: "sm" | "md";
}

export function SaveButton({
  listId,
  initialSaved,
  initialCount,
  size = "md",
}: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [reluctant, setReluctant] = useState(false);
  const [isPending, startTransition] = useTransition();
  const reluctanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (isPending) return;

      const willSave = !saved;

      if (!willSave) {
        // Unsave: 200ms reluctance delay
        setReluctant(true);
        reluctanceTimer.current = setTimeout(() => {
          setReluctant(false);
          setSaved(false);
          setCount((c) => Math.max(0, c - 1));
          setRolling(true);
          setTimeout(() => setRolling(false), 300);

          startTransition(async () => {
            try {
              const result = await toggleSave(listId);
              setSaved(result.saved);
              setCount(result.count);
            } catch {
              // Revert on error
              setSaved(true);
              setCount((c) => c + 1);
            }
          });
        }, 200);
        return;
      }

      // Save: immediate feedback with animations
      setSaved(true);
      setCount((c) => c + 1);
      setAnimating(true);
      setRolling(true);

      // Haptic feedback on mobile
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(10);
      }

      // Dispatch custom event for parent card micro-celebration
      e.currentTarget.dispatchEvent(
        new CustomEvent("vouch:save-pulse", { bubbles: true })
      );

      // Toast confirmation
      toast("Saved to your collection");

      // Clear animation states after sequence completes
      setTimeout(() => setAnimating(false), 500);
      setTimeout(() => setRolling(false), 300);

      startTransition(async () => {
        try {
          const result = await toggleSave(listId);
          setSaved(result.saved);
          setCount(result.count);
        } catch {
          // Revert on error
          setSaved(false);
          setCount((c) => Math.max(0, c - 1));
        }
      });
    },
    [saved, isPending, listId]
  );

  const iconSize = size === "sm" ? 16 : 20;

  return (
    <button
      type="button"
      className={cn(styles.wrapper, styles[size])}
      onClick={handleClick}
      aria-label={saved ? "Unsave" : "Save"}
      aria-pressed={saved}
    >
      <span className={styles.heartWrap}>
        <svg
          className={cn(
            styles.heart,
            saved && animating && styles.heartActive,
            reluctant && styles.heartReluctant,
            saved && !animating && !reluctant && styles.heartFilled
          )}
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
        </svg>

        {/* Particle burst */}
        <span
          className={cn(
            styles.particles,
            animating && styles.particleActive
          )}
        >
          <span className={styles.particle} />
          <span className={styles.particle} />
          <span className={styles.particle} />
          <span className={styles.particle} />
          <span className={styles.particle} />
          <span className={styles.particle} />
        </span>
      </span>

      {count > 0 && (
        <span
          className={cn(
            styles.count,
            rolling && styles.countRoll,
            saved && styles.countActive
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
