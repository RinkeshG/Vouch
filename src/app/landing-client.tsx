"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { placePhotoUrl } from "@/types";
import s from "./landing.module.css";

interface LandingList {
  id: string;
  title: string;
  description: string | null;
  slug: string | null;
  emoji: string | null;
  coverStyle: number;
  placeCount: number;
  authorHandle: string;
  authorName: string;
  authorAvatarUrl: string | null;
  heroPhotoRef: string | null;
}

interface LandingClientProps {
  lists: LandingList[];
}

const COVER_GRADIENTS = [
  "linear-gradient(135deg, #BF3A2B 0%, #E8614A 100%)",
  "linear-gradient(135deg, #1B4332 0%, #40916C 100%)",
  "linear-gradient(135deg, #1D3557 0%, #457B9D 100%)",
  "linear-gradient(135deg, #7B2D8E 0%, #B56BC8 100%)",
  "linear-gradient(135deg, #C97B1A 0%, #E8B44A 100%)",
];

const SHOWCASE_LISTS = [
  {
    emoji: "☕",
    title: "Best Coffee in Bangalore",
    desc: "From pour-overs to filter kaapi — the spots that keep me caffeinated",
    places: 12,
    saves: 142,
    author: "Priya",
    gradient: COVER_GRADIENTS[0],
    photo: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
  },
  {
    emoji: "🍸",
    title: "Date Night Spots",
    desc: "Candlelit corners and rooftop cocktails worth dressing up for",
    places: 8,
    saves: 89,
    author: "Arjun",
    gradient: COVER_GRADIENTS[1],
    photo: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80",
  },
  {
    emoji: "🌮",
    title: "Street Food Trail",
    desc: "The real Bangalore food tour — VV Puram to Jayanagar",
    places: 15,
    saves: 203,
    author: "Meera",
    gradient: COVER_GRADIENTS[2],
    photo: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  },
  {
    emoji: "🍕",
    title: "Hidden Gems in Indiranagar",
    desc: "Beyond the 12th Main hype — the places only locals know",
    places: 9,
    saves: 67,
    author: "Karthik",
    gradient: COVER_GRADIENTS[3],
    photo: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80",
  },
  {
    emoji: "🥐",
    title: "Weekend Breakfast",
    desc: "Where I go when sleeping in means brunch by 11",
    places: 7,
    saves: 54,
    author: "Nisha",
    gradient: COVER_GRADIENTS[4],
    photo: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80",
  },
  {
    emoji: "🍻",
    title: "Craft Beer Crawl",
    desc: "Koramangala to Whitefield — every taproom worth visiting",
    places: 11,
    saves: 118,
    author: "Rahul",
    gradient: COVER_GRADIENTS[0],
    photo: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&q=80",
  },
];

