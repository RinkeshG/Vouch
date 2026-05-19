import { useMemo, useState } from "react";
import { getWaitlistCount, WaitlistForm } from "./components/WaitlistForm";
import { CONTEXT_MARQUEE, DEMO_PROFILES } from "./demoProfiles";
import "./landing.css";

const HERO_PROFILE = DEMO_PROFILES[0];
const SECONDARY_PROFILE = DEMO_PROFILES[1];
const THIRD_PROFILE = DEMO_PROFILES[2];
const CITIES = ["Bangalore", "Mumbai", "Delhi NCR", "Goa"];
const DEFAULT_TASTE_PLACES = ["Burma Burma", "Muro", "The Conservatory"];

type LandingPov = "pov-1" | "pov-2" | "pov-3" | "pov-4";

type LandingVariant = {
  id: LandingPov;
  label: string;
  navLabel: string;
  mode: "chat" | "identity" | "trust" | "challenge";
  eyebrow: string;
  headline: string;
  subcopy: string;
  cta: string;
  proof: string;
  proofCards: Array<{ label: string; title: string; body: string }>;
  sceneKicker: string;
  sceneTitle: string;
  sceneBody: string;
  formTitle: string;
  formBody: string;
  close: string;
};

const VARIANTS: Record<LandingPov, LandingVariant> = {
  "pov-1": {
    id: "pov-1",
    label: "POV 1: Group chat pain",
    navLabel: "POV 1",
    mode: "chat",
    eyebrow: "For the person everyone texts first",
    headline: "Stop retyping your restaurant list.",
    subcopy:
      "Make one card with the places you actually recommend. Send it whenever the group chat asks where to go.",
    cta: "Make my rec card",
    proof: "Built from a real habit: the same rec, sent again and again.",
    proofCards: [
      {
        label: "Pain",
        title: "Your recs are trapped in chats.",
        body: "Vouch turns the answers you keep typing into one reusable card."
      },
      {
        label: "Object",
        title: "Three places is enough.",
        body: "A small card gets shared. A giant profile gets ignored."
      },
      {
        label: "Loop",
        title: "Friends save, then make theirs.",
        body: "The waitlist grows from useful cards, not vague hype."
      }
    ],
    sceneKicker: "The moment",
    sceneTitle: "“Where should we go?” deserves a better answer.",
    sceneBody:
      "Vouch is the thing you send before the thread turns into screenshots, old pins, and twelve maybes.",
    formTitle: "Join, then make the card you keep needing.",
    formBody: "Early access opens city by city. Start with three places you would send without overthinking.",
    close: "One link for the recs you repeat most."
  },
  "pov-2": {
    id: "pov-2",
    label: "POV 2: Taste as identity",
    navLabel: "POV 2",
    mode: "identity",
    eyebrow: "Your taste should be findable",
    headline: "Your taste deserves a URL.",
    subcopy:
      "Start with three places that say something about you. Vouch makes them public, saveable, and easy to send.",
    cta: "Claim my taste card",
    proof: "Less food diary. More public taste identity.",
    proofCards: [
      {
        label: "Identity",
        title: "A handle for your taste.",
        body: "Your Vouch is the page friends open when they trust your food calls."
      },
      {
        label: "Status",
        title: "Your name changes the rec.",
        body: "The same restaurant means more when it comes signed by someone specific."
      },
      {
        label: "Taste",
        title: "Known for something.",
        body: "Date spots, veg-safe dinners, late-night fixes, parent-proof meals."
      }
    ],
    sceneKicker: "The identity layer",
    sceneTitle: "A better bio than “foodie”.",
    sceneBody:
      "Instagram shows what you ate. Vouch shows what you would put your name behind.",
    formTitle: "Reserve the handle your friends will open.",
    formBody: "Join the beta and create a three-place taste card that feels like yours from the first click.",
    close: "A taste profile should feel worth sending."
  },
  "pov-3": {
    id: "pov-3",
    label: "POV 3: Anti-algorithm trust",
    navLabel: "POV 3",
    mode: "trust",
    eyebrow: "Not another discovery feed",
    headline: "Trust friends, not stars.",
    subcopy:
      "Skip ratings, reels, and SEO lists. Vouch starts with real friends putting their name behind real places.",
    cta: "Join the trusted beta",
    proof: "A friend’s reason beats a thousand anonymous stars.",
    proofCards: [
      {
        label: "Enemy",
        title: "Ratings flatten taste.",
        body: "4.6 stars cannot tell you if it works for a second date or your parents."
      },
      {
        label: "Filter",
        title: "People first, places second.",
        body: "The source of the rec matters as much as the restaurant."
      },
      {
        label: "Signal",
        title: "Context beats popularity.",
        body: "Veg-safe, book-ahead, quiet, chaotic, worth it. That is the useful layer."
      }
    ],
    sceneKicker: "The enemy",
    sceneTitle: "The internet knows what is popular. Your friends know what fits.",
    sceneBody:
      "Vouch is a smaller, sharper feed where trust comes from people, not rankings.",
    formTitle: "Help build the anti-random food graph.",
    formBody: "Join early and bring the people whose taste should outrank the internet.",
    close: "Search less. Borrow better taste."
  },
  "pov-4": {
    id: "pov-4",
    label: "POV 4: Challenge loop",
    navLabel: "POV 4",
    mode: "challenge",
    eyebrow: "A 30-second taste challenge",
    headline: "Name 3 places you’d defend.",
    subcopy:
      "That is your Vouch: a tiny public taste card friends can save, copy, and make their own.",
    cta: "Take the 3-place challenge",
    proof: "Specific enough to make. Social enough to spread.",
    proofCards: [
      {
        label: "Prompt",
        title: "Low effort, high signal.",
        body: "Three restaurants reveal more than a long preference survey."
      },
      {
        label: "Share",
        title: "A card beats a waitlist form.",
        body: "The user leaves with an object, not just a promise."
      },
      {
        label: "Growth",
        title: "“I made mine. Make yours.”",
        body: "The challenge gives people a reason to invite friends immediately."
      }
    ],
    sceneKicker: "The mechanic",
    sceneTitle: "The waitlist becomes the product demo.",
    sceneBody:
      "Before the full app opens, users can still make the first object: a taste card worth sharing.",
    formTitle: "Join, then make yours.",
    formBody: "Claim a spot and create a three-place card your friends can save or copy.",
    close: "Three places. One card. Your name on it."
  }
};

