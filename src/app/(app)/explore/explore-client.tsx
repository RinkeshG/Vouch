"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import styles from "./explore.module.css";

interface PreviewPlace {
  name: string;
  area: string;
}

interface ExploreList {
  id: string;
  title: string;
  description: string | null;
  slug: string | null;
  emoji: string | null;
  coverStyle: number;
  placeCount: number;
  createdAt: string;
  authorHandle: string;
  authorName: string;
  authorAvatarUrl: string | null;
  previewPlaces: PreviewPlace[];
}

interface ExploreClientProps {
  initialLists: ExploreList[];
  isAuthed: boolean;
}

export function ExploreClient({ initialLists, isAuthed }: ExploreClientProps) {
  if (initialLists.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>— BROWSE</span>
          <h1 className={styles.heading}>Explore</h1>
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

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>— BROWSE</span>
        <h1 className={styles.heading}>Explore</h1>
        <p className={styles.subheading}>
          Curated lists from people who know their city
        </p>
      </div>

      <div className={styles.grid}>
        {initialLists.map((list, idx) => {
          const href = list.slug
            ? `/@${list.authorHandle}/${list.slug}`
            : `/@${list.authorHandle}`;

          // Card number (1-indexed, padded)
          const listNum = String(idx + 1).padStart(2, "0");

          // Determine text color for the band based on coverStyle
          const darkTextBand = list.coverStyle === 3;

          return (
            <Link key={list.id} href={href} className={styles.card}>
              <div
                className={styles.cardBand}
                data-style={list.coverStyle}
              >
                <div className={styles.cardBandTop}>
                  <span
                    className={styles.cardBandLabel}
                    style={darkTextBand ? { color: "#181210" } : undefined}
                  >
                    LIST №{listNum}
                  </span>
                  <span
                    className={styles.cardBandHandle}
                    style={darkTextBand ? { color: "rgba(24,18,16,0.6)" } : undefined}
                  >
                    @{list.authorHandle.toUpperCase()}
                  </span>
                </div>
                <div
                  className={styles.cardBandTitle}
                  style={darkTextBand ? { color: "#181210" } : undefined}
                >
                  {list.emoji && (
                    <span className={styles.cardEmoji}>{list.emoji}</span>
                  )}
                  <span>{list.title}</span>
                </div>
              </div>

              <div className={styles.cardBody}>
                {list.previewPlaces.length > 0 ? (
                  list.previewPlaces.map((place, pIdx) => (
                    <div key={pIdx} className={styles.cardPlace}>
                      <span className={styles.cardPlaceName}>{place.name}</span>
                      {place.area && (
                        <span className={styles.cardPlaceHood}>
                          {place.area.toUpperCase()}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={styles.cardPlaceEmpty}>
                    No places yet
                  </div>
                )}
              </div>

              <div className={styles.cardFoot}>
                <span className={styles.cardPlaceCount}>
                  {list.placeCount} PLACE{list.placeCount !== 1 ? "S" : ""}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom CTA — drive signups from public explore page */}
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
