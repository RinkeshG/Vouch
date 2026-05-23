"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ShareRow } from "@/components/app/share-row";
import { timeAgoLabel, formatCount } from "@/lib/utils";
import styles from "./list-view.module.css";

/* ---- Types ---- */

interface ListInfo {
  title: string;
  description: string | null;
  emoji: string | null;
  coverStyle: number;
  placeCount: number;
  saveCount: number;
  createdAt: string;
  updatedAt: string;
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
  listId: string;
  slug: string;
  isOwner: boolean;
  isSaved: boolean;
  isAuthed: boolean;
}

/* ---- Constants ---- */

const INITIAL_SHOW = 10;

/* ---- Component ---- */

export function ListViewClient({
  list,
  places,
  author,
  listId,
  slug,
  isOwner,
  isSaved: initialSaved,
  isAuthed,
}: ListViewClientProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Save state (optimistic)
  const [saved, setSaved] = useState(initialSaved);
  const [saveCount, setSaveCount] = useState(list.saveCount);
  const [saving, setSaving] = useState(false);

  // Show all / collapse
  const [showAll, setShowAll] = useState(places.length <= INITIAL_SHOW);
  const visiblePlaces = showAll ? places : places.slice(0, INITIAL_SHOW);

  // Staggered entrance animation via IntersectionObserver
  useEffect(() => {
    if (!gridRef.current) return;
    const items = gridRef.current.querySelectorAll("[data-animate]");
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
  }, [showAll]);

  // Save / unsave handler
  const handleSave = useCallback(async () => {
    if (!isAuthed) {
      router.push(`/sign-up?next=/@${author.handle}/${slug}`);
      return;
    }
    if (saving) return;

    // Optimistic update
    const wasSaved = saved;
    setSaved(!wasSaved);
    setSaveCount((c) => c + (wasSaved ? -1 : 1));
    setSaving(true);

    try {
      const method = wasSaved ? "DELETE" : "POST";
      const res = await fetch(`/api/lists/${listId}/save`, { method });
      const data = await res.json();

      if (res.ok) {
        setSaved(data.saved);
        setSaveCount(data.count);
      } else {
        // Revert
        setSaved(wasSaved);
        setSaveCount((c) => c + (wasSaved ? 1 : -1));
      }
    } catch {
      // Revert
      setSaved(wasSaved);
      setSaveCount((c) => c + (wasSaved ? 1 : -1));
    } finally {
      setSaving(false);
    }
  }, [saved, saving, isAuthed, listId, author.handle, slug, router]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/@${author.handle}/${slug}`
      : `/@${author.handle}/${slug}`;

  const city = author.city.charAt(0).toUpperCase() + author.city.slice(1);
  const updatedLabel = timeAgoLabel(list.updatedAt || list.createdAt);

  // Extract neighborhood from area string
  // Area is stored as "street, neighborhood" from Google Places formatted_address.
  // The first segment is often a street number or road name — prefer the second segment
  // when the first looks like a number/street.
  const getHood = (area: string) => {
    if (!area) return "";
    const parts = area.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0];
    // If the first part is purely numeric or looks like a street/road, use second part
    const first = parts[0];
    const isNumeric = /^\d+[\s/-]*\d*$/.test(first);
    const isStreet = /\b(rd|road|st|street|cross|main|lane|ave|avenue|nagar|block|floor|no\.|plot)\b/i.test(first);
    if (isNumeric || isStreet) return parts[1];
    return first;
  };

  return (
    <div className={styles.page}>
      {/* ---- Hero / Cover ---- */}
      <div
        className={`${styles.hero} ${list.coverStyle === 3 ? styles.heroDarkText : ""}`}
        data-style={list.coverStyle}
      >
        <div className={styles.heroEyebrow}>
          <span>Curated List</span>
          <span className={styles.heroDot}>·</span>
          <span>{list.placeCount} Place{list.placeCount !== 1 ? "s" : ""}</span>
        </div>
        {list.emoji && <div className={styles.heroEmoji}>{list.emoji}</div>}
        <h1 className={styles.heroTitle}>{list.title}</h1>
        {list.description && (
          <p className={styles.heroDesc}>{list.description}</p>
        )}
        <div className={styles.heroMeta}>
          <Avatar
            handle={author.handle}
            name={author.displayName}
            imageUrl={author.avatarUrl}
            size="sm"
          />
          <span className={styles.heroMetaText}>
            By @{author.handle}
            <span className={styles.heroMetaSep}>·</span>
            {city}
            <span className={styles.heroMetaSep}>·</span>
            Updated {updatedLabel.toLowerCase()}
          </span>
        </div>
      </div>

      {/* ---- Place Cards — Postcard Grid ---- */}
      <div className={styles.places}>
        <div className={styles.placeGrid} ref={gridRef}>
          {visiblePlaces.map((place, idx) => (
            <div
              key={place.id}
              className={`${styles.card} ${idx === 0 ? styles.cardHero : ""}`}
              data-animate
              style={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ["--delay" as any]: `${Math.min(idx * 80, 400)}ms`,
              }}
            >
              <div className={styles.cardInner}>
                {idx === 0 ? (
                  /* Hero card — number + content side by side */
                  <>
                    <span className={styles.cardNum}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className={styles.cardMain}>
                      <h2 className={styles.cardName}>{place.name}</h2>
                      <div className={styles.cardMeta}>
                        <span className={styles.cardHood}>{getHood(place.area)}</span>
                        {place.cuisines[0] && (
                          <span className={styles.cardCuisine}>
                            {place.cuisines.slice(0, 2).join(", ").replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                      {place.note && (
                        <p className={styles.cardNote}>
                          <span className={styles.arrow}>→</span>
                          {place.note}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  /* Regular cards — stacked */
                  <>
                    <span className={styles.cardNum}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h2 className={styles.cardName}>{place.name}</h2>
                    <div className={styles.cardMeta}>
                      <span className={styles.cardHood}>{getHood(place.area)}</span>
                      {place.cuisines[0] && (
                        <span className={styles.cardCuisine}>
                          {place.cuisines.slice(0, 2).join(", ").replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    {place.note && (
                      <p className={styles.cardNote}>
                        <span className={styles.arrow}>→</span>
                        {place.note}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Show all button */}
          {!showAll && places.length > INITIAL_SHOW && (
            <div className={styles.showAll}>
              <div className={styles.showAllLine} />
              <button
                className={styles.showAllBtn}
                onClick={() => setShowAll(true)}
              >
                Show all {list.placeCount} places
              </button>
              <div className={styles.showAllLine} />
            </div>
          )}
        </div>
      </div>

      {/* ---- Footer ---- */}
      <div className={styles.footer}>
        {/* Save + Short URL — full width bar */}
        <div className={styles.footerActions}>
          <button
            className={`${styles.saveBtn} ${saved ? styles.saveBtnActive : ""}`}
            onClick={handleSave}
            disabled={saving}
          >
            <svg viewBox="0 0 24 24" className={styles.saveIcon}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{saveCount > 0 ? `${formatCount(saveCount)} Save${saveCount !== 1 ? "s" : ""}` : "Save"}</span>
          </button>
          <span className={styles.shortUrl}>
            vouch.in/@{author.handle}/{slug}
          </span>
        </div>

        {/* Below-the-fold: author, share, CTA */}
        <div className={styles.footerContent}>
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

          {/* CTA for visitors */}
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
    </div>
  );
}
