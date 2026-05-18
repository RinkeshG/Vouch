import { useState } from "react";
import { Check, ChevronRight, Search, Sparkles, UserPlus } from "lucide-react";
import { PLACE_CATALOG } from "../../data/places";
import type { Friend, FriendVouchCard, UserPlace } from "../../types";
import { placesFromFriend } from "../../lib/selectors";

function previewImages(card: FriendVouchCard | undefined): string[] {
  if (!card) return [];
  const catalogById = Object.fromEntries(PLACE_CATALOG.map((p) => [p.id, p]));
  const vouched = card.userPlaces.filter((p) => p.state === "vouched");
  const top = vouched.filter((p) => p.top);
  const picks = (top.length ? top : vouched).slice(0, 4);
  return picks
    .map((up) => catalogById[up.placeId]?.image)
    .filter((img): img is string => Boolean(img));
}

function normalizeHandle(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return "";
  // Accept @friend, bare handle, or a profile URL (`…/their-handle`).
  const cleaned = trimmed
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/^\/?p\//, "")
    .replace(/^@/, "")
    .replace(/[^a-z0-9-_.]/g, "");
  return cleaned;
}

type LookupState =
  | { kind: "idle" }
  | { kind: "loading"; handle: string }
  | { kind: "found"; card: FriendVouchCard; alreadyAdded: boolean }
  | { kind: "not_found"; handle: string };

