import {
  ArrowUpRight,
  Bookmark,
  ListPlus,
  Plus,
  Share2,
  UsersRound
} from "lucide-react";
import { MIN_VOUCHED_PLACES_PER_LIST } from "../../lib/collectionRules";
import type {
  CircleFeedItem,
  Collection,
  Friend,
  Place,
  PlaceSaveEvent,
  UserPlace,
  UserProfile
} from "../../types";

type Props = {
  profile: UserProfile;
  topPlaces: UserPlace[];
  vouched: UserPlace[];
  want: UserPlace[];
  saved: UserPlace[];
  friends: Friend[];
  collections: Collection[];
  placeById: Record<string, Place>;
  circleFeed: CircleFeedItem[];
  circleLoading: boolean;
  influenceEvents: PlaceSaveEvent[];
  cloudEnabled: boolean;
  onShare: () => void;
  onOpenTopFour: () => void;
  onOpenPlace: (id: string) => void;
  onOpenCollection: (id: string) => void;
  onOpenAddPlace: () => void;
  onAddFriend: () => void;
  onLogFriendRec: () => void;
  onCreateCollection: () => void;
  onQuickPlan: (contextId: string) => void;
  onRefreshCircle: () => void;
  onSaveFromCircle: (item: CircleFeedItem) => void;
};

export function HomeScreen(props: Props) {
  const {
    profile,
    topPlaces,
    vouched,
    placeById,
    circleFeed,
    circleLoading,
    influenceEvents,
    onShare,
    onOpenPlace,
    onAddFriend,
    onRefreshCircle,
    onSaveFromCircle,
    saved,
    want,
    collections,
    onOpenAddPlace,
    onCreateCollection,
    onOpenCollection
  } = props;

  const savedIds = new Set(saved.map((s) => s.placeId));
  const hasFeed = circleFeed.length > 0;
  const hasInfluence = influenceEvents.length > 0;

  return (
    <div className="home2">
      {hasInfluence && (
        <InfluenceStrip events={influenceEvents} onOpenPlace={onOpenPlace} />
      )}

      {hasFeed ? (
        <FeedView
          items={circleFeed}
          want={want}
          linkedFriendCount={props.friends.filter((f) => f.profileHandle).length}
          loading={circleLoading}
          savedIds={savedIds}
          placeById={placeById}
          onOpenPlace={onOpenPlace}
          onRefresh={onRefreshCircle}
          onSave={onSaveFromCircle}
        />
      ) : (
        <NoCircleFeedHome
          profile={profile}
          vouched={vouched}
          want={want}
          placeById={placeById}
          collections={collections}
          friends={props.friends}
          topPreview={topPlaces.slice(0, 4).map((i) => placeById[i.placeId]).filter(Boolean)}
          onShare={onShare}
          onOpenPlace={onOpenPlace}
          onOpenAddPlace={onOpenAddPlace}
          onCreateCollection={onCreateCollection}
          onOpenCollection={onOpenCollection}
          onAddFriend={onAddFriend}
        />
      )}
    </div>
  );
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return `${Math.floor(d / 7)}w`;
}

function InfluenceStrip({
  events,
  onOpenPlace
}: {
  events: PlaceSaveEvent[];
  onOpenPlace: (id: string) => void;
}) {
  const recent = events.slice(0, 3);
  const overflow = events.length - recent.length;
  return (
    <section className="home2-influence">
      <header className="home2-influence-head">
        <span className="home2-eyebrow">From your Vouch</span>
        <h2 className="home2-influence-title">
          {events.length === 1 ? `1 save this week` : `${events.length} saves from your list`}
        </h2>
      </header>
      <ul className="home2-influence-list">
        {recent.map((event) => {
          const first = event.actorName.trim().split(/\s+/)[0] || event.actorHandle;
          return (
            <li key={event.id}>
              <button
                type="button"
                className="home2-influence-row"
                onClick={() => onOpenPlace(event.placeId)}
              >
                {event.placeImage ? (
                  <img src={event.placeImage} alt="" loading="lazy" />
                ) : (
                  <div className="home2-influence-thumb-fallback" aria-hidden />
                )}
                <div className="home2-influence-copy">
                  <strong>{first}</strong>
                  <span>saved {event.placeName || "a place"}</span>
                </div>
                <span className="home2-influence-time">{relativeTime(event.savedAt)}</span>
              </button>
            </li>
          );
        })}
        {overflow > 0 && (
          <li className="home2-influence-overflow">
            <span>+{overflow} more</span>
          </li>
        )}
      </ul>
    </section>
  );
}

function recentWantSorted(
  want: UserPlace[],
  placeById: Record<string, Place>,
  limit: number
): Array<{ up: UserPlace; place: Place }> {
  return [...want]
    .filter((up) => placeById[up.placeId])
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
    .slice(0, limit)
    .map((up) => ({ up, place: placeById[up.placeId]! }));
}

/**
 * Backlog uses the exact same chrome as Recent vouches — no extra card surface.
 */
