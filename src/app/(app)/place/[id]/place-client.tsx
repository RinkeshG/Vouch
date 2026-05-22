"use client";

import { useState } from "react";
import Link from "next/link";
import { VouchCard } from "@/components/app/vouch-card";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Stamp } from "@/components/ui/stamp";
import { AddToListModal } from "@/components/app/add-to-list-modal";
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
  coverImageUrl?: string | null;
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
  const [saved, setSaved] = useState(initialSaved);
  const [listModalOpen, setListModalOpen] = useState(false);

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

  const hasPhoto = !!place.coverImageUrl;
  const priceStr = place.priceTier > 0 ? "₹".repeat(place.priceTier) : null;

  // Collect all context tags across all vouches for the tag cloud
  const allTags = new Map<string, number>();
  for (const v of vouches) {
    for (const tag of v.contextTags || []) {
      allTags.set(tag, (allTags.get(tag) || 0) + 1);
    }
  }
  const sortedTags = [...allTags.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className={styles.page}>
      {/* Breadcrumbs */}
      <nav className={styles.breadcrumbs}>
        <Link href="/home">Home</Link>
        {" / "}
        <Link href="/search">{place.city}</Link>
        {" / "}
        <span className={styles.breadcrumbCurrent}>{place.name}</span>
      </nav>

      {/* Photo Gallery */}
      {hasPhoto ? (
        <div className={styles.gallery}>
          <div
            className={styles.galleryMain}
            style={{ backgroundImage: `url(${place.coverImageUrl})` }}
          />
          <div className={styles.gallerySide}>
            <div className={styles.gallerySmall} />
            <div className={styles.gallerySmall} />
          </div>
        </div>
      ) : (
        <div className={styles.typeHero}>
          <h1 className={styles.typeHeroName}>{place.name}</h1>
        </div>
      )}

      {/* Title Row */}
      <div className={styles.titleRow}>
        <div className={styles.titleInfo}>
          <div className={styles.categoryLabel}>
            {place.cuisines[0]?.toUpperCase() || "RESTAURANT"}
            {" · "}
            {place.area.split(",")[0].toUpperCase()}
            {priceStr && ` · ${priceStr}`}
          </div>

          {hasPhoto && (
            <h1 className={styles.placeName}>{place.name}</h1>
          )}

          {place.isClosed && (
            <span className={styles.closedBadge}>Permanently closed</span>
          )}

          <div className={styles.metaRow}>
            <span className={styles.metaItem}>
              <Icon name="map-pin" size={14} />
              {place.area}
            </span>
            {place.phone && (
              <span className={styles.metaItem}>
                · {place.phone}
              </span>
            )}
          </div>
        </div>

        <div className={styles.titleActions}>
          <Link
            href={`/add?placeId=${place.id}&placeName=${encodeURIComponent(place.name)}`}
            className={styles.btnSeal}
          >
            <Icon name="plus" size={14} strokeWidth={2} />
            Vouch this place
          </Link>
          <button
            className={cn(styles.btnSecondary, saved && styles.btnSaved)}
            onClick={toggleSave}
          >
            <Icon name={saved ? "bookmark-filled" : "bookmark"} size={14} />
            {saved ? "Saved" : "Save"}
          </button>
          <button
            className={styles.btnSecondary}
            onClick={() => setListModalOpen(true)}
          >
            <Icon name="list" size={14} />
            Add to list
          </button>
          <button className={styles.btnSecondary}>
            <Icon name="share" size={14} />
            Send
          </button>
          <button className={styles.btnGhost}>
            <Icon name="more" size={18} />
          </button>
        </div>
      </div>

      {/* Social Proof Banner */}
      {uniqueAuthors.length > 0 && (
        <div className={styles.socialBanner}>
          <div className={styles.socialAvatars}>
            {uniqueAuthors.slice(0, 3).map((a, i) => (
              <div key={a.handle} className={styles.socialAvatarWrap} style={{ zIndex: 3 - i }}>
                <Avatar
                  handle={a.handle}
                  name={a.name}
                  imageUrl={a.avatarUrl}
                  size="sm"
                />
              </div>
            ))}
          </div>
          <div className={styles.socialInfo}>
            <div className={styles.socialTitle}>
              {uniqueAuthors.length} in your circle vouched for this place.
            </div>
            <div className={styles.socialSub}>
              {uniqueAuthors
                .slice(0, 3)
                .map((a) => a.name.split(" ")[0])
                .join(", ")}
              {" — across the last few months."}
            </div>
          </div>
        </div>
      )}

      {/* Two-column body */}
      <div className={styles.twoCol}>
        {/* Left: Takes */}
        <div className={styles.takesSection}>
          <div className={styles.sectionKicker}>From your circle</div>
          <h2 className={styles.sectionTitle}>What friends said.</h2>

          {vouches.length > 0 ? (
            <div className={styles.takesList}>
              {vouches.map((v) => (
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
                  variant="compact"
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyTakes}>
              <p style={{ fontSize: 14, color: "var(--v-ink2)" }}>
                No one has vouched for this place yet.
              </p>
              <Link
                href={`/add?placeId=${place.id}&placeName=${encodeURIComponent(place.name)}`}
                className={styles.btnSeal}
                style={{ marginTop: 12, display: "inline-flex" }}
              >
                Be the first to vouch
              </Link>
            </div>
          )}

          {/* Beyond your circle */}
          {place.vouchCount > uniqueAuthors.length && (
            <>
              <div className={styles.ruleRow}>
                <div className={styles.ruleLine} />
                <span className={styles.ruleLabel}>Beyond your circle</span>
                <div className={styles.ruleLine} />
              </div>
              <p className={styles.beyondText}>
                <span className={styles.beyondStrong}>
                  {place.vouchCount - uniqueAuthors.length} other{" "}
                  {place.vouchCount - uniqueAuthors.length === 1
                    ? "person"
                    : "people"}
                </span>{" "}
                on Vouch have endorsed this place. We don&rsquo;t average their
                takes. Tap a tag to see one.
              </p>
              {sortedTags.length > 0 && (
                <div className={styles.tagCloud}>
                  {sortedTags.map(([tag, count]) => (
                    <span key={tag} className={styles.tagPill}>
                      {tag} · {count}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Sidebar */}
        <aside className={styles.sidebar}>
          {/* The Basics */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardLabel}>The basics</div>
            <div className={styles.basicsList}>
              {place.phone && (
                <div className={styles.basicsRow}>
                  <span className={styles.basicsKey}>Phone</span>
                  <a href={`tel:${place.phone}`} className={styles.basicsVal}>
                    {place.phone}
                  </a>
                </div>
              )}
              {priceStr && (
                <div className={styles.basicsRow}>
                  <span className={styles.basicsKey}>Price</span>
                  <span className={styles.basicsVal}>{priceStr}</span>
                </div>
              )}
              {place.cuisines.length > 0 && (
                <div className={styles.basicsRow}>
                  <span className={styles.basicsKey}>Cuisine</span>
                  <span className={styles.basicsVal}>
                    {place.cuisines.join(", ")}
                  </span>
                </div>
              )}
              <div className={styles.basicsRow}>
                <span className={styles.basicsKey}>Area</span>
                <span className={styles.basicsVal}>
                  {place.area}, {place.city}
                </span>
              </div>
              <div className={styles.basicsRow}>
                <span className={styles.basicsKey}>Vouches</span>
                <span className={styles.basicsVal}>
                  {place.vouchCount} vouch
                  {place.vouchCount !== 1 ? "es" : ""}
                </span>
              </div>
              {place.website && (
                <div className={styles.basicsRow}>
                  <span className={styles.basicsKey}>Website</span>
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.basicsVal}
                    style={{ color: "var(--v-seal)" }}
                  >
                    Visit website →
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Map Card */}
          {place.latitude && place.longitude && (
            <div className={styles.mapCard}>
              <div className={styles.mapPlaceholder}>
                <Stamp size={36} />
              </div>
              <div className={styles.mapBody}>
                <div className={styles.mapAddress}>{place.area}</div>
                <div className={styles.mapCoords}>
                  {place.latitude.toFixed(2)} N · {place.longitude.toFixed(2)} E
                </div>
                <div className={styles.mapActions}>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnSecondarySmall}
                  >
                    Open in maps
                  </a>
                  <button className={styles.btnGhostSmall}>Copy</button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      <div className={styles.bottomSpacer} />

      <AddToListModal
        placeId={place.id}
        placeName={place.name}
        isOpen={listModalOpen}
        onClose={() => setListModalOpen(false)}
      />
    </div>
  );
}
