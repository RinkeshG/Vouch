import { useState } from "react";
import { getWaitlistCount, WaitlistForm } from "./components/WaitlistForm";
import { CONTEXT_MARQUEE, DEMO_PROFILES } from "./demoProfiles";
import "./landing.css";

const HERO_PROFILE = DEMO_PROFILES[0];
const SECONDARY_PROFILE = DEMO_PROFILES[1];
const CITIES = ["Bangalore", "Mumbai", "Delhi NCR", "Goa"];
const DEFAULT_TASTE_PLACES = ["Burma Burma", "Muro", "The Conservatory"];

export function LandingPage() {
  const [count, setCount] = useState(getWaitlistCount);
  const [joined, setJoined] = useState(false);

  const goWaitlist = () => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="signed signed-waitlist">
      <header className="signed-nav">
        <a href="/" className="signed-wordmark" aria-label="Vouch home">
          <span className="signed-wordmark__stamp">V</span>
          <span>Vouch</span>
        </a>
        <div className="signed-nav__meta">
          <span>{count.toLocaleString()} early seats</span>
          <a href="/app">Sign in</a>
        </div>
      </header>

      <main>
        <section className="signed-hero" aria-labelledby="landing-headline">
          <div className="signed-hero__copy">
            <p className="signed-kicker">Private beta</p>
            <h1 id="landing-headline">The places you swear by, in one link.</h1>
            <p className="signed-hero__sub">
              Your best restaurant recs are buried in chats, stories, and map pins.
              Vouch turns three places you actually stand behind into a taste card friends can save.
            </p>
            <div className="signed-hero__actions">
              <button type="button" className="signed-btn signed-btn--primary" onClick={goWaitlist}>
                Make my 3-place card
              </button>
              <span className="signed-hero__proof">No ratings. No influencer lists. Just taste with a name on it.</span>
            </div>
          </div>

          <div className="signed-hero__stage" aria-label="Vouch product preview">
            <div className="signed-phone-card">
              <div className="signed-phone-card__top">
                <span>Tonight through your circle</span>
                <b>@{HERO_PROFILE.handle}</b>
              </div>
              <div className="signed-taste-card">
                <div className="signed-taste-card__image">
                  <img src={HERO_PROFILE.vouches[0].image} alt="" />
                  <span className="signed-stamp-mark">V</span>
                </div>
                <div className="signed-taste-card__body">
                  <span>{HERO_PROFILE.vouches[0].context}</span>
                  <strong>{HERO_PROFILE.vouches[0].name}</strong>
                  <p>{HERO_PROFILE.vouches[0].take}</p>
                </div>
              </div>
              <div className="signed-feed-signal">
                <span>Aditi and Rohan both vouch for this.</span>
                <b>Save before the table gets booked.</b>
              </div>
            </div>

            <div className="signed-profile-slip">
              <div>
                <span>vouch.app/{HERO_PROFILE.handle}</span>
                <strong>{HERO_PROFILE.name}</strong>
                <p>{HERO_PROFILE.tasteLine}</p>
              </div>
              <div className="signed-mini-grid">
                {HERO_PROFILE.vouches.slice(1, 4).map((vouch) => (
                  <img key={vouch.name} src={vouch.image} alt="" />
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="signed-marquee" aria-label="Vouch contexts">
          <div>
            {[...CONTEXT_MARQUEE, ...CONTEXT_MARQUEE].map((context, index) => (
              <span key={`${context}-${index}`}>{context}</span>
            ))}
          </div>
        </div>

        <section className="signed-proof" aria-label="Why Vouch">
          <article>
            <span>Taste card</span>
            <strong>Three places. Your name on them.</strong>
            <p>Start with the spots you keep sending anyway.</p>
          </article>
          <article>
            <span>Lists</span>
            <strong>Plans, not folders.</strong>
            <p>First dates. Parents visiting. Veg-safe dinners.</p>
          </article>
          <article>
            <span>Circle</span>
            <strong>Your friends become the filter.</strong>
            <p>Borrow taste from people you would actually text.</p>
          </article>
        </section>

        <section className="signed-social-scene" aria-labelledby="scene-title">
          <div className="signed-social-scene__copy">
            <p className="signed-kicker">The real use case</p>
            <h2 id="scene-title">“Where should we go?” should not start from zero.</h2>
            <p>
              If your restaurant texts get forwarded, Vouch gives that instinct a home.
              Friends can open your card, save your places, and make their own.
            </p>
          </div>

          <div className="signed-chat-stack" aria-label="Example group chat">
            <div className="signed-chat signed-chat--question">Where should we go for dinner?</div>
            <div className="signed-chat signed-chat--answer">
              <span>@{HERO_PROFILE.handle} vouched</span>
              <strong>{HERO_PROFILE.vouches[1].name}</strong>
              <p>{HERO_PROFILE.vouches[1].take}</p>
            </div>
            <div className="signed-chat signed-chat--answer signed-chat--offset">
              <span>@{SECONDARY_PROFILE.handle} made a list</span>
              <strong>Client dinners that do not miss</strong>
              <p>7 places. 3 saved by your circle.</p>
            </div>
          </div>
        </section>

        <section className="signed-access" id="waitlist" aria-labelledby="waitlist-title">
          <div className="signed-access__visual" aria-hidden="true">
            <div className="signed-access-card signed-access-card--front">
              <span>Claiming now</span>
              <strong>vouch.app/yourname</strong>
              <p>Reserved handles will open city by city.</p>
            </div>
            <div className="signed-access-card signed-access-card--back">
              <span>Early circle</span>
              <strong>{count.toLocaleString()} people</strong>
              <p>Bangalore, Mumbai, Delhi NCR, Goa.</p>
            </div>
          </div>

          <div className="signed-access__form">
            <p className="signed-kicker">Join the waitlist</p>
            <h2 id="waitlist-title">Claim your handle. Make your first card.</h2>
            <p>
              Early access opens by city. Join now, then make the three-place card your friends
              can actually use.
            </p>
            <WaitlistForm
              onSuccess={() => {
                setCount(getWaitlistCount());
                setJoined(true);
              }}
            />
            {joined && <TasteCardMaker />}
            <div className="signed-city-row" aria-label="Launch cities">
              {CITIES.map((city) => (
                <span key={city}>{city}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="signed-close" aria-label="Vouch promise">
          <p>Stop sending the same restaurant text twice.</p>
          <button type="button" className="signed-btn signed-btn--ghost" onClick={goWaitlist}>
            Make your card
          </button>
        </section>
      </main>

      <footer className="signed-footer">
        <span>vouch.app</span>
        <p>A home for the places people ask you for.</p>
      </footer>
    </div>
  );
}

function TasteCardMaker() {
  const [name, setName] = useState("Aditi");
  const [handle, setHandle] = useState("aditi");
  const [places, setPlaces] = useState(DEFAULT_TASTE_PLACES);
  const [copied, setCopied] = useState(false);

  const cleanHandle = handle.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  const filledPlaces = places.map((place) => place.trim()).filter(Boolean);
  const shareText = [
    `${name.trim() || "Someone"} made a Vouch taste card:`,
    ...filledPlaces.map((place, index) => `${index + 1}. ${place}`),
    `vouch.app/${cleanHandle || "yourname"}`
  ].join("\n");

  const updatePlace = (index: number, value: string) => {
    setPlaces((current) => current.map((place, i) => (i === index ? value : place)));
  };

  const copyTasteCard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="signed-taste-maker" aria-label="Create your taste card">
      <div className="signed-taste-maker__form">
        <p className="signed-kicker">Your first share object</p>
        <strong>Make your first card.</strong>
        <label>
          <span>Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          <span>Handle</span>
          <input value={handle} onChange={(event) => setHandle(event.target.value)} />
        </label>
        {places.map((place, index) => (
          <label key={index}>
            <span>Place {index + 1}</span>
            <input value={place} onChange={(event) => updatePlace(index, event.target.value)} />
          </label>
        ))}
      </div>

      <div className="signed-tiny-card">
        <span>vouch.app/{cleanHandle || "yourname"}</span>
        <strong>{name.trim() || "Your"}'s taste card</strong>
        <div>
          {places.map((place, index) => (
            <p key={index}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              {place.trim() || `Place ${index + 1}`}
            </p>
          ))}
        </div>
        <button type="button" className="signed-btn signed-btn--primary" onClick={copyTasteCard}>
          {copied ? "Copied" : "Copy taste card"}
        </button>
      </div>
    </div>
  );
}
