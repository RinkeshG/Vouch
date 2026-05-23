"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ShareRow } from "@/components/app/share-row";
import { placePhotoUrl } from "@/types";
import styles from "./list-view.module.css";

/* ---- Types ---- */

interface ListInfo {
  title: string;
  description: string | null;
  emoji: string | null;
  coverStyle: number;
  placeCount: number;
  createdAt: string;
}

interface PlaceItem {
  id: string;
  name: string;
  area: string;
  cuisines: string[];
  photoRef: string | null;
  note: string | null;
  position: number;
}

interface Author {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  city: string;
}

interface ListViewClientProps {
  list: ListInfo;
  places: PlaceItem[];
  author: Author;
  slug: string;
  isOwner: boolean;
}

const COVER_GRADIENTS = [
  "linear-gradient(135deg, #BF3A2B 0%, #E8614A 100%)",
  "linear-gradient(135deg, #1B4332 0%, #40916C 100%)",
  "linear-gradient(135deg, #1D3557 0%, #457B9D 100%)",
  "linear-gradient(135deg, #7B2D8E 0%, #B56BC8 100%)",
  "linear-gradient(135deg, #C97B1A 0%, #E8B44A 100%)",
];

/* ---- Component ---- */

export function ListViewClient({
  list,
  places,
  author,
  slug,
  isOwner,
}: ListViewClientProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const handleImgLoad = useCallback((id: string) => {
    setLoaded((prev) => ({ ...prev, [id]: true }));
  }, []);

  /* Scroll-linked parallax on hero cover photo */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const bg = hero.querySelector(`.${styles.heroBgPhoto}`) as HTMLElement;
      if (bg) bg.style.transform = `translateY(${scrollY * 0.3}px) scale(1.1)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/@${author.handle}/${slug}`
      : `/@${author.handle}/${slug}`;

  const city = author.city.charAt(0).toUpperCase() + author.city.slice(1);
  const gradient = COVER_GRADIENTS[list.coverStyle] || COVER_GRADIENTS[0];
  const heroPhoto = places[0]?.photoRef ? placePhotoUrl(places[0].photoRef, 1200) : null;

  return (
    <div className={styles.page}>
      {/* ---- Hero / Cover ---- */}
      <div className={styles.hero} ref={heroRef}>
        <div className={styles.heroBg}>
          {heroPhoto ? (
            <img
              src={heroPhoto}
              alt={list.title}
              className={styles.heroBgPhoto}
            />
          ) : (
            <div className={styles.heroBgGradient} style={{ background: gradient }} />
          )}
          <div className={styles.heroBgOverlay} />
        </div>
        <div className={styles.heroContent}>
          {list.emoji && <div className={styles.heroEmoji}>{list.emoji}</div>}
          <h1 className={styles.heroTitle}>{list.title}</h1>
          {list.description && (
            <p className={styles.heroDesc}>{list.description}</p>
          )}
          <div className={styles.heroMeta}>
            <div className={styles.heroAuthor}>
              <Avatar
                handle={author.handle}
                name={author.displayName}
                imageUrl={author.avatarUrl}
                size="sm"
              />
              <span className={styles.heroAuthorName}>{author.displayName}</span>
              <span className={styles.heroAuthorSep}>·</span>
              <span className={styles.heroAuthorCity}>{city}</span>
            </div>
            <span className={styles.heroPlaceCount}>
              {list.placeCount} place{list.placeCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* ---- Places ---- */}
      <div className={styles.places}>
        {places.map((place, idx) => {
          const photo = placePhotoUrl(place.photoRef, 400);
          return (
            <PlaceCard
              key={place.id}
              place={place}
              idx={idx}
              photo={photo}
              loaded={loaded}
              onLoad={handleImgLoad}
            />
          );
        })}
      </div>

      {/* ---- Footer ---- */}
      <div className={styles.footer}>
        <div className={styles.authorCard}>
          <Avatar
            handle={author.handle}
            name={author.displayName}
            imageUrl={author.avatarUrl}
            size="lg"
          />
          <div className={styles.authorCardInfo}>
            <div className={styles.authorCardName}>{author.displayName}</div>
            <div className={styles.authorCardHandle}>@{author.handle}</div>
          </div>
          <Link href={`/${author.handle}`}>
            <Button variant="secondary" size="sm">
              View profile
            </Button>
          </Link>
        </div>

        <div className={styles.shareSection}>
          <ShareRow
            url={shareUrl}
            title={list.title}
            text={`Check out "${list.title}" by @${author.handle} on Vouch`}
          />
        </div>

        {!isOwner && (
          <div className={styles.cta}>
            <p className={styles.ctaText}>Want to build your own list?</p>
            <Link href="/sign-up">
              <Button variant="seal">Create yours on Vouch</Button>
            </Link>
          </div>
        )}
      </div>

      {/* ---- Mobile sticky bottom bar ---- */}
      <div className={styles.stickyBar}>
        <div className={styles.stickyBarInner}>
          <div className={styles.stickyBarInfo}>
            <span className={styles.stickyBarTitle}>{list.title}</span>
            <span className={styles.stickyBarMeta}>
              {list.placeCount} place{list.placeCount !== 1 ? "s" : ""}
            </span>
          </div>
          <ShareRow
            url={shareUrl}
            title={list.title}
            text={`Check out "${list.title}" by @${author.handle} on Vouch`}
          />
        </div>
      </div>
    </div>
  );
}

/* ---- PlaceCard helper ---- */

function PlaceCard({
  place,
  idx,
  photo,
  loaded,
  onLoad,
}: {
  place: PlaceItem;
  idx: number;
  photo: string | null;
  loaded: Record<string, boolean>;
  onLoad: (id: string) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      onLoad(place.id);
    }
  }, [place.id, onLoad]);

  return (
    <div className={styles.placeCard}>
      <span className={styles.placeNum}>
        {String(idx + 1).padStart(2, "0")}
      </span>

      {photo && (
        <div className={styles.placePhoto}>
          <img
            ref={imgRef}
            src={photo}
            alt={place.name}
            className={`${styles.placePhotoImg} ${loaded[place.id] ? styles.placePhotoLoaded : ""}`}
            loading={idx < 3 ? "eager" : "lazy"}
            onLoad={() => onLoad(place.id)}
          />
        </div>
      )}

      <div className={styles.placeBody}>
        <h2 className={styles.placeName}>{place.name}</h2>
        <div className={styles.placeArea}>{place.area}</div>
        {place.cuisines.length > 0 && (
          <div className={styles.cuisineTags}>
            {place.cuisines.map((c) => (
              <span key={c} className={styles.cuisineTag}>
                {c.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
        {place.note && (
          <p className={styles.placeNote}>&ldquo;{place.note}&rdquo;</p>
        )}
      </div>
    </div>
  );
}
