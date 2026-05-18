import { useEffect, useRef, useState } from "react";
import { Bookmark, Check, Lock, MapPin, Stamp } from "lucide-react";
import { tasteBio } from "../../lib/format";
import { firstName } from "../../lib/share";
import type { PublicSharePayload } from "../../lib/share";
import type { Place, UserPlace } from "../../types";

const VISIBLE_VOUCHES = 5;

type Row = { up: UserPlace; place: Place };

function buildRows(payload: PublicSharePayload, placeById: Record<string, Place>): Row[] {
  return payload.userPlaces
    .filter((up) => up.state === "vouched")
    .map((up) => {
      const place = placeById[up.placeId];
      if (!place) return null;
      return { up, place };
    })
    .filter(Boolean) as Row[];
}

export function PublicProfileScreen({
  payload,
  placeById,
  inviterHandle,
  featuredCollectionId,
  onStart
}: {
  payload: PublicSharePayload;
  placeById: Record<string, Place>;
  inviterHandle?: string;
  /** When opened from a `/handle/list-slug` link */
  featuredCollectionId?: string | null;
  onStart: () => void;
}) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const featuredRef = useRef<HTMLElement | null>(null);
  const rows = buildRows(payload, placeById);
  const pinned = rows.filter((r) => r.up.top).slice(0, 4);
  const visible = rows.slice(0, VISIBLE_VOUCHES);
  const locked = rows.slice(VISIBLE_VOUCHES);
  const name = firstName(payload.profile.name);
  const collections = payload.collections;

  useEffect(() => {
    if (!featuredCollectionId) return;
    const t = window.setTimeout(() => {
      featuredRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    return () => window.clearTimeout(t);
  }, [featuredCollectionId]);

  function toggleSave(placeId: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return next;
    });
  }

  return (
    <div className="pub">
      <header className="pub-mast">
        <div className="pub-brand">
          <Stamp size={16} />
          <span>Vouch</span>
        </div>
        <div className="pub-mast-meta">
          <span className="pub-mast-eyebrow">Curated by</span>
          <h1 className="pub-mast-name">{payload.profile.name}</h1>
          <p className="pub-mast-sub">
            {payload.profile.city}
            {payload.profile.tasteTags.length > 0 ? ` · ${tasteBio(payload.profile.tasteTags)}` : ""}
          </p>
        </div>
      </header>

      {pinned.length > 0 && rows.length > pinned.length && (
        <section className="pub-pinned">
          <span className="pub-pinned-label">{name}&rsquo;s pinned {pinned.length}</span>
          <div className="pub-pinned-strip">
            {pinned.map(({ place }) => (
              <div className="pub-pinned-thumb" key={place.id}>
                <img src={place.image} alt={place.name} loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="pub-list">
        <header className="pub-list-head">
          <h2>Vouched</h2>
          <span className="pub-list-count">
            {rows.length} place{rows.length === 1 ? "" : "s"}
          </span>
        </header>

        {visible.map(({ up, place }) => {
          const isSaved = savedIds.has(place.id);
          const note = up.why?.trim() || place.tip;
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${place.name} ${place.area} ${place.city}`
          )}`;
          return (
            <article className="pub-card" key={place.id}>
              <div className="pub-card-photo">
                <img src={place.image} alt="" loading="lazy" />
                {up.top && (
                  <span className="pub-card-pin" aria-label="Pinned pick">
                    Pinned
                  </span>
                )}
              </div>
              <div className="pub-card-body">
                <strong>{place.name}</strong>
                <span>{place.area}</span>
                <p>{note}</p>
                <div className="pub-card-actions">
                  <button
                    type="button"
                    className={isSaved ? "pub-save saved" : "pub-save"}
                    onClick={() => toggleSave(place.id)}
                  >
                    {isSaved ? <Check size={14} /> : <Bookmark size={14} />}
                    {isSaved ? "Saved" : "Save"}
                  </button>
                  <a className="pub-map" href={mapUrl} target="_blank" rel="noreferrer">
                    <MapPin size={14} /> Maps
                  </a>
                </div>
              </div>
            </article>
          );
        })}

        {locked.length > 0 && (
          <div className="pub-locked">
            <div className="pub-locked-thumbs" aria-hidden>
              {locked.slice(0, 4).map(({ place }) => (
                <img key={place.id} src={place.image} alt="" loading="lazy" />
              ))}
            </div>
            <div className="pub-locked-copy">
              <Lock size={16} />
              <strong>
                +{locked.length} more on {name}&rsquo;s Vouch
              </strong>
              <span>Make yours — free in two minutes.</span>
            </div>
          </div>
        )}
      </section>

      {collections.length > 0 && (
        <section className="pub-lists">
          <header className="pub-list-head">
            <h2>Lists</h2>
          </header>
          <div className="pub-lists-row">
            {collections.map((c) => (
              <article
                ref={featuredCollectionId === c.id ? featuredRef : undefined}
                className={`pub-list-card${featuredCollectionId === c.id ? " pub-list-card-featured" : ""}`}
                key={c.id}
              >
                <div className="pub-list-thumbs">
                  {c.placeIds.slice(0, 3).map((id) => (
                    <img key={id} src={placeById[id]?.image} alt="" loading="lazy" />
                  ))}
                </div>
                <strong>{c.title}</strong>
                <span>
                  {c.placeIds.length} place{c.placeIds.length === 1 ? "" : "s"}
                </span>
              </article>
            ))}
          </div>
        </section>
      )}

      {savedIds.size > 0 && (
        <p className="pub-saved-note">
          You saved {savedIds.size} place{savedIds.size === 1 ? "" : "s"}. Make your Vouch to keep them.
        </p>
      )}

      {inviterHandle && <p className="pub-invited-by">Invited by @{inviterHandle}</p>}

      <div className="pub-cta-dock">
        <button type="button" className="pub-cta" onClick={onStart}>
          <Stamp size={18} /> Make my Vouch — free
        </button>
        <p className="pub-cta-sub">Takes 2 minutes</p>
      </div>
    </div>
  );
}
