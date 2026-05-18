import { Stamp } from "lucide-react";
import type { Place } from "../../types";

export function StampOverlay({ place, onDone }: { place: Place; onDone: () => void }) {
  return (
    <div className="stamp-overlay" role="dialog" aria-modal="true" aria-label="Vouch stamped">
      <div className="stamp-overlay-card">
        <div className="stamp-overlay-photo" style={{ backgroundColor: place.color }}>
          <img src={place.image} alt={place.name} />
          <MotionStamp />
        </div>
        <div className="stamp-overlay-copy">
          <h2>{place.name}</h2>
          <p>It’s on your list. Share it when someone asks.</p>
          <button type="button" className="primary-button" onClick={onDone}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function MotionStamp() {
  return (
    <div className="stamp-animation" aria-hidden>
      <Stamp size={42} strokeWidth={1.6} />
      <span>VOUCHED</span>
    </div>
  );
}
