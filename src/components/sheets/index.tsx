import { Check, Copy, Loader2, MapPin, MessageCircle, Search, Share2, UserPlus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { tasteBio } from "../../lib/format";
import { useGooglePlacesSearch } from "../../hooks/useGooglePlacesSearch";
import { googleSuggestionToPlace, type GooglePlaceSuggestion } from "../../lib/googlePlaces";
import {
  buildInviteShareMessage,
  buildShareMessage,
  copyToClipboard,
  nativeShare,
  openWhatsApp
} from "../../lib/share";
import { MIN_VOUCHED_PLACES_PER_LIST } from "../../lib/collectionRules";
import type { Collection, Friend, Place, UserPlace, UserProfile } from "../../types";
import { EmptyState } from "../ui/EmptyState";
import { Sheet } from "../ui/Sheet";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function shareLinkSummary(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname === "/" || u.pathname === "" ? "" : u.pathname;
    return `${u.host}${path}`;
  } catch {
    return "Ready to send";
  }
}

export function AddPlaceSheet({
  query,
  onQuery,
  searchedPlaces,
  userPlaces,
  profile,
  onClose,
  onOpenPlace,
  onAddCustomPlace,
  onAddGooglePlace
}: {
  query: string;
  onQuery: (query: string) => void;
  searchedPlaces: Place[];
  userPlaces: UserPlace[];
  profile: UserProfile;
  onClose: () => void;
  onOpenPlace: (placeId: string) => void;
  onAddCustomPlace: (name: string, area: string) => string;
  onAddGooglePlace: (place: Place) => string;
}) {
  const catalogMatches = useMemo(() => {
    if (!query.trim()) return searchedPlaces.slice(0, 6);
    return searchedPlaces.filter((p) => !p.googlePlaceId).slice(0, 6);
  }, [searchedPlaces, query]);

  const [customName, setCustomName] = useState("");
  const [customArea, setCustomArea] = useState(profile.city);
  const [googleAdding, setGoogleAdding] = useState<string | null>(null);

  const {
    results: googleResults,
    loading: googleLoading,
    status: googleStatus,
    message: googleMessage
  } = useGooglePlacesSearch(query, profile.city, true);

  async function pickGoogle(suggestion: GooglePlaceSuggestion) {
    setGoogleAdding(suggestion.placeId);
    try {
      const place = await googleSuggestionToPlace(suggestion, profile.city);
      const id = onAddGooglePlace(place);
      onOpenPlace(id);
    } finally {
      setGoogleAdding(null);
    }
  }

  return (
    <Sheet title="Add a place" onClose={onClose}>
      <div className="search-box">
        <Search size={16} />
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search restaurants, cafes, bars…"
        />
        {googleLoading && <Loader2 size={16} className="search-spinner" />}
      </div>

      {query.trim().length >= 2 && !googleLoading && googleResults.length === 0 && (
        <p className="sheet-results-hint sheet-results-hint--warn">
          {googleStatus === "unconfigured"
            ? "Google Maps search is not configured on this deploy — add GOOGLE_PLACES_API_KEY in Vercel and redeploy."
            : googleMessage ?? "No Google results for that search. Try a shorter name or add manually below."}
        </p>
      )}

      {query.trim().length >= 2 && googleResults.length > 0 && (
        <div className="sheet-results sheet-results-google">
          <p className="sheet-results-label">From Google Maps</p>
          {googleResults.map((suggestion) => (
            <button
              type="button"
              className="sheet-place-row google-row"
              key={suggestion.placeId}
              disabled={googleAdding === suggestion.placeId}
              onClick={() => void pickGoogle(suggestion)}
            >
              <div className="google-row-icon">
                <MapPin size={16} />
              </div>
              <div>
                <strong>{suggestion.name}</strong>
                <span>{suggestion.address}</span>
              </div>
              {googleAdding === suggestion.placeId ? (
                <Loader2 size={14} className="search-spinner" />
              ) : (
                <small>Add</small>
              )}
            </button>
          ))}
        </div>
      )}

      {catalogMatches.length > 0 && (
        <div className="sheet-results">
          <p className="sheet-results-label">From Vouch picks</p>
          <p className="sheet-results-hint">Tap a place to open it — stamp or save from there.</p>
          {catalogMatches.map((place) => {
            const current = userPlaces.find((item) => item.placeId === place.id);
            return (
              <button type="button" className="sheet-place-row" key={place.id} onClick={() => onOpenPlace(place.id)}>
                <img src={place.image} alt={place.name} />
                <div>
                  <strong>{place.name}</strong>
                  <span>
                    {place.area} · {place.tags[0] ?? "Editorial pick"}
                  </span>
                </div>
                {current && <small>{current.state}</small>}
              </button>
            );
          })}
        </div>
      )}

      <div className="ask-form">
        <p className="eyebrow">Add custom place</p>
        <label>
          Place name
          <input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Name" />
        </label>
        <label>
          Area
          <input value={customArea} onChange={(event) => setCustomArea(event.target.value)} placeholder={profile.city} />
        </label>
        <button
          type="button"
          className="secondary-button"
          disabled={customName.trim().length < 2}
          onClick={() => {
            const id = onAddCustomPlace(customName, customArea);
            setCustomName("");
            onOpenPlace(id);
          }}
        >
          Add custom place
        </button>
      </div>
    </Sheet>
  );
}

