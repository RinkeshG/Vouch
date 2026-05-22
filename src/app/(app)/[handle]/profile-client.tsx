"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TopBar, TopBarIconButton } from "@/components/app/top-bar";
import { VouchCard } from "@/components/app/vouch-card";
import { PlaceCard } from "@/components/app/place-card";
import { EmptyState } from "@/components/app/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Stamp } from "@/components/ui/stamp";
import { cn } from "@/lib/utils";
import styles from "./profile.module.css";

interface ProfileInfo {
  id: string;
  handle: string;
  displayName: string;
  bio: string | null;
  tasteLine: string | null;
  avatarUrl: string | null;
  avatarTint: number;
  isPublic: boolean;
  vouchCount: number;
  followerCount: number;
  followingCount: number;
  listCount: number;
}

interface ProfileVouch {
  id: string;
  take: string;
  contextTags: string[];
  createdAt: string;
  placeId: string;
  placeName: string;
  placeArea: string;
  cuisines?: string[];
  priceTier?: number;
}

interface ProfileClientProps {
  profile: ProfileInfo;
  vouches: ProfileVouch[];
  isOwnProfile: boolean;
  isFollowing: boolean;
  savedPlaceIds: string[];
  currentUserId: string;
  isDemo?: boolean;
}

/** Group vouches by place to build a "taste map" */
function groupVouchesByPlace(vouches: ProfileVouch[]) {
  const map = new Map<
    string,
    {
      placeId: string;
      placeName: string;
      placeArea: string;
      cuisines: string[];
      priceTier: number;
      vouches: ProfileVouch[];
    }
  >();

  for (const v of vouches) {
    if (!map.has(v.placeId)) {
      map.set(v.placeId, {
        placeId: v.placeId,
        placeName: v.placeName,
        placeArea: v.placeArea,
        cuisines: v.cuisines || [],
        priceTier: v.priceTier || 0,
        vouches: [],
      });
    }
    map.get(v.placeId)!.vouches.push(v);
  }

  return Array.from(map.values());
}

