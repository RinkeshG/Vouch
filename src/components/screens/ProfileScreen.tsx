import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { CITY_OPTIONS, TASTE_TAGS } from "../../data/taste";
import { tasteBio } from "../../lib/format";
import type { Collection, Place, UserPlace, UserProfile } from "../../types";
import { EmptyState } from "../ui/EmptyState";
import { PlaceCard } from "../ui/PlaceCard";
import { SectionTitle } from "../ui/SectionTitle";

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
  onReset
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
}) {
  const [editingSettings, setEditingSettings] = useState(false);
  const [draftName, setDraftName] = useState(profile.name);
  const [draftCity, setDraftCity] = useState(profile.city);
  const [draftTags, setDraftTags] = useState<string[]>([...profile.tasteTags]);
  const [confirmReset, setConfirmReset] = useState(false);

  function openSettings() {
    setDraftName(profile.name);
    setDraftCity(profile.city);
    setDraftTags([...profile.tasteTags]);
    setEditingSettings(true);
  }

  function saveSettings() {
    onUpdateProfile({ name: draftName, city: draftCity, tasteTags: draftTags });
    setEditingSettings(false);
  }

  function toggleTag(tag: string) {
    setDraftTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    );
  }

  return (
    <div className="content-stack profile-screen">
      <section className="profile-hero">
        <div className="profile-topline">
          <div className="profile-avatar">
            {(profile.name || "Y").trim().charAt(0).toUpperCase()}
          </div>
          <button type="button" className="small-button" onClick={onShare}>
            <Share2 size={14} /> Share
          </button>
        </div>
        <p className="eyebrow">{profile.city}</p>
        <h2>{profile.name}'s Vouch</h2>
        {profile.handle && <p className="profile-handle">vouch.app/u/{profile.handle}</p>}
        <p className="profile-bio">{tasteBio(profile.tasteTags)}</p>
      </section>

      <section className="impact-strip">
        <div>
          <strong>{vouched.length}</strong>
          <span>vouched</span>
        </div>
        <div>
          <strong>{savesFromFriends}</strong>
          <span>from friends</span>
        </div>
        <div>
          <strong>{collections.length}</strong>
          <span>lists</span>
        </div>
      </section>

      <SectionTitle title="Top 4" action="Reorder" onAction={onOpenTopFour} />
      {topPlaces.length === 0 ? (
        <EmptyState icon={<Share2 size={18} />}>
          <p>Vouch at least four places to unlock your Top 4.</p>
        </EmptyState>
      ) : (
        <div className="stack-list">
          {topPlaces.map((item, index) => {
            const place = placeById[item.placeId];
            if (!place) return null;
            return (
              <PlaceCard
                key={item.placeId}
                place={place}
                userPlace={item}
                onClick={() => onOpenPlace(item.placeId)}
                index={index + 1}
                stamped
              />
            );
          })}
        </div>
      )}

      <SectionTitle title="Collections" action="New" onAction={onCreateCollection} />
      {collections.length === 0 ? (
        <EmptyState icon={<Share2 size={18} />}>
          <p>Group places into themed lists — date spots, brunch picks, visitor musts.</p>
        </EmptyState>
      ) : (
        <div className="stack-list">
          {collections.map((collection) => (
            <button
              type="button"
              className="collection-wide-card"
              key={collection.id}
              onClick={() => onOpenCollection(collection.id)}
            >
              <div className="collection-preview">
                {collection.placeIds.slice(0, 3).map((id) => (
                  <img src={placeById[id]?.image} alt="" key={id} />
                ))}
              </div>
              <div>
                <strong>{collection.title}</strong>
                <p>{collection.note}</p>
              </div>
              <span className="mini-stamp">{collection.placeIds.length} places</span>
            </button>
          ))}
        </div>
      )}

      <SectionTitle
        title="Settings"
        action={editingSettings ? undefined : "Edit"}
        onAction={editingSettings ? undefined : openSettings}
      />

      {editingSettings ? (
        <div className="inline-edit-form">
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
            <span>Taste tags</span>
            <div className="tag-cloud">
              {TASTE_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={draftTags.includes(tag) ? "taste-tag active" : "taste-tag"}
                  onClick={() => toggleTag(tag)}
                >
                  {draftTags.includes(tag) && <Check size={12} />}
                  {tag}
                </button>
              ))}
            </div>
          </label>
          <div className="dual-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setEditingSettings(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={saveSettings}
              disabled={draftName.trim().length < 2}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <section className="settings-section">
          <div className="settings-row">
            <strong>Name</strong>
            <span>{profile.name}</span>
          </div>
          <div className="settings-row">
            <strong>City</strong>
            <span>{profile.city}</span>
          </div>
          <div className="settings-row">
            <strong>Taste</strong>
            <span>{profile.tasteTags.slice(0, 3).join(", ")}</span>
          </div>
          <div className="settings-row">
            <strong>Reset</strong>
            {confirmReset ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setConfirmReset(false)}>
                  Cancel
                </button>
                <button type="button" className="danger-text" onClick={onReset}>
                  Confirm reset
                </button>
              </div>
            ) : (
              <button type="button" className="danger-text" onClick={() => setConfirmReset(true)}>
                Start over
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
