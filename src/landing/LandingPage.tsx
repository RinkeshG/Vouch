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
            <h1 id="landing-headline">Your best food recs deserve a home outside the group chat.</h1>
            <p>
              Save the places you would actually send a friend. Add the why. Share your taste in one clean link.
              No ratings. No noise. Just vouches.
            </p>
            <button type="button" className="signed-btn signed-btn--primary" onClick={goWaitlist}>
              Create your Vouch
            </button>
          </div>

          <HeroProduct />
        </section>

        <section className="signed-break" aria-labelledby="broken-title">
          <CirclePreview />

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

          <div className="signed-shelf-grid">
            {shelfCards.map((card, index) => (
              <article className={`signed-list-card signed-list-card--${index + 1}`} key={card.title}>
                <div className="signed-list-card__top">
                  <span>{card.city}</span>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                </div>
                <h3>{card.title}</h3>
                <ol>
                  {card.places.map((place) => (
                    <li key={place}>{place}</li>
                  ))}
                </ol>
                <p>vouch.app/{["rohan", "aditi", "ishani"][index]}</p>
              </article>
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

function HeroProduct() {
  return (
    <div className="signed-hero-product" aria-label="Vouch public profile preview">
      <div className="signed-product-bar">
        <span>vouch.app/aditi</span>
        <b>Public taste card</b>
      </div>

      <div className="signed-profile-card">
        <div className="signed-profile-card__header">
          <div className="signed-avatar">AR</div>
          <div>
            <strong>Aditi Rao</strong>
            <span>Bangalore · 12 vouches</span>
          </div>
        </div>
        <p>Places I send when someone asks where to go.</p>
        <div className="signed-vouch-stack">
          <article>
            <span>Date night</span>
            <strong>The Conservatory</strong>
            <p>Book the terrace. Looks planned even when it was not.</p>
          </article>
          <article>
            <span>Parents visiting</span>
            <strong>Burma Burma</strong>
            <p>Safe pick when veg and non-fussy both matter.</p>
          </article>
          <article>
            <span>Cocktails</span>
            <strong>Muro</strong>
            <p>Second-date drinks without shouting over the bar.</p>
          </article>
        </div>
      </div>

      <div className="signed-floating-card signed-floating-card--save">
        <span>Rohan saved this</span>
        <strong>“Stealing this for Saturday.”</strong>
      </div>
      <div className="signed-floating-card signed-floating-card--link">
        <span>Share link</span>
        <strong>vouch.app/aditi</strong>
      </div>
    </div>
  );
}

function CirclePreview() {
  return (
    <div className="signed-circle-preview" aria-label="Vouch circle activity preview">
      <div className="signed-phone-shell">
        <div className="signed-phone-top">
          <span>New from your circle</span>
          <b>Vouch</b>
        </div>
        <div className="signed-activity-card signed-activity-card--hot">
          <span>Aditi vouched</span>
          <strong>The Conservatory</strong>
          <p>Terrace table, low-effort impressive, book ahead.</p>
          <button type="button">Save</button>
        </div>
        <div className="signed-activity-row">
          <div className="signed-avatar signed-avatar--small">RM</div>
          <p>Rohan also has this on “client dinners that do not miss”.</p>
        </div>
        <div className="signed-activity-card">
          <span>Ishani made a list</span>
          <strong>One-day Bangalore</strong>
          <p>3 places · copied by 8 friends</p>
        </div>
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
