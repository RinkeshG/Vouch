import { Search } from "lucide-react";
import { PLAN_CONTEXTS } from "../../data/taste";
import type { Friend, Place, UserPlace } from "../../types";
import { EmptyState } from "../ui/EmptyState";
import { PlaceCard } from "../ui/PlaceCard";
import { SectionTitle } from "../ui/SectionTitle";

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
  onOpenAddSheet,
  onOpenPlace
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
  onOpenAddSheet: () => void;
  onOpenPlace: (placeId: string) => void;
}) {
  return (
    <div className="content-stack">
      <button type="button" className="search-pill" onClick={onOpenAddSheet}>
        <Search size={18} /> Search or add a place
      </button>
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
