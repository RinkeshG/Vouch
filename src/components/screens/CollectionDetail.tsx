import { ArrowLeft, ChevronRight, Share2 } from "lucide-react";
import { priceShort } from "../../lib/format";
import type { Collection, Place, UserPlace } from "../../types";

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
  const accent = collection.accent || "#973a32";

  const entries = collection.placeIds
    .map((placeId) => {
      const place = placeById[placeId];
      if (!place) return null;
      const userPlace = userPlaces.find((item) => item.placeId === placeId);
      return { placeId, place, userPlace };
    })
    .filter(Boolean) as Array<{
    placeId: string;
    place: Place;
    userPlace?: UserPlace;
  }>;

  const mosaic = entries.slice(0, 3);

  if (entries.length === 0) {
    return (
      <div className="collection-detail collection-detail--fallback" style={{ "--collection-accent": accent } as React.CSSProperties}>
        <button type="button" className="collection-detail-back collection-detail-back--flat" onClick={onBack}>
          <ArrowLeft size={18} strokeWidth={2} aria-hidden />
          <span>Back</span>
        </button>
        <p className="collection-detail-empty-copy">Nothing in this list yet.</p>
      </div>
    );
  }

  return (
    <div className="collection-detail" style={{ "--collection-accent": accent } as React.CSSProperties}>
      <header className="collection-detail-hero">
        <div className="collection-detail-visual">
          <div className="collection-detail-mosaic" aria-hidden>
            {mosaic.length <= 2 ? (
              <div className="collection-detail-mosaic-row collection-detail-mosaic-row--solo">
                {mosaic.slice(0, 2).map(({ place }) => (
                  <figure key={place.id} className="collection-detail-mosaic-card">
                    <img src={place.image} alt="" loading="lazy" />
                  </figure>
                ))}
              </div>
            ) : (
              <div className="collection-detail-mosaic-row collection-detail-mosaic-row--fan">
                {mosaic.slice(0, 3).map(({ place }) => (
                  <figure key={place.id} className="collection-detail-mosaic-card">
                    <img src={place.image} alt="" loading="lazy" />
                  </figure>
                ))}
              </div>
            )}
          </div>

          <div className="collection-detail-visual-gradient" aria-hidden />

          <button type="button" className="collection-detail-back" onClick={onBack}>
            <ArrowLeft size={18} strokeWidth={2} aria-hidden />
            <span>Back</span>
          </button>
        </div>

        <div className="collection-detail-sheet">
          <div className="collection-detail-sheet-inner">
            <p className="collection-detail-kicker">
              List · {entries.length} {entries.length === 1 ? "spot" : "spots"}
            </p>
            <h1 className="collection-detail-title">{collection.title}</h1>
            {collection.note?.trim() ? (
              <p className="collection-detail-lede">{collection.note.trim()}</p>
            ) : null}
            <button type="button" className="collection-detail-share-main" onClick={onShare}>
              <Share2 size={17} strokeWidth={2} />
              Share this list
            </button>
          </div>
        </div>
      </header>

      <div className="collection-detail-divider-head">
        <span className="collection-detail-divider-rule" aria-hidden />
        <span className="collection-detail-divider-label">In this list</span>
        <span className="collection-detail-divider-rule" aria-hidden />
      </div>

      <ol className="collection-detail-list">
        {entries.map(({ placeId, place, userPlace }, idx) => {
          const num = idx + 1;
          const why = userPlace?.why?.trim() || place.tip;
          const tags = (userPlace?.tags?.length ? userPlace.tags : place.tags).slice(0, 3);

          return (
            <li key={placeId}>
              <button type="button" className="collection-detail-slot" onClick={() => onOpenPlace(placeId)}>
                <span className="collection-detail-slot-num" aria-hidden>
                  {String(num).padStart(2, "0")}
                </span>
                <span className="collection-detail-slot-photo">
                  <img src={place.image} alt="" loading="lazy" />
                </span>
                <span className="collection-detail-slot-body">
                  <span className="collection-detail-slot-title">{place.name}</span>
                  <span className="collection-detail-slot-meta">
                    {place.area}
                    {" · "}
                    {priceShort(place.price)}
                  </span>
                  {why ? <span className="collection-detail-slot-why">{why}</span> : null}
                  {tags.length > 0 ? (
                    <span className="collection-detail-slot-tags">
                      {tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </span>
                  ) : null}
                </span>
                <ChevronRight className="collection-detail-slot-chevron" size={18} strokeWidth={2} aria-hidden />
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
