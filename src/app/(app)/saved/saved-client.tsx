"use client";

import { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/app/top-bar";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/client";
import styles from "./saved.module.css";

interface SavedPlace {
  savedId: string;
  placeId: string;
  name: string;
  area: string;
  vouchCount: number;
  savedAt: string;
}

interface SavedClientProps {
  savedPlaces: SavedPlace[];
  currentUserId: string;
}

export function SavedClient({
  savedPlaces: initialPlaces,
  currentUserId,
}: SavedClientProps) {
  const [places, setPlaces] = useState(initialPlaces);

  async function unsavePlace(placeId: string) {
    const supabase = createClient();

    // Optimistic removal
    setPlaces((prev) => prev.filter((p) => p.placeId !== placeId));

    try {
      await supabase
        .from("saved_places")
        .delete()
        .eq("user_id", currentUserId)
        .eq("place_id", placeId);
    } catch {
      // Revert on error
      setPlaces(initialPlaces);
    }
  }

  return (
    <div className={styles.page}>
      <TopBar title="Saved" />

      {places.length > 0 ? (
        <div className={styles.list}>
          {places.map((place) => (
            <div key={place.placeId} className={styles.placeRow}>
              <Link
                href={`/place/${place.placeId}`}
                className={styles.placeIcon}
              >
                <Icon name="map-pin" size={20} />
              </Link>
              <Link
                href={`/place/${place.placeId}`}
                className={styles.placeInfo}
              >
                <p className={styles.placeName}>{place.name}</p>
                <div className={styles.placeMeta}>
                  <span>{place.area}</span>
                  {place.vouchCount > 0 && (
                    <span className={styles.placeVouches}>
                      &middot; {place.vouchCount} vouch
                      {place.vouchCount !== 1 ? "es" : ""}
                    </span>
                  )}
                </div>
              </Link>
              <button
                className={styles.unsaveBtn}
                onClick={() => unsavePlace(place.placeId)}
                aria-label={`Unsave ${place.name}`}
              >
                <Icon name="bookmark-filled" size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="bookmark"
          title="No saved places"
          message="When you save a place, it'll show up here for quick access."
          action={
            <Link href="/search">
              <Button variant="secondary" size="sm">
                Discover places
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
