"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TopBar, TopBarIconButton } from "@/components/app/top-bar";
import { VouchCard } from "@/components/app/vouch-card";
import { EmptyState } from "@/components/app/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
}

interface ProfileVouch {
  id: string;
  take: string;
  contextTags: string[];
  createdAt: string;
  placeId: string;
  placeName: string;
  placeArea: string;
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
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(profile.followerCount);
  const [activeTab, setActiveTab] = useState<"vouches" | "lists">("vouches");
  const savedSet = new Set(savedPlaceIds);

  async function toggleFollow() {
    const newFollowing = !following;
    setFollowing(newFollowing);
    setFollowerCount((c) => c + (newFollowing ? 1 : -1));

    // In demo mode, just toggle locally
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

      {/* Profile header */}
      <div className={styles.profileHeader}>
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
        <p className={styles.handleText}>@{profile.handle}</p>

        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
        {profile.tasteLine && (
          <p className={styles.tasteLine}>
            &ldquo;{profile.tasteLine}&rdquo;
          </p>
        )}

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statCount}>{profile.vouchCount}</span>
            <span className={styles.statLabel}>Vouches</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statCount}>{followerCount}</span>
            <span className={styles.statLabel}>Followers</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statCount}>{profile.followingCount}</span>
            <span className={styles.statLabel}>Following</span>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {isOwnProfile ? (
            <Button variant="secondary" fullWidth size="sm">
              Edit profile
            </Button>
          ) : (
            <>
              <Button
                variant={following ? "secondary" : "seal"}
                fullWidth
                size="sm"
                onClick={toggleFollow}
              >
                {following ? "Following" : "Follow"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={cn(styles.tab, activeTab === "vouches" && styles.tabActive)}
          onClick={() => setActiveTab("vouches")}
        >
          Vouches
        </button>
        <button
          className={cn(styles.tab, activeTab === "lists" && styles.tabActive)}
          onClick={() => setActiveTab("lists")}
        >
          Lists
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
                authorHandle={profile.handle}
                authorName={profile.displayName}
                authorAvatarUrl={profile.avatarUrl}
                placeId={v.placeId}
                placeName={v.placeName}
                placeArea={v.placeArea}
                take={v.take}
                contextTags={v.contextTags}
                createdAt={v.createdAt}
                isSaved={savedSet.has(v.placeId)}
                currentUserId={currentUserId}
                authorId={profile.id}
              />
            ))
          ) : (
            <EmptyState
              icon="vouch"
              title={
                isOwnProfile
                  ? "No vouches yet"
                  : `${profile.displayName} hasn't vouched yet`
              }
              message={
                isOwnProfile
                  ? "Vouch for your favorite spots to build your taste profile."
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

      {/* Lists tab */}
      {activeTab === "lists" && (
        <div className={styles.lists}>
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
    </div>
  );
}
