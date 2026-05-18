import { ArrowLeft, Bookmark, Plus } from "lucide-react";
import { PLACE_CATALOG } from "../../data/places";
import { relativeTime } from "../../lib/format";
import type { Friend, FriendVouchCard, Place, UserPlace } from "../../types";
import { PlaceCard } from "../ui/PlaceCard";

function liveTopPlaces(card: FriendVouchCard, placeById: Record<string, Place>) {
  const catalogById = Object.fromEntries(PLACE_CATALOG.map((p) => [p.id, p]));
  const vouched = card.userPlaces.filter((p) => p.state === "vouched");
  const top = vouched.filter((p) => p.top);
  const picks = (top.length ? top : vouched).slice(0, 4);
  return picks
    .map((up) => {
      const place = placeById[up.placeId] ?? catalogById[up.placeId];
      if (!place) return null;
      return { up, place };
    })
    .filter(Boolean) as { up: UserPlace; place: Place }[];
}

export function FriendDetail({
  friend,
  recsFromFriend,
  placeById,
  liveCard,
  liveCardLoading,
  savedPlaceIds,
  onBack,
  onLogRec,
  onOpenPlace,
  onSaveFromLive
}: {
  friend: Friend;
  recsFromFriend: UserPlace[];
  placeById: Record<string, Place>;
  liveCard: FriendVouchCard | null;
  liveCardLoading: boolean;
  savedPlaceIds: Set<string>;
  onBack: () => void;
  onLogRec: () => void;
  onOpenPlace: (placeId: string) => void;
  onSaveFromLive: (placeId: string, why: string) => void;
}) {
  const livePlaces = liveCard ? liveTopPlaces(liveCard, placeById) : [];

  return (
    <div className="detail-page friend-detail-page">
      <button type="button" className="quiet-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back
      </button>

      <section className="friend-profile-hero">
        <div className="friend-big-avatar">{friend.name.charAt(0).toUpperCase()}</div>
        <h2>{friend.name}</h2>
        <p className="friend-meta">
          {friend.city}
          {friend.profileHandle ? " · On Vouch" : ""} · Added {relativeTime(friend.createdAt)}
        </p>
        {friend.trustedFor.length > 0 && (
          <div className="friend-trust-tags">
            {friend.trustedFor.map((tag) => (
              <span className="taste-tag static" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {friend.profileHandle && (
        <section className="friend-live-vouch">
          <strong>{friend.name}&apos;s Vouch</strong>
          {liveCardLoading ? (
            <div className="friend-live-mosaic skeleton" aria-hidden>
              <div />
              <div />
              <div />
              <div />
            </div>
          ) : livePlaces.length > 0 ? (
            <div className="friend-live-mosaic">
              {livePlaces.map(({ up, place }) => (
                <article className="friend-live-tile" key={place.id}>
                  <button type="button" onClick={() => onOpenPlace(place.id)}>
                    <img src={place.image} alt="" />
                    <div>
                      <span>{place.area}</span>
                      <strong>{place.name}</strong>
                    </div>
                  </button>
                  {up.why ? <p className="friend-live-why">&ldquo;{up.why}&rdquo;</p> : null}
                  <button
                    type="button"
                    className={savedPlaceIds.has(place.id) ? "circle-feed-save saved" : "circle-feed-save"}
                    disabled={savedPlaceIds.has(place.id)}
                    onClick={() => onSaveFromLive(place.id, up.why || place.tip)}
                  >
                    <Bookmark size={14} />
                    {savedPlaceIds.has(place.id) ? "Saved" : "Save"}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="friend-live-empty">
              {friend.name} hasn&apos;t vouched their Top 4 yet. When they do, it shows up here live.
            </p>
          )}
        </section>
      )}

      <section className="friend-recs-section">
        <div className="friend-recs-header">
          <strong>
            {recsFromFriend.length === 0
              ? "Places you logged from them"
              : `${recsFromFriend.length} logged rec${recsFromFriend.length === 1 ? "" : "s"}`}
          </strong>
          <button type="button" className="small-button" onClick={onLogRec}>
            <Plus size={14} /> Log rec
          </button>
        </div>

        {recsFromFriend.length === 0 ? (
          <div className="friend-empty-recs">
            <p>
              When {friend.name} tells you about a spot in person, log it here. Their live vouches from their card appear above.
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
