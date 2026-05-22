"use client";

import { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/app/top-bar";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Stamp } from "@/components/ui/stamp";
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
        <div className={styles.content}>
          <p className={styles.count}>
            {places.length} place{places.length !== 1 ? "s" : ""} saved
          </p>

          <div className={styles.list}>
            {places.map((place) => (
              <div key={place.placeId} className={styles.row}>
                <Link
                  href={`/place/${place.placeId}`}
                  className={styles.placeLink}
                >
                  <span className={styles.placeName}>{place.name}</span>
                  <span className={styles.placeArea}>{place.area}</span>
                </Link>

                <div className={styles.rowRight}>
                  <span className={styles.vouches}>
                    <Stamp size={10} variant="outline" />
                    {place.vouchCount}
                  </span>
                  <button
                    className={styles.unsaveBtn}
                    onClick={() => unsavePlace(place.placeId)}
                    aria-label={`Remove ${place.name}`}
                  >
                    <Icon name="bookmark-filled" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon="bookmark"
          title="No saved places"
          message="Save places you want to remember. They'll appear here."
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
