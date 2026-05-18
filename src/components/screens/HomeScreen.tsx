import { MapPin, Share2, UserPlus } from "lucide-react";
import { PLAN_CONTEXTS } from "../../data/taste";
import { friendById } from "../../lib/selectors";
import type { Collection, Friend, Place, UserPlace, UserProfile } from "../../types";
import { PlaceCard } from "../ui/PlaceCard";
import { SectionTitle } from "../ui/SectionTitle";

type Props = {
  profile: UserProfile;
  topPlaces: UserPlace[];
  vouched: UserPlace[];
  saved: UserPlace[];
  friends: Friend[];
  collections: Collection[];
  placeById: Record<string, Place>;
  onShare: () => void;
  onOpenTopFour: () => void;
  onOpenPlace: (id: string) => void;
  onOpenCollection: (id: string) => void;
  onAddFriend: () => void;
  onLogFriendRec: () => void;
  onCreateCollection: () => void;
  onQuickPlan: (contextId: string) => void;
};

const QUICK_PLANS = PLAN_CONTEXTS.slice(0, 6);

export function HomeScreen(props: Props) {
  const {
    profile,
    topPlaces,
    vouched,
    saved,
    friends,
    collections,
    placeById,
    onShare,
    onOpenTopFour,
    onOpenPlace,
    onOpenCollection,
    onAddFriend,
    onLogFriendRec,
    onCreateCollection,
    onQuickPlan
  } = props;

  const topPreview = topPlaces.slice(0, 4).map((item) => placeById[item.placeId]).filter(Boolean);
  const friendSaved = saved.filter((s) => s.addedFrom);
  const recentFromFriends = friendSaved.slice(0, 3);
  const hasMosaic = topPreview.length >= 2;

  return (
    <div className="content-stack home-stack">
      {/* ── Your Vouch card ── */}
      <section className="vouch-card-hero">
        <div className="vouch-card-header">
          <div>
            <p className="vouch-card-name">{profile.name}</p>
            <p className="vouch-card-city">{profile.city}</p>
          </div>
          <button type="button" className="vouch-edit-btn" onClick={onOpenTopFour}>
            Edit
          </button>
        </div>

        {hasMosaic ? (
          <div className="vouch-mosaic">
            {topPreview.map((place) => (
              <button
                type="button"
                className="vouch-mosaic-tile"
                key={place.id}
                onClick={() => onOpenPlace(place.id)}
              >
                <img src={place.image} alt="" />
                <div className="vouch-mosaic-label">
                  <span>{place.area}</span>
                  <strong>{place.name}</strong>
                </div>
              </button>
            ))}
          </div>
        ) : topPreview.length > 0 ? (
          <div className="vouch-list-fallback">
            {topPreview.map((place) => (
              <button
                type="button"
                className="vouch-list-item"
                key={place.id}
                onClick={() => onOpenPlace(place.id)}
              >
                <img src={place.image} alt="" />
                <div>
                  <strong>{place.name}</strong>
                  <span>{place.area}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="vouch-empty-state">
            <MapPin size={20} />
            <p>Vouch your first 4 places to build your card</p>
          </div>
        )}

        <button type="button" className="vouch-share-cta" onClick={onShare}>
          <Share2 size={18} />
          Send my Vouch
        </button>
      </section>

      {/* ── Need a spot? — the daily utility ── */}
      <section className="quick-plan-section">
        <SectionTitle title="Need a spot?" />
        <div className="quick-plan-grid">
          {QUICK_PLANS.map((ctx) => (
            <button
              type="button"
              key={ctx.id}
              className="quick-plan-btn"
              onClick={() => onQuickPlan(ctx.id)}
            >
              {ctx.label}
            </button>
          ))}
        </div>
        {vouched.length === 0 && (
          <p className="quick-plan-hint">
            Vouch places first — they'll show up here filtered by what you need.
          </p>
        )}
      </section>

      {/* ── From your circle ── */}
      {recentFromFriends.length > 0 && (
        <>
          <SectionTitle title="From your circle" action="Log a rec" onAction={onLogFriendRec} />
          <div className="stack-list">
            {recentFromFriends.map((item) => {
              const place = placeById[item.placeId];
              const friend = item.addedFrom ? friendById(friends, item.addedFrom) : undefined;
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
        </>
      )}

      {/* ── Friend nudge or circle stats ── */}
      {friends.length === 0 ? (
        <section className="friend-nudge-card">
          <div>
            <strong>Your circle is empty</strong>
            <span>Invite friends whose taste you trust. When they vouch their own places, you'll see them here.</span>
          </div>
          <button type="button" onClick={onAddFriend}>
            <UserPlus size={15} /> Invite a friend
          </button>
        </section>
      ) : recentFromFriends.length === 0 ? (
        <section className="friend-nudge-card">
          <div>
            <strong>No recs from friends yet</strong>
            <span>When a friend tells you about a great place, log it here so you don't forget.</span>
          </div>
          <button type="button" onClick={onLogFriendRec}>
            Log a recommendation
          </button>
        </section>
      ) : null}

      {/* ── Collections ── */}
      {collections.length > 0 && (
        <>
          <SectionTitle title="Your lists" action="New" onAction={onCreateCollection} />
          <div className="collection-strip">
            {collections.map((collection) => (
              <button
                type="button"
                className="collection-card"
                key={collection.id}
                style={{ "--accent": collection.accent } as React.CSSProperties}
                onClick={() => onOpenCollection(collection.id)}
              >
                <span>{collection.placeIds.length} places</span>
                <strong>{collection.title}</strong>
                <div>
                  {collection.placeIds.slice(0, 3).map((id) => (
                    <img src={placeById[id]?.image} alt="" key={id} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
