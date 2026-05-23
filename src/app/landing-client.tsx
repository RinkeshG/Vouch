"use client";

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

export function LandingClient({ lists }: LandingClientProps) {
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

      {/* ---- Featured list (show, don't describe) ---- */}
      {heroList && (
        <section className={s.featured}>
          <ListPreviewCard list={heroList} size="hero" />
        </section>
      )}

      {/* ---- Live feed preview ---- */}
      {feedLists.length > 0 && (
        <section className={s.feed}>
          <h2 className={s.feedHeading}>Discover what people are sharing</h2>
          <div className={s.feedGrid}>
            {feedLists.map((list) => (
              <ListPreviewCard key={list.id} list={list} size="standard" />
            ))}
          </div>
          <div className={s.feedCta}>
            <Link href="/explore">
              <Button variant="secondary" size="md">
                See all lists →
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* ---- Value prop ---- */}
      <section className={s.value}>
        <h2 className={s.valueTitle}>Your list starts here</h2>
        <p className={s.valueSub}>
          Share your favorite coffee spots, date night restaurants,
          or hidden bars — with photos, notes, and your personal take.
        </p>
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

/* ---- List preview card (reused for hero + feed) ---- */

function ListPreviewCard({
  list,
  size,
}: {
  list: LandingList;
  size: "hero" | "standard";
}) {
  const photoUrl = placePhotoUrl(list.heroPhotoRef, size === "hero" ? 1200 : 800);
  const gradient = COVER_GRADIENTS[list.coverStyle] || COVER_GRADIENTS[0];
  const href = list.slug
    ? `/@${list.authorHandle}/${list.slug}`
    : "/explore";

  return (
    <Link
      href={href}
      className={`${s.card} ${size === "hero" ? s.cardHero : ""}`}
    >
      <div className={s.cardImage}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={list.title}
            className={s.cardPhoto}
            loading={size === "hero" ? "eager" : "lazy"}
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
          {list.placeCount} place{list.placeCount !== 1 ? "s" : ""}
        </span>
      </div>
    </Link>
  );
}
