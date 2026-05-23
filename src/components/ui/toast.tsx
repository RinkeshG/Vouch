"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import styles from "./toast.module.css";

/* ── Types ──────────────────────────────────────── */

interface ToastItem {
  id: number;
  message: string;
  thumbnail?: string;
  exiting: boolean;
}

interface ToastContextValue {
  toast: (message: string, thumbnail?: string) => void;
}

/* ── Context ────────────────────────────────────── */

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { toast: () => {} };
  }
  return ctx;
}

/* ── Provider ───────────────────────────────────── */

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismiss = useCallback((id: number) => {
    // Start exit animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    // Remove after exit animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const toast = useCallback(
    (message: string, thumbnail?: string) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, thumbnail, exiting: false }]);

      // Auto-dismiss after 3 seconds
      setTimeout(() => dismiss(id), 3000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted &&
        createPortal(
          <div className={styles.toastContainer} aria-live="polite">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={cn(styles.toast, t.exiting && styles.toastExit)}
                role="status"
              >
                {t.thumbnail && (
                  <img
                    className={styles.toastThumb}
                    src={t.thumbnail}
                    alt=""
                    aria-hidden="true"
                  />
                )}
                <span className={styles.toastMsg}>{t.message}</span>
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}