const DEFAULT_VARIANT = VARIANTS["pov-4"];

export function LandingPage() {
  const variant = useMemo(() => getVariantFromPath(), []);
  const [count, setCount] = useState(getWaitlistCount);
  const [joined, setJoined] = useState(false);

  const goWaitlist = () => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className={`signed signed-waitlist signed-waitlist--${variant.mode}`}>
      <header className="signed-nav">
        <a href="/waitlist" className="signed-wordmark" aria-label="Vouch home">
          <span className="signed-wordmark__stamp">V</span>
          <span>Vouch</span>
        </a>
        <nav className="signed-pov-nav" aria-label="Landing page variants">
          {Object.values(VARIANTS).map((item) => (
            <a key={item.id} href={`/waitlist/${item.id}`} aria-current={item.id === variant.id ? "page" : undefined}>
              {item.navLabel}
            </a>
          ))}
        </nav>
        <div className="signed-nav__meta">
          <span>{count.toLocaleString()} early seats</span>
          <a href="/app">Sign in</a>
        </div>
      </header>

      <main>
        <section className="signed-hero" aria-labelledby="landing-headline">
          <div className="signed-hero__copy">
            <p className="signed-kicker">{variant.eyebrow}</p>
            <h1 id="landing-headline">{variant.headline}</h1>
            <p className="signed-hero__sub">{variant.subcopy}</p>
            <div className="signed-hero__actions">
              <button type="button" className="signed-btn signed-btn--primary" onClick={goWaitlist}>
                {variant.cta}
              </button>
              <span className="signed-hero__proof">{variant.proof}</span>
            </div>
          </div>

          <HeroVisual variant={variant} />
        </section>

        <div className="signed-marquee" aria-label="Vouch contexts">
          <div>
            {[...CONTEXT_MARQUEE, ...CONTEXT_MARQUEE].map((context, index) => (
              <span key={`${context}-${index}`}>{context}</span>
            ))}
          </div>
        </div>

        <section className="signed-proof" aria-label={`Why ${variant.label} works`}>
          {variant.proofCards.map((card) => (
            <article key={card.label}>
              <span>{card.label}</span>
              <strong>{card.title}</strong>
              <p>{card.body}</p>
            </article>
          ))}
        </section>

        <section className="signed-social-scene" aria-labelledby="scene-title">
          <div className="signed-social-scene__copy">
            <p className="signed-kicker">{variant.sceneKicker}</p>
            <h2 id="scene-title">{variant.sceneTitle}</h2>
            <p>{variant.sceneBody}</p>
          </div>

          <SceneVisual variant={variant} />
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
            <h2 id="waitlist-title">{variant.formTitle}</h2>
            <p>{variant.formBody}</p>
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
          <p>{variant.close}</p>
          <button type="button" className="signed-btn signed-btn--ghost" onClick={goWaitlist}>
            Make your card
          </button>
        </section>
      </main>

      <footer className="signed-footer">
        <span>vouch.app</span>
        <p>{variant.label}</p>
      </footer>
    </div>
  );
}

