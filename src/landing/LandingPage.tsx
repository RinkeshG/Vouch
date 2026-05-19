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
    <div className="signed-taste-object" aria-label="Vouch public taste profile preview">
      <div className="signed-taste-object__url">vouch.app/aditi</div>
      <div className="signed-taste-object__identity">
        <div className="signed-avatar">AR</div>
        <div>
          <strong>Aditi Rao</strong>
          <span>Bangalore · date spots, veg-safe dinners, places that feel considered</span>
        </div>
      </div>

      <div className="signed-vouch-collage">
        <article className="signed-vouch-card signed-vouch-card--hero">
          <div className="signed-vouch-visual">
            <span className="signed-stamp">V</span>
            <b>TC</b>
          </div>
          <span>Date night</span>
          <strong>The Conservatory</strong>
          <p>Book the terrace. Looks planned even when it was not.</p>
          <small>8 friends saved this</small>
        </article>
        <article className="signed-vouch-card signed-vouch-card--left">
          <div className="signed-vouch-visual signed-vouch-visual--small">
            <b>BB</b>
          </div>
          <span>Parents visiting</span>
          <strong>Burma Burma</strong>
          <p>Safe pick when veg and non-fussy both matter.</p>
        </article>
        <article className="signed-vouch-card signed-vouch-card--right">
          <div className="signed-vouch-visual signed-vouch-visual--small">
            <b>MU</b>
          </div>
          <span>Cocktails</span>
          <strong>Muro</strong>
          <p>Second-date drinks without shouting over the bar.</p>
        </article>
      </div>

      <div className="signed-taste-object__proof">
        <span>Rohan saved Aditi's Vouch</span>
        <span>Ishani copied 2 places</span>
        <span>Shared in Dinner plan · 8:14 PM</span>
      </div>
    </div>
  );
}

function WebActivityPreview() {
  return (
    <div className="signed-social-loop" aria-label="Vouch social loop preview">
      <div className="signed-chat-line signed-chat-line--question">Where should we go tonight?</div>
      <div className="signed-shared-vouch">
        <div className="signed-shared-vouch__top">
          <span>Aditi's Vouch</span>
          <b>vouch.app/aditi</b>
        </div>
        <div className="signed-vouch-visual signed-vouch-visual--wide">
          <span className="signed-stamp">V</span>
          <b>TC</b>
        </div>
        <strong>The Conservatory</strong>
        <p>Terrace table, low-effort impressive, book ahead.</p>
        <div>
          <button type="button">Save</button>
          <span>Rohan + Ishani saved this</span>
        </div>
      </div>
      <div className="signed-chat-line signed-chat-line--reply">This is exactly the kind of place I meant.</div>
    </div>
  );
}

function ShelfProductBoard() {
  return (
    <div className="signed-public-shelf" aria-label="Vouch public shelf preview">
      <div className="signed-public-shelf__mast">
        <span>vouch.app/aditi</span>
        <strong>Aditi's public shelf</strong>
        <p>Lists friends can steal, save, and send.</p>
      </div>

      <div className="signed-shelf-strip">
        {shelfCards.map((card, index) => (
          <article className={`signed-shelf-card signed-shelf-card--${index + 1}`} key={card.title}>
            <div className="signed-list-cover" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="signed-shelf-card__top">
              <span>{card.city}</span>
              <b>{["Rohan saved", "38 saves", "New"][index]}</b>
            </div>
            <h3>{card.title}</h3>
            <ol>
              {card.places.map((place) => (
                <li key={place}>{place}</li>
              ))}
            </ol>
            <footer>
              <span>{index === 1 ? "Copy this list" : "Save to your Vouch"}</span>
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
