import { ArrowLeft, Share2 } from "lucide-react";
import type { Collection, Place, UserPlace } from "../../types";
import { PlaceCard } from "../ui/PlaceCard";

export function CollectionDetail({
  collection,
  placeById,
  userPlaces,
  onBack,
  onShare,
  onOpenPlace
}: {
  collection: Collection;
  placeById: Record<string, Place>;
  userPlaces: UserPlace[];
  onBack: () => void;
  onShare: () => void;
  onOpenPlace: (placeId: string) => void;
}) {
  return (
    <div className="detail-page">
      <button type="button" className="quiet-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back
      </button>
      <section className="collection-hero" style={{ "--accent": collection.accent } as React.CSSProperties}>
        <p className="eyebrow">Collection</p>
        <h2>{collection.title}</h2>
        <p>{collection.note}</p>
        <button type="button" className="small-button inverted" onClick={onShare}>
          <Share2 size={14} /> Share list
        </button>
      </section>
      <div className="content-stack tight">
        {collection.placeIds.map((placeId, index) => {
          const place = placeById[placeId];
          if (!place) return null;
          const userPlace = userPlaces.find((item) => item.placeId === placeId);
          return (
            <PlaceCard
              key={placeId}
              place={place}
              userPlace={userPlace}
              onClick={() => onOpenPlace(placeId)}
              index={index + 1}
              stamped={userPlace?.state === "vouched"}
            />
          );
        })}
      </div>
    </div>
  );
}
