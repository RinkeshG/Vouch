import { useState } from "react";
import { Bookmark, Check, MapPin, Stamp } from "lucide-react";
import { tasteBio } from "../../lib/format";
import type { PublicSharePayload } from "../../lib/share";
import type { Place } from "../../types";

export function PublicProfileScreen({
  payload,
  placeById,
  inviterHandle,
  onStart
}: {
  payload: PublicSharePayload;
  placeById: Record<string, Place>;
  inviterHandle?: string;
  onStart: () => void;
}) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const vouched = payload.userPlaces.filter((item) => item.state === "vouched");
  const topPlaces = payload.userPlaces.filter((item) => item.top).slice(0, 4);
  const preview = (topPlaces.length ? topPlaces : vouched.slice(0, 4))
    .map((item) => placeById[item.placeId])
    .filter(Boolean);
  const firstName = payload.profile.name.trim().split(/\s+/)[0] || "Someone";
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleSave(placeId: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return next;
    });
  }

  return (
    <div className="public-profile">
      <header className="public-header">
        <div className="brand-mark small">
          <Stamp size={20} />
        </div>
        <h1>{firstName}'s Vouch</h1>
        <p className="public-meta">
          {payload.profile.city} · {tasteBio(payload.profile.tasteTags)}
        </p>
      </header>

      {preview.length > 0 && (
        <section className="public-mosaic-section">
          <div className="public-mosaic">
            {preview.map((place) => (
              <div className="public-mosaic-tile" key={place.id}>
                <img src={place.image} alt="" />
                <div className="vouch-mosaic-label">
                  <span>{place.area}</span>
                  <strong>{place.name}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="public-places-list">
        <p className="public-list-label">{firstName}'s top places</p>
        {preview.map((place, index) => {
          const expanded = expandedId === place.id;
          const isSaved = savedIds.has(place.id);
          const userPlace = payload.userPlaces.find((p) => p.placeId === place.id);
          const note = userPlace?.why?.trim() || place.tip;
          return (
            <div className={`public-place-card ${expanded ? "expanded" : ""}`} key={place.id}>
              <button
                type="button"
                className="public-place-main"
                onClick={() => setExpandedId(expanded ? null : place.id)}
              >
                <span className="public-place-rank">{index + 1}</span>
                <img src={place.image} alt="" className="public-place-thumb" />
                <div className="public-place-info">
                  <strong>{place.name}</strong>
                  <span>{place.area} · {place.tags[0]}</span>
                </div>
              </button>
              {expanded && (
                <div className="public-place-expanded">
                  <p>{note}</p>
                  <div className="public-place-tags">
                    {place.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="taste-tag static">{tag}</span>
                    ))}
                  </div>
                  <div className="public-place-actions">
                    <button
                      type="button"
                      className={isSaved ? "secondary-button saved" : "secondary-button"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(place.id);
                      }}
                    >
                      {isSaved ? <Check size={14} /> : <Bookmark size={14} />}
                      {isSaved ? "Saved" : "Save this"}
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.area} ${place.city}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="secondary-button"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MapPin size={14} /> Maps
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {savedIds.size > 0 && (
        <div className="public-saved-banner">
          <p>You saved {savedIds.size} place{savedIds.size === 1 ? "" : "s"}. Make your own Vouch to keep them.</p>
        </div>
      )}

      {inviterHandle && (
        <p className="public-invite-note">
          You were invited by @{inviterHandle}. Make yours to connect.
        </p>
      )}

      <button type="button" className="primary-button public-cta" onClick={onStart}>
        <Stamp size={18} /> Make my own Vouch
      </button>
    </div>
  );
}
