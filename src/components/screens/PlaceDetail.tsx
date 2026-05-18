import { useState } from "react";
import { ArrowLeft, ExternalLink, Pencil, Share2, Stamp, Trash2 } from "lucide-react";
import { priceLabel } from "../../lib/format";
import { QUICK_VOUCH_TAGS } from "../../data/taste";
import type { Friend, Place, UserPlace } from "../../types";

export function PlaceDetail({
  place,
  userPlace,
  friend,
  onBack,
  onWant,
  onVouch,
  onUpdateNote,
  onRemove,
  onShare
}: {
  place: Place;
  userPlace?: UserPlace | null;
  friend?: Friend;
  onBack: () => void;
  onWant: () => void;
  onVouch: (why: string, tags: string[]) => void;
  onUpdateNote?: (why: string, tags: string[]) => void;
  onRemove?: () => void;
  onShare: () => void;
}) {
  const isVouched = userPlace?.state === "vouched";
  const [editing, setEditing] = useState(false);
  const [showVouchInput, setShowVouchInput] = useState(false);
  const [why, setWhy] = useState(userPlace?.why ?? place.tip);
  const [tags, setTags] = useState<string[]>(
    userPlace?.tags.length ? [...userPlace.tags] : place.tags.slice(0, 3)
  );

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${place.name} ${place.area} ${place.city}`
  )}`;

  function toggleTag(tag: string) {
    setTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    );
  }

  function handleVouch() {
    onVouch(why || place.tip, tags.length ? tags : place.tags.slice(0, 3));
    setShowVouchInput(false);
  }

  function handleSaveEdit() {
    onUpdateNote?.(why, tags);
    setEditing(false);
  }

  return (
    <div className="detail-page">
      <button type="button" className="quiet-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back
      </button>
      <div className="place-hero-image">
        <img src={place.image} alt={place.name} />
        {isVouched && <span className="stamp-badge">Vouched</span>}
      </div>
      <section className="detail-copy">
        <p className="eyebrow">
          {place.area} · {priceLabel(place.price)}
        </p>
        <h2>{place.name}</h2>

        {editing ? (
          <div className="inline-edit-form">
            <label className="field">
              <span>Your note</span>
              <textarea
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                placeholder="What would you tell a friend?"
              />
            </label>
            <div className="tag-cloud compact">
              {QUICK_VOUCH_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={tags.includes(tag) ? "taste-tag active" : "taste-tag"}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="dual-actions">
              <button type="button" className="secondary-button" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button type="button" className="primary-button" onClick={handleSaveEdit}>
                Save changes
              </button>
            </div>
          </div>
        ) : (
          <>
            <p>{userPlace?.why || place.tip}</p>
            {userPlace?.addedFrom && friend && (
              <p className="friend-proof">Saved from {friend.name}'s recommendation</p>
            )}
            <div className="tag-row">
              {(userPlace?.tags.length ? userPlace.tags : place.tags).map((tag) => (
                <span className="taste-tag static" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}

        <div className="insight-list">
          <div>
            <strong>Best for</strong>
            <span>{place.bestFor.join(", ")}</span>
          </div>
          {!editing && (
            <div>
              <strong>Your note</strong>
              <span>{userPlace?.why || place.tip}</span>
            </div>
          )}
          {place.caveat && (
            <div className="caveat-block">
              <strong>Heads up</strong>
              <span>{place.caveat}</span>
            </div>
          )}
        </div>
        <a href={mapUrl} target="_blank" rel="noreferrer" className="map-link">
          Open in Maps <ExternalLink size={14} />
        </a>
      </section>

      {showVouchInput && !isVouched && (
        <div className="inline-vouch-form">
          <textarea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="What would you actually tell a friend?"
            rows={2}
          />
          <div className="tag-cloud compact">
            {QUICK_VOUCH_TAGS.map((tag) => (
              <button
                type="button"
                key={tag}
                className={tags.includes(tag) ? "taste-tag active" : "taste-tag"}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="dual-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowVouchInput(false)}
            >
              Cancel
            </button>
            <button type="button" className="primary-button" onClick={handleVouch}>
              <Stamp size={15} /> Vouch it
            </button>
          </div>
        </div>
      )}

      <div className="detail-actions">
        {isVouched ? (
          <>
            <button type="button" className="secondary-button" onClick={() => setEditing(!editing)}>
              <Pencil size={14} /> Edit
            </button>
            <button type="button" className="secondary-button" onClick={onShare}>
              <Share2 size={14} /> Share
            </button>
            {onRemove && (
              <button type="button" className="secondary-button danger" onClick={onRemove}>
                <Trash2 size={14} /> Remove
              </button>
            )}
          </>
        ) : (
          <>
            <button type="button" className="secondary-button" onClick={onWant}>
              Want to try
            </button>
            <button type="button" className="secondary-button" onClick={onShare}>
              <Share2 size={14} /> Share
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => setShowVouchInput(true)}
            >
              <Stamp size={15} /> Vouch
            </button>
          </>
        )}
      </div>
    </div>
  );
}
