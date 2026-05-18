import { useState } from "react";
import { Check, Plus, Settings, Share2 } from "lucide-react";
import { EmailAuthCard } from "../ui/EmailAuthCard";
import { CITY_OPTIONS, TASTE_TAGS } from "../../data/taste";
import { tasteBio } from "../../lib/format";
import { MIN_VOUCHED_PLACES_PER_LIST } from "../../lib/collectionRules";
import type { Collection, Place, UserPlace, UserProfile } from "../../types";

export function ProfileScreen({
  profile,
  topPlaces,
  vouched,
  savesFromFriends,
  collections,
  placeById,
  onOpenPlace,
  onOpenCollection,
  onOpenTopFour,
  onCreateCollection,
  onShare,
  onUpdateProfile,
  onReset,
  cloudEnabled,
  authEmail,
  authAnonymous,
  authBusy,
  onLinkEmail,
  onSignInEmail
}: {
  profile: UserProfile;
  topPlaces: UserPlace[];
  vouched: UserPlace[];
  savesFromFriends: number;
  collections: Collection[];
  placeById: Record<string, Place>;
  onOpenPlace: (placeId: string) => void;
  onOpenCollection: (collectionId: string) => void;
  onOpenTopFour: () => void;
  onCreateCollection: () => void;
  onShare: () => void;
  onUpdateProfile: (partial: Partial<UserProfile>) => void;
  onReset: () => void;
  cloudEnabled: boolean;
  authEmail: string | null;
  authAnonymous: boolean;
  authBusy: boolean;
  onLinkEmail: (email: string) => Promise<{ ok: boolean; error?: string }>;
  onSignInEmail: (email: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [draftName, setDraftName] = useState(profile.name);
  const [draftCity, setDraftCity] = useState(profile.city);
  const [draftTags, setDraftTags] = useState<string[]>([...profile.tasteTags]);
  const [confirmReset, setConfirmReset] = useState(false);

  const pinned = topPlaces.slice(0, 4).map((item) => placeById[item.placeId]).filter(Boolean);

  function openSettings() {
    setDraftName(profile.name);
    setDraftCity(profile.city);
    setDraftTags([...profile.tasteTags]);
    setShowSettings(true);
  }

  function saveSettings() {
    onUpdateProfile({ name: draftName, city: draftCity, tasteTags: draftTags });
    setShowSettings(false);
  }

  if (showSettings) {
    return (
      <SettingsView
        profile={profile}
        draftName={draftName}
        setDraftName={setDraftName}
        draftCity={draftCity}
        setDraftCity={setDraftCity}
        draftTags={draftTags}
        setDraftTags={setDraftTags}
        onClose={() => setShowSettings(false)}
        onSave={saveSettings}
        onReset={onReset}
        confirmReset={confirmReset}
        setConfirmReset={setConfirmReset}
        cloudEnabled={cloudEnabled}
        authEmail={authEmail}
        authBusy={authBusy}
        onLinkEmail={onLinkEmail}
        onSignInEmail={onSignInEmail}
      />
    );
  }

  return (
    <div className="you">
      <header className="you-head">
        <div className="you-avatar">{(profile.name || "V").trim().charAt(0).toUpperCase()}</div>
        <div className="you-meta">
          <h1 className="you-name">{profile.name}</h1>
          <p className="you-city">{profile.city}</p>
        </div>
        <button
          type="button"
          className="you-cog"
          onClick={openSettings}
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
      </header>

      <p className="you-taste">{tasteBio(profile.tasteTags)}</p>

      {cloudEnabled && !authEmail && (
        <EmailAuthCard
          variant="compact"
          cloudEnabled={cloudEnabled}
          authEmail={authEmail}
          authBusy={authBusy}
          onSaveEmail={onLinkEmail}
          onSignInEmail={onSignInEmail}
        />
      )}

      {authEmail && <p className="you-email-linked">Saved as {authEmail}</p>}

      {profile.tasteTags.length > 0 && (
        <div className="you-tags">
          {profile.tasteTags.slice(0, 6).map((tag) => (
            <span key={tag} className="you-tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="you-stats">
        <span><strong>{vouched.length}</strong> vouched</span>
        <span className="you-stats-dot" aria-hidden>·</span>
        <span><strong>{collections.length}</strong> {collections.length === 1 ? "list" : "lists"}</span>
        <span className="you-stats-dot" aria-hidden>·</span>
        <span><strong>{savesFromFriends}</strong> saves from friends</span>
      </div>

      <button type="button" className="you-share" onClick={onShare}>
        <Share2 size={15} /> Share my Vouch
      </button>

      {pinned.length > 0 && (
        <div className="you-pinned">
          <div className="you-pinned-row">
            {pinned.map((place) => (
              <button
                type="button"
                key={place.id}
                className="you-pinned-thumb"
                onClick={() => onOpenPlace(place.id)}
                aria-label={place.name}
              >
                <img src={place.image} alt="" loading="lazy" />
              </button>
            ))}
            {Array.from({ length: Math.max(0, 4 - pinned.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="you-pinned-thumb empty" aria-hidden />
            ))}
          </div>
          <button type="button" className="you-pinned-edit" onClick={onOpenTopFour}>
            {pinned.length === 4 ? "Edit pinned" : `Pin ${4 - pinned.length} more`}
          </button>
        </div>
      )}

      {vouched.length === 0 ? (
        <section className="you-empty">
          <p>Start your Vouch list — add the places you actually recommend.</p>
        </section>
      ) : (
        <section className="you-section">
          <h2 className="you-section-title">Vouched</h2>
          <div className="you-list">
            {vouched.map((item) => {
              const place = placeById[item.placeId];
              if (!place) return null;
              return (
                <button
                  type="button"
                  key={item.placeId}
                  className="you-row"
                  onClick={() => onOpenPlace(item.placeId)}
                >
                  <img src={place.image} alt="" loading="lazy" />
                  <div className="you-row-body">
                    <strong>{place.name}</strong>
                    <span>{place.area}</span>
                    {item.why && <p>{item.why}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="you-section">
        <div className="you-section-head">
          <h2 className="you-section-title">Lists</h2>
          {collections.length > 0 && (
            <button type="button" className="you-section-action" onClick={onCreateCollection}>
              + New
            </button>
          )}
        </div>
        {collections.length === 0 ? (
          vouched.length >= MIN_VOUCHED_PLACES_PER_LIST ? (
            <button type="button" className="you-list-empty" onClick={onCreateCollection}>
              <Plus size={16} />
              <div>
                <strong>Start a list</strong>
                <span>Group your vouches — Goa picks, date spots, visitor musts.</span>
              </div>
            </button>
          ) : (
            <p className="you-list-hint">
              Stamp at least {MIN_VOUCHED_PLACES_PER_LIST} places — then you can weave them into shareable lists
              (&ldquo;visitor breakfast,&rdquo; &ldquo;late chai,&rdquo; etc.).
            </p>
          )
        ) : (
          <div className="you-lists">
            {collections.map((c) => (
              <button
                type="button"
                key={c.id}
                className="you-list-card"
                onClick={() => onOpenCollection(c.id)}
              >
                <div className="you-list-thumbs">
                  {c.placeIds.slice(0, 3).map((id) => (
                    <img key={id} src={placeById[id]?.image} alt="" loading="lazy" />
                  ))}
                </div>
                <strong>{c.title}</strong>
                <span>{c.placeIds.length} place{c.placeIds.length === 1 ? "" : "s"}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SettingsView({
  profile,
  draftName,
  setDraftName,
  draftCity,
  setDraftCity,
  draftTags,
  setDraftTags,
  onClose,
  onSave,
  onReset,
  confirmReset,
  setConfirmReset,
  cloudEnabled,
  authEmail,
  authBusy,
  onLinkEmail,
  onSignInEmail
}: {
  profile: UserProfile;
  draftName: string;
  setDraftName: (v: string) => void;
  draftCity: string;
  setDraftCity: (v: string) => void;
  draftTags: string[];
  setDraftTags: (updater: (current: string[]) => string[]) => void;
  onClose: () => void;
  onSave: () => void;
  onReset: () => void;
  confirmReset: boolean;
  setConfirmReset: (v: boolean) => void;
  cloudEnabled: boolean;
  authEmail: string | null;
  authBusy: boolean;
  onLinkEmail: (email: string) => Promise<{ ok: boolean; error?: string }>;
  onSignInEmail: (email: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  return (
    <div className="you-settings">
      <header className="you-settings-head">
        <h2>Edit profile</h2>
        <button type="button" onClick={onClose}>Done</button>
      </header>

      <label className="field">
        <span>Name</span>
        <input
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          placeholder="Your name"
        />
      </label>

      <label className="field">
        <span>City</span>
        <div className="city-row-grid">
          {CITY_OPTIONS.map((city) => (
            <button
              type="button"
              key={city}
              className={draftCity === city ? "city-chip selected" : "city-chip"}
              onClick={() => setDraftCity(city)}
            >
              {draftCity === city && <Check size={13} />}
              {city}
            </button>
          ))}
        </div>
      </label>

      <label className="field">
        <span>Trusted for</span>
        <div className="tag-cloud">
          {TASTE_TAGS.map((tag) => (
            <button
              type="button"
              key={tag}
              className={draftTags.includes(tag) ? "taste-tag active" : "taste-tag"}
              onClick={() =>
                setDraftTags((current) =>
                  current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
                )
              }
            >
              {draftTags.includes(tag) && <Check size={12} />}
              {tag}
            </button>
          ))}
        </div>
      </label>

      <EmailAuthCard
        variant="compact"
        cloudEnabled={cloudEnabled}
        authEmail={authEmail}
        authBusy={authBusy}
        onSaveEmail={onLinkEmail}
        onSignInEmail={onSignInEmail}
      />

      <button
        type="button"
        className="you-settings-save"
        onClick={onSave}
        disabled={draftName.trim().length < 2}
      >
        Save changes
      </button>

      <div className="you-settings-reset">
        {confirmReset ? (
          <>
            <span>This will erase everything.</span>
            <button type="button" onClick={() => setConfirmReset(false)}>Cancel</button>
            <button type="button" className="danger-text" onClick={onReset}>Confirm</button>
          </>
        ) : (
          <button type="button" className="danger-text" onClick={() => setConfirmReset(true)}>
            Start over
          </button>
        )}
      </div>
    </div>
  );
}
