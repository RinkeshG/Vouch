import { Bookmark } from "lucide-react";
import type { CircleFeedItem } from "../../types";

type Props = {
  item: CircleFeedItem;
  saved: boolean;
  onOpenPlace: (placeId: string) => void;
  onSave: (item: CircleFeedItem) => void;
};

export function CircleFeedCard({ item, saved, onOpenPlace, onSave }: Props) {
  return (
    <article className="circle-feed-card">
      <button
        type="button"
        className="circle-feed-media"
        onClick={() => onOpenPlace(item.placeId)}
        aria-label={`${item.placeName}, ${item.area}`}
      >
        <img src={item.image} alt="" />
        <div className="circle-feed-media-label">
          <span>{item.area}</span>
          <strong>{item.placeName}</strong>
        </div>
      </button>
      <div className="circle-feed-body">
        <p className="circle-feed-by">
          <span className="circle-feed-avatar">{item.friendName.charAt(0).toUpperCase()}</span>
          <span>
            <strong>{item.friendName}</strong> vouched this
          </span>
        </p>
        {item.why ? <p className="circle-feed-why">&ldquo;{item.why}&rdquo;</p> : null}
        <button
          type="button"
          className={saved ? "circle-feed-save saved" : "circle-feed-save"}
          disabled={saved}
          onClick={() => onSave(item)}
        >
          <Bookmark size={15} />
          {saved ? "On your list" : "Save to my list"}
        </button>
      </div>
    </article>
  );
}
