import { Check, Copy, ExternalLink, MessageCircle, Search, Share2, Stamp, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { QUICK_VOUCH_TAGS } from "../../data/taste";
import { openWhatsApp, nativeShare } from "../../lib/share";
import type { Collection, Friend, Place, UserPlace, UserProfile } from "../../types";
import { EmptyState } from "../ui/EmptyState";
import { Sheet } from "../ui/Sheet";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AddPlaceSheet({
  query,
  onQuery,
  searchedPlaces,
  userPlaces,
  profile,
  onClose,
  onOpenPlace,
  onWant,
  onVouch,
  onAddCustomPlace
}: {
  query: string;
  onQuery: (query: string) => void;
  searchedPlaces: Place[];
  userPlaces: UserPlace[];
  profile: UserProfile;
  onClose: () => void;
  onOpenPlace: (placeId: string) => void;
  onWant: (placeId: string) => void;
  onVouch: (placeId: string, why: string, tags: string[]) => void;
  onAddCustomPlace: (name: string, area: string) => string;
}) {
  const selected = searchedPlaces[0] ?? null;
  const [why, setWhy] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [customName, setCustomName] = useState("");
  const [customArea, setCustomArea] = useState(profile.city);

  function toggleTag(tag: string) {
    setTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  }

  return (
    <Sheet title="Add a place" onClose={onClose}>
      <div className="search-box">
        <Search size={16} />
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search by place, area, or taste tag"
        />
      </div>
      <div className="sheet-results">
        {searchedPlaces.slice(0, 6).map((place) => {
          const current = userPlaces.find((item) => item.placeId === place.id);
          return (
            <button type="button" className="sheet-place-row" key={place.id} onClick={() => onOpenPlace(place.id)}>
              <img src={place.image} alt={place.name} />
              <div>
                <strong>{place.name}</strong>
                <span>
                  {place.area} · {place.tags[0] ?? "Add note"}
                </span>
              </div>
              {current && <small>{current.state}</small>}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="vouch-composer">
          <p className="eyebrow">Stamp a real vouch</p>
          <h3>{selected.name}</h3>
          <textarea
            value={why}
            onChange={(event) => setWhy(event.target.value)}
            placeholder="What would you actually tell a friend?"
          />
          <div className="tag-cloud compact">
            {QUICK_VOUCH_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={tags.includes(tag) ? "taste-tag active" : "taste-tag"}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="dual-actions">
            <button type="button" className="secondary-button" onClick={() => onWant(selected.id)}>
              Want to try
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => onVouch(selected.id, why || selected.tip, tags.length ? tags : selected.tags.slice(0, 3))}
            >
              <Stamp size={14} /> I vouch
            </button>
          </div>
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
  title,
  body,
  url,
  places,
  onClose,
  onCopy
}: {
  title: string;
  body: string;
  url: string;
  places: Place[];
  onClose: () => void;
  onCopy: (text: string) => void;
}) {
  const shareText = `${body}\n\n${url}`;

  async function handleNativeShare() {
    const result = await nativeShare({ title, text: body, url });
    if (result === "shared") {
      onClose();
    } else if (result === "copied") {
      onCopy(shareText);
    }
  }

  return (
    <Sheet title={title} onClose={onClose}>
      <div className="share-card share-card-polished">
        {places.length > 0 && (
          <div className="share-photo-mosaic">
            {places.slice(0, 4).map((place, index) => (
              <img className={index === 0 ? "large" : ""} src={place.image} alt="" key={place.id} />
            ))}
          </div>
        )}
        <div className="share-card-copy">
          <p className="eyebrow">Ready to send</p>
          <h2>{title}</h2>
          <pre className="share-preview-text">{body}</pre>
          <p className="share-footer">Includes a public Vouch card link.</p>
        </div>
      </div>
      <div className="share-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            openWhatsApp(shareText);
            onClose();
          }}
        >
          <MessageCircle size={14} /> WhatsApp
        </button>
        <button type="button" className="secondary-button" onClick={() => onCopy(url)}>
          <Copy size={14} /> Copy link
        </button>
        {"share" in navigator ? (
          <button type="button" className="primary-button" onClick={handleNativeShare}>
            <Share2 size={14} /> Share
          </button>
        ) : (
          <button type="button" className="primary-button" onClick={() => onCopy(shareText)}>
            <ExternalLink size={14} /> Send
          </button>
        )}
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
  const [title, setTitle] = useState("Places I'd send first");
  const [note, setNote] = useState("Tight shortlist for a friend asking right now.");
  const [selected, setSelected] = useState<string[]>(() => vouched.slice(0, 3).map((item) => item.placeId));

  function toggle(placeId: string) {
    setSelected((current) =>
      current.includes(placeId) ? current.filter((item) => item !== placeId) : [...current.slice(-7), placeId]
    );
  }

  return (
    <Sheet title="New collection" onClose={onClose}>
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
      <div className="sheet-results">
        {vouched.map((item) => {
          const place = placeById[item.placeId];
          if (!place) return null;
          const active = selected.includes(item.placeId);
          return (
            <button type="button" className="sheet-place-row" key={item.placeId} onClick={() => toggle(item.placeId)}>
              <img src={place.image} alt={place.name} />
              <div>
                <strong>{place.name}</strong>
                <span>{item.why}</span>
              </div>
              {active && <Check size={16} />}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="primary-button"
        disabled={selected.length === 0 || title.trim().length < 2}
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
        Create collection
      </button>
    </Sheet>
  );
}

export function AddFriendSheet({
  inviteUrl,
  hasHandle,
  onClose,
  onWhatsApp,
  onCopyLink,
  onNativeShare,
  onAdd
}: {
  inviteUrl: string;
  hasHandle: boolean;
  onClose: () => void;
  onWhatsApp: () => void;
  onCopyLink: () => void;
  onNativeShare: () => void;
  onAdd: (name: string) => void;
}) {
  const [showManual, setShowManual] = useState(false);
  const [name, setName] = useState("");

  return (
    <Sheet title="Invite a friend" onClose={onClose}>
      <div className="invite-flow">
        <h3>Share your Vouch</h3>
        <p>
          {hasHandle
            ? "Your invite link adds them to your circle when they finish onboarding."
            : "Finish onboarding first — your personal invite link will appear here."}
        </p>
        {hasHandle && (
          <p className="invite-url-preview">{inviteUrl}</p>
        )}
        <div className="invite-actions">
          <button
            type="button"
            className="invite-btn whatsapp"
            onClick={() => {
              onWhatsApp();
              onClose();
            }}
          >
            <MessageCircle size={18} />
            WhatsApp
          </button>
          <button
            type="button"
            className="invite-btn copy"
            onClick={() => {
              onCopyLink();
              onClose();
            }}
          >
            <Copy size={18} />
            Copy link
          </button>
          {"share" in navigator && (
            <button
              type="button"
              className="invite-btn native"
              onClick={() => {
                onNativeShare();
                onClose();
              }}
            >
              <Share2 size={18} />
              Share
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
