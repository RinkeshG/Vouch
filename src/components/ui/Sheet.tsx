import { X } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useKeyboardInset } from "../../hooks/useKeyboardInset";

export function Sheet({
  title,
  children,
  onClose
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const keyboardInset = useKeyboardInset();

  const sheetStyle = {
    "--sheet-keyboard-inset": `${keyboardInset}px`,
    maxHeight: `min(92dvh, calc(100dvh - env(safe-area-inset-top, 0px) - ${keyboardInset}px - 12px))`
  } as CSSProperties;

  return (
    <div
      className="sheet-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bottom-sheet"
        style={sheetStyle}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sheet-handle" aria-hidden />
        <div className="sheet-header">
          <strong>{title}</strong>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}
