import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Pencil, Share2, Stamp, Trash2 } from "lucide-react";
import { priceLabel } from "../../lib/format";
import { QUICK_VOUCH_TAGS } from "../../data/taste";
import type { Friend, Place, UserPlace } from "../../types";

function ConsensusRow({
  vouchers,
  onOpenFriend
}: {
  vouchers: Array<{ friend: Friend; why: string }>;
  onOpenFriend?: (friendId: string) => void;
}) {
  const names = vouchers.map((v) => v.friend.name);
  let label: string;
  if (names.length === 1) label = `Vouched by ${names[0]}`;
  else if (names.length === 2) label = `Vouched by ${names[0]} and ${names[1]}`;
  else if (names.length === 3) label = `Vouched by ${names[0]}, ${names[1]} and ${names[2]}`;
  else label = `Vouched by ${names[0]}, ${names[1]} and ${names.length - 2} others`;

  const stack = vouchers.slice(0, 4);

  return (
    <div className="detail-consensus detail-consensus--editorial">
      <div className="detail-consensus-stack">
        {stack.map(({ friend: f }, i) => (
          <button
            type="button"
            key={f.id}
            className="detail-consensus-avatar"
            style={{ zIndex: stack.length - i }}
            onClick={() => onOpenFriend?.(f.id)}
            aria-label={f.name}
          >
            {f.name.charAt(0).toUpperCase()}
          </button>
        ))}
      </div>
      <span className="detail-consensus-label">{label}</span>
    </div>
  );
}

