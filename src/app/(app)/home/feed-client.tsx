"use client";

import Link from "next/link";
import { VouchCard } from "@/components/app/vouch-card";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import styles from "./home.module.css";

/* ============================================================
   Feed item types — a mixed activity stream
   ============================================================ */

export interface FeedVouch {
  kind: "vouch";
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
  placeCuisine?: string;
  placePrice?: string;
  placeImageUrl?: string | null;
  reason: string;
}

export interface FeedList {
  kind: "list";
  id: string;
  listName: string;
  listCount: number;
  listArea: string;
  createdAt: string;
  authorHandle: string;
  authorName: string;
  authorAvatarUrl: string | null;
  reason: string;
  places: { id: string; name: string; imageUrl: string | null }[];
}

export interface FeedCircle {
  kind: "circle";
  id: string;
  body: string;
  createdAt: string;
  userHandle: string;
  userName: string;
  userAvatarUrl: string | null;
  reason: string;
  fourVouches: { id: string; name: string; imageUrl: string | null }[];
}

export type FeedItem = FeedVouch | FeedList | FeedCircle;

interface HomeFeedClientProps {
  feedItems: FeedItem[];
  savedPlaceIds: string[];
  currentUserId: string;
}

export function HomeFeedClient({
  feedItems,
  savedPlaceIds,
  currentUserId,
}: HomeFeedClientProps) {
  const savedSet = new Set(savedPlaceIds);
  const hasFeed = feedItems.length > 0;

  // Get today's date formatted
  const now = new Date();
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dateStr = `${dayNames[now.getDay()]} · ${now.getDate()} ${monthNames[now.getMonth()]}`;

  return (
    <div className={styles.page}>
      {hasFeed ? (
        <>
          {/* Feed header — "Today in your circle." */}
          <div className={styles.feedHeader}>
            <div>
              <div className={styles.feedDate}>{dateStr}</div>
              <h1 className={styles.feedTitle}>
                Today in your
                <br />
                circle.
              </h1>
            </div>
            <div className={styles.cityTabs}>
              <span className={`${styles.cityTab} ${styles.cityTabActive}`}>
                Bangalore
              </span>
              <span className={styles.cityTab}>All cities</span>
              <span className={styles.cityTab}>Open now</span>
            </div>
          </div>

          {/* Feed stream */}
          <div className={styles.feed}>
            {feedItems.map((item) => {
              switch (item.kind) {
                case "vouch":
                  return (
                    <VouchCard
                      key={item.id}
                      id={item.id}
                      authorHandle={item.authorHandle}
                      authorName={item.authorName}
                      authorAvatarUrl={item.authorAvatarUrl}
                      placeId={item.placeId}
                      placeName={item.placeName}
                      placeArea={item.placeArea}
                      placeCuisine={item.placeCuisine}
                      placePrice={item.placePrice}
                      placeImageUrl={item.placeImageUrl}
                      take={item.take}
                      contextTags={item.contextTags}
                      createdAt={item.createdAt}
                      isSaved={savedSet.has(item.placeId)}
                      currentUserId={currentUserId}
                      authorId={item.authorId}
                      variant="feed"
                      reason={item.reason}
                    />
                  );

                case "list":
                  return (
                    <ListCard
                      key={item.id}
                      item={item}
                      savedSet={savedSet}
                    />
                  );

                case "circle":
                  return <CircleCard key={item.id} item={item} />;

                default:
                  return null;
              }
            })}

            {/* End of feed */}
            <div className={styles.endOfFeed}>
              <div className={styles.endTitle}>You&rsquo;re all caught up.</div>
              <div className={styles.endSub}>
                Next refresh tomorrow at 8 AM, or check trending.
              </div>
              <div className={styles.endAction}>
                <Link href="/search">
                  <button className={styles.btnSecondary}>
                    See trending in Bangalore →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.emptyWrap}>
          <EmptyState
            icon="vouch"
            title={currentUserId ? "You're all set" : "See what people are vouching for"}
            message={
              currentUserId
                ? "Your vouches are saved. Follow people to see their recommendations here, or vouch for more places."
                : "Sign up to vouch for your favorite places and follow people whose taste you trust."
            }
            action={
              currentUserId ? (
                <div style={{ display: "flex", gap: "8px" }}>
                  <Link href="/add">
                    <Button variant="seal">Vouch a place</Button>
                  </Link>
                  <Link href="/search">
                    <Button variant="secondary">Find people</Button>
                  </Link>
                </div>
              ) : (
                <Link href="/sign-up">
                  <Button variant="seal">Get started</Button>
                </Link>
              )
            }
          />
        </div>
      )}

      <div className={styles.bottomSpacer} />
    </div>
  );
}

