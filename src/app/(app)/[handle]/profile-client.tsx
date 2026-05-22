"use client";

import { useState } from "react";
import Link from "next/link";
import { VouchCard } from "@/components/app/vouch-card";
import { EmptyState } from "@/components/app/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
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
  city?: string;
}

interface ProfileVouch {
  id: string;
  take: string;
  contextTags: string[];
  createdAt: string;
  placeId: string;
  placeName: string;
  placeArea: string;
  placeCuisine?: string;
  placeImageUrl?: string | null;
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

export function ProfileClient({
  profile,
  vouches,
  isOwnProfile,
  isFollowing: initialFollowing,
  savedPlaceIds,
  currentUserId,
  isDemo = false,
}: ProfileClientProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(profile.followerCount);
  const [activeTab, setActiveTab] = useState(0);
  const savedSet = new Set(savedPlaceIds);

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

  // Top 4 vouches for "The Canon" section
  const fourVouches = vouches.slice(0, 4);

  // Tab definitions
  const tabs = [
    `All vouches · ${profile.vouchCount}`,
    `Lists · ${profile.listCount}`,
    `Saved`,
  ];

  const firstName = profile.displayName.split(" ")[0];
  const city = profile.city || "Bangalore";

  return (
    <div className={styles.page}>
      {/* ---- Header ---- */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Avatar
            handle={profile.handle}
            name={profile.displayName}
            imageUrl={profile.avatarUrl}
            size="xl"
          />
          <div className={styles.headerInfo}>
            <div className={styles.headerLabel}>
              {isOwnProfile ? `YOUR VOUCH · ${city.toUpperCase()}` : `A VOUCH BY · ${city.toUpperCase()}`}
            </div>
            <h1 className={styles.headerName}>{profile.displayName}</h1>
            <div className={styles.headerHandle}>
              vouch.app/@{profile.handle}
            </div>
            {profile.tasteLine && (
              <p className={styles.headerTasteLine}>
                &ldquo;{profile.tasteLine}&rdquo;
              </p>
            )}
            <div className={styles.headerStats}>
              <span>
                <span className={styles.statStrong}>{profile.vouchCount}</span>{" "}
                vouches
              </span>
              <span>
                <span className={styles.statStrong}>{followerCount}</span>{" "}
                in circle
              </span>
              <span>
                <span className={styles.statStrong}>{profile.listCount}</span>{" "}
                lists
              </span>
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          {isOwnProfile ? (
            <>
              <button className={styles.btnSecondary}>
                <Icon name="edit" size={14} />
                Edit profile
              </button>
              <button className={styles.btnSecondary}>
                <Icon name="share" size={14} />
                Share
              </button>
              <button className={styles.btnGhost}>
                <Icon name="settings" size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                className={following ? styles.btnSecondary : styles.btnSeal}
                onClick={toggleFollow}
              >
                <Icon name="plus" size={14} />
                {following ? "Following" : "Follow taste"}
              </button>
              <button className={styles.btnSecondary}>
                <Icon name="share" size={14} />
                Share
              </button>
              <button className={styles.btnGhost}>
                <Icon name="more" size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ---- Four Vouches: The Canon ---- */}
      {fourVouches.length > 0 && (
        <div className={styles.fourSection}>
          <div className={styles.sectionHead}>
            <div>
              <div className={styles.sectionKicker}>The canon</div>
              <h2 className={styles.sectionTitle}>
                {isOwnProfile ? "My Four Vouches" : `${firstName}'s Four Vouches`}
              </h2>
            </div>
            {isOwnProfile && (
              <button className={styles.btnGhostSmall}>
                <Icon name="edit" size={12} />
                Edit four
              </button>
            )}
          </div>

          <div className={styles.fourGrid}>
            {fourVouches.map((v, i) => (
              <Link
                key={v.id}
                href={`/place/${v.placeId}`}
                className={styles.fourCard}
              >
                <div
                  className={styles.fourImage}
                  style={
                    v.placeImageUrl
                      ? { backgroundImage: `url(${v.placeImageUrl})` }
                      : undefined
                  }
                />
                <div className={styles.fourBody}>
                  <div className={styles.fourIndex}>
                    0{i + 1} / 0{Math.min(fourVouches.length, 4)}
                  </div>
                  <div className={styles.fourName}>{v.placeName}</div>
                  <div className={styles.fourArea}>
                    {v.placeArea.split(",")[0].toUpperCase()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ---- Tabs ---- */}
      <div className={styles.tabs}>
        {tabs.map((t, i) => (
          <button
            key={t}
            className={cn(styles.tab, i === activeTab && styles.tabActive)}
            onClick={() => setActiveTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ---- Vouch Grid ---- */}
      {activeTab === 0 && (
        <>
          {vouches.length > 0 ? (
            <div className={styles.vouchGrid}>
              {vouches.map((v) => (
                <VouchCard
                  key={v.id}
                  id={v.id}
                  authorHandle={profile.handle}
                  authorName={profile.displayName}
                  authorAvatarUrl={profile.avatarUrl}
                  placeId={v.placeId}
                  placeName={v.placeName}
                  placeArea={v.placeArea}
                  placeCuisine={v.placeCuisine}
                  placeImageUrl={v.placeImageUrl}
                  take={v.take}
                  contextTags={v.contextTags}
                  createdAt={v.createdAt}
                  isSaved={savedSet.has(v.placeId)}
                  currentUserId={currentUserId}
                  authorId={profile.id}
                  variant="grid"
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyWrap}>
              <EmptyState
                icon="vouch"
                title={isOwnProfile ? "No takes yet" : "No takes yet"}
                message={
                  isOwnProfile
                    ? "Share your honest take on a place you love."
                    : `${profile.displayName} hasn't shared any takes yet.`
                }
                action={
                  isOwnProfile ? (
                    <Link href="/add">
                      <button className={styles.btnSeal}>Add a vouch</button>
                    </Link>
                  ) : undefined
                }
              />
            </div>
          )}
        </>
      )}

      {/* Lists tab placeholder */}
      {activeTab === 1 && (
        <div className={styles.emptyWrap}>
          <EmptyState
            icon="list"
            title="No lists yet"
            message={
              isOwnProfile
                ? "Create a curated list of your favorite places."
                : `${firstName} hasn't created any lists yet.`
            }
          />
        </div>
      )}

      {/* Saved tab placeholder */}
      {activeTab === 2 && (
        <div className={styles.emptyWrap}>
          <EmptyState
            icon="bookmark"
            title="Nothing saved yet"
            message="Places you save will appear here."
          />
        </div>
      )}

      <div className={styles.bottomSpacer} />
    </div>
  );
}
