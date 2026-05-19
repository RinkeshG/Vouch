import { useState } from "react";
import { getWaitlistCount, WaitlistForm } from "./components/WaitlistForm";
import { DEMO_PROFILES } from "./demoProfiles";
import "./landing.css";

const heroImage =
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1800&q=84";
const phoneImage =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=84";

const shelfPlaces = [
  {
    city: "Mumbai",
    name: "Date night at Americano",
    image: "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?auto=format&fit=crop&w=720&q=84"
  },
  {
    city: "Bangalore",
    name: "Sunday comfort food",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=720&q=84"
  },
  {
    city: "Goa",
    name: "The hidden gem",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=720&q=84"
  }
];

const starterPlaces = ["The Conservatory", "Burma Burma", "Muro"];

export function LandingPage() {
  const [count, setCount] = useState(getWaitlistCount);
  const [joined, setJoined] = useState(false);

  const goWaitlist = () => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="signed signed-waitlist">
      <header className="signed-nav">
        <a href="/waitlist" className="signed-wordmark" aria-label="Vouch home">
          Vouch
        </a>
        <button type="button" className="signed-nav__button" onClick={goWaitlist}>
          Join waitlist
        </button>
      </header>

      <main>
        <section className="signed-hero" aria-labelledby="landing-headline">
          <div className="signed-hero__copy">
            <h1 id="landing-headline">Your best food recs deserve a home outside the group chat.</h1>
            <p>
              Save the places you would actually send a friend. Add the why. Share your taste in one clean link.
              No ratings. No noise. Just vouches.
            </p>
            <button type="button" className="signed-btn signed-btn--primary" onClick={goWaitlist}>
              Create your Vouch
            </button>
          </div>

          <figure className="signed-hero__image">
            <img src={heroImage} alt="A shared dinner table after a meal" />
          </figure>
        </section>

        <section className="signed-break" aria-labelledby="broken-title">
          <div className="signed-phone-scene" aria-hidden="true">
            <img src={phoneImage} alt="" />
            <div className="signed-phone-card">
              <span>Saved from Aditi</span>
              <strong>The Conservatory</strong>
              <p>Book the terrace. Looks planned even when it was not.</p>
            </div>
          </div>

          <div className="signed-section-copy">
            <span className="signed-kicker">Why Vouch</span>
            <h2 id="broken-title">The internet broke food discovery.</h2>
            <p>
              Ratings are anonymous. Reels disappear. Map pins pile up. But friends still ask you where to go,
              because your taste means something.
            </p>
          </div>
        </section>

        <section className="signed-shelf" aria-labelledby="shelf-title">
          <div className="signed-section-copy signed-section-copy--wide">
            <span className="signed-kicker">What you keep</span>
            <h2 id="shelf-title">A public shelf for the places you stand behind.</h2>
            <p>
              Not a food diary. Not a review page. A small, opinionated collection of places you would put your
              name on.
            </p>
          </div>

          <div className="signed-place-grid">
            {shelfPlaces.map((place, index) => (
              <figure className={`signed-place signed-place--${index + 1}`} key={place.name}>
                <img src={place.image} alt="" />
                <figcaption>
                  <span>{place.city}</span>
                  {place.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="signed-proof" aria-labelledby="proof-title">
          <div className="signed-section-copy">
            <span className="signed-kicker">The share object</span>
            <h2 id="proof-title">Your proof of taste.</h2>
            <p>
              Start with three places you would send a friend today. That tiny card becomes your public Vouch.
            </p>
          </div>

          <TastePreview />
        </section>

        <section className="signed-access" id="waitlist" aria-labelledby="waitlist-title">
          <div className="signed-access__inner">
            <p className="signed-kicker">Early access</p>
            <h2 id="waitlist-title">Good taste is better shared.</h2>
            <p>
              Invite the people whose recommendations you actually trust. We are opening the first circles city
              by city.
            </p>
            <WaitlistForm
              onSuccess={() => {
                setCount(getWaitlistCount());
                setJoined(true);
              }}
            />
            <p className="signed-access__count">{count.toLocaleString()} people saving their spot.</p>
            {joined && <TasteCardMaker />}
          </div>
        </section>
      </main>

      <footer className="signed-footer">
        <span>Vouch</span>
        <nav aria-label="Footer">
          <a href="/waitlist">Mission</a>
          <a href="/waitlist">Privacy</a>
          <a href="/app">Sign in</a>
        </nav>
        <p>Built for the places people actually vouch for.</p>
      </footer>
    </div>
  );
}

function TastePreview() {
  return (
    <article className="signed-taste-preview" aria-label="Example Vouch taste card">
      <div className="signed-taste-preview__person">
        <img src={DEMO_PROFILES[0].vouches[0].image} alt="" />
        <div>
          <strong>Ishani</strong>
          <span>The taste friend</span>
        </div>
      </div>
      <p>If I had one day...</p>
      <ol>
        {starterPlaces.map((place, index) => (
          <li key={place}>
            <span>{place}</span>
            <small>{["Bangalore", "Indiranagar", "Museum Road"][index]}</small>
          </li>
        ))}
      </ol>
      <a href="/waitlist" onClick={(event) => event.preventDefault()}>
        vouch.app/ishani
      </a>
    </article>
  );
}

function TasteCardMaker() {
  const [name, setName] = useState("Aditi");
  const [handle, setHandle] = useState("aditi");
  const [places, setPlaces] = useState(starterPlaces);
  const [copied, setCopied] = useState(false);

  const cleanHandle = handle.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  const filledPlaces = places.map((place) => place.trim()).filter(Boolean);
  const shareText = [
    `${name.trim() || "I"} made a Vouch:`,
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
    <div className="signed-taste-maker" aria-label="Create your first Vouch card">
      <div className="signed-taste-maker__form">
        <p className="signed-kicker">Make yours</p>
        <strong>Three places. One link.</strong>
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
        <strong>{name.trim() || "Your"}'s Vouch</strong>
        <div>
          {places.map((place, index) => (
            <p key={index}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              {place.trim() || `Place ${index + 1}`}
            </p>
          ))}
        </div>
        <button type="button" className="signed-btn signed-btn--primary" onClick={copyTasteCard}>
          {copied ? "Copied" : "Copy card"}
        </button>
      </div>
    </div>
  );
}