export function PlaceDetail({
  place,
  userPlace,
  friend,
  circleVouchers,
  onBack,
  onWant,
  onVouch,
  onUpdateNote,
  onRemove,
  onShare,
  onOpenFriend
}: {
  place: Place;
  userPlace?: UserPlace | null;
  friend?: Friend;
  circleVouchers: Array<{ friend: Friend; why: string }>;
  onBack: () => void;
  onWant: () => void;
  onVouch: (why: string, tags: string[]) => void;
  onUpdateNote?: (why: string, tags: string[]) => void;
  onRemove?: () => void;
  onShare: () => void;
  onOpenFriend?: (friendId: string) => void;
}) {
  const isVouched = userPlace?.state === "vouched";
  const [editing, setEditing] = useState(false);
  const [showVouchInput, setShowVouchInput] = useState(false);
  const [why, setWhy] = useState(userPlace?.why ?? place.tip);
  const [tags, setTags] = useState<string[]>(
    userPlace?.tags.length ? [...userPlace.tags] : place.tags.slice(0, 3)
  );

  useEffect(() => {
    setWhy(userPlace?.why ?? place.tip);
    setTags(userPlace?.tags.length ? [...userPlace.tags] : place.tags.slice(0, 3));
  }, [place.id, place.tip, place.tags, userPlace?.why, userPlace?.tags]);

  useEffect(() => {
    if (isVouched) setShowVouchInput(false);
  }, [isVouched]);

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${place.name} ${place.area} ${place.city}`
  )}`;

  function toggleTag(tag: string) {
    setTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    );
  }

  /** One line shown under the title — never duplicate “Your note” elsewhere */
  function leadParagraph(): string {
    if (isVouched || userPlace?.state === "saved") {
      const w = userPlace?.why?.trim();
      if (w) return w;
    }
    return place.tip;
  }

  function handleVouch() {
    setShowVouchInput(false);
    onVouch(why || place.tip, tags.length ? tags : place.tags.slice(0, 3));
  }

  function handleSaveEdit() {
    onUpdateNote?.(why, tags);
    setEditing(false);
  }

  const lead = leadParagraph();
  const tagsList = userPlace?.tags.length ? userPlace.tags : place.tags;

  /** Editorial subtitle when no personal quote yet — best-for only so tags aren’t duplicated. */
  const deckLine =
    !editing && !lead ? place.bestFor.slice(0, 2).join(" · ").trim() : "";

  const sheetSparse = !editing && !lead && !(userPlace?.addedFrom && friend) && tagsList.length === 0;

  const showContextCard =
    !editing && (place.bestFor.length > 0 || Boolean(place.caveat?.trim()));

  return (
    <div className="detail-page detail-page--editorial">
      <header className="detail-hero-editorial">
        <div className="detail-hero-photo">
          <img src={place.image} alt={place.name} />
          <div className="detail-hero-gradient" aria-hidden />
          <button type="button" className="detail-back-floating" onClick={onBack}>
            <ArrowLeft size={18} strokeWidth={2} aria-hidden />
            <span>Back</span>
          </button>
          {isVouched ? (
            <span className="detail-hero-badge" aria-live="polite">
              Vouched
            </span>
          ) : null}
        </div>

        <div className="detail-hero-sheet">
          <div
            className={
              sheetSparse ? "detail-hero-sheet-inner detail-hero-sheet-inner--tight" : "detail-hero-sheet-inner"
            }
          >
            <p className="detail-hero-meta">
              <span>{place.area}</span>
              <span className="detail-hero-meta-dot" aria-hidden>
                ◆
              </span>
              <span>{priceLabel(place.price)}</span>
            </p>
            <h2 className="detail-hero-name">{place.name}</h2>

            {editing ? (
              <div className="inline-edit-form detail-inline-edit">
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
                {lead ? <p className="detail-hero-lead">{lead}</p> : null}
                {!lead && deckLine ? <p className="detail-hero-deck">{deckLine}</p> : null}
                {userPlace?.addedFrom && friend ? (
                  <p className="detail-hero-origin">Saved via {friend.name}&rsquo;s list</p>
                ) : null}
                {!editing && tagsList.length > 0 ? (
                  <div className="detail-tag-strip detail-tag-strip--hero">
                    {tagsList.map((tag) => (
                      <span className="detail-tag-pill" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </header>

      {!editing && (
        <div className="detail-article">
          {circleVouchers.length > 0 ? <ConsensusRow vouchers={circleVouchers} onOpenFriend={onOpenFriend} /> : null}

          {showContextCard ? (
            <div className="detail-rail-card">
              {place.bestFor.length > 0 ? (
                <div className="detail-rail detail-rail--best">
                  <span className="detail-rail-label">Best for</span>
                  <p className="detail-rail-body">{place.bestFor.join(" · ")}</p>
                </div>
              ) : null}
              {place.caveat?.trim() ? (
                <div className="detail-rail detail-rail--caveat">
                  <span className="detail-rail-label">Heads up</span>
                  <p className="detail-rail-body">{place.caveat}</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      {circleVouchers.length > 0 && circleVouchers.some((v) => v.why) && (
        <section className="detail-friend-takes detail-friend-takes--editorial">
          <h3 className="detail-friend-takes-kicker">From your circle</h3>
          <p className="detail-friend-takes-title">What people actually said</p>
          <ul className="detail-friend-takes-list">
            {circleVouchers
              .filter((v) => v.why)
              .map(({ friend: f, why: friendWhy }) => (
                <li key={f.id}>
                  <button
                    type="button"
                    className="detail-friend-take detail-friend-take--editorial"
                    onClick={() => onOpenFriend?.(f.id)}
                  >
                    <span className="detail-friend-avatar">{f.name.charAt(0).toUpperCase()}</span>
                    <div className="detail-friend-take-copy">
                      <strong>{f.name}</strong>
                      <p>{friendWhy}</p>
                    </div>
                  </button>
                </li>
              ))}
          </ul>
        </section>
      )}

      <footer className="detail-footer detail-footer--editorial">
        {showVouchInput && !isVouched ? (
          <div className="detail-vouch-panel detail-vouch-panel--editorial">
            <p className="detail-vouch-panel-label">Your vouch</p>
            <textarea
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder="What would you actually tell a friend?"
              rows={3}
              className="detail-vouch-textarea"
            />
            <div className="tag-cloud compact detail-vouch-tags">
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
            <div className="detail-vouch-actions">
              <button type="button" className="detail-cta-minor" onClick={() => setShowVouchInput(false)}>
                Cancel
              </button>
              <button type="button" className="detail-cta-main detail-cta-main--solid" onClick={handleVouch}>
                <Stamp size={17} strokeWidth={2} /> Stamp it
              </button>
            </div>
          </div>
        ) : (
          <div className="detail-cta-zone">
            {isVouched ? (
              <div className="detail-cta-owned">
                <button type="button" className="detail-cta-tool" onClick={() => setEditing(!editing)}>
                  <Pencil size={17} strokeWidth={1.85} /> Edit note
                </button>
                <button type="button" className="detail-cta-tool" onClick={onShare}>
                  <Share2 size={17} strokeWidth={1.85} /> Share
                </button>
                {onRemove ? (
                  <button type="button" className="detail-cta-tool detail-cta-tool--risk" onClick={onRemove}>
                    <Trash2 size={17} strokeWidth={1.85} /> Remove
                  </button>
                ) : null}
              </div>
            ) : (
              <>
                <button type="button" className="detail-cta-main detail-cta-main--solid" onClick={() => setShowVouchInput(true)}>
                  <Stamp size={18} strokeWidth={2} /> Vouch this place
                </button>
                <div className="detail-cta-subrow">
                  <button type="button" className="detail-cta-link" onClick={onWant}>
                    Want to try
                  </button>
                  <span className="detail-cta-dot" aria-hidden />
                  <button type="button" className="detail-cta-link" onClick={onShare}>
                    <Share2 size={15} strokeWidth={1.85} /> Share picks
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <a href={mapUrl} target="_blank" rel="noreferrer" className="detail-map-link">
          <span className="detail-map-link-inner">
            <ExternalLink size={15} strokeWidth={2} aria-hidden />
            Open in Google Maps
          </span>
        </a>
      </footer>
    </div>
  );
}
