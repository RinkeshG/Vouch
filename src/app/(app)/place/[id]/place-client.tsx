"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TopBar, TopBarIconButton } from "@/components/app/top-bar";
import { VouchCard } from "@/components/app/vouch-card";
import { AvatarStack } from "@/components/app/avatar-stack";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Stamp } from "@/components/ui/stamp";
import { getCuisineVisual, getCuisineIcon, priceDots, getTagIcon } from "@/lib/cuisine";
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

  const visual = getCuisineVisual(place.cuisines);
  const cuisineIcon = getCuisineIcon(place.cuisines);

  // Unique authors for social proof
  const uniqueAuthors = vouches.reduce<
    { handle: string; name: string; avatarUrl?: string | null }[]
  >((acc, v) => {
    if (!acc.find((a) => a.handle === v.authorHandle)) {
      acc.push({
        handle: v.authorHandle,
        name: v.authorName,
        avatarUrl: v.authorAvatarUrl,
      });
    }
    return acc;
  }, []);

  // Collect all unique tags across vouches
  const allTags = Array.from(
    new Set(vouches.flatMap((v) => v.contextTags))
  ).slice(0, 6);

  async function toggleSave() {
    const newSaved = !saved;
    setSaved(newSaved);

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
      {/* Transparent top bar overlaying hero */}
      <TopBar
        title=""
        className={styles.topBar}
        left={
          <TopBarIconButton label="Go back" onClick={() => router.back()}>
            <Icon name="chevron-left" size={20} />
          </TopBarIconButton>
        }
        right={
          <TopBarIconButton label="Share place">
            <Icon name="share" size={20} />
          </TopBarIconButton>
        }
      />

      {/* ---- Visual Hero with cuisine gradient ---- */}
      <div
        className={styles.hero}
        style={{ background: visual.gradient }}
      >
        <span className={styles.heroIcon}>{cuisineIcon}</span>
        {/* Subtle decorative pattern */}
        <div className={styles.heroOverlay} />
      </div>

      {/* ---- Place info card (overlaps hero) ---- */}
      <div className={styles.infoCard}>
        <h1 className={styles.placeName}>{place.name}</h1>

        {/* Meta row */}
        <div className={styles.meta}>
          <span>{place.area}</span>
          {place.priceTier > 0 && (
            <>
              <span className={styles.metaDot} />
              <span className={styles.priceDots}>
                {priceDots(place.priceTier)}
              </span>
            </>
          )}
          {place.isClosed && (
            <>
              <span className={styles.metaDot} />
              <span className={styles.closedBadge}>Closed</span>
            </>
          )}
        </div>

        {/* Cuisine pills */}
        {place.cuisines.length > 0 && (
          <div className={styles.cuisines}>
            {place.cuisines.map((c) => {
              const cv = getCuisineVisual([c]);
              return (
                <span
                  key={c}
                  className={styles.cuisinePill}
                  style={{
                    "--pill-bg": cv.bg,
                    "--pill-color": cv.color,
                  } as React.CSSProperties}
                >
                  {getCuisineIcon([c])} {c}
                </span>
              );
            })}
          </div>
        )}

        {/* Vouch stamp badge */}
        <div className={styles.vouchBadge}>
          <Stamp size={20} />
          <span className={styles.vouchCount}>{place.vouchCount}</span>
          <span className={styles.vouchLabel}>
            vouch{place.vouchCount !== 1 ? "es" : ""}
          </span>
        </div>

        {/* Social proof: who vouches */}
        {uniqueAuthors.length > 0 && (
          <div className={styles.socialProof}>
            <AvatarStack
              people={uniqueAuthors}
              label="vouch for this place"
            />
          </div>
        )}

        {/* Context tags — visual mood indicators */}
        {allTags.length > 0 && (
          <div className={styles.moodTags}>
            {allTags.map((tag) => (
              <span key={tag} className={styles.moodTag}>
                {getTagIcon(tag)} {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className={styles.actions}>
          <Button
            variant={saved ? "seal" : "secondary"}
            size="sm"
            icon={
              <Icon
                name={saved ? "bookmark-filled" : "bookmark"}
                size={16}
              />
            }
            onClick={toggleSave}
          >
            {saved ? "Saved" : "Save"}
          </Button>
          <Link
            href={`/add?placeId=${place.id}&placeName=${encodeURIComponent(place.name)}`}
          >
            <Button
              variant="primary"
              size="sm"
              icon={<Icon name="plus" size={16} />}
            >
              Vouch
            </Button>
          </Link>
        </div>
      </div>

      {/* ---- Tabs ---- */}
      <div className={styles.tabs}>
        <button
          className={cn(
            styles.tab,
            activeTab === "vouches" && styles.tabActive
          )}
          onClick={() => setActiveTab("vouches")}
        >
          Vouches ({vouches.length})
        </button>
        <button
          className={cn(
            styles.tab,
            activeTab === "info" && styles.tabActive
          )}
          onClick={() => setActiveTab("info")}
        >
          Details
        </button>
      </div>

      {/* ---- Vouches tab ---- */}
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
                <Link
                  href={`/add?placeId=${place.id}&placeName=${encodeURIComponent(place.name)}`}
                >
                  <Button variant="seal" size="sm">
                    Vouch for {place.name}
                  </Button>
                </Link>
              }
            />
          )}
        </div>
      )}

      {/* ---- Info tab ---- */}
      {activeTab === "info" && (
        <div className={styles.details}>
          <div className={styles.detailCard}>
            <div className={styles.detailRow}>
              <div className={styles.detailIcon}>
                <Icon name="map-pin" size={18} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Location</span>
                <span className={styles.detailValue}>
                  {place.area}, {place.city}
                </span>
              </div>
            </div>

            {place.phone && (
              <div className={styles.detailRow}>
                <div className={styles.detailIcon}>
                  <Icon name="send" size={18} />
                </div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Phone</span>
                  <a
                    href={`tel:${place.phone}`}
                    className={styles.detailLink}
                  >
                    {place.phone}
                  </a>
                </div>
              </div>
            )}

            {place.website && (
              <div className={styles.detailRow}>
                <div className={styles.detailIcon}>
                  <Icon name="globe" size={18} />
                </div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Website</span>
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.detailLink}
                  >
                    Visit website
                  </a>
                </div>
              </div>
            )}

            {place.latitude && place.longitude && (
              <div className={styles.detailRow}>
                <div className={styles.detailIcon}>
                  <Icon name="external" size={18} />
                </div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Directions</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.detailLink}
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.bottomSpacer} />
    </div>
  );
}
