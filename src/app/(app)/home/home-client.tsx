"use client";

import Link from "next/link";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { timeAgo } from "@/lib/utils";
import styles from "./home.module.css";

interface PreviewPlace {
  name: string;
  area: string | null;
}

interface HomeList {
  id: string;
  title: string;
  slug: string | null;
  emoji: string | null;
  description: string | null;
  placeCount: number;
  isPublished: boolean;
  updatedAt: string;
  previewPlaces: PreviewPlace[];
}

interface HomeClientProps {
  handle: string | null;
  displayName: string | null;
  lists: HomeList[];
  totalPlaces: number;
}

function padIndex(n: number): string {
  return String(n).padStart(2, "0");
}

export function HomeClient({
  handle,
  displayName,
  lists,
  totalPlaces,
}: HomeClientProps) {
  if (lists.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash}>&mdash;</span>
            YOUR LISTS
          </p>
          <h1 className={styles.statsHeading}>Start curating</h1>
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
      {/* ---- Header ---- */}
      <div className={styles.header}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDash}>&mdash;</span>
          YOUR LISTS
        </p>
        <h1 className={styles.statsHeading}>
          {lists.length} list{lists.length !== 1 ? "s" : ""}
          <span className={styles.statsSep}>&middot;</span>
          {totalPlaces} place{totalPlaces !== 1 ? "s" : ""}
        </h1>
        {displayName && (
          <span className={styles.ownerHint}>by {displayName}</span>
        )}
      </div>

      {/* ---- Action bar ---- */}
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

      {/* ---- Editorial list rows ---- */}
      <div className={styles.listSection}>
        {lists.map((list, idx) => {
          const previewText =
            list.previewPlaces.length > 0
              ? list.previewPlaces.map((p) => p.name).join(", ")
              : null;

          return (
            <Link
              key={list.id}
              href={`/list/${list.id}/edit`}
              className={styles.listRow}
            >
              {/* Number */}
              <span className={styles.listNumber}>{padIndex(idx + 1)}</span>

              {/* Title + meta */}
              <div className={styles.listInfo}>
                <div className={styles.listTitleRow}>
                  <span className={styles.listTitle}>{list.title}</span>
                  {list.emoji && (
                    <span className={styles.listEmoji}>{list.emoji}</span>
                  )}
                </div>
                <span className={styles.listMeta}>
                  {list.placeCount} place{list.placeCount !== 1 ? "s" : ""}
                  <span className={styles.metaSep}>&middot;</span>
                  {timeAgo(list.updatedAt)}
                </span>
                {previewText && (
                  <span className={styles.listPreview}>{previewText}</span>
                )}
              </div>

              {/* Right: badge + actions */}
              <div className={styles.listRowRight}>
                {list.isPublished ? (
                  <span className={styles.publishedBadge}>Published</span>
                ) : (
                  <span className={styles.draftBadge}>Draft</span>
                )}

                {list.isPublished && list.slug && handle && (
                  <span
                    className={styles.viewLink}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/@${handle}/${list.slug}`;
                    }}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/@${handle}/${list.slug}`;
                      }
                    }}
                  >
                    <Icon name="external" size={13} />
                    View
                  </span>
                )}

                <Icon
                  name="chevron-right"
                  size={16}
                  className={styles.rowChevron}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