/* ============================================================
   List Card — "Kabir just published" a list
   ============================================================ */

function ListCard({
  item,
  savedSet: _savedSet,
}: {
  item: FeedList;
  savedSet: Set<string>;
}) {
  return (
    <article className={styles.listCard}>
      {/* Attribution row */}
      <div className={styles.cardAttr}>
        <Link href={`/${item.authorHandle}`}>
          <Avatar
            handle={item.authorHandle}
            name={item.authorName}
            imageUrl={item.authorAvatarUrl}
            size="xs"
          />
        </Link>
        <span className={styles.cardReason}>
          <span className={styles.reasonDot} />
          {item.reason}
        </span>
        <span className={styles.cardTime}>{timeAgo(item.createdAt)}</span>
      </div>

      {/* List title */}
      <h3 className={styles.listTitle}>{item.listName}</h3>
      <div className={styles.listMeta}>
        {item.listCount} PLACES · {item.listArea.toUpperCase()}
      </div>

      {/* 4-photo grid */}
      <div className={styles.listGrid}>
        {item.places.slice(0, 4).map((place) => (
          <Link
            key={place.id}
            href={`/place/${place.id}`}
            className={styles.listGridItem}
          >
            <div
              className={styles.listGridImage}
              style={{
                backgroundImage: place.imageUrl
                  ? `url(${place.imageUrl})`
                  : undefined,
              }}
            />
            <div className={styles.listGridOverlay} />
            <span className={styles.listGridName}>{place.name}</span>
          </Link>
        ))}
      </div>

      {/* Actions */}
      <div className={styles.cardActions}>
        <button className={styles.btnPrimary}>
          Open list
          <Icon name="arrow-right" size={14} />
        </button>
        <button className={styles.btnSecondary}>
          <Icon name="bookmark" size={14} />
          Save
        </button>
      </div>
    </article>
  );
}

/* ============================================================
   Circle Card — "Priya joined Vouch and picked her Four Vouches."
   ============================================================ */

function CircleCard({ item }: { item: FeedCircle }) {
  return (
    <article className={styles.circleCard}>
      {/* Attribution row */}
      <div className={styles.cardAttr}>
        <Link href={`/${item.userHandle}`}>
          <Avatar
            handle={item.userHandle}
            name={item.userName}
            imageUrl={item.userAvatarUrl}
            size="xs"
          />
        </Link>
        <span className={styles.cardReason}>
          <span className={styles.reasonDot} />
          {item.reason}
        </span>
        <span className={styles.cardTime}>{timeAgo(item.createdAt)}</span>
      </div>

      {/* Body */}
      <h3 className={styles.circleBody}>{item.body}</h3>

      {/* Four Vouches grid */}
      <div className={styles.fourGrid}>
        {item.fourVouches.slice(0, 4).map((place, idx) => (
          <Link
            key={place.id}
            href={`/place/${place.id}`}
            className={styles.fourItem}
          >
            <div
              className={styles.fourImage}
              style={{
                backgroundImage: place.imageUrl
                  ? `url(${place.imageUrl})`
                  : undefined,
              }}
            />
            <div className={styles.fourInfo}>
              <span className={styles.fourIndex}>
                0{idx + 1}/04
              </span>
              <span className={styles.fourName}>{place.name}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Actions */}
      <div className={styles.cardActions}>
        <Link
          href={`/${item.userHandle}`}
          className={styles.btnPrimary}
        >
          <Icon name="users" size={14} />
          See {item.userName.split(" ")[0]}&apos;s profile
        </Link>
      </div>
    </article>
  );
}
