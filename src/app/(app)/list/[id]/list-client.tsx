"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import styles from "./list.module.css";

interface ListPlace {
  id: string;
  listPlaceId: string;
  name: string;
  area: string;
  cuisines: string[];
  coverImageUrl: string | null;
  vouchCount: number;
  position: number;
}

interface ListOwner {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
}

interface ListDetailClientProps {
  list: {
    id: string;
    title: string;
    description: string | null;
    isPublic: boolean;
    userId: string;
    createdAt: string;
  };
  places: ListPlace[];
  owner: ListOwner;
  isSaved: boolean;
  isOwnList: boolean;
  currentUserId: string;
}

export function ListDetailClient({
  list,
  places: initialPlaces,
  owner,
  isSaved: initialSaved,
  isOwnList,
  currentUserId,
}: ListDetailClientProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [places, setPlaces] = useState(initialPlaces);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const getShareUrl = useCallback(
    () => `${window.location.origin}/list/${list.id}`,
    [list.id]
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

  async function toggleSave() {
    const newSaved = !saved;
    setSaved(newSaved);

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    try {
      if (newSaved) {
        await supabase.from("list_saves").insert({
          user_id: currentUserId,
          list_id: list.id,
        });
      } else {
        await supabase
          .from("list_saves")
          .delete()
          .eq("user_id", currentUserId)
          .eq("list_id", list.id);
      }
    } catch {
      setSaved(!newSaved);
    }
  }

  async function handleShare() {
    const url = getShareUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: list.title,
          text: `Check out "${list.title}" on Vouch`,
          url,
        });
        return;
      } catch {
        // Fall through to dropdown
      }
    }
    setShareOpen((prev) => !prev);
  }

  async function copyLink() {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShareOpen(false);
      }, 1200);
    } catch {
      // Clipboard unavailable
    }
  }

  async function handleDeleteList() {
    if (!confirm("Delete this list? This cannot be undone.")) return;

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    try {
      await supabase.from("lists").delete().eq("id", list.id);
      router.push("/home");
    } catch {
      // Silent fail
    }
  }

  async function handleRemovePlace(listPlaceId: string) {
    const prev = places;
    setPlaces((p) => p.filter((pl) => pl.listPlaceId !== listPlaceId));

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    try {
      await supabase.from("list_places").delete().eq("id", listPlaceId);
    } catch {
      setPlaces(prev);
    }
  }

  return (
    <div className={styles.page}>
      {/* Breadcrumbs */}
      <nav className={styles.breadcrumbs}>
        <Link href="/home">Home</Link>
        {" / "}
        <span>Lists</span>
        {" / "}
        <span>{list.title}</span>
      </nav>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.kicker}>
            LIST {" · "} {places.length} PLACE{places.length !== 1 ? "S" : ""}
          </div>
          <h1 className={styles.title}>{list.title}</h1>
          {list.description && (
            <p className={styles.description}>{list.description}</p>
          )}
          <div className={styles.ownerRow}>
            <Avatar
              handle={owner.handle}
              name={owner.displayName}
              imageUrl={owner.avatarUrl}
              size="xs"
            />
            <span>
              by{" "}
              <Link href={`/${owner.handle}`} className={styles.ownerLink}>
                {owner.displayName}
              </Link>
            </span>
          </div>
        </div>

        <div className={styles.headerActions}>
          {!isOwnList && (
            <button
              className={cn(styles.btnSecondary, saved && styles.btnSaved)}
              onClick={toggleSave}
            >
              <Icon name={saved ? "bookmark-filled" : "bookmark"} size={14} />
              {saved ? "Saved" : "Save list"}
            </button>
          )}
          <div style={{ position: "relative" }} ref={shareRef}>
            <button className={styles.btnSecondary} onClick={handleShare}>
              <Icon name="share" size={14} />
              Share
            </button>
            {shareOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  zIndex: 50,
                  minWidth: 170,
                  background: "var(--v-surface)",
                  border: "1px solid var(--v-line)",
                  borderRadius: "var(--v-radius-card)",
                  boxShadow: "var(--v-shadow-sm)",
                  padding: "4px 0",
                }}
              >
                <button
                  onClick={copyLink}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 16px",
                    textAlign: "left",
                    fontSize: 14,
                    fontWeight: 500,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
            )}
          </div>
          {isOwnList && (
            <button className={styles.btnDanger} onClick={handleDeleteList}>
              <Icon name="x" size={14} />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Places */}
      <div className={styles.placesSection}>
        {places.length > 0 ? (
          <div className={styles.placesList}>
            {places.map((place, i) => (
              <div key={place.listPlaceId} className={styles.placeRow}>
                <span className={styles.placeIndex}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {place.coverImageUrl && (
                  <div
                    className={styles.placeImage}
                    style={{ backgroundImage: `url(${place.coverImageUrl})` }}
                  />
                )}
                <Link href={`/place/${place.id}`} className={styles.placeInfo}>
                  <div className={styles.placeName}>{place.name}</div>
                  <div className={styles.placeMeta}>
                    {place.cuisines[0]?.toUpperCase() || "RESTAURANT"}
                    {" · "}
                    {place.area.split(",")[0].toUpperCase()}
                  </div>
                  <div className={styles.placeVouches}>
                    {place.vouchCount} vouch{place.vouchCount !== 1 ? "es" : ""}
                  </div>
                </Link>
                {isOwnList && (
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemovePlace(place.listPlaceId)}
                  >
                    <Icon name="x" size={12} />
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyWrap}>
            <p className={styles.emptyText}>
              No places in this list yet.
            </p>
          </div>
        )}
      </div>

      <div className={styles.bottomSpacer} />
    </div>
  );
}
