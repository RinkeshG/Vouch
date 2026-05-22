"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Stamp } from "@/components/ui/stamp";
import { AvatarStack } from "./avatar-stack";
import { getCuisineVisual, getCuisineIcon, priceDots } from "@/lib/cuisine";
import { cn } from "@/lib/utils";
import styles from "./place-card.module.css";

interface PlaceCardVouch {
  take: string;
  authorName: string;
  authorHandle: string;
  authorAvatarUrl?: string | null;
}

interface PlaceCardProps {
  id: string;
  name: string;
  area: string;
  cuisines: string[];
  priceTier: number;
  vouchCount: number;
  /** Featured vouch(es) to display as pull quote */
  vouches?: PlaceCardVouch[];
  /** Is this place saved by the current user */
  isSaved?: boolean;
  currentUserId?: string;
  /** Visual variant */
  variant?: "default" | "compact" | "wide";
  isDemo?: boolean;
}

export function PlaceCard({
  id,
  name,
  area,
  cuisines,
  priceTier,
  vouchCount,
  vouches = [],
  isSaved: initialSaved = false,
  currentUserId,
  variant = "default",
  isDemo = false,
}: PlaceCardProps) {
  const [saved, setSaved] = useState(initialSaved);
  const visual = getCuisineVisual(cuisines);
  const icon = getCuisineIcon(cuisines);
  const featured = vouches[0]; // First vouch as pull quote

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId) return;

    const newSaved = !saved;
    setSaved(newSaved);

    if (isDemo) return;

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      if (newSaved) {
        await supabase.from("saved_places").insert({
          user_id: currentUserId,
          place_id: id,
        });
      } else {
        await supabase
          .from("saved_places")
          .delete()
          .eq("user_id", currentUserId)
          .eq("place_id", id);
      }
    } catch {
      setSaved(!newSaved);
    }
  }

  // Unique vouchers for avatar stack
  const uniqueAuthors = vouches.reduce<
    { handle: string; name: string; avatarUrl?: string | null }[]
  >((acc, v) => {
    if (!acc.find((a) => a.handle === v.authorHandle)) {
      acc.push({
        handle: v.authorHandle,
        name: v.authorName,
        avatarUrl: v.authorAvatarUrl,
      });
    }
    return acc;
  }, []);

  return (
    <Link
      href={`/place/${id}`}
      className={cn(
        styles.card,
        variant === "compact" && styles.compact,
        variant === "wide" && styles.wide
      )}
    >
      {/* Visual hero banner */}
      <div
        className={styles.hero}
        style={{ background: visual.gradient }}
      >
        <span className={styles.heroIcon}>{icon}</span>
      </div>

      {/* Card body */}
      <div className={styles.body}>
        {/* Place name */}
        <h3 className={styles.name}>{name}</h3>

        {/* Meta: area, price, vouch count */}
        <div className={styles.meta}>
          <span>{area}</span>
          {priceTier > 0 && (
            <>
              <span className={styles.metaDot} />
              <span className={styles.priceDots}>{priceDots(priceTier)}</span>
            </>
          )}
          <span className={styles.metaDot} />
          <span className={styles.vouchBadge}>
            <Stamp size={12} variant="outline" />
            {vouchCount}
          </span>
        </div>

        {/* Cuisine pills with colors */}
        {cuisines.length > 0 && (
          <div className={styles.cuisines}>
            {cuisines.map((c) => {
              const cv = getCuisineVisual([c]);
              return (
                <span
                  key={c}
                  className={styles.cuisinePill}
                  style={{
                    "--pill-bg": cv.bg,
                    "--pill-color": cv.color,
                  } as React.CSSProperties}
                >
                  <span className={styles.cuisineEmoji}>
                    {getCuisineIcon([c])}
                  </span>
                  {c}
                </span>
              );
            })}
          </div>
        )}

        {/* Featured take (pull quote) */}
        {featured && (
          <div className={styles.quote}>
            <p className={styles.quoteText}>
              &ldquo;{featured.take}&rdquo;
            </p>
            <p className={styles.quoteAuthor}>
              &mdash; {featured.authorName}
            </p>
          </div>
        )}

        {/* Social proof */}
        {uniqueAuthors.length > 0 && (
          <div className={styles.socialProof}>
            <AvatarStack
              people={uniqueAuthors}
              label={vouches.length === 1 ? "vouches" : "vouch"}
            />
          </div>
        )}

        {/* Footer: save action + vouch count badge */}
        {currentUserId && (
          <div className={styles.footer}>
            <button
              className={cn(
                styles.saveBtn,
                saved && styles.saveBtnActive
              )}
              onClick={toggleSave}
              aria-label={saved ? "Unsave" : "Save"}
            >
              <Icon
                name={saved ? "bookmark-filled" : "bookmark"}
                size={14}
              />
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}