export function FriendsScreen({
  friends,
  userPlaces,
  friendVouchCards,
  cloudEnabled,
  onInvite,
  onOpenFriend,
  onLogRecommendation,
  onLookupHandle,
  onAddLinkedFriend
}: {
  friends: Friend[];
  userPlaces: UserPlace[];
  friendVouchCards: Record<string, FriendVouchCard>;
  cloudEnabled: boolean;
  onInvite: () => void;
  onOpenFriend: (friendId: string) => void;
  onLogRecommendation: () => void;
  onLookupHandle: (handle: string) => Promise<FriendVouchCard | null>;
  onAddLinkedFriend: (card: { handle: string; name: string; city: string; tasteTags: string[] }) => void;
}) {
  const [query, setQuery] = useState("");
  const [lookup, setLookup] = useState<LookupState>({ kind: "idle" });

  async function runSearch() {
    const clean = normalizeHandle(query);
    if (!clean) return;
    setLookup({ kind: "loading", handle: clean });
    const card = await onLookupHandle(clean);
    if (!card) {
      setLookup({ kind: "not_found", handle: clean });
      return;
    }
    const alreadyAdded = friends.some(
      (f) => f.profileHandle?.toLowerCase() === card.handle.toLowerCase()
    );
    setLookup({ kind: "found", card, alreadyAdded });
  }

  function clearLookup() {
    setLookup({ kind: "idle" });
    setQuery("");
  }

  return (
    <div className="friends2">
      {friends.length === 0 && (
        <section className="friends2-hub">
          <h1 className="friends2-hub-title">Invite someone you eat with</h1>
          <p className="friends2-hub-lede">
            Invite someone you swap recs with — you&apos;ll see their picks on Home and can save straight
            into yours.
            {cloudEnabled ? (
              <> Or find them by handle below.</>
            ) : null}
          </p>
          <button type="button" className="friends2-hub-cta-main" onClick={onInvite}>
            <Sparkles size={17} strokeWidth={1.85} />
            Send invite
          </button>
          <p className="friends2-hub-cap">
            They join from your link → their vouches show up here → tap to save anything you love.
          </p>
        </section>
      )}

      {/* ── Handle search ── */}
      {cloudEnabled && (
        <section className="friends2-search">
          <div className="friends2-search-row">
            <Search size={16} className="friends2-search-icon" />
            <input
              type="text"
              inputMode="text"
              autoCapitalize="none"
              autoCorrect="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a friend — aditi or vouch.app/aditi"
              onKeyDown={(e) => {
                if (e.key === "Enter") void runSearch();
              }}
            />
            {query.trim().length > 0 && (
              <button
                type="button"
                className="friends2-search-go"
                onClick={() => void runSearch()}
                disabled={lookup.kind === "loading"}
              >
                {lookup.kind === "loading" ? "…" : "Find"}
              </button>
            )}
          </div>

          {lookup.kind === "found" && (
            <article className="friends2-result">
              <div className="friends2-result-head">
                <div className="friend-avatar">{lookup.card.name.charAt(0).toUpperCase()}</div>
                <div>
                  <strong>{lookup.card.name}</strong>
                  <span>
                    {lookup.card.city}
                    {lookup.card.tasteTags.length > 0 ? ` · ${lookup.card.tasteTags.slice(0, 2).join(", ")}` : ""}
                  </span>
                </div>
              </div>
              {previewImages(lookup.card).length > 0 && (
                <div className="friends2-result-preview">
                  {previewImages(lookup.card).map((src) => (
                    <img src={src} alt="" key={src} loading="lazy" />
                  ))}
                </div>
              )}
              <div className="friends2-result-actions">
                <button type="button" className="friends2-cancel" onClick={clearLookup}>
                  Cancel
                </button>
                {lookup.alreadyAdded ? (
                  <button type="button" className="friends2-added" disabled>
                    <Check size={14} /> Already added
                  </button>
                ) : (
                  <button
                    type="button"
                    className="friends2-add"
                    onClick={() => {
                      onAddLinkedFriend({
                        handle: lookup.card.handle,
                        name: lookup.card.name,
                        city: lookup.card.city,
                        tasteTags: lookup.card.tasteTags
                      });
                      clearLookup();
                    }}
                  >
                    Add to my circle
                  </button>
                )}
              </div>
            </article>
          )}

          {lookup.kind === "not_found" && (
            <div className="friends2-not-found">
              <p>
                No one on Vouch with the handle <strong>{lookup.handle}</strong>.
              </p>
              <button type="button" className="text-button" onClick={onInvite}>
                Invite them instead
              </button>
            </div>
          )}
        </section>
      )}

      {/* ── Existing friends ── */}
      {friends.length > 0 ? (
        <section className="friends2-list-section">
          <div className="friends2-list-head">
            <h2>Your circle</h2>
            <button type="button" className="friends2-action" onClick={onInvite}>
              <UserPlus size={14} /> Invite
            </button>
          </div>
          <div className="friends2-list">
            {friends.map((friend) => {
              const recs = placesFromFriend(userPlaces, friend.id);
              const card = friend.profileHandle
                ? friendVouchCards[friend.profileHandle.toLowerCase()]
                : undefined;
              const previews = previewImages(card);
              const liveCount = card?.userPlaces.filter((p) => p.state === "vouched").length ?? 0;

              return (
                <button
                  type="button"
                  className="friend-card"
                  key={friend.id}
                  onClick={() => onOpenFriend(friend.id)}
                >
                  <div className="friend-avatar">{friend.name.charAt(0).toUpperCase()}</div>
                  <div className="friend-card-copy">
                    <strong>{friend.name}</strong>
                    <span>
                      {liveCount > 0
                        ? `${liveCount} live vouch${liveCount === 1 ? "" : "es"}`
                        : recs.length > 0
                          ? `${recs.length} logged rec${recs.length === 1 ? "" : "s"}`
                          : friend.profileHandle
                            ? "Waiting for their vouches"
                            : friend.trustedFor.slice(0, 2).join(", ") || friend.city}
                    </span>
                    {previews.length > 0 && (
                      <div className="friend-card-preview">
                        {previews.map((src) => (
                          <img src={src} alt="" key={src} />
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight size={16} />
                </button>
              );
            })}
          </div>
          <button type="button" className="friends2-log-rec" onClick={onLogRecommendation}>
            Log a recommendation
          </button>
        </section>
      ) : null}
    </div>
  );
}
