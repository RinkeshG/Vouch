import { useState } from "react";
import { getWaitlistCount, WaitlistForm } from "./components/WaitlistForm";
import "./landing.css";

const shelfCards = [
  {
    city: "Mumbai",
    title: "Where I take people I like",
    places: ["Americano", "The Bombay Canteen", "Seefah"]
  },
  {
    city: "Bangalore",
    title: "Parents visiting, no panic",
    places: ["Burma Burma", "The Conservatory", "Naru Noodle Bar"]
  },
  {
    city: "Goa",
    title: "Not the obvious Goa list",
    places: ["Gunpowder", "Miguels", "For The Record"]
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
            <h1 id="landing-headline">Your food taste, made social.</h1>
            <p>
              Vouch for the places you would actually send people to. Share your taste when someone asks where
              to go.
            </p>
            <button type="button" className="signed-btn signed-btn--primary" onClick={goWaitlist}>
              Build my Vouch
            </button>
          </div>

          <HeroProduct />
        </section>

        <section className="signed-break" aria-labelledby="broken-title">
          <WebActivityPreview />

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

          <ShelfProductBoard />
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

function HeroProduct() {
  return (
    <div className="signed-hero-world" aria-label="Vouch signed recommendation flow">
      <div className="signed-thread-card">
        <span>Dinner plan · 8:14 PM</span>
        <p>Where should we go tonight?</p>
        <p>Something date-ish, but not try-hard.</p>
      </div>

      <article className="signed-vouch-note">
        <div className="signed-note-top">
          <span>vouch.app/aditi</span>
          <b className="signed-stamp">V</b>
        </div>
        <div className="signed-note-person">
          <div className="signed-avatar">AR</div>
          <div>
            <strong>Aditi Rao</strong>
            <span>Bangalore · date spots · veg-safe groups</span>
          </div>
        </div>
        <h2>Three places I’d actually send you to.</h2>
        <ol className="signed-note-list">
          <li>
            <b>01</b>
            <div>
              <strong>The Conservatory</strong>
              <p>Book the terrace. Looks planned even when it was not.</p>
            </div>
            <span>Date night</span>
          </li>
          <li>
            <b>02</b>
            <div>
              <strong>Burma Burma</strong>
              <p>Safe when veg and non-fussy both matter.</p>
            </div>
            <span>Parents</span>
          </li>
          <li>
            <b>03</b>
            <div>
              <strong>Muro</strong>
              <p>Second-date drinks without shouting over the bar.</p>
            </div>
            <span>Cocktails</span>
          </li>
        </ol>
        <footer>
          <span>Signed by @aditi</span>
          <span>Saved by Rohan + Ishani</span>
        </footer>
      </article>

      <div className="signed-send-card">
        <span>Sent to group chat</span>
        <strong>Aditi’s Vouch</strong>
        <p>One link. Three places. Her name on it.</p>
      </div>
    </div>
  );
}

function WebActivityPreview() {
  return (
    <div className="signed-trust-theater" aria-label="Vouch trust signal preview">
      <div className="signed-noise-stack" aria-label="Broken discovery examples">
        <article>
          <span>Google</span>
          <strong>4.6 stars</strong>
          <p>Anonymous. Context missing.</p>
        </article>
        <article>
          <span>Instagram</span>
          <strong>Saved reel</strong>
          <p>Gone when you need it.</p>
        </article>
        <article>
          <span>SEO list</span>
          <strong>Top 10</strong>
          <p>Everyone, therefore no one.</p>
        </article>
      </div>
      <article className="signed-friend-take">
        <span>Because Aditi vouched</span>
        <strong>“Book the terrace. Looks planned even when it was not.”</strong>
        <p>The Conservatory · Date night · Saved by 8 friends</p>
        <button type="button">Save from Aditi</button>
      </article>
    </div>
  );
}

function ShelfProductBoard() {
  return (
    <div className="signed-shelf-book" aria-label="Vouch public shelf preview">
      <aside>
        <span>vouch.app/aditi</span>
        <strong>Aditi’s shelf</strong>
        <p>Not every saved place. Just the ones she would put her name behind.</p>
      </aside>
      <div className="signed-shelf-pages">
        {shelfCards.map((card, index) => (
          <article className={`signed-shelf-page signed-shelf-page--${index + 1}`} key={card.title}>
            <span>{card.city}</span>
            <h3>{card.title}</h3>
            <ol>
              {card.places.map((place) => (
                <li key={place}>{place}</li>
              ))}
            </ol>
            <footer>
              <span>{["Rohan saved", "38 saves", "New"][index]}</span>
              <b>{index === 1 ? "Copy list" : "Save"}</b>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}

function TastePreview() {
  return (
    <article className="signed-taste-preview" aria-label="Example Vouch taste card">
      <div className="signed-taste-preview__person">
        <div className="signed-avatar signed-avatar--small">IS</div>
        <div>
          <strong>Ishani</strong>
          <span>The taste friend</span>
        </div>
      </div>
      <span className="signed-stamp signed-stamp--mini">V</span>
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
