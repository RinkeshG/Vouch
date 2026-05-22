"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TopBar, TopBarIconButton } from "@/components/app/top-bar";
import { VouchCard } from "@/components/app/vouch-card";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import { Stamp } from "@/components/ui/stamp";
import { cn } from "@/lib/utils";
import styles from "./place.module.css";

interface PlaceInfo {
  id: string;
  name: string;
  area: string;
  city: string;
  cuisines: string[];
  priceTier: number;
  vouchCount: number;
  phone: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  isClosed: boolean;
}

interface PlaceVouch {
  id: string;
  take: string;
  contextTags: string[];
  createdAt: string;
  userId: string;
  authorHandle: string;
  authorName: string;
  authorAvatarUrl: string | null;
}

interface PlaceDetailClientProps {
  place: PlaceInfo;
  vouches: PlaceVouch[];
  isSaved: boolean;
  currentUserId: string;
  isDemo?: boolean;
}

export function PlaceDetailClient({
  place,
  vouches,
  isSaved: initialSaved,
  currentUserId,
  isDemo = false,
}: PlaceDetailClientProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [activeTab, setActiveTab] = useState<"vouches" | "info">("vouches");

  const priceTierLabel = "$".repeat(place.priceTier);

  async function toggleSave() {
    const newSaved = !saved;
    setSaved(newSaved);

    // In demo mode, just toggle locally
    if (isDemo) return;

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    try {
      if (newSaved) {
        await supabase.from("saved_places").insert({
          user_id: currentUserId,
          place_id: place.id,
        });
      } else {
        await supabase
          .from("saved_places")
          .delete()
          .eq("user_id", currentUserId)
          .eq("place_id", place.id);
      }
    } catch {
      setSaved(!newSaved);
    }
  }

  return (
    <div className={styles.page}>
      <TopBar
        title=""
        left={
          <TopBarIconButton label="Go back" onClick={() => router.back()}>
            <Icon name="chevron-left" size={20} />
          </TopBarIconButton>
        }
        right={
          <>
            <TopBarIconButton label="Share place">
              <Icon name="share" size={20} />
            </TopBarIconButton>
          </>
        }
      />

      {/* Hero */}
      <div className={styles.hero}>
        <h1 className={styles.placeName}>{place.name}</h1>
        <div className={styles.meta}>
          <span className={styles.vouchCount}>
            <Stamp size={14} />
            {place.vouchCount} vouch{place.vouchCount !== 1 ? "es" : ""}
          </span>
          <span className={styles.metaDot} />
          <span>{place.area}</span>
          {place.priceTier > 0 && (
            <>
              <span className={styles.metaDot} />
              <span>{priceTierLabel}</span>
            </>
          )}
          {place.isClosed && (
            <>
              <span className={styles.metaDot} />
              <span style={{ color: "var(--v-seal)" }}>Closed</span>
            </>
          )}
        </div>
        {place.cuisines.length > 0 && (
          <div className={styles.cuisines}>
            {place.cuisines.map((c) => (
              <Tag key={c} variant="default" as="span">
                {c}
              </Tag>
            ))}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className={styles.actionBar}>
        <Button
          variant={saved ? "seal" : "secondary"}
          size="sm"
          icon={<Icon name={saved ? "bookmark-filled" : "bookmark"} size={16} />}
          onClick={toggleSave}
        >
          {saved ? "Saved" : "Save"}
        </Button>
        <Link href={`/add?placeId=${place.id}&placeName=${encodeURIComponent(place.name)}`}>
          <Button
            variant="primary"
            size="sm"
            icon={<Icon name="plus" size={16} />}
          >
            Vouch
          </Button>
        </Link>
        <div className={styles.actionBarSpacer} />
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={cn(styles.tab, activeTab === "vouches" && styles.tabActive)}
          onClick={() => setActiveTab("vouches")}
        >
          Vouches ({vouches.length})
        </button>
        <button
          className={cn(styles.tab, activeTab === "info" && styles.tabActive)}
          onClick={() => setActiveTab("info")}
        >
          Info
        </button>
      </div>

      {/* Vouches tab */}
      {activeTab === "vouches" && (
        <div className={styles.vouches}>
          {vouches.length > 0 ? (
            vouches.map((v) => (
              <VouchCard
                key={v.id}
                id={v.id}
                authorHandle={v.authorHandle}
                authorName={v.authorName}
                authorAvatarUrl={v.authorAvatarUrl}
                placeId={place.id}
                placeName={place.name}
                placeArea={place.area}
                take={v.take}
                contextTags={v.contextTags}
                createdAt={v.createdAt}
                isSaved={saved}
                currentUserId={currentUserId}
                authorId={v.userId}
                hidePlace
                compact
              />
            ))
          ) : (
            <EmptyState
              icon="vouch"
              title="No vouches yet"
              message="Be the first to vouch for this place."
              action={
                <Link href={`/add?placeId=${place.id}&placeName=${encodeURIComponent(place.name)}`}>
                  <Button variant="seal" size="sm">
                    Vouch for {place.name}
                  </Button>
                </Link>
              }
            />
          )}
        </div>
      )}

      {/* Info tab */}
      {activeTab === "info" && (
        <div className={styles.info}>
          <div className={styles.infoRow}>
            <Icon name="map-pin" size={18} className={styles.infoIcon} />
            <span className={styles.infoText}>{place.area}, Bangalore</span>
          </div>

          {place.phone && (
            <div className={styles.infoRow}>
              <Icon name="send" size={18} className={styles.infoIcon} />
              <a
                href={`tel:${place.phone}`}
                className={cn(styles.infoText, styles.infoLink)}
              >
                {place.phone}
              </a>
            </div>
          )}

          {place.website && (
            <div className={styles.infoRow}>
              <Icon name="globe" size={18} className={styles.infoIcon} />
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(styles.infoText, styles.infoLink)}
              >
                Visit website
              </a>
            </div>
          )}

          {place.latitude && place.longitude && (
            <div className={styles.mapPlaceholder}>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(styles.infoText, styles.infoLink)}
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Icon name="external" size={14} />
                Open in Google Maps
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
