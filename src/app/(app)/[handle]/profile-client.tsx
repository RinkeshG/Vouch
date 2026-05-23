"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/app/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { placePhotoUrl } from "@/types";
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
  coverStyle: number;
  isPublished: boolean;
  heroPhotoRef: string | null;
}

const COVER_GRADIENTS = [
  "linear-gradient(135deg, #BF3A2B 0%, #E8614A 100%)",
  "linear-gradient(135deg, #1B4332 0%, #40916C 100%)",
  "linear-gradient(135deg, #1D3557 0%, #457B9D 100%)",
  "linear-gradient(135deg, #7B2D8E 0%, #B56BC8 100%)",
  "linear-gradient(135deg, #C97B1A 0%, #E8B44A 100%)",
];

interface ProfileClientProps {
  profile: ProfileInfo;
  lists: ProfileList[];
  isOwnProfile: boolean;
}

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
            {visibleLists.map((list) => {
              const href = list.slug
                ? `/@${profile.handle}/${list.slug}`
                : `/@${profile.handle}`;
              const photoUrl = placePhotoUrl(list.heroPhotoRef, 800);
              const gradient = COVER_GRADIENTS[list.coverStyle] || COVER_GRADIENTS[0];
              return (
                <Link key={list.id} href={href} className={styles.listCard}>
                  <div className={styles.listCardImage}>
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={list.title}
                        className={styles.listCardPhoto}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.listCardBg} style={{ background: gradient }} />
                    )}
                    <div className={styles.listCardOverlay} />
                  </div>
                  <div className={styles.listCardContent}>
                    <h3 className={styles.listCardTitle}>
                      {list.emoji && <span className={styles.listCardEmoji}>{list.emoji} </span>}
                      {list.title}
                    </h3>
                    <span className={styles.listCardCount}>
                      {list.placeCount} place{list.placeCount !== 1 ? "s" : ""}
                    </span>
                    {!list.isPublished && (
                      <span className={styles.draftBadge}>Draft</span>
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
