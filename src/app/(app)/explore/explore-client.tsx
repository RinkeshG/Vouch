"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { placePhotoUrl } from "@/types";
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
  heroPhotoRef: string | null;
}

interface ExploreClientProps {
  initialLists: ExploreList[];
  isAuthed: boolean;
}

const COVER_GRADIENTS = [
  "linear-gradient(135deg, #BF3A2B 0%, #E8614A 100%)",
  "linear-gradient(135deg, #1B4332 0%, #40916C 100%)",
  "linear-gradient(135deg, #1D3557 0%, #457B9D 100%)",
  "linear-gradient(135deg, #7B2D8E 0%, #B56BC8 100%)",
  "linear-gradient(135deg, #C97B1A 0%, #E8B44A 100%)",
];

function ListCard({
  list,
  size = "standard",
}: {
  list: ExploreList;
  size?: "feature" | "standard" | "compact";
}) {
  const href = list.slug
    ? `/@${list.authorHandle}/${list.slug}`
    : `/@${list.authorHandle}`;

  const photoUrl = placePhotoUrl(list.heroPhotoRef, size === "feature" ? 1200 : 800);
  const gradient = COVER_GRADIENTS[list.coverStyle] || COVER_GRADIENTS[0];

  const cardClass = [
    styles.card,
    size === "feature" ? styles.cardFeature : "",
    size === "compact" ? styles.cardCompact : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={href} className={cardClass}>
      <div className={styles.cardImage}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={list.title}
            className={styles.cardPhoto}
            loading="lazy"
          />
        ) : (
          <div className={styles.cardGradient} style={{ background: gradient }} />
        )}
        <div className={styles.cardOverlay} />
        <div className={styles.cardAuthorOverlay}>
          <Avatar
            handle={list.authorHandle}
            name={list.authorName}
            imageUrl={list.authorAvatarUrl}
            size="xs"
          />
          <span className={styles.cardAuthorName}>{list.authorName}</span>
        </div>
      </div>
      <div className={styles.cardBody}>
        <h2 className={styles.cardTitle}>
          {list.emoji && <span className={styles.cardEmoji}>{list.emoji} </span>}
          {list.title}
        </h2>
        {size !== "compact" && list.description && (
          <p className={styles.cardDesc}>{list.description}</p>
        )}
        <span className={styles.cardMeta}>
          {list.placeCount} place{list.placeCount !== 1 ? "s" : ""}
        </span>
      </div>
    </Link>
  );
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

  const [hero, ...rest] = initialLists;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Explore</h1>
      <p className={styles.subheading}>
        Curated lists from people in Bangalore
      </p>

      {hero && <ListCard list={hero} size="feature" />}

      <div className={styles.grid}>
        {rest.map((list, i) => (
          <ListCard
            key={list.id}
            list={list}
            size={i % 5 === 3 ? "feature" : "standard"}
          />
        ))}
      </div>

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
