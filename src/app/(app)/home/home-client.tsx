"use client";

import Link from "next/link";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { timeAgo } from "@/lib/utils";
import styles from "./home.module.css";

interface PreviewPlace {
  name: string;
  area: string | null;
}

interface HomeList {
  id: string;
  title: string;
  slug: string | null;
  emoji: string | null;
  description: string | null;
  placeCount: number;
  saveCount: number;
  coverStyle: number;
  isPublished: boolean;
  updatedAt: string;
  previewPlaces: PreviewPlace[];
}

interface HomeClientProps {
  handle: string | null;
  displayName: string | null;
  lists: HomeList[];
  totalPlaces: number;
}

const BAND_COLORS: Record<number, { bg: string; text: string }> = {
  0: { bg: "#B8412C", text: "#FFFFFF" },
  1: { bg: "#7A8472", text: "#FFFFFF" },
  2: { bg: "#3D2B3D", text: "#FFFFFF" },
  3: { bg: "#C49A4A", text: "#181210" },
  4: { bg: "#8A2E1F", text: "#FFFFFF" },
};
const BAND_FALLBACK = { bg: "#6E4F3A", text: "#FFFFFF" };

export function HomeClient({
  handle,
  displayName,
  lists,
  totalPlaces,
}: HomeClientProps) {
  if (lists.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash}>&mdash;</span>
            YOUR LISTS
          </p>
          <h1 className={styles.statsHeading}>Start curating</h1>
        </div>

        <div className={styles.emptyWrap}>
          <EmptyState
            icon="list"
            title="You haven't created any lists yet"
            message="Curate your favorite places into shareable lists."
            action={
              <div className={styles.emptyActions}>
                <Link href="/new">
                  <Button
                    variant="seal"
                    icon={<Icon name="plus" size={14} />}
                  >
                    New list
                  </Button>
                </Link>
                <Link href="/new?import=csv">
                  <Button
                    variant="secondary"
                    icon={<Icon name="list" size={14} />}
                  >
                    Import CSV
                  </Button>
                </Link>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ---- Header ---- */}
      <div className={styles.header}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDash}>&mdash;</span>
          YOUR LISTS
        </p>
        <h1 className={styles.statsHeading}>
          {lists.length} list{lists.length !== 1 ? "s" : ""}
          <span className={styles.statsSep}>&middot;</span>
          {totalPlaces} place{totalPlaces !== 1 ? "s" : ""}
        </h1>
        {displayName && (
          <span className={styles.ownerHint}>by {displayName}</span>
        )}
      </div>

      {/* ---- Action bar ---- */}
      <div className={styles.actionBar}>
        <Link href="/new">
          <Button variant="seal" size="sm" icon={<Icon name="plus" size={14} />}>
            New list
          </Button>
        </Link>
        <Link href="/new?import=csv">
          <Button
            variant="secondary"
            size="sm"
            icon={<Icon name="list" size={14} />}
          >
            Import CSV
          </Button>
        </Link>
      </div>

      {/* ---- Card grid ---- */}
      <div className={styles.listGrid}>
        {lists.map((list, idx) => {
          const band = BAND_COLORS[list.coverStyle] ?? BAND_FALLBACK;
          const listNum = String(idx + 1).padStart(2, "0");

          return (
            <Link
              key={list.id}
              href={`/list/${list.id}/edit`}
              className={styles.listCard}
            >
              {/* Colored band header */}
              <div
                className={styles.cardBand}
                style={{ background: band.bg, color: band.text }}
              >
                <div className={styles.cardBandRow}>
                  <span>LIST №{listNum}</span>
                  <span className={styles.cardBandRight}>
                    {!list.isPublished ? (
                      <span className={styles.draftBadge}>Draft</span>
                    ) : (
                      <span className={styles.publishedBadge}>Published</span>
                    )}
                  </span>
                </div>
                <div className={styles.cardBandTitle}>
                  {list.emoji && (
                    <span className={styles.cardBandEmoji}>{list.emoji}</span>
                  )}
                  {list.title}
                </div>
              </div>

              {/* Cream body with place previews */}
              <div className={styles.cardBody}>
                {list.previewPlaces.length > 0 ? (
                  <ul className={styles.cardPlaces}>
                    {list.previewPlaces.map((place, i) => (
                      <li key={i} className={styles.cardPlaceItem}>
                        <span className={styles.cardPlaceName}>{place.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.cardPlacesEmpty}>No places yet</div>
                )}
              </div>

              {/* Footer */}
              <div className={styles.cardFoot}>
                <span>
                  {list.placeCount} place{list.placeCount !== 1 ? "s" : ""}
                  <span className={styles.footSep}>&middot;</span>
                  {timeAgo(list.updatedAt)}
                </span>
                <span className={styles.cardFootRight}>
                  {list.saveCount > 0 && (
                    <span className={styles.cardSaveCount}>
                      <svg viewBox="0 0 24 24" className={styles.heartIcon}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {list.saveCount}
                    </span>
                  )}
                  {list.isPublished && list.slug && handle && (
                    <span
                      className={styles.viewLink}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/@${handle}/${list.slug}`;
                      }}
                      role="link"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                          window.location.href = `/@${handle}/${list.slug}`;
                        }
                      }}
                    >
                      <Icon name="external" size={12} />
                      View
                    </span>
                  )}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