function getVariantFromPath(): LandingVariant {
  const path = window.location.pathname.replace(/\/$/, "");
  if (path.endsWith("/pov-1")) return VARIANTS["pov-1"];
  if (path.endsWith("/pov-2")) return VARIANTS["pov-2"];
  if (path.endsWith("/pov-3")) return VARIANTS["pov-3"];
  if (path.endsWith("/pov-4")) return VARIANTS["pov-4"];
  return DEFAULT_VARIANT;
}

function HeroVisual({ variant }: { variant: LandingVariant }) {
  if (variant.mode === "chat") return <ChatHeroVisual />;
  if (variant.mode === "identity") return <IdentityHeroVisual />;
  if (variant.mode === "trust") return <TrustHeroVisual />;
  return <ChallengeHeroVisual />;
}

function ChatHeroVisual() {
  return (
    <div className="signed-hero__stage signed-hero__stage--chat" aria-label="Group chat recommendation preview">
      <div className="signed-chat-window">
        <div className="signed-chat-window__bar">
          <span>Dinner plan</span>
          <b>8:14 PM</b>
        </div>
        <div className="signed-message signed-message--ask">Where should we go tonight?</div>
        <div className="signed-message signed-message--ask signed-message--small">Something date-ish but not painful.</div>
        <div className="signed-message-card">
          <span>@aditi vouched</span>
          <strong>The Conservatory</strong>
          <p>Book the terrace. Looks planned even when it was not.</p>
        </div>
        <div className="signed-message signed-message--reply">Sent my Vouch. Save the 3 you like.</div>
      </div>
    </div>
  );
}

function IdentityHeroVisual() {
  return (
    <div className="signed-hero__stage signed-hero__stage--identity" aria-label="Taste profile preview">
      <div className="signed-identity-card">
        <span>vouch.app/{HERO_PROFILE.handle}</span>
        <strong>{HERO_PROFILE.name}</strong>
        <p>{HERO_PROFILE.tasteLine}</p>
        <div className="signed-identity-grid">
          {HERO_PROFILE.vouches.slice(0, 3).map((vouch) => (
            <figure key={vouch.name}>
              <img src={vouch.image} alt="" />
              <figcaption>{vouch.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="signed-identity-note">Ask me for date spots, veg-safe dinners, and places that feel considered.</div>
    </div>
  );
}

function TrustHeroVisual() {
  return (
    <div className="signed-hero__stage signed-hero__stage--trust" aria-label="Trust versus algorithm preview">
      <div className="signed-trust-board">
        <div className="signed-trust-column signed-trust-column--muted">
          <span>The internet says</span>
          <p>4.6 stars</p>
          <p>Top 10 new places</p>
          <p>Best restaurant near me</p>
        </div>
        <div className="signed-trust-column signed-trust-column--live">
          <span>Your circle says</span>
          <strong>Muro</strong>
          <p>Second-date drinks without shouting over the bar.</p>
          <b>Vouched by Aditi · saved by Rohan</b>
        </div>
      </div>
    </div>
  );
}

function ChallengeHeroVisual() {
  return (
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
  );
}

function SceneVisual({ variant }: { variant: LandingVariant }) {
  if (variant.mode === "identity") {
    return (
      <div className="signed-passport-stack" aria-label="Taste identity examples">
        {[HERO_PROFILE, SECONDARY_PROFILE, THIRD_PROFILE].map((profile) => (
          <div className="signed-passport" key={profile.handle}>
            <span>vouch.app/{profile.handle}</span>
            <strong>{profile.name}</strong>
            <p>{profile.city} · {profile.vouches[0].context}</p>
          </div>
        ))}
      </div>
    );
  }

  if (variant.mode === "trust") {
    return (
      <div className="signed-signal-stack" aria-label="Trusted food signals">
        <div><span>Not useful</span><strong>“Popular near you”</strong></div>
        <div><span>Useful</span><strong>“Priya takes parents here.”</strong></div>
        <div><span>Most useful</span><strong>“Aditi and Rohan both saved this.”</strong></div>
      </div>
    );
  }

  return (
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
