import { useState } from "react";
import { ArrowLeft, Check, Plus, Share2, Stamp } from "lucide-react";
import { CITY_OPTIONS, ONBOARDING_EXAMPLE_IDS, TASTE_TAGS } from "../../data/taste";
import type { Place, UserPlace, UserProfile } from "../../types";

const REQUIRED_VOUCHES = 4;

export function Onboarding({
  step,
  profile,
  userPlaces,
  placeById,
  onProfile,
  onToggleTag,
  onNext,
  onBack,
  onVouch,
  onFinish,
  onShare
}: {
  step: UserProfile["onboardingStep"];
  profile: UserProfile;
  userPlaces: UserPlace[];
  placeById: Record<string, Place>;
  onProfile: (partial: Partial<UserProfile>) => void;
  onToggleTag: (tag: string) => void;
  onNext: () => void;
  onBack: () => void;
  onVouch: (placeId: string) => void;
  onFinish: () => void;
  onShare: () => void;
}) {
  const [celebrating, setCelebrating] = useState(false);
  const vouchCount = userPlaces.filter((p) => p.state === "vouched").length;
  const examplePlaces = ONBOARDING_EXAMPLE_IDS.map((id) => placeById[id]).filter(Boolean);
  const liveTop = userPlaces.filter((p) => p.state === "vouched").slice(0, 4);
  const cityPlaces = Object.values(placeById).filter((p) => p.city === profile.city);

  if (celebrating) {
    const topPreview = liveTop.map((item) => placeById[item.placeId]).filter(Boolean);
    return (
      <div className="onboarding">
        <section className="celebration-screen">
          <div className="celebration-mosaic">
            {topPreview.map((place) => (
              <div className="celebration-tile" key={place.id}>
                <img src={place.image} alt="" />
                <div className="vouch-mosaic-label">
                  <span>{place.area}</span>
                  <strong>{place.name}</strong>
                </div>
              </div>
            ))}
          </div>
          <div className="celebration-copy">
            <h1>Your Vouch is ready.</h1>
            <p>Share it with the people who always ask you where to go.</p>
          </div>
          <button
            type="button"
            className="primary-button celebration-share"
            onClick={() => {
              onFinish();
              setTimeout(onShare, 100);
            }}
          >
            <Share2 size={18} /> Send to a friend
          </button>
          <button
            type="button"
            className="text-link"
            onClick={onFinish}
          >
            Explore my Vouch
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="onboarding">
      {step > 0 && (
        <button type="button" className="quiet-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
      )}

      {step === 0 && (
        <section className="welcome-panel">
          <div className="brand-mark">
            <Stamp size={24} />
          </div>
          <p className="eyebrow">Vouch</p>
          <h1>Your places, ready when friends ask.</h1>
          <p className="lede">
            Four places you'd actually send someone. With a why, not just a name.
          </p>
          <ExampleCard examplePlaces={examplePlaces} />
          <button type="button" className="primary-button" onClick={onNext}>
            Start my Vouch
          </button>
        </section>
      )}

      {step === 1 && (
        <section className="setup-panel">
          <h1>Who's vouching?</h1>
          <p className="lede">Your name shows on everything you share.</p>
          <label className="field">
            <span>First name</span>
            <input
              value={profile.name}
              onChange={(e) => onProfile({ name: e.target.value })}
              placeholder="e.g. Rinkesh"
              autoComplete="given-name"
            />
          </label>
          <div className="setup-section">
            <strong>Where do you go out most?</strong>
            <p>Your catalog starts in one city. You can add more later.</p>
            <div className="city-row-grid">
              {CITY_OPTIONS.map((city) => (
                <button
                  type="button"
                  key={city}
                  className={profile.city === city ? "city-chip selected" : "city-chip"}
                  onClick={() => onProfile({ city })}
                >
                  {profile.city === city && <Check size={13} />}
                  {city}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="primary-button"
            onClick={onNext}
            disabled={profile.name.trim().length < 2}
          >
            Continue
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="setup-panel">
          <h1>What's your thing?</h1>
          <p className="lede">Pick a few. This is what friends will ask you about.</p>
          <div className="tag-cloud onboarding-tags">
            {TASTE_TAGS.map((tag) => (
              <button
                type="button"
                key={tag}
                className={profile.tasteTags.includes(tag) ? "taste-tag active" : "taste-tag"}
                onClick={() => onToggleTag(tag)}
              >
                {profile.tasteTags.includes(tag) && <Check size={12} />}
                {tag}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="primary-button"
            onClick={onNext}
            disabled={profile.tasteTags.length < 2}
          >
            Build my Top 4
          </button>
        </section>
      )}

      {step === 3 && (
        <section className="setup-panel onboarding-vouch-step">
          <h1>Pick your first four</h1>
          <p className="lede">These become your Top 4 — the face of your Vouch profile.</p>
          <div className="progress-line">
            <span style={{ width: `${Math.min(vouchCount, REQUIRED_VOUCHES) * 25}%` }} />
          </div>
          <p className="muted">
            {Math.min(vouchCount, REQUIRED_VOUCHES)} of {REQUIRED_VOUCHES} selected
          </p>
          {liveTop.length > 0 && (
            <div className="live-top-preview">
              <span className="example-label">Your Top 4 so far</span>
              <div className="home-top-preview">
                {liveTop.map((item) => {
                  const place = placeById[item.placeId];
                  if (!place) return null;
                  return <img key={item.placeId} src={place.image} alt={place.name} />;
                })}
              </div>
            </div>
          )}
          <div className="candidate-list">
            {cityPlaces.slice(0, 8).map((place) => {
              const isVouched = userPlaces.some(
                (p) => p.placeId === place.id && p.state === "vouched"
              );
              return (
                <button
                  type="button"
                  className="candidate-row"
                  key={place.id}
                  onClick={() => onVouch(place.id)}
                >
                  <img src={place.image} alt="" />
                  <span>
                    <strong>{place.name}</strong>
                    <small>{place.area} · {place.tags[0]}</small>
                  </span>
                  {isVouched ? <Check size={18} /> : <Plus size={18} />}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="primary-button"
            onClick={() => setCelebrating(true)}
            disabled={vouchCount < REQUIRED_VOUCHES}
          >
            See my Vouch
          </button>
        </section>
      )}
    </div>
  );
}

function ExampleCard({ examplePlaces }: { examplePlaces: Place[] }) {
  return (
    <div className="mini-profile-card labeled-example">
      <span className="example-label">Example profile</span>
      <div className="mini-grid">
        {examplePlaces.map((place) => (
          <div className="mini-place" key={place.id}>
            <img src={place.image} alt="" />
            <span>{place.name}</span>
          </div>
        ))}
      </div>
      <p>Four places. One message. No screenshot collage.</p>
    </div>
  );
}
