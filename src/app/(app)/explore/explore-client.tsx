"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/app/empty-state";
import { placePhotoUrl } from "@/types";
import styles from "./explore.module.css";

const CATEGORIES = ["All", "Coffee", "Bars", "Restaurants", "Date Night", "Breakfast", "Dessert", "Street Food"];

interface ExploreList {
  id: string;
  title: string;
  description: string | null;
  slug: string | null;
  emoji: string | null;
  coverStyle: number;
  placeCount: number;
  saveCount: number;
  isHot: boolean;
  createdAt: string;
  authorHandle: string;
  authorName: string;
  authorAvatarUrl: string | null;
  heroPhotoRef: string | null;
}

interface ExploreClientProps {
  initialLists: ExploreList[];
  isAuthed: boolean;
}

const COVER_GRADIENTS = [
  "linear-gradient(135deg, #BF3A2B 0%, #E8614A 100%)",
  "linear-gradient(135deg, #1B4332 0%, #40916C 100%)",
  "linear-gradient(135deg, #1D3557 0%, #457B9D 100%)",
  "linear-gradient(135deg, #7B2D8E 0%, #B56BC8 100%)",
  "linear-gradient(135deg, #C97B1A 0%, #E8B44A 100%)",
];

export function SkeletonCard({ size = "standard" }: { size?: "feature" | "standard" }) {
  return (
    <div className={`${styles.skeleton} ${size === "feature" ? styles.skeletonFeature : ""}`}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonMeta} />
      </div>
    </div>
  );
}

function ListCard({
  list,
  variant = "standard",
}: {
  list: ExploreList;
  variant?: "featured" | "standard";
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setImgLoaded(true);
    }
  }, []);

  const href = list.slug
    ? `/${list.authorHandle}/${list.slug}`
    : `/${list.authorHandle}`;

  const photoUrl = placePhotoUrl(list.heroPhotoRef, variant === "featured" ? 1200 : 800);
  const gradient = COVER_GRADIENTS[list.coverStyle] || COVER_GRADIENTS[0];

  if (variant === "featured") {
    return (
      <Link href={href} className={styles.featuredCard}>
        <div className={styles.featuredImage}>
          {photoUrl ? (
            <img
              ref={imgRef}
              src={photoUrl}
              alt={list.title}
              className={`${styles.featuredPhoto} ${imgLoaded ? styles.photoLoaded : ""}`}
              onLoad={() => setImgLoaded(true)}
            />
          ) : (
            <div className={styles.featuredGradient} style={{ background: gradient }} />
          )}
          <div className={styles.featuredOverlay} />
          {list.isHot && (
            <span className={styles.badge}>Trending now</span>
          )}
          <div className={styles.featuredContent}>
            <div className={styles.featuredAuthor}>
              <Avatar
                handle={list.authorHandle}
                name={list.authorName}
                imageUrl={list.authorAvatarUrl}
                size="xs"
              />
              <span className={styles.featuredAuthorName}>{list.authorName}</span>
            </div>
            <h2 className={styles.featuredTitle}>
              {list.emoji && <span>{list.emoji} </span>}
              {list.title}
            </h2>
            {list.description && (
              <p className={styles.featuredDesc}>{list.description}</p>
            )}
            <div className={styles.featuredMeta}>
              <span>{list.placeCount} places</span>
              {list.saveCount > 0 && (
                <>
                  <span className={styles.dot}>·</span>
                  <span>{list.saveCount} saves</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className={styles.card}>
      <div className={styles.cardImage}>
        {photoUrl ? (
          <img
            ref={imgRef}
            src={photoUrl}
            alt={list.title}
            className={`${styles.cardPhoto} ${imgLoaded ? styles.photoLoaded : ""}`}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
        ) : (
          <div className={styles.cardGradient} style={{ background: gradient }} />
        )}
        <div className={styles.cardOverlay} />
        <div className={styles.cardAuthorOverlay}>
          <Avatar
            handle={list.authorHandle}
            name={list.authorName}
            imageUrl={list.authorAvatarUrl}
            size="xs"
          />
          <span className={styles.cardAuthorName}>{list.authorName}</span>
        </div>
        {list.isHot && (
          <span className={styles.cardBadge}>Hot</span>
        )}
      </div>
      <div className={styles.cardBody}>
        <h2 className={styles.cardTitle}>
          {list.emoji && <span className={styles.cardEmoji}>{list.emoji} </span>}
          {list.title}
        </h2>
        {list.description && (
          <p className={styles.cardDesc}>{list.description}</p>
        )}
        <div className={styles.cardMeta}>
          <span>{list.placeCount} places</span>
          {list.saveCount > 0 && (
            <>
              <span className={styles.dot}>·</span>
              <span>{list.saveCount} saves</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ExploreClient({ initialLists, isAuthed }: ExploreClientProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  if (initialLists.length === 0) {
    return (
      <div className={styles.page}>
        <h1 className={styles.heading}>Explore</h1>
        <div className={styles.chips}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`${styles.chip} ${activeCategory === cat ? styles.chipActive : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <EmptyState
          icon="globe"
          title="No lists yet"
          message="Be the first to create and publish a curated list."
          action={
            <Link href={isAuthed ? "/new" : "/sign-up"}>
              <Button variant="seal">Create your first list</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const hotLists = initialLists.filter(l => l.isHot);
  const recentLists = initialLists.filter(l => !l.isHot);
  const [topHot, ...restHot] = hotLists;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Explore</h1>
      <p className={styles.subheading}>
        Curated lists from people in Bangalore
      </p>

      <div className={styles.chips}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`${styles.chip} ${activeCategory === cat ? styles.chipActive : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ---- TRENDING NOW section ---- */}
      {hotLists.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLine} />
            <h2 className={styles.sectionTitle}>TRENDING NOW</h2>
            <div className={styles.sectionLine} />
          </div>

          {topHot && <ListCard list={topHot} variant="featured" />}

          {restHot.length > 0 && (
            <div className={styles.hotGrid}>
              {restHot.map(list => (
                <ListCard key={list.id} list={list} variant="standard" />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ---- ALL LISTS section ---- */}
      {recentLists.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLine} />
            <h2 className={styles.sectionTitle}>ALL LISTS</h2>
            <div className={styles.sectionLine} />
          </div>

          <div className={styles.grid}>
            {recentLists.map(list => (
              <ListCard key={list.id} list={list} variant="standard" />
            ))}
          </div>
        </section>
      )}

      {!isAuthed && (
        <div className={styles.bottomCta}>
          <p className={styles.bottomCtaText}>
            Got a list in your head? Put it on the internet.
          </p>
          <Link href="/sign-up">
            <Button variant="seal" size="lg">
              Create your own list
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