export function ProfileClient({
  profile,
  vouches,
  isOwnProfile,
  isFollowing: initialFollowing,
  savedPlaceIds,
  currentUserId,
  isDemo = false,
}: ProfileClientProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(profile.followerCount);
  const [activeTab, setActiveTab] = useState<"places" | "takes" | "lists">(
    "places"
  );
  const savedSet = new Set(savedPlaceIds);
  const placeGroups = groupVouchesByPlace(vouches);

  // Avatar tint as header color
  const tintColors = [
    "#E8D5C4", "#C4D4C0", "#C9D1DC", "#D4C4B0",
    "#B8C8C0", "#D0C4D4", "#C8D0B8", "#DCC8B4", "#B4C4CC",
  ];
  const headerColor = tintColors[profile.avatarTint % tintColors.length];

  async function toggleFollow() {
    const newFollowing = !following;
    setFollowing(newFollowing);
    setFollowerCount((c) => c + (newFollowing ? 1 : -1));

    if (isDemo) return;

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    try {
      if (newFollowing) {
        await supabase.from("follows").insert({
          follower_id: currentUserId,
          following_id: profile.id,
        });
      } else {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", profile.id);
      }
    } catch {
      setFollowing(!newFollowing);
      setFollowerCount((c) => c + (newFollowing ? -1 : 1));
    }
  }

  return (
    <div className={styles.page}>
      <TopBar
        title={`@${profile.handle}`}
        left={
          !isOwnProfile ? (
            <TopBarIconButton label="Go back" onClick={() => router.back()}>
              <Icon name="chevron-left" size={20} />
            </TopBarIconButton>
          ) : undefined
        }
        right={
          isOwnProfile ? (
            <TopBarIconButton label="Settings">
              <Icon name="settings" size={20} />
            </TopBarIconButton>
          ) : (
            <TopBarIconButton label="Share profile">
              <Icon name="share" size={20} />
            </TopBarIconButton>
          )
        }
      />

      {/* ---- Visual header band (avatar tint color) ---- */}
      <div
        className={styles.headerBand}
        style={{ backgroundColor: headerColor }}
      />

      {/* ---- Profile card (overlaps band) ---- */}
      <div className={styles.profileCard}>
        <div className={styles.avatarWrap}>
          <Avatar
            handle={profile.handle}
            name={profile.displayName}
            imageUrl={profile.avatarUrl}
            size="xl"
            ring
          />
        </div>

        <h1 className={styles.name}>{profile.displayName}</h1>
        <p className={styles.handle}>@{profile.handle}</p>

        {/* Taste line — the HERO of the profile */}
        {profile.tasteLine && (
          <div className={styles.tasteLineWrap}>
            <span className={styles.tasteQuote}>&ldquo;</span>
            <p className={styles.tasteLine}>{profile.tasteLine}</p>
            <span className={styles.tasteQuote}>&rdquo;</span>
          </div>
        )}

        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

        {/* Stats — visual badges */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <Stamp size={14} variant="outline" />
            <span className={styles.statCount}>{profile.vouchCount}</span>
            <span className={styles.statLabel}>
              vouch{profile.vouchCount !== 1 ? "es" : ""}
            </span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statCount}>{placeGroups.length}</span>
            <span className={styles.statLabel}>places</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statCount}>{followerCount}</span>
            <span className={styles.statLabel}>followers</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statCount}>{profile.followingCount}</span>
            <span className={styles.statLabel}>following</span>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {isOwnProfile ? (
            <Button variant="secondary" fullWidth size="sm">
              Edit profile
            </Button>
          ) : (
            <Button
              variant={following ? "secondary" : "seal"}
              fullWidth
              size="sm"
              onClick={toggleFollow}
            >
              {following ? "Following" : "Follow"}
            </Button>
          )}
        </div>
      </div>

      {/* ---- Tabs ---- */}
      <div className={styles.tabs}>
        <button
          className={cn(
            styles.tab,
            activeTab === "places" && styles.tabActive
          )}
          onClick={() => setActiveTab("places")}
        >
          Places
        </button>
        <button
          className={cn(
            styles.tab,
            activeTab === "takes" && styles.tabActive
          )}
          onClick={() => setActiveTab("takes")}
        >
          Takes
        </button>
        <button
          className={cn(
            styles.tab,
            activeTab === "lists" && styles.tabActive
          )}
          onClick={() => setActiveTab("lists")}
        >
          Lists
        </button>
      </div>

      {/* ---- Places tab: visual place cards (taste map) ---- */}
      {activeTab === "places" && (
        <div className={styles.placeGrid}>
          {placeGroups.length > 0 ? (
            placeGroups.map((group) => (
              <PlaceCard
                key={group.placeId}
                id={group.placeId}
                name={group.placeName}
                area={group.placeArea}
                cuisines={group.cuisines}
                priceTier={group.priceTier}
                vouchCount={group.vouches.length}
                vouches={group.vouches.map((v) => ({
                  take: v.take,
                  authorName: profile.displayName,
                  authorHandle: profile.handle,
                  authorAvatarUrl: profile.avatarUrl,
                }))}
                isSaved={savedSet.has(group.placeId)}
                currentUserId={currentUserId}
                variant="compact"
                isDemo={isDemo}
              />
            ))
          ) : (
            <EmptyState
              icon="map-pin"
              title={
                isOwnProfile
                  ? "No places yet"
                  : `${profile.displayName} hasn't vouched yet`
              }
              message={
                isOwnProfile
                  ? "Vouch for your favorite spots to build your taste map."
                  : "Check back later for their recommendations."
              }
              action={
                isOwnProfile ? (
                  <Link href="/add">
                    <Button variant="seal" size="sm">
                      Add a vouch
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          )}
        </div>
      )}

      {/* ---- Takes tab: individual vouches ---- */}
      {activeTab === "takes" && (
        <div className={styles.takesList}>
          {vouches.length > 0 ? (
            vouches.map((v) => (
              <VouchCard
                key={v.id}
                id={v.id}
                authorHandle={profile.handle}
                authorName={profile.displayName}
                authorAvatarUrl={profile.avatarUrl}
                placeId={v.placeId}
                placeName={v.placeName}
                placeArea={v.placeArea}
                take={v.take}
                contextTags={v.contextTags}
                createdAt={v.createdAt}
                cuisines={v.cuisines}
                isSaved={savedSet.has(v.placeId)}
                currentUserId={currentUserId}
                authorId={profile.id}
                feedCard
              />
            ))
          ) : (
            <EmptyState
              icon="vouch"
              title="No takes yet"
              message={
                isOwnProfile
                  ? "Share your honest takes on places."
                  : "No takes to show yet."
              }
            />
          )}
        </div>
      )}

      {/* ---- Lists tab ---- */}
      {activeTab === "lists" && (
        <div className={styles.listsTab}>
          <EmptyState
            icon="list"
            title={isOwnProfile ? "No lists yet" : "No lists"}
            message={
              isOwnProfile
                ? "Create lists to organize your favorite places."
                : `${profile.displayName} hasn't created any lists yet.`
            }
          />
        </div>
      )}

      <div className={styles.bottomSpacer} />
    </div>
  );
}
