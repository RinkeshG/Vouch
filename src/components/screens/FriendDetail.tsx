import { ArrowLeft, Plus } from "lucide-react";
import { relativeTime } from "../../lib/format";
import type { Friend, Place, UserPlace } from "../../types";
import { PlaceCard } from "../ui/PlaceCard";

export function FriendDetail({
  friend,
  recsFromFriend,
  placeById,
  onBack,
  onLogRec,
  onOpenPlace
}: {
  friend: Friend;
  recsFromFriend: UserPlace[];
  placeById: Record<string, Place>;
  onBack: () => void;
  onLogRec: () => void;
  onOpenPlace: (placeId: string) => void;
}) {
  return (
    <div className="detail-page friend-detail-page">
      <button type="button" className="quiet-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back
      </button>

      <section className="friend-profile-hero">
        <div className="friend-big-avatar">
          {friend.name.charAt(0).toUpperCase()}
        </div>
        <h2>{friend.name}</h2>
        <p className="friend-meta">{friend.city} · Added {relativeTime(friend.createdAt)}</p>
        {friend.trustedFor.length > 0 && (
          <div className="friend-trust-tags">
            {friend.trustedFor.map((tag) => (
              <span className="taste-tag static" key={tag}>{tag}</span>
            ))}
          </div>
        )}
      </section>

      <section className="friend-recs-section">
        <div className="friend-recs-header">
          <strong>
            {recsFromFriend.length === 0
              ? "No recommendations yet"
              : `${recsFromFriend.length} place${recsFromFriend.length === 1 ? "" : "s"} recommended`}
          </strong>
          <button type="button" className="small-button" onClick={onLogRec}>
            <Plus size={14} /> Log rec
          </button>
        </div>

        {recsFromFriend.length === 0 ? (
          <div className="friend-empty-recs">
            <p>
              Next time {friend.name} tells you about a great place, log it here. You'll build a trusted rec history together.
            </p>
          </div>
        ) : (
          <div className="stack-list">
            {recsFromFriend.map((item) => {
              const place = placeById[item.placeId];
              if (!place) return null;
              return (
                <PlaceCard
                  key={item.placeId}
                  place={place}
                  userPlace={item}
                  friend={friend}
                  onClick={() => onOpenPlace(item.placeId)}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