function WantTryRail({
  wantPlaces,
  placeById,
  onOpenPlace,
  appendix = false
}: {
  wantPlaces: UserPlace[];
  placeById: Record<string, Place>;
  onOpenPlace: (id: string) => void;
  appendix?: boolean;
}) {
  const rows = recentWantSorted(wantPlaces, placeById, 24);
  if (rows.length === 0) return null;

  const n = rows.length;

  return (
    <section
      className={
        appendix
          ? "home2-your-strip home2-want-queue home2-want-queue--appendix"
          : "home2-your-strip home2-want-queue"
      }
      aria-label="Want to try"
    >
      <div className="home2-strip-head">
        <h2>Want to try</h2>
        <span className="home2-want-queue-meta">
          {n} queued · not stamped yet
        </span>
      </div>
      <div className="home2-your-cards">
        {rows.map(({ place }) => (
          <button
            type="button"
            key={place.id}
            className="home2-your-thumb"
            onClick={() => onOpenPlace(place.id)}
            aria-label={`${place.name}, want to try`}
          >
            <img src={place.image} alt="" loading="lazy" />
            <span className="home2-your-thumb-name">{place.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function recentVouchesOrdered(
  vouched: UserPlace[],
  placeById: Record<string, Place>,
  limit: number
): Array<{ up: UserPlace; place: Place }> {
  return [...vouched]
    .filter((up) => placeById[up.placeId])
    .sort(
      (a, b) =>
        (b.vouchedAt ?? b.updatedAt ?? 0) - (a.vouchedAt ?? a.updatedAt ?? 0)
    )
    .slice(0, limit)
    .map((up) => ({ up, place: placeById[up.placeId]! }));
}

/** When the circle feed is quiet: Home stays useful — library first, friends second */
function NoCircleFeedHome({
  profile,
  vouched,
  want,
  placeById,
  collections,
  friends,
  topPreview,
  onShare,
  onOpenPlace,
  onOpenAddPlace,
  onCreateCollection,
  onOpenCollection,
  onAddFriend
}: {
  profile: UserProfile;
  vouched: UserPlace[];
  want: UserPlace[];
  placeById: Record<string, Place>;
  collections: Collection[];
  friends: Friend[];
  topPreview: Place[];
  onShare: () => void;
  onOpenPlace: (id: string) => void;
  onOpenAddPlace: () => void;
  onCreateCollection: () => void;
  onOpenCollection: (id: string) => void;
  onAddFriend: () => void;
}) {
  const first = profile.name.trim().split(/\s+/)[0] || "You";
  const hasVouches = vouched.length > 0;
  const recent = recentVouchesOrdered(vouched, placeById, 8);
  const linkedCount = friends.filter((f) => f.profileHandle).length;

  if (!hasVouches) {
    return (
      <div className="home2-library-root">
        <section className="home2-library-hero">
          <div className="home2-library-visual" aria-hidden>
            {[0, 1, 2].map((i) => (
              <div key={i} className="home2-library-slot" />
            ))}
          </div>

          <div className="home2-library-copy">
            <span className="home2-eyebrow light">Home</span>
            <h1 className="home2-library-title">
              Start a library worth sharing.
            </h1>
            <p className="home2-library-lede">
              Add a few places you&apos;d honestly send someone to — then bundle any three stamps into a
              list (&ldquo;visitors,&rdquo; &ldquo;date nights,&rdquo; whatever reads true). Saves and wanna-go picks
              never count toward lists.
            </p>
          </div>

          <div className="home2-library-actions">
            <button type="button" className="home2-btn-solid" onClick={onOpenAddPlace}>
              <Plus size={18} strokeWidth={2.25} />
              Add places
            </button>
          </div>

          <p className="home2-library-hint">
            Tip: Tap the stamp anytime to search. Queued &ldquo;want to try&rdquo; spots show here once you add them.
          </p>
        </section>

        <WantTryRail wantPlaces={want} placeById={placeById} onOpenPlace={onOpenPlace} />

        <aside className="home2-social-aside">
          <div className="home2-social-aside-inner">
            <UsersRound size={18} className="home2-social-icon" aria-hidden />
            <div className="home2-social-body">
              <strong>Friends&apos; picks</strong>
              <span>
                When someone you invite joins Vouch, their vouches can land here —
                yours always comes first.
              </span>
              <button type="button" className="home2-social-aside-link" onClick={onAddFriend}>
                Invite someone
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="home2-library-root">
      <header className="home2-hub-mast">
        <span className="home2-eyebrow">Home</span>
        <h1 className="home2-hub-title">
          You&apos;ve vouched {vouched.length}&nbsp;
          place{vouched.length === 1 ? "" : "s"}
          {collections.length > 0
            ? ` · ${collections.length} list${collections.length === 1 ? "" : "s"}`
            : ""}
        </h1>
        <p className="home2-hub-lede">
          Friend picks sit below yours once they sync — this screen stays anchored to what you stamped.
        </p>
      </header>

      {recent.length > 0 && (
        <section className="home2-your-strip">
          <div className="home2-strip-head">
            <h2>Recent vouches</h2>
            <button type="button" className="home2-strip-link" onClick={onOpenAddPlace}>
              <Plus size={14} /> Add
            </button>
          </div>
          <div className="home2-your-cards">
            {recent.map(({ place }) => (
              <button
                type="button"
                key={place.id}
                className="home2-your-thumb"
                onClick={() => onOpenPlace(place.id)}
                aria-label={place.name}
              >
                <img src={place.image} alt="" loading="lazy" />
                <span className="home2-your-thumb-name">{place.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <WantTryRail wantPlaces={want} placeById={placeById} onOpenPlace={onOpenPlace} />

      <article className="home2-share-card home2-share-card--hub" onClick={onShare}>
        <div className="home2-share-thumbs">
          {topPreview.slice(0, 4).map((p, i) => (
            <img key={p.id} src={p.image} alt="" loading="lazy" style={{ zIndex: 4 - i }} />
          ))}
        </div>
        <div className="home2-share-copy">
          <strong>Share {first}&apos;s Vouch</strong>
          <span>
            Send your shortlist — {vouched.length} place{vouched.length === 1 ? "" : "s"} you stand
            behind
          </span>
        </div>
        <span className="home2-share-arrow" aria-hidden>
          <Share2 size={16} />
        </span>
      </article>

      {(collections.length > 0 || vouched.length >= MIN_VOUCHED_PLACES_PER_LIST) && (
        <section className="home2-lists-mini">
          <div className="home2-strip-head">
            <h2>Lists</h2>
            <button type="button" className="home2-strip-link" onClick={onCreateCollection}>
              New
            </button>
          </div>
          {collections.length === 0 ? (
            <button type="button" className="home2-list-prompt" onClick={onCreateCollection}>
              <ListPlus size={18} />
              <div>
                <strong>Group these into a list</strong>
                <span>Pick any {MIN_VOUCHED_PLACES_PER_LIST}+ stamped spots — neighbourhoods, moods, whoever you&apos;re planning for.</span>
              </div>
            </button>
          ) : (
            <div className="home2-lists-mini-row">
              {collections.slice(0, 4).map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className="home2-list-mini-card"
                  onClick={() => onOpenCollection(c.id)}
                >
                  <div className="home2-list-mini-thumbs">
                    {c.placeIds.slice(0, 3).map((id) => (
                      <img key={id} src={placeById[id]?.image} alt="" loading="lazy" />
                    ))}
                  </div>
                  <strong>{c.title}</strong>
                  <span>
                    {c.placeIds.length} place{c.placeIds.length === 1 ? "" : "s"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <aside className="home2-social-aside muted">
        <div className="home2-social-aside-inner">
          <UsersRound size={18} className="home2-social-icon" aria-hidden />
          <div className="home2-social-body">
            <strong>Friends&apos; picks</strong>
            <span>
              {linkedCount > 0
                ? `${linkedCount} in your circle — when they publish vouches, you&apos;ll see them here. `
                : "Invite people you swap recs with. Their vouches sync here automatically. "}
            </span>
            <button type="button" className="home2-social-aside-link" onClick={onAddFriend}>
              {linkedCount > 0 ? "Manage invites" : "Invite"}
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function FeedView({
  items,
  want,
  linkedFriendCount,
  loading,
  savedIds,
  placeById,
  onOpenPlace,
  onRefresh,
  onSave
}: {
  items: CircleFeedItem[];
  want: UserPlace[];
  linkedFriendCount: number;
  loading: boolean;
  savedIds: Set<string>;
  placeById: Record<string, Place>;
  onOpenPlace: (id: string) => void;
  onRefresh: () => void;
  onSave: (item: CircleFeedItem) => void;
}) {
  return (
    <div className="home2-feed">
      <header className="home2-feed-mast">
        <span className="home2-eyebrow">
          Your circle · {linkedFriendCount} friend{linkedFriendCount === 1 ? "" : "s"}
        </span>
        <button type="button" className="home2-refresh" onClick={onRefresh} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      <div className="home2-feed-list">
        {items.slice(0, 12).map((item) => {
          const place = placeById[item.placeId];
          const isSaved = savedIds.has(item.placeId);
          return (
            <article key={item.id} className="home2-card">
              <button
                type="button"
                className="home2-card-photo"
                onClick={() => onOpenPlace(item.placeId)}
                aria-label={`${item.placeName}, ${item.area}`}
              >
                <img src={place?.image ?? item.image} alt="" loading="lazy" />
              </button>
              <div className="home2-card-body">
                <p className="home2-card-by">
                  <span className="home2-card-avatar">
                    {item.friendName.charAt(0).toUpperCase()}
                  </span>
                  <strong>{item.friendName}</strong> vouches for
                </p>
                <h3 className="home2-card-place">{item.placeName}</h3>
                <p className="home2-card-area">{item.area}</p>
                {item.why && <p className="home2-card-why">&ldquo;{item.why}&rdquo;</p>}
                <button
                  type="button"
                  className={isSaved ? "home2-card-save saved" : "home2-card-save"}
                  disabled={isSaved}
                  onClick={() => onSave(item)}
                >
                  <Bookmark size={14} />
                  {isSaved ? "Saved" : "Save to my list"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <WantTryRail wantPlaces={want} placeById={placeById} onOpenPlace={onOpenPlace} appendix />
    </div>
  );
}
