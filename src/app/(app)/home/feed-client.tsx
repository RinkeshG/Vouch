"use client";

import Link from "next/link";
import { TopBar, TopBarIconButton } from "@/components/app/top-bar";
import { VouchCard } from "@/components/app/vouch-card";
import { EmptyState } from "@/components/app/empty-state";
import { Icon } from "@/components/ui/icon";
import { Stamp } from "@/components/ui/stamp";
import { Button } from "@/components/ui/button";
import styles from "./home.module.css";

interface FeedVouch {
  id: string;
  take: string;
  contextTags: string[];
  createdAt: string;
  authorHandle: string;
  authorName: string;
  authorAvatarUrl: string | null;
  authorId: string;
  placeId: string;
  placeName: string;
  placeArea: string;
}

interface TrendingPlace {
  id: string;
  name: string;
  area: string;
  vouch_count: number;
}

interface HomeFeedClientProps {
  circleFeed: FeedVouch[];
  discoverFeed: FeedVouch[];
  trending: TrendingPlace[];
  savedPlaceIds: string[];
  currentUserId: string;
}

export function HomeFeedClient({
  circleFeed,
  discoverFeed,
  trending,
  savedPlaceIds,
  currentUserId,
}: HomeFeedClientProps) {
  const savedSet = new Set(savedPlaceIds);
  const hasFeed = circleFeed.length > 0 || discoverFeed.length > 0;

  return (
    <div className={styles.page}>
      <TopBar
        title="Vouch"
        left={<Stamp size={22} />}
        right={
          <TopBarIconButton label="Notifications">
            <Icon name="bell" size={20} />
          </TopBarIconButton>
        }
      />

      {/* Trending places — horizontal scroll */}
      {trending.length > 0 && (
        <div className={styles.trending}>
          <p className={styles.trendingTitle}>Trending in Bangalore</p>
          <div className={styles.trendingScroll}>
            {trending.map((place) => (
              <Link
                key={place.id}
                href={`/place/${place.id}`}
                className={styles.trendingCard}
              >
                <span className={styles.trendingName}>{place.name}</span>
                <span className={styles.trendingArea}>{place.area}</span>
                <span className={styles.trendingVouches}>
                  <Icon name="vouch" size={12} />
                  {place.vouch_count} vouch{place.vouch_count !== 1 ? "es" : ""}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Circle feed */}
      {circleFeed.length > 0 && (
        <>
          <div className={styles.section}>
            <p className={styles.sectionTitle}>From your circle</p>
          </div>
          <div className={styles.feed}>
            {circleFeed.map((vouch) => (
              <VouchCard
                key={vouch.id}
                id={vouch.id}
                authorHandle={vouch.authorHandle}
                authorName={vouch.authorName}
                authorAvatarUrl={vouch.authorAvatarUrl}
                placeId={vouch.placeId}
                placeName={vouch.placeName}
                placeArea={vouch.placeArea}
                take={vouch.take}
                contextTags={vouch.contextTags}
                createdAt={vouch.createdAt}
                isSaved={savedSet.has(vouch.placeId)}
                currentUserId={currentUserId}
                authorId={vouch.authorId}
              />
            ))}
          </div>
        </>
      )}

      {/* Divider between sections */}
      {circleFeed.length > 0 && discoverFeed.length > 0 && (
        <div className={styles.divider} />
      )}

      {/* Discover feed */}
      {discoverFeed.length > 0 && (
        <>
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Discover</p>
          </div>
          <div className={styles.feed}>
            {discoverFeed.map((vouch) => (
              <VouchCard
                key={vouch.id}
                id={vouch.id}
                authorHandle={vouch.authorHandle}
                authorName={vouch.authorName}
                authorAvatarUrl={vouch.authorAvatarUrl}
                placeId={vouch.placeId}
                placeName={vouch.placeName}
                placeArea={vouch.placeArea}
                take={vouch.take}
                contextTags={vouch.contextTags}
                createdAt={vouch.createdAt}
                isSaved={savedSet.has(vouch.placeId)}
                currentUserId={currentUserId}
                authorId={vouch.authorId}
              />
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!hasFeed && trending.length === 0 && (
        <EmptyState
          icon="vouch"
          title="Your feed is empty"
          message="Start by following people in Bangalore to see their vouches here."
          action={
            <Link href="/search">
              <Button variant="seal">Find people to follow</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
