"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ShareRow } from "@/components/app/share-row";
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

/* ---- Component ---- */

export function ListViewClient({
  list,
  places,
  author,
  slug,
  isOwner,
}: ListViewClientProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Staggered entrance animation via IntersectionObserver
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

  return (
    <div className={styles.page}>
      {/* ---- Hero / Cover ---- */}
      <div
          className={`${styles.hero} ${list.coverStyle === 3 ? styles.heroDarkText : ""}`}
          data-style={list.coverStyle}
        >
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

      {/* ---- Numbered places ---- */}
      <div className={styles.places} ref={listRef}>
        {places.map((place, idx) => (
          <div
            key={place.id}
            className={styles.placeRow}
            data-animate
            style={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ["--delay" as any]: `${Math.min(idx * 80, 400)}ms`,
            }}
          >
            <span className={styles.placeNum}>
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div className={styles.placeInfo}>
              <h2 className={styles.placeName}>{place.name}</h2>
              <div className={styles.placeMeta}>
                {place.area.split(",")[0].toUpperCase()}
                {place.cuisines[0] && (
                  <>
                    <span className={styles.metaDot}>·</span>
                    {place.cuisines[0].toUpperCase().replace(/_/g, " ")}
                  </>
                )}
              </div>
              {place.note && (
                <p className={styles.placeNote}>&ldquo;{place.note}&rdquo;</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ---- Footer ---- */}
      <div className={styles.footer}>
        {/* Author card */}
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

        {/* Share */}
        <div className={styles.shareSection}>
          <ShareRow
            url={shareUrl}
            title={list.title}
            text={`Check out "${list.title}" by @${author.handle} on Vouch`}
          />
        </div>

        {/* CTA for visitors — owners just see the share buttons above */}
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
