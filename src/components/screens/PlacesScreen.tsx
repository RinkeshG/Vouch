import { useMemo } from "react";
import { Bookmark, Search } from "lucide-react";
import { PLAN_CONTEXTS } from "../../data/taste";
import type { CircleFeedItem, Friend, Place, UserPlace } from "../../types";
import { EmptyState } from "../ui/EmptyState";
import { PlaceCard } from "../ui/PlaceCard";
import { SectionTitle } from "../ui/SectionTitle";

type DiscoveryItem = {
  placeId: string;
  place: Place;
  voucherCount: number;
  primaryFriendName: string;
  why: string;
  feedItem: CircleFeedItem;
};

function buildDiscovery(
  circleFeed: CircleFeedItem[],
  knownPlaceIds: Set<string>,
  placeById: Record<string, Place>
): DiscoveryItem[] {
  const grouped = new Map<string, { items: CircleFeedItem[]; place: Place }>();
  for (const item of circleFeed) {
    if (knownPlaceIds.has(item.placeId)) continue;
    const place = placeById[item.placeId];
    if (!place) continue;
    const entry = grouped.get(item.placeId);
    if (entry) {
      entry.items.push(item);
    } else {
      grouped.set(item.placeId, { items: [item], place });
    }
  }
  const out: DiscoveryItem[] = [];
  for (const { items, place } of grouped.values()) {
    const primary = items[0];
    out.push({
      placeId: place.id,
      place,
      voucherCount: items.length,
      primaryFriendName: primary.friendName,
      why: primary.why,
      feedItem: primary
    });
  }
  return out.sort((a, b) => b.voucherCount - a.voucherCount);
}

function LibrarySection({
  title,
  items,
  placeById,
  friends,
  empty,
  onOpenPlace
}: {
  title: string;
  items: UserPlace[];
  placeById: Record<string, Place>;
  friends: Friend[];
  empty: string;
  onOpenPlace: (placeId: string) => void;
}) {
  return (
    <section className="library-section">
      <SectionTitle title={title} />
      {items.length === 0 ? (
        <EmptyState icon={<Search size={18} />}>
          <p>{empty}</p>
        </EmptyState>
      ) : (
        <div className="stack-list">
          {items.map((item) => {
            const place = placeById[item.placeId];
            if (!place) return null;
            const friend = item.addedFrom ? friends.find((f) => f.id === item.addedFrom) : undefined;
            return (
              <PlaceCard
                key={item.placeId}
                place={place}
                userPlace={item}
                friend={friend}
                onClick={() => onOpenPlace(item.placeId)}
                stamped={item.state === "vouched"}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

export function PlacesScreen({
  query,
  onQueryChange,
  planContext,
  onPlanContext,
  vouched,
  want,
  saved,
  placeById,
  friends,
  circleFeed,
  onOpenAddSheet,
  onOpenPlace,
  onSaveFromCircle
}: {
  query: string;
  onQueryChange: (query: string) => void;
  planContext: string | null;
  onPlanContext: (id: string | null) => void;
  vouched: UserPlace[];
  want: UserPlace[];
  saved: UserPlace[];
  placeById: Record<string, Place>;
  friends: Friend[];
  circleFeed: CircleFeedItem[];
  onOpenAddSheet: () => void;
  onOpenPlace: (placeId: string) => void;
  onSaveFromCircle: (item: CircleFeedItem) => void;
}) {
  const knownPlaceIds = useMemo(() => {
    const set = new Set<string>();
    for (const p of vouched) set.add(p.placeId);
    for (const p of want) set.add(p.placeId);
    for (const p of saved) set.add(p.placeId);
    return set;
  }, [vouched, want, saved]);

  const discovery = useMemo(
    () => buildDiscovery(circleFeed, knownPlaceIds, placeById),
    [circleFeed, knownPlaceIds, placeById]
  );

  return (
    <div className="content-stack">
      <button type="button" className="search-pill" onClick={onOpenAddSheet}>
        <Search size={18} /> Search or add a place
      </button>

      {discovery.length > 0 && (
        <section className="circle-discovery">
          <div className="circle-discovery-head">
            <span className="circle-discovery-eyebrow">From your circle</span>
            <h2>Places friends vouch for</h2>
          </div>
          <div className="circle-discovery-rail">
            {discovery.slice(0, 10).map((item) => (
              <article key={item.placeId} className="discovery-card">
                <button
                  type="button"
                  className="discovery-card-photo"
                  onClick={() => onOpenPlace(item.placeId)}
                  aria-label={item.place.name}
                >
                  <img src={item.place.image} alt="" loading="lazy" />
                </button>
                <div className="discovery-card-body">
                  <strong>{item.place.name}</strong>
                  <span>{item.place.area}</span>
                  <p className="discovery-attribution">
                    {item.voucherCount > 1
                      ? `Vouched by ${item.primaryFriendName} and ${item.voucherCount - 1} other${item.voucherCount - 1 === 1 ? "" : "s"}`
                      : `Vouched by ${item.primaryFriendName}`}
                  </p>
                  <button
                    type="button"
                    className="discovery-save"
                    onClick={() => onSaveFromCircle(item.feedItem)}
                  >
                    <Bookmark size={13} /> Save
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="plan-rail">
        <button
          type="button"
          className={planContext === null ? "active" : ""}
          onClick={() => onPlanContext(null)}
        >
          All
        </button>
        {PLAN_CONTEXTS.map((ctx) => (
          <button
            type="button"
            key={ctx.id}
            className={planContext === ctx.id ? "active" : ""}
            onClick={() => onPlanContext(ctx.id)}
          >
            {ctx.label}
          </button>
        ))}
      </div>

      <input
        className="inline-query"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Filter your places by name, area, tag"
      />

      <LibrarySection
        title="Vouched"
        items={vouched}
        placeById={placeById}
        friends={friends}
        empty="Add places you would put your name behind."
        onOpenPlace={onOpenPlace}
      />
      <LibrarySection
        title="Want to try"
        items={want}
        placeById={placeById}
        friends={friends}
        empty="Save places you plan to try soon."
        onOpenPlace={onOpenPlace}
      />
      <LibrarySection
        title="Saved from friends"
        items={saved}
        placeById={placeById}
        friends={friends}
        empty="When friends recommend places, they land here."
        onOpenPlace={onOpenPlace}
      />
    </div>
  );
}
