"use client";

import Link from "next/link";
import { TopBar, TopBarIconButton } from "@/components/app/top-bar";
import { VouchCard } from "@/components/app/vouch-card";
import { PlaceCard } from "@/components/app/place-card";
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
  cuisines: string[];
  priceTier: number;
}

interface TrendingPlace {
  id: string;
  name: string;
  area: string;
  vouch_count: number;
  cuisines: string[];
  price_tier: number;
}

interface HomeFeedClientProps {
  circleFeed: FeedVouch[];
  discoverFeed: FeedVouch[];
  trending: TrendingPlace[];
  savedPlaceIds: string[];
  currentUserId: string;
  userName?: string;
}

/** Group vouches by place — for visual place cards */
function groupByPlace(vouches: FeedVouch[]) {
  const map = new Map<
    string,
    {
      placeId: string;
      placeName: string;
      placeArea: string;
      cuisines: string[];
      priceTier: number;
      vouches: FeedVouch[];
    }
  >();

  for (const v of vouches) {
    if (!map.has(v.placeId)) {
      map.set(v.placeId, {
        placeId: v.placeId,
        placeName: v.placeName,
        placeArea: v.placeArea,
        cuisines: v.cuisines,
        priceTier: v.priceTier,
        vouches: [],
      });
    }
    map.get(v.placeId)!.vouches.push(v);
  }

  return Array.from(map.values());
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function HomeFeedClient({
  circleFeed,
  discoverFeed,
  trending,
  savedPlaceIds,
  currentUserId,
  userName = "there",
}: HomeFeedClientProps) {
  const savedSet = new Set(savedPlaceIds);
  const circlePlaces = groupByPlace(circleFeed);
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

      {/* ---- Greeting ---- */}
      <div className={styles.greeting}>
        <h2 className={styles.greetingText}>
          {getGreeting()}, {userName}
        </h2>
        <p className={styles.greetingSub}>
          Your food guide to Bangalore
        </p>
      </div>

      {/* ---- From Your Circle: horizontal place cards ---- */}
      {circlePlaces.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>From your circle</h3>
            <span className={styles.sectionCount}>
              {circlePlaces.length} place{circlePlaces.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className={styles.carousel}>
            {circlePlaces.map((group) => (
              <div key={group.placeId} className={styles.carouselItem}>
                <PlaceCard
                  id={group.placeId}
                  name={group.placeName}
                  area={group.placeArea}
                  cuisines={group.cuisines}
                  priceTier={group.priceTier}
                  vouchCount={group.vouches.length}
                  vouches={group.vouches.map((v) => ({
                    take: v.take,
                    authorName: v.authorName,
                    authorHandle: v.authorHandle,
                    authorAvatarUrl: v.authorAvatarUrl,
                  }))}
                  isSaved={savedSet.has(group.placeId)}
                  currentUserId={currentUserId}
                  isDemo={!process.env.NEXT_PUBLIC_SUPABASE_URL}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- Hot in Bangalore: 2-column place grid ---- */}
      {trending.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Hot in Bangalore</h3>
            <Link href="/search" className={styles.seeAll}>
              See all <Icon name="chevron-right" size={14} />
            </Link>
          </div>
          <div className={styles.placeGrid}>
            {trending.slice(0, 6).map((place) => (
              <PlaceCard
                key={place.id}
                id={place.id}
                name={place.name}
                area={place.area}
                cuisines={place.cuisines || []}
                priceTier={place.price_tier || 0}
                vouchCount={place.vouch_count}
                isSaved={savedSet.has(place.id)}
                currentUserId={currentUserId}
                variant="compact"
                isDemo={!process.env.NEXT_PUBLIC_SUPABASE_URL}
              />
            ))}
          </div>
        </section>
      )}

      {/* ---- Fresh Takes: individual vouches as rich cards ---- */}
      {circleFeed.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Fresh takes</h3>
          </div>
          <div className={styles.takeFeed}>
            {circleFeed.slice(0, 5).map((vouch) => (
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
                cuisines={vouch.cuisines}
                isSaved={savedSet.has(vouch.placeId)}
                currentUserId={currentUserId}
                authorId={vouch.authorId}
                feedCard
              />
            ))}
          </div>
        </section>
      )}

      {/* ---- Discover: from outside your circle ---- */}
      {discoverFeed.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Discover</h3>
            <span className={styles.sectionCount}>Beyond your circle</span>
          </div>
          <div className={styles.takeFeed}>
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
                cuisines={vouch.cuisines}
                isSaved={savedSet.has(vouch.placeId)}
                currentUserId={currentUserId}
                authorId={vouch.authorId}
                feedCard
              />
            ))}
          </div>
        </section>
      )}

      {/* ---- Empty state ---- */}
      {!hasFeed && trending.length === 0 && (
        <div className={styles.emptyWrap}>
          <EmptyState
            icon="vouch"
            title="Your guide is empty"
            message="Follow people to see their restaurant picks here."
            action={
              <Link href="/search">
                <Button variant="seal">Find people to follow</Button>
              </Link>
            }
          />
        </div>
      )}

      {/* Bottom spacing for nav */}
      <div className={styles.bottomSpacer} />
    </div>
  );
}
