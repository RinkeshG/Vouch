"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { timeAgo } from "@/lib/utils";
import { placePhotoUrl } from "@/types";
import styles from "./home.module.css";

const COVER_GRADIENTS = [
  "linear-gradient(135deg, #BF3A2B 0%, #E8614A 100%)",
  "linear-gradient(135deg, #1B4332 0%, #40916C 100%)",
  "linear-gradient(135deg, #1D3557 0%, #457B9D 100%)",
  "linear-gradient(135deg, #7B2D8E 0%, #B56BC8 100%)",
  "linear-gradient(135deg, #C97B1A 0%, #E8B44A 100%)",
];

interface HomeList {
  id: string;
  title: string;
  slug: string | null;
  emoji: string | null;
  description: string | null;
  placeCount: number;
  isPublished: boolean;
  updatedAt: string;
  heroPhotoRef?: string | null;
  coverStyle?: number;
}

interface HomeClientProps {
  handle: string | null;
  displayName: string | null;
  lists: HomeList[];
  totalPlaces: number;
}

export function HomeClient({
  handle,
  displayName,
  lists,
  totalPlaces,
}: HomeClientProps) {
  const publishedCount = lists.filter(l => l.isPublished).length;
  const draftCount = lists.filter(l => !l.isPublished).length;

  if (lists.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Your lists</h1>
        </div>

        <div className={styles.emptyWrap}>
          <EmptyState
            icon="list"
            title="You haven't created any lists yet"
            message="Curate your favorite places into shareable lists."
            action={
              <div className={styles.emptyActions}>
                <Link href="/new">
                  <Button
                    variant="seal"
                    icon={<Icon name="plus" size={14} />}
                  >
                    New list
                  </Button>
                </Link>
                <Link href="/new?import=csv">
                  <Button
                    variant="secondary"
                    icon={<Icon name="list" size={14} />}
                  >
                    Import CSV
                  </Button>
                </Link>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        {displayName && (
          <div className={styles.greeting}>Welcome back, {displayName.split(" ")[0]}</div>
        )}
        <h1 className={styles.heading}>Your lists</h1>
      </div>

      <div className={styles.actionBar}>
        <Link href="/new">
          <Button variant="seal" size="sm" icon={<Icon name="plus" size={14} />}>
            New list
          </Button>
        </Link>
        <Link href="/new?import=csv">
          <Button
            variant="secondary"
            size="sm"
            icon={<Icon name="list" size={14} />}
          >
            Import CSV
          </Button>
        </Link>
      </div>

      <div className={styles.statsStrip}>
        <div className={styles.statBlock}>
          <div className={styles.statNumber}>{lists.length}</div>
          <div className={styles.statLabel}>lists</div>
        </div>
        <div className={styles.statBlock}>
          <div className={styles.statNumber}>{totalPlaces}</div>
          <div className={styles.statLabel}>places</div>
        </div>
        <div className={styles.statBlock}>
          <div className={styles.statNumber}>{publishedCount}</div>
          <div className={styles.statLabel}>published</div>
        </div>
        {draftCount > 0 && (
          <div className={styles.statBlock}>
            <div className={styles.statNumber}>{draftCount}</div>
            <div className={styles.statLabel}>drafts</div>
          </div>
        )}
      </div>

      <div className={styles.listGrid}>
        {lists.map((list, idx) => (
          <HomeListCard
            key={list.id}
            list={list}
            handle={handle}
            isHero={idx === 0}
          />
        ))}
      </div>
    </div>
  );
}

function HomeListCard({
  list,
  handle,
  isHero,
}: {
  list: HomeList;
  handle: string | null;
  isHero: boolean;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const photoUrl = placePhotoUrl(list.heroPhotoRef, isHero ? 1200 : 800);
  const gradient = COVER_GRADIENTS[list.coverStyle ?? 0] || COVER_GRADIENTS[0];

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setImgLoaded(true);
    }
  }, []);

  return (
    <Link
      href={`/list/${list.id}/edit`}
      className={`${styles.listCard} ${isHero ? styles.listCardHero : ""}`}
    >
      <div className={styles.listCardImage}>
        {photoUrl ? (
          <img
            ref={imgRef}
            src={photoUrl}
            alt={list.title}
            className={`${styles.listCardPhoto} ${imgLoaded ? "" : ""}`}
            loading={isHero ? "eager" : "lazy"}
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className={styles.listCardGradient} style={{ background: gradient }} />
        )}
        <div className={styles.listCardOverlay} />
        {list.isPublished ? (
          <span className={`${styles.listCardBadge} ${styles.listCardBadgePublished}`}>
            Published
          </span>
        ) : (
          <span className={`${styles.listCardBadge} ${styles.listCardBadgeDraft}`}>
            Draft
          </span>
        )}
      </div>
      <div className={styles.listCardBody}>
        <h3 className={styles.listCardTitle}>
          {list.emoji && <span className={styles.listCardEmoji}>{list.emoji} </span>}
          {list.title}
        </h3>
        <span className={styles.listCardMeta}>
          {list.placeCount} place{list.placeCount !== 1 ? "s" : ""} · {timeAgo(list.updatedAt)}
        </span>
      </div>
    </Link>
  );
}