export function ShareSheet({
  profile,
  blurb,
  url,
  places,
  cloudEnabled,
  cloudSyncing,
  onClose,
  onCopy,
  onSyncLink
}: {
  profile: UserProfile;
  blurb: string;
  url: string;
  places: Place[];
  cloudEnabled: boolean;
  cloudSyncing: boolean;
  onClose: () => void;
  onCopy: (text: string) => void;
  onSyncLink: () => void;
}) {
  const name = profile.name.trim().split(/\s+/)[0] || "You";
  const trimmedBlurb = blurb.trim();
  const shareMessage = buildShareMessage(trimmedBlurb, url);
  const hasLink = Boolean(url);
  const canShare = hasLink || trimmedBlurb.length > 0;
  const navigatorHasShare = typeof navigator !== "undefined" && "share" in navigator && typeof navigator.share === "function";

  const syncAttempted = useRef(false);
  useEffect(() => {
    if (syncAttempted.current || !cloudEnabled || hasLink) return;
    syncAttempted.current = true;
    if (!cloudSyncing) onSyncLink();
  }, [cloudEnabled, hasLink, cloudSyncing, onSyncLink]);

  async function handleNativeShare() {
    const result = await nativeShare({
      title: `${name}'s Vouch`,
      text: trimmedBlurb || "My picks on Vouch",
      url: hasLink ? url : undefined
    });
    if (result === "shared") {
      onClose();
      return;
    }
    if (result === "copied") {
      onCopy(shareMessage.trim() || trimmedBlurb);
    }
  }

  async function handleCopySharePayload() {
    const text = (shareMessage || trimmedBlurb).trim();
    await onCopy(text || trimmedBlurb);
  }

  return (
    <Sheet title="Share" onClose={onClose}>
      <div className="share-sheet-v3">
        <header className="share-v3-brand">
          <div className="share-v3-avatar" aria-hidden>
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="share-v3-meta">
            <strong>{profile.name.trim()}</strong>
            <span>
              {profile.city}
              {profile.tasteTags.length > 0 ? ` · ${tasteBio(profile.tasteTags)}` : ""}
            </span>
          </div>
        </header>

        {places.length > 0 && (
          <section className="share-v3-picks">
            <div className="share-v3-rail-head">
              <span>In this share</span>
              <span className="share-v3-rail-note">
                {places.length === 1 ? "1 place" : `${places.length} places`}
              </span>
            </div>
            <div className="share-v3-rail">
              {places.slice(0, 6).map((place) => (
                <figure key={place.id} className="share-v3-chip">
                  <img src={place.image} alt="" loading="lazy" />
                  <figcaption>
                    <span>{place.area}</span>
                    <strong>{place.name}</strong>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section className="share-v3-msg">
          <p className="share-v3-msg-label">Message people will get</p>
          {cloudSyncing && !hasLink ? (
            <p className="share-v3-quiet">Preparing your share link…</p>
          ) : (
            <blockquote className="share-v3-outgoing">
              {shareMessage.trim() || trimmedBlurb || "Building your taste card on Vouch."}
            </blockquote>
          )}
          {hasLink ? (
            <p className="share-v3-link-summary">Includes link · {shareLinkSummary(url)}</p>
          ) : cloudEnabled ? (
            <button type="button" className="share-v3-short-link-btn" onClick={onSyncLink} disabled={cloudSyncing}>
              {cloudSyncing ? "Syncing…" : "Try again"}
            </button>
          ) : (
            <p className="share-v3-quiet">Add Supabase keys to enable shareable links.</p>
          )}
        </section>

        <div className={navigatorHasShare ? "share-v3-actions-dual" : "share-v3-actions-single"}>
          {navigatorHasShare ? (
            <button type="button" className="share-v3-send" disabled={!canShare} onClick={() => void handleNativeShare()}>
              <Share2 size={17} strokeWidth={1.85} />
              Send
            </button>
          ) : null}
          <button
            type="button"
            className={navigatorHasShare ? "share-v3-copy-chip" : "share-v3-send share-v3-send-solo"}
            disabled={!canShare}
            onClick={() => void handleCopySharePayload()}
          >
            <Copy size={17} strokeWidth={1.85} />
            Copy
          </button>
        </div>
      </div>
    </Sheet>
  );
}

export function CollectionSheet({
  vouched,
  placeById,
  onClose,
  onCreate
}: {
  vouched: UserPlace[];
  placeById: Record<string, Place>;
  onClose: () => void;
  onCreate: (collection: Collection) => void;
}) {
  const stamps = useMemo(
    () =>
      [...vouched]
        .filter((item) => item.state === "vouched")
        .filter((item) => placeById[item.placeId]),
    [vouched, placeById]
  );

  const [title, setTitle] = useState("Places I'd send first");
  const [note, setNote] = useState("Tight shortlist for a friend asking right now.");
  const [selected, setSelected] = useState<string[]>(() =>
    stamps.slice(0, Math.min(MIN_VOUCHED_PLACES_PER_LIST, stamps.length)).map((item) => item.placeId)
  );

  function toggle(placeId: string) {
    setSelected((current) =>
      current.includes(placeId) ? current.filter((item) => item !== placeId) : [...current, placeId]
    );
  }

  const ready = stamps.length >= MIN_VOUCHED_PLACES_PER_LIST;
  const selectionComplete = selected.length >= MIN_VOUCHED_PLACES_PER_LIST;

  return (
    <Sheet title="New list" onClose={onClose}>
      <div className="ask-form">
        <label>
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          Note
          <input value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
      </div>

      {!ready ? (
        <p className="collection-sheet-empty">
          Vouch first — you need at least {MIN_VOUCHED_PLACES_PER_LIST} stamped spots before grouping them
          into a list. Saves and &ldquo;want to try&rdquo; don&apos;t count.
        </p>
      ) : (
        <>
          <p className="collection-sheet-hint">
            Select {MIN_VOUCHED_PLACES_PER_LIST}+ places you&apos;ve stamped ({selected.length} selected).
          </p>
          <div className="sheet-results">
            {stamps.map((item) => {
              const place = placeById[item.placeId];
              if (!place) return null;
              const active = selected.includes(item.placeId);
              return (
                <button
                  type="button"
                  className="sheet-place-row"
                  key={item.placeId}
                  onClick={() => toggle(item.placeId)}
                >
                  <img src={place.image} alt={place.name} />
                  <div>
                    <strong>{place.name}</strong>
                    <span>{item.why}</span>
                  </div>
                  {active ? <Check size={16} /> : null}
                </button>
              );
            })}
          </div>
        </>
      )}
      <button
        type="button"
        className="primary-button"
        disabled={!ready || !selectionComplete || title.trim().length < 2}
        onClick={() =>
          onCreate({
            id: uid(),
            title: title.trim(),
            note: note.trim(),
            placeIds: selected,
            accent: "#973a32",
            createdAt: Date.now()
          })
        }
      >
        Create list
      </button>
    </Sheet>
  );
}

export function AddFriendSheet({
  profile,
  inviteUrl,
  previewPlaces,
  hasHandle,
  cloudSyncing,
  onClose,
  onToast,
  onAdd
}: {
  profile: UserProfile;
  inviteUrl: string;
  previewPlaces: Place[];
  hasHandle: boolean;
  cloudSyncing?: boolean;
  onClose: () => void;
  onToast: (message: string) => void;
  onAdd: (name: string) => void;
}) {
  const [showManual, setShowManual] = useState(false);
  const [name, setName] = useState("");

  const sharePayload = buildInviteShareMessage(profile, inviteUrl, previewPlaces);
  const canSend = hasHandle && inviteUrl.length > 0;
  const navigatorHasShare =
    typeof navigator !== "undefined" && "share" in navigator && typeof navigator.share === "function";

  async function sendWhatsApp() {
    if (!canSend) {
      onToast("Your invite link is still syncing — try again in a moment.");
      return;
    }
    openWhatsApp(sharePayload);
    onClose();
  }

  async function sendShare() {
    if (!canSend) {
      onToast("Your invite link is still syncing — try again in a moment.");
      return;
    }
    const hook = sharePayload.split("\n\n")[0] ?? sharePayload;
    const result = await nativeShare({
      title: `${profile.name.trim().split(/\s+/)[0] || "Friend"}'s Vouch invite`,
      text: hook,
      url: inviteUrl
    });
    if (result === "shared") onToast("Sent!");
    else if (result === "copied") onToast("Message copied — paste anywhere");
    else onToast("Could not share — try WhatsApp");
    if (result !== "failed") onClose();
  }

  return (
    <Sheet title="Invite a friend" onClose={onClose}>
      <div className="invite-flow">
        <h3>Share your Vouch</h3>
        <p>
          {hasHandle
            ? "They join your circle when they finish onboarding from your link."
            : "Finish onboarding first — your personal invite link will appear here."}
        </p>

        <section className="share-v3-msg invite-msg-preview">
          <blockquote>
            {canSend
              ? sharePayload.split("\n\n")[0]
              : "Your invite message will show here once your link is ready."}
          </blockquote>
          {canSend ? (
            <p className="share-v3-link-summary">{shareLinkSummary(inviteUrl)}</p>
          ) : cloudSyncing ? (
            <p className="share-v3-quiet">Finishing your invite link…</p>
          ) : null}
        </section>

        <div
          className={
            navigatorHasShare ? "share-v3-actions-dual invite-actions" : "share-v3-actions-single invite-actions"
          }
        >
          <button
            type="button"
            className="invite-btn whatsapp"
            disabled={!canSend}
            onClick={() => void sendWhatsApp()}
          >
            <MessageCircle size={18} />
            WhatsApp
          </button>
          {navigatorHasShare ? (
            <button
              type="button"
              className="invite-btn native"
              disabled={!canSend}
              onClick={() => void sendShare()}
            >
              <Share2 size={18} />
              Share
            </button>
          ) : (
            <button
              type="button"
              className="invite-btn native"
              disabled={!canSend}
              onClick={async () => {
                if (!canSend) return;
                const copied = await copyToClipboard(sharePayload);
                onToast(copied ? "Message copied — paste anywhere" : "Copy failed");
                if (copied) onClose();
              }}
            >
              <Copy size={18} />
              Copy message
            </button>
          )}
        </div>

        {!showManual ? (
          <button
            type="button"
            className="manual-add-link"
            onClick={() => setShowManual(true)}
          >
            Or add a name manually
          </button>
        ) : (
          <div className="manual-add-form">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Friend's name"
              autoFocus
            />
            <button
              type="button"
              className="secondary-button"
              disabled={name.trim().length < 2}
              onClick={() => {
                onAdd(name.trim());
                setName("");
                setShowManual(false);
              }}
            >
              <UserPlus size={14} /> Add
            </button>
          </div>
        )}
      </div>
    </Sheet>
  );
}

export function FriendRecSheet({
  friends,
  places,
  onClose,
  onSave
}: {
  friends: Friend[];
  places: Place[];
  onClose: () => void;
  onSave: (placeId: string, friendId: string, why: string) => void;
}) {
  const [friendId, setFriendId] = useState(friends[0]?.id ?? "");
  const [placeId, setPlaceId] = useState(places[0]?.id ?? "");
  const [why, setWhy] = useState("");

  const canSave = friendId && placeId;

  return (
    <Sheet title="Log friend recommendation" onClose={onClose}>
      {friends.length === 0 ? (
        <EmptyState icon={<UserPlus size={18} />}>
          <p>Add at least one friend before logging recommendations.</p>
        </EmptyState>
      ) : (
        <div className="ask-form">
          <label>
            Friend
            <select value={friendId} onChange={(event) => setFriendId(event.target.value)}>
              {friends.map((friend) => (
                <option key={friend.id} value={friend.id}>
                  {friend.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Place
            <select value={placeId} onChange={(event) => setPlaceId(event.target.value)}>
              {places.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name} ({place.area})
                </option>
              ))}
            </select>
          </label>
          <label>
            Why did they recommend it?
            <input value={why} onChange={(event) => setWhy(event.target.value)} placeholder="Friend note" />
          </label>
          <button
            type="button"
            className="primary-button"
            disabled={!canSave}
            onClick={() => onSave(placeId, friendId, why || "Recommended by a trusted friend")}
          >
            Save recommendation
          </button>
        </div>
      )}
    </Sheet>
  );
}

export function TopFourSheet({
  topPlaces,
  allVouched,
  placeById,
  onClose,
  onMove,
  onToggleSlot
}: {
  topPlaces: UserPlace[];
  allVouched: UserPlace[];
  placeById: Record<string, Place>;
  onClose: () => void;
  onMove: (placeId: string, direction: "up" | "down") => void;
  onToggleSlot: (placeId: string) => void;
}) {
  const ordered = useMemo(() => topPlaces.slice(0, 4), [topPlaces]);
  const topIds = new Set(ordered.map((p) => p.placeId));
  const swapCandidates = allVouched.filter((p) => !topIds.has(p.placeId));
  const canAdd = ordered.length < 4;

  return (
    <Sheet title="Reorder Top 4" onClose={onClose}>
      <div className="sheet-results">
        {ordered.map((item, index) => {
          const place = placeById[item.placeId];
          if (!place) return null;
          return (
            <div key={item.placeId} className="sheet-place-row">
              <img src={place.image} alt={place.name} />
              <div>
                <strong>
                  #{index + 1} {place.name}
                </strong>
                <span>{item.why}</span>
              </div>
              <div className="row-actions">
                <button type="button" onClick={() => onMove(item.placeId, "up")} disabled={index === 0}>
                  ↑
                </button>
                <button type="button" onClick={() => onMove(item.placeId, "down")} disabled={index === ordered.length - 1}>
                  ↓
                </button>
                <button type="button" onClick={() => onToggleSlot(item.placeId)}>
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {(canAdd || swapCandidates.length > 0) && swapCandidates.length > 0 && (
        <>
          <p className="eyebrow" style={{ marginTop: 12 }}>Add to Top 4</p>
          <div className="sheet-results">
            {swapCandidates.slice(0, 6).map((item) => {
              const place = placeById[item.placeId];
              if (!place) return null;
              return (
                <button
                  type="button"
                  key={item.placeId}
                  className="sheet-place-row"
                  onClick={() => onToggleSlot(item.placeId)}
                  disabled={!canAdd && topIds.size >= 4}
                >
                  <img src={place.image} alt={place.name} />
                  <div>
                    <strong>{place.name}</strong>
                    <span>{place.area}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </Sheet>
  );
}
