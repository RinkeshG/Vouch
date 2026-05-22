"use client";

import { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/app/top-bar";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Stamp } from "@/components/ui/stamp";
import { getCuisineVisual, getCuisineIcon, priceDots } from "@/lib/cuisine";
import styles from "./saved.module.css";

interface SavedPlace {
  savedId: string;
  placeId: string;
  name: string;
  area: string;
  vouchCount: number;
  savedAt: string;
  cuisines?: string[];
  priceTier?: number;
}

interface SavedClientProps {
  savedPlaces: SavedPlace[];
  currentUserId: string;
  isDemo?: boolean;
}

export function SavedClient({
  savedPlaces: initialPlaces,
  currentUserId,
  isDemo = false,
}: SavedClientProps) {
  const [places, setPlaces] = useState(initialPlaces);

  async function unsavePlace(placeId: string) {
    setPlaces((prev) => prev.filter((p) => p.placeId !== placeId));

    if (isDemo) return;

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    try {
      await supabase
        .from("saved_places")
        .delete()
        .eq("user_id", currentUserId)
        .eq("place_id", placeId);
    } catch {
      setPlaces(initialPlaces);
    }
  }

  return (
    <div className={styles.page}>
      <TopBar title="Saved" />

      {places.length > 0 ? (
        <>
          <div className={styles.header}>
            <p className={styles.headerCount}>
              {places.length} place{places.length !== 1 ? "s" : ""} saved
            </p>
          </div>

          <div className={styles.grid}>
            {places.map((place) => {
              const cuisines = place.cuisines || [];
              const visual = getCuisineVisual(cuisines);
              const icon = getCuisineIcon(cuisines);

              return (
                <div key={place.placeId} className={styles.card}>
                  {/* Visual hero */}
                  <Link
                    href={`/place/${place.placeId}`}
                    className={styles.cardHero}
                    style={{ background: visual.gradient }}
                  >
                    <span className={styles.cardHeroIcon}>{icon}</span>
                  </Link>

                  {/* Card body */}
                  <div className={styles.cardBody}>
                    <Link
                      href={`/place/${place.placeId}`}
                      className={styles.cardName}
                    >
                      {place.name}
                    </Link>
                    <div className={styles.cardMeta}>
                      <span>{place.area}</span>
                      {place.priceTier && place.priceTier > 0 && (
                        <>
                          <span className={styles.cardMetaDot} />
                          <span className={styles.cardPrice}>
                            {priceDots(place.priceTier)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Vouch count + unsave */}
                    <div className={styles.cardFooter}>
                      <span className={styles.cardVouches}>
                        <Stamp size={12} variant="outline" />
                        {place.vouchCount} vouch
                        {place.vouchCount !== 1 ? "es" : ""}
                      </span>
                      <button
                        className={styles.unsaveBtn}
                        onClick={() => unsavePlace(place.placeId)}
                        aria-label={`Unsave ${place.name}`}
                      >
                        <Icon name="bookmark-filled" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyState
          icon="bookmark"
          title="No saved places"
          message="When you save a place, it'll show up here for quick access."
          action={
            <Link href="/search">
              <Button variant="secondary" size="sm">
                Explore places
              </Button>
            </Link>
          }
        />
      )}

      <div className={styles.bottomSpacer} />
    </div>
  );
}