export function LandingClient({ lists }: LandingClientProps) {
  const hasRealLists = lists.length > 0;
  const [heroList, ...feedLists] = lists;

  return (
    <div className={s.page}>
      {/* ---- Nav ---- */}
      <nav className={s.nav}>
        <span className={s.logo}>Vouch</span>
        <div className={s.navRight}>
          <Link href="/sign-in" className={s.navLink}>
            Sign in
          </Link>
          <Link href="/sign-up">
            <Button variant="seal" size="sm">
              Get started
            </Button>
          </Link>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section className={s.hero}>
        <h1 className={s.heroTitle}>
          Your favorite places,
          <br />
          beautifully listed.
        </h1>
        <p className={s.heroSub}>
          Curate and share lists of the places you love.
          <br />
          Now in Bangalore.
        </p>
        <div className={s.heroCta}>
          <Link href="/sign-up">
            <Button variant="seal" size="lg">
              Create your first list
            </Button>
          </Link>
          <Link href="/explore" className={s.heroExplore}>
            or explore lists →
          </Link>
        </div>
      </section>

      {/* ---- Real lists from the database ---- */}
      {hasRealLists && heroList && (
        <section className={s.feed}>
          <div className={s.sectionHeader}>
            <div className={s.sectionLine} />
            <h2 className={s.sectionTitle}>POPULAR RIGHT NOW</h2>
            <div className={s.sectionLine} />
          </div>
          <ListPreviewCard list={heroList} size="hero" />
          {feedLists.length > 0 && (
            <div className={s.feedGrid}>
              {feedLists.map((list) => (
                <ListPreviewCard key={list.id} list={list} size="standard" />
              ))}
            </div>
          )}
          <div className={s.feedCta}>
            <Link href="/explore">
              <Button variant="secondary" size="md">
                See all lists →
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* ---- Showcase section ---- */}
      <section className={s.feed}>
        <div className={s.sectionHeader}>
          <div className={s.sectionLine} />
          <h2 className={s.sectionTitle}>
            {hasRealLists ? "CURATED WITH CARE" : "WHAT PEOPLE ARE BUILDING"}
          </h2>
          <div className={s.sectionLine} />
        </div>
        <div className={s.feedGrid}>
          {SHOWCASE_LISTS.map((item, i) => (
            <ShowcaseCard key={i} item={item} />
          ))}
        </div>
      </section>

      {/* ---- Value prop ---- */}
      <section className={s.value}>
        <h2 className={s.valueTitle}>Your list starts here</h2>
        <p className={s.valueSub}>
          Share your favorite coffee spots, date night restaurants,
          or hidden bars — with photos, notes, and your personal take.
        </p>
        <div className={s.createMockup}>
          <div className={s.createMockupInput}>
            <span className={s.createMockupPlaceholder}>My favorite coffee spots in Bangalore...</span>
          </div>
          <div className={s.createMockupHint}>↵ to start adding places</div>
        </div>
        <Link href="/sign-up">
          <Button variant="seal" size="lg">
            Start curating
          </Button>
        </Link>
      </section>

      {/* ---- Footer ---- */}
      <footer className={s.footer}>
        <span className={s.footerBrand}>Vouch</span>
        <span className={s.footerNote}>Made in Bangalore</span>
      </footer>
    </div>
  );
}

/* ---- Real list preview card ---- */

function ListPreviewCard({
  list,
  size,
}: {
  list: LandingList;
  size: "hero" | "standard";
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const photoUrl = placePhotoUrl(list.heroPhotoRef, size === "hero" ? 1200 : 800);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setImgLoaded(true);
    }
  }, []);
  const gradient = COVER_GRADIENTS[list.coverStyle] || COVER_GRADIENTS[0];
  const href = list.slug
    ? `/${list.authorHandle}/${list.slug}`
    : "/explore";

  return (
    <Link
      href={href}
      className={`${s.card} ${size === "hero" ? s.cardHero : ""}`}
    >
      <div className={s.cardImage}>
        {photoUrl ? (
          <img
            ref={imgRef}
            src={photoUrl}
            alt={list.title}
            className={`${s.cardPhoto} ${imgLoaded ? s.cardPhotoLoaded : ""}`}
            loading={size === "hero" ? "eager" : "lazy"}
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className={s.cardGradient} style={{ background: gradient }} />
        )}
        <div className={s.cardOverlay} />
        <div className={s.cardAuthor}>
          <Avatar
            handle={list.authorHandle}
            name={list.authorName}
            imageUrl={list.authorAvatarUrl}
            size="xs"
          />
          <span className={s.cardAuthorName}>{list.authorName}</span>
        </div>
      </div>
      <div className={s.cardBody}>
        <h3 className={s.cardTitle}>
          {list.emoji && <span>{list.emoji} </span>}
          {list.title}
        </h3>
        {size === "hero" && list.description && (
          <p className={s.cardDesc}>{list.description}</p>
        )}
        <span className={s.cardMeta}>
          {list.placeCount} places
        </span>
      </div>
    </Link>
  );
}

/* ---- Showcase card ---- */

function ShowcaseCard({
  item,
}: {
  item: typeof SHOWCASE_LISTS[number];
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setImgLoaded(true);
    }
  }, []);

  return (
    <Link
      href="/sign-up"
      className={s.card}
    >
      <div className={s.cardImage}>
        {item.photo ? (
          <img
            ref={imgRef}
            src={item.photo}
            alt={item.title}
            className={`${s.cardPhoto} ${imgLoaded ? s.cardPhotoLoaded : ""}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className={s.cardGradient} style={{ background: item.gradient }} />
        )}
        <div className={s.cardOverlay} />
        <div className={s.cardAuthor}>
          <div className={s.showcaseAvatar}>
            {item.author.charAt(0)}
          </div>
          <span className={s.cardAuthorName}>{item.author}</span>
        </div>
      </div>
      <div className={s.cardBody}>
        <h3 className={s.cardTitle}>
          <span>{item.emoji} </span>
          {item.title}
        </h3>
        <p className={s.cardDesc}>{item.desc}</p>
        <div className={s.cardMeta}>
          <span>{item.places} places</span>
          <span className={s.dot}>·</span>
          <span>{item.saves} saves</span>
        </div>
      </div>
    </Link>
  );
}
