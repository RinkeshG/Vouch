import { useState } from "react";
import { getWaitlistCount, WaitlistForm } from "./components/WaitlistForm";
import { CONTEXT_MARQUEE, DEMO_PROFILES } from "./demoProfiles";
import "./landing.css";

const HERO_PROFILE = DEMO_PROFILES[0];
const SECONDARY_PROFILE = DEMO_PROFILES[1];
const CITIES = ["Bangalore", "Mumbai", "Delhi NCR", "Goa"];

export function LandingPage() {
  const [count, setCount] = useState(getWaitlistCount);

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
            <p className="signed-kicker">Private beta for people friends ask first</p>
            <h1 id="landing-headline">Put your name on the places worth sending.</h1>
            <p className="signed-hero__sub">
              Vouch turns your restaurant taste into a public profile, useful lists, and a circle of
              recommendations that feel better than searching.
            </p>
            <div className="signed-hero__actions">
              <button type="button" className="signed-btn signed-btn--primary" onClick={goWaitlist}>
                Claim early access
              </button>
              <span className="signed-hero__proof">No ratings. No influencer noise. Just people you trust.</span>
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
            <span>01</span>
            <strong>Your taste becomes a link.</strong>
            <p>Not a note in your phone. A public Vouch people can open, save from, and trust.</p>
          </article>
          <article>
            <span>02</span>
            <strong>Your circle beats search.</strong>
            <p>See what friends stand behind, what they saved, and which places are gaining heat.</p>
          </article>
          <article>
            <span>03</span>
            <strong>Your lists travel.</strong>
            <p>First dates, parents visiting, veg-safe dinners. Built for the actual ask.</p>
          </article>
        </section>

        <section className="signed-social-scene" aria-labelledby="scene-title">
          <div className="signed-social-scene__copy">
            <p className="signed-kicker">The group chat problem</p>
            <h2 id="scene-title">Everyone asks where to go. Nobody wants another search result.</h2>
            <p>
              Vouch is for the person whose restaurant text gets forwarded. It gives that instinct
              a home, a handle, and a way to spread.
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
            <h2 id="waitlist-title">Get in before your food circle does.</h2>
            <p>
              Early access is opening to small city circles first, so the feed starts with real
              taste instead of empty profiles.
            </p>
            <WaitlistForm onSuccess={() => setCount(getWaitlistCount())} />
            <div className="signed-city-row" aria-label="Launch cities">
              {CITIES.map((city) => (
                <span key={city}>{city}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="signed-close" aria-label="Vouch promise">
          <p>Vouch is not for every restaurant. It is for the ones you would put your name behind.</p>
          <button type="button" className="signed-btn signed-btn--ghost" onClick={goWaitlist}>
            Claim your spot
          </button>
        </section>
      </main>

      <footer className="signed-footer">
        <span>vouch.app</span>
        <p>Where restaurant taste becomes social proof.</p>
      </footer>
    </div>
  );
}
