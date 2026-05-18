import { useEffect } from "react";
import { Stamp } from "lucide-react";
import type { Place } from "../../types";

export function StampOverlay({ place, onDone }: { place: Place; onDone: () => void }) {
  useEffect(() => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.([12, 40, 18]);
      } catch {
        /* noop */
      }
    }
    const t = window.setTimeout(onDone, 2800);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <div className="stamp-overlay" role="dialog" aria-modal="true" aria-label="Vouch stamped">
      <div className="stamp-overlay-card">
        <div className="stamp-overlay-photo" style={{ backgroundColor: place.color }}>
          <img src={place.image} alt={place.name} />
          <span className="stamp-burst" aria-hidden />
          <div className="stamp-animation" aria-hidden>
            <Stamp size={36} strokeWidth={1.8} />
            <span>VOUCHED</span>
          </div>
        </div>
        <div className="stamp-overlay-copy">
          <span className="stamp-eyebrow">Vouched</span>
          <h2>{place.name}</h2>
          <p>On your list. Send it when someone asks.</p>
          <button type="button" className="stamp-done" onClick={onDone}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
