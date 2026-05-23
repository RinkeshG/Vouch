"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/app/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import styles from "./profile.module.css";

interface ProfileInfo {
  id: string;
  handle: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  avatarTint: number;
  listCount: number;
  city?: string;
}

interface ProfileList {
  id: string;
  title: string;
  slug: string | null;
  emoji: string | null;
  description: string | null;
  placeCount: number;
  saveCount: number;
  coverStyle: number;
  isPublished: boolean;
  previewPlaces: { name: string; area: string }[];
}

interface ProfileClientProps {
  profile: ProfileInfo;
  lists: ProfileList[];
  isOwnProfile: boolean;
}

const BAND_COLORS: Record<number, { bg: string; text: string }> = {
  0: { bg: "#B8412C", text: "#FFFFFF" },
  1: { bg: "#7A8472", text: "#FFFFFF" },
  2: { bg: "#3D2B3D", text: "#FFFFFF" },
  3: { bg: "#C49A4A", text: "#181210" },
  4: { bg: "#8A2E1F", text: "#FFFFFF" },
};
const BAND_FALLBACK = { bg: "#6E4F3A", text: "#FFFFFF" };

export function ProfileClient({
  profile,
  lists,
  isOwnProfile,
}: ProfileClientProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const getShareUrl = useCallback(
    () => `${window.location.origin}/@${profile.handle}`,
    [profile.handle]
  );

  useEffect(() => {
    if (!shareOpen) return;
    function handleClick(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [shareOpen]);

  async function handleShare() {
    const url = getShareUrl();
    const shareText = `Check out ${profile.displayName}'s lists on Vouch`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Vouch", text: shareText, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    setShareOpen((prev) => !prev);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShareOpen(false);
      }, 1200);
    } catch {
      /* clipboard unavailable */
    }
  }

  function shareWhatsApp() {
    const url = getShareUrl();
    const text = `Check out ${profile.displayName}'s lists on Vouch`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      "_blank"
    );
    setShareOpen(false);
  }

  function shareTwitter() {
    const url = getShareUrl();
    const text = `Check out ${profile.displayName}'s lists on Vouch`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
    setShareOpen(false);
  }

  const city = profile.city || "Bangalore";

  // Only show published lists to non-owners
  const visibleLists = isOwnProfile
    ? lists
    : lists.filter((l) => l.isPublished);

  return (
    <div className={styles.page}>
      {/* ---- Hero ---- */}
      <div className={styles.hero}>
        <span className={styles.eyebrow}>Curator</span>
        <Avatar
          handle={profile.handle}
          name={profile.displayName}
          imageUrl={profile.avatarUrl}
          size="xl"
        />
        <h1 className={styles.displayName}>{profile.displayName}</h1>
        <div className={styles.handle}>@{profile.handle}</div>
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
        <div className={styles.meta}>
          <span className={styles.cityTag}>{city}</span>
          <span className={styles.stat}>
            {visibleLists.length} list{visibleLists.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className={styles.heroActions}>
          {isOwnProfile ? (
            <>
              <Link href="/new">
                <Button variant="seal" size="sm" icon={<Icon name="plus" size={14} />}>
                  New list
                </Button>
              </Link>
              <div className={styles.shareWrap} ref={shareRef}>
                <Button variant="secondary" size="sm" onClick={handleShare}>
                  <Icon name="share" size={14} />
                  Share
                </Button>
                {shareOpen && (
                  <div className={styles.shareMenu}>
                    <button className={styles.shareMenuItem} onClick={copyLink}>
                      {copied ? "Copied!" : "Copy link"}
                    </button>
                    <button className={styles.shareMenuItem} onClick={shareWhatsApp}>
                      WhatsApp
                    </button>
                    <button className={styles.shareMenuItem} onClick={shareTwitter}>
                      Twitter / X
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.shareWrap} ref={shareRef}>
              <Button variant="secondary" size="sm" onClick={handleShare}>
                <Icon name="share" size={14} />
                Share profile
              </Button>
              {shareOpen && (
                <div className={styles.shareMenu}>
                  <button className={styles.shareMenuItem} onClick={copyLink}>
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                  <button className={styles.shareMenuItem} onClick={shareWhatsApp}>
                    WhatsApp
                  </button>
                  <button className={styles.shareMenuItem} onClick={shareTwitter}>
                    Twitter / X
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---- List gallery ---- */}
      {visibleLists.length > 0 ? (
        <>
          <div className={styles.sectionLabel}>Lists</div>
          <div className={styles.listGrid}>
            {visibleLists.map((list, idx) => {
              const href = list.slug
                ? `/@${profile.handle}/${list.slug}`
                : `/@${profile.handle}`;
              const band = BAND_COLORS[list.coverStyle] ?? BAND_FALLBACK;
              const listNumber = String(idx + 1).padStart(2, "0");

              return (
                <Link key={list.id} href={href} className={styles.listCard}>
                  {/* Colored band header */}
                  <div
                    className={styles.cardBand}
                    style={{ background: band.bg, color: band.text }}
                  >
                    <div className={styles.cardBandRow}>
                      <span>LIST №{listNumber}</span>
                      <span className={styles.cardBandHandle}>
                        @{profile.handle}
                        {!list.isPublished && (
                          <span className={styles.draftBadge}>Draft</span>
                        )}
                      </span>
                    </div>
                    <div className={styles.cardBandTitle}>
                      {list.emoji && (
                        <span className={styles.cardBandEmoji}>{list.emoji}</span>
                      )}
                      {list.title}
                    </div>
                  </div>

                  {/* Cream body with place previews */}
                  <div className={styles.cardBody}>
                    {list.previewPlaces.length > 0 ? (
                      <ul className={styles.cardPlaces}>
                        {list.previewPlaces.map((place, i) => (
                          <li key={i} className={styles.cardPlaceItem}>
                            <span className={styles.cardPlaceName}>{place.name}</span>
                            {place.area && (
                              <span className={styles.cardPlaceHood}>{place.area}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className={styles.cardPlacesEmpty}>No places yet</div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className={styles.cardFoot}>
                    <span>
                      {list.placeCount} place{list.placeCount !== 1 ? "s" : ""}
                    </span>
                    {list.saveCount > 0 && (
                      <span className={styles.cardSaveCount}>
                        <svg viewBox="0 0 24 24" className={styles.heartIcon}>
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {list.saveCount}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <div className={styles.emptyWrap}>
          <EmptyState
            icon="list"
            title={isOwnProfile ? "No lists yet" : "No lists yet"}
            message={
              isOwnProfile
                ? "Create a curated list of your favorite places."
                : `${profile.displayName} hasn't created any lists yet.`
            }
            action={
              isOwnProfile ? (
                <Link href="/new">
                  <Button variant="seal">Create your first list</Button>
                </Link>
              ) : undefined
            }
          />
        </div>
      )}

      {/* Bottom CTA for visitors */}
      {!isOwnProfile && (
        <div className={styles.bottomCta}>
          <p className={styles.bottomCtaText}>
            Inspired? Create your own curated list.
          </p>
          <Link href="/sign-up">
            <Button variant="seal">Create yours on Vouch</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
