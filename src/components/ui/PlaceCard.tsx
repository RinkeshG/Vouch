import { ChevronRight } from "lucide-react";
import { priceShort } from "../../lib/format";
import type { Friend, Place, UserPlace } from "../../types";

export function PlaceCard({
  place,
  userPlace,
  friend,
  onClick,
  index,
  stamped
}: {
  place: Place;
  userPlace?: UserPlace;
  friend?: Friend;
  onClick: () => void;
  index?: number;
  stamped?: boolean;
}) {
  const note = userPlace?.why ?? place.tip;
  const attribution =
    userPlace?.addedFrom && friend ? `From ${friend.name}` : userPlace?.state === "want" ? "Want to try" : null;

  return (
    <button type="button" className="place-card" onClick={onClick}>
      <div className="place-thumb" style={{ backgroundColor: place.color }}>
        <img src={place.image} alt={place.name} />
        {index !== undefined && <span>{index}</span>}
      </div>
      <div className="place-card-copy">
        <strong>{place.name}</strong>
        <small>
          {place.area} · {priceShort(place.price)}
        </small>
        {attribution && <em className="place-attribution">{attribution}</em>}
        <p>{note}</p>
        {(userPlace?.tags.length ? userPlace.tags : place.tags).slice(0, 2).length > 0 && (
          <MotionTags tags={(userPlace?.tags.length ? userPlace.tags : place.tags).slice(0, 2)} />
        )}
      </div>
      {stamped ? <span className="mini-stamp">Vouched</span> : <ChevronRight size={17} aria-hidden />}
    </button>
  );
}

function MotionTags({ tags }: { tags: string[] }) {
  return (
    <div className="micro-tags">
      {tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  );
}
