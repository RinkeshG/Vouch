"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Stamp } from "@/components/ui/stamp";
import { cn, timeAgo } from "@/lib/utils";
import styles from "./vouch-card.module.css";

interface VouchCardProps {
  id: string;
  authorHandle: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  placeId: string;
  placeName: string;
  placeArea: string;
  placeCuisine?: string;
  placePrice?: string;
  placeImageUrl?: string | null;
  take: string;
  contextTags?: string[];
  createdAt: string;
  isSaved?: boolean;
  currentUserId?: string;
  authorId?: string;
  /** Card style: "feed" (horizontal with photo), "compact" (for place page takes), "grid" (profile grid) */
  variant?: "feed" | "compact" | "grid";
  hidePlace?: boolean;
  reason?: string;
}

export function VouchCard({
  authorHandle,
  authorName,
  authorAvatarUrl,
  placeId,
  placeName,
  placeArea,
  placeCuisine,
  placePrice,
  placeImageUrl,
  take,
  contextTags = [],
  createdAt,
  isSaved: initialSaved = false,
  currentUserId,
  variant = "feed",
  hidePlace = false,
  reason,
}: VouchCardProps) {
  const [saved, setSaved] = useState(initialSaved);

  async function toggleSave() {
    const newSaved = !saved;
    setSaved(newSaved);

    const hasSupabase =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!hasSupabase) return;

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      if (newSaved) {
        await supabase.from("saved_places").insert({
          user_id: currentUserId,
          place_id: placeId,
        });
      } else {
        await supabase
          .from("saved_places")
          .delete()
          .eq("user_id", currentUserId)
          .eq("place_id", placeId);
      }
    } catch {
      setSaved(!newSaved);
    }
  }

  // ---- Compact variant (for place page takes) ----
  if (variant === "compact") {
    return (
      <article className={styles.compactCard}>
        <div className={styles.compactHeader}>
          <Link href={`/${authorHandle}`} className={styles.compactAuthor}>
            <Avatar
              handle={authorHandle}
              name={authorName}
              imageUrl={authorAvatarUrl}
              size="sm"
            />
            <div>
              <div className={styles.compactAuthorName}>{authorName}</div>
              <div className={styles.compactMeta}>
                @{authorHandle} · {timeAgo(createdAt)}
              </div>
            </div>
          </Link>
          <Stamp size={28} />
        </div>
        <p className={styles.compactTake}>&ldquo;{take}&rdquo;</p>
        {contextTags.length > 0 && (
          <div className={styles.tags}>
            {contextTags.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
      </article>
    );
  }

  // ---- Grid variant (for profile vouch grid) ----
  if (variant === "grid") {
    return (
      <article className={styles.gridCard}>
        {placeImageUrl && (
          <Link href={`/place/${placeId}`}>
            <div
              className={styles.gridImage}
              style={{ backgroundImage: `url(${placeImageUrl})` }}
            />
          </Link>
        )}
        <div className={styles.gridBody}>
          <Link href={`/place/${placeId}`} className={styles.gridPlaceName}>
            {placeName}
          </Link>
          <div className={styles.gridLabel}>
            {placeCuisine?.toUpperCase()}
            {placeArea && ` · ${placeArea.toUpperCase()}`}
          </div>
          <p className={styles.gridTake}>&ldquo;{take}&rdquo;</p>
        </div>
      </article>
    );
  }

  // ---- Feed variant (default — horizontal card with photo) ----
  return (
    <article className={styles.card}>
      {/* Photo side */}
      {placeImageUrl && (
        <Link href={`/place/${placeId}`} className={styles.cardImage}>
          <div
            className={styles.cardImageInner}
            style={{ backgroundImage: `url(${placeImageUrl})` }}
          />
        </Link>
      )}

      {/* Content side */}
      <div className={cn(styles.cardContent, !placeImageUrl && styles.cardContentFull)}>
        {/* Attribution row */}
        <div className={styles.attrRow}>
          <Link href={`/${authorHandle}`} className={styles.authorLink}>
            <Avatar
              handle={authorHandle}
              name={authorName}
              imageUrl={authorAvatarUrl}
              size="xs"
            />
          </Link>
          {reason ? (
            <span className={styles.reason}>
              <span className={styles.reasonDot} />
              {reason}
            </span>
          ) : (
            <span className={styles.reason}>
              <span className={styles.reasonDot} />
              Because {authorName.split(" ")[0]} vouched
            </span>
          )}
          <span className={styles.time}>{timeAgo(createdAt)}</span>
        </div>

        {/* Place name */}
        {!hidePlace && (
          <>
            <Link href={`/place/${placeId}`} className={styles.placeName}>
              {placeName}
            </Link>
            <div className={styles.placeLabel}>
              {placeCuisine?.toUpperCase()}
              {placeArea && ` · ${placeArea.split(",")[0].toUpperCase()}`}
              {placePrice && ` · ${placePrice}`}
            </div>
          </>
        )}

        {/* The take */}
        <p className={styles.take}>&ldquo;{take}&rdquo;</p>

        {/* Context tags */}
        {contextTags.length > 0 && (
          <div className={styles.tags}>
            {contextTags.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className={styles.actions}>
          <button className={styles.actionBtn}>
            <Icon name="plus" size={14} strokeWidth={2} />
            Vouch this too
          </button>
          <button
            className={cn(styles.actionBtnSecondary, saved && styles.actionBtnSaved)}
            onClick={toggleSave}
          >
            <Icon name={saved ? "bookmark-filled" : "bookmark"} size={14} />
            {saved ? "Saved" : "Save"}
          </button>
          <button className={styles.actionBtnGhost}>
            <Icon name="share" size={14} />
            Send
          </button>
        </div>
      </div>
    </article>
  );
}
