"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import styles from "./explore.module.css";

interface ExploreList {
  id: string;
  title: string;
  description: string | null;
  slug: string | null;
  emoji: string | null;
  coverStyle: number;
  placeCount: number;
  createdAt: string;
  authorHandle: string;
  authorName: string;
  authorAvatarUrl: string | null;
}

interface ExploreClientProps {
  initialLists: ExploreList[];
  isAuthed: boolean;
}

export function ExploreClient({ initialLists, isAuthed }: ExploreClientProps) {
  if (initialLists.length === 0) {
    return (
      <div className={styles.page}>
        <h1 className={styles.heading}>Explore</h1>
        <EmptyState
          icon="globe"
          title="No lists yet"
          message="Be the first to create and publish a curated list."
          action={
            <Link href={isAuthed ? "/new" : "/sign-up"}>
              <Button variant="seal">Create your first list</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Explore</h1>
      <p className={styles.subheading}>
        Curated lists from people in Bangalore
      </p>

      <div className={styles.grid}>
        {initialLists.map((list) => {
          const href = list.slug
            ? `/@${list.authorHandle}/${list.slug}`
            : `/@${list.authorHandle}`;

          return (
            <Link key={list.id} href={href} className={styles.card}>
              <div className={styles.cardBg} data-style={list.coverStyle} />
              <div className={styles.cardContent}>
                {list.emoji && (
                  <span className={styles.cardEmoji}>{list.emoji}</span>
                )}
                <h2 className={styles.cardTitle}>{list.title}</h2>
                <span className={styles.cardCount}>
                  {list.placeCount} place{list.placeCount !== 1 ? "s" : ""}
                </span>
                <div className={styles.cardAuthor}>
                  <Avatar
                    handle={list.authorHandle}
                    name={list.authorName}
                    imageUrl={list.authorAvatarUrl}
                    size="xs"
                  />
                  <span className={styles.cardAuthorName}>
                    {list.authorName}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom CTA — drive signups from public explore page */}
      {!isAuthed && (
        <div className={styles.bottomCta}>
          <p className={styles.bottomCtaText}>
            Got a list in your head? Put it on the internet.
          </p>
          <Link href="/sign-up">
            <Button variant="seal" size="lg">
              Create your own list
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
