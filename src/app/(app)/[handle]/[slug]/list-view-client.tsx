"use client";

import { useEffect, useRef } from "react";
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
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-animate]");
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.add(styles.visible);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
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
      <div className={styles.hero}>
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

      {/* ---- Places as visual moments ---- */}
      <div className={styles.places} ref={listRef}>
        {places.map((place, idx) => {
          const photo = placePhotoUrl(place.photoRef, 800);
          const isHero = idx === 0;
          return (
            <div
              key={place.id}
              className={`${styles.placeCard} ${isHero ? styles.placeCardHero : ""}`}
              data-animate
              style={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ["--delay" as any]: `${Math.min(idx * 60, 300)}ms`,
              }}
            >
              {photo && (
                <div className={styles.placePhoto}>
                  <img
                    src={photo}
                    alt={place.name}
                    className={styles.placePhotoImg}
                    loading={idx < 3 ? "eager" : "lazy"}
                  />
                </div>
              )}
              <div className={styles.placeBody}>
                <span className={styles.placeNum}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h2 className={styles.placeName}>{place.name}</h2>
                <div className={styles.placeMeta}>
                  {place.area.split(",")[0]}
                  {place.cuisines[0] && (
                    <>
                      <span className={styles.metaDot}>·</span>
                      {place.cuisines[0].replace(/_/g, " ")}
                    </>
                  )}
                </div>
                {place.note && (
                  <p className={styles.placeNote}>&ldquo;{place.note}&rdquo;</p>
                )}
              </div>
            </div>
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
          <Link href={`/@${author.handle}`}>
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
    </div>
  );
}
