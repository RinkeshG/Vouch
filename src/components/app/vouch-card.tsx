"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import { Stamp } from "@/components/ui/stamp";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import styles from "./vouch-card.module.css";

interface VouchCardProps {
  id: string;
  // Author
  authorHandle: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  // Place
  placeId: string;
  placeName: string;
  placeArea: string;
  // Content
  take: string;
  contextTags: string[];
  createdAt: string;
  // Interactions
  isSaved?: boolean;
  currentUserId?: string;
  authorId?: string;
  // Display
  compact?: boolean;
  hidePlace?: boolean;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;

  return `${Math.floor(months / 12)}y`;
}

export function VouchCard({
  id,
  authorHandle,
  authorName,
  authorAvatarUrl,
  placeId,
  placeName,
  placeArea,
  take,
  contextTags,
  createdAt,
  isSaved: initialSaved = false,
  currentUserId,
  authorId,
  compact = false,
  hidePlace = false,
}: VouchCardProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [savingState, setSavingState] = useState<"idle" | "saving">("idle");

  async function toggleSave() {
    if (savingState === "saving" || !currentUserId) return;
    setSavingState("saving");

    const supabase = createClient();
    const newSaved = !saved;
    setSaved(newSaved);

    try {
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
      setSaved(!newSaved); // Revert on error
    } finally {
      setSavingState("idle");
    }
  }

  return (
    <article className={cn(styles.card, compact && styles.compact)}>
      {/* Header */}
      <div className={styles.header}>
        <Link href={`/${authorHandle}`}>
          <Avatar
            handle={authorHandle}
            name={authorName}
            imageUrl={authorAvatarUrl}
            size="sm"
          />
        </Link>
        <div className={styles.headerInfo}>
          <div className={styles.nameRow}>
            <Link href={`/${authorHandle}`} className={styles.displayName}>
              {authorName}
            </Link>
            <span className={styles.handle}>@{authorHandle}</span>
            <span className={styles.dot}>&middot;</span>
            <span className={styles.time}>{timeAgo(createdAt)}</span>
          </div>
        </div>
        <Stamp size={18} variant="outline" />
      </div>

      {/* Place pill */}
      {!hidePlace && (
        <Link href={`/place/${placeId}`} className={styles.place}>
          <Icon name="map-pin" size={16} className={styles.placeIcon} />
          <div className={styles.placeInfo}>
            <p className={styles.placeName}>{placeName}</p>
            <p className={styles.placeArea}>{placeArea}</p>
          </div>
          <Icon
            name="chevron-right"
            size={14}
            className={styles.placeChevron}
          />
        </Link>
      )}

      {/* Take */}
      <p className={styles.take}>
        <span className={styles.takeQuote}>&ldquo;</span>
        {take}
        <span className={styles.takeQuote}>&rdquo;</span>
      </p>

      {/* Context tags */}
      {contextTags.length > 0 && (
        <div className={styles.tags}>
          {contextTags.map((tag) => (
            <Tag key={tag} variant="default" as="span">
              {tag}
            </Tag>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={cn(styles.actionBtn, saved && styles.actionBtnActive)}
          onClick={toggleSave}
          aria-label={saved ? "Unsave place" : "Save place"}
          disabled={!currentUserId}
        >
          <Icon
            name={saved ? "bookmark-filled" : "bookmark"}
            size={16}
          />
          <span>{saved ? "Saved" : "Save"}</span>
        </button>

        <button className={styles.actionBtn} aria-label="Share vouch">
          <Icon name="share" size={16} />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
}
