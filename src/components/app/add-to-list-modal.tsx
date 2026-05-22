"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import styles from "./add-to-list-modal.module.css";

function isClientDemoMode() {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

interface UserList {
  id: string;
  title: string;
}

interface AddToListModalProps {
  placeId: string;
  placeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToListModal({
  placeId,
  placeName,
  isOpen,
  onClose,
}: AddToListModalProps) {
  const isDemo = isClientDemoMode();
  const [lists, setLists] = useState<UserList[]>([]);
  const [addedListIds, setAddedListIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    if (isDemo) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const [listsRes, placesRes] = await Promise.all([
        supabase
          .from("lists")
          .select("id, title")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("list_places")
          .select("list_id")
          .eq("place_id", placeId),
      ]);

      setLists(listsRes.data || []);
      setAddedListIds(
        new Set((placesRes.data || []).map((lp) => lp.list_id))
      );
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [isDemo, placeId]);

  useEffect(() => {
    if (isOpen) {
      fetchLists();
    }
  }, [isOpen, fetchLists]);

  async function togglePlace(listId: string) {
    const isAdded = addedListIds.has(listId);
    const prev = new Set(addedListIds);

    // Optimistic update
    if (isAdded) {
      setAddedListIds((s) => {
        const next = new Set(s);
        next.delete(listId);
        return next;
      });
    } else {
      setAddedListIds((s) => new Set(s).add(listId));
    }

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      if (isAdded) {
        await supabase
          .from("list_places")
          .delete()
          .eq("list_id", listId)
          .eq("place_id", placeId);
      } else {
        // Get current max position
        const { data: existing } = await supabase
          .from("list_places")
          .select("position")
          .eq("list_id", listId)
          .order("position", { ascending: false })
          .limit(1);

        const nextPosition =
          existing && existing.length > 0 ? existing[0].position + 1 : 0;

        await supabase.from("list_places").insert({
          list_id: listId,
          place_id: placeId,
          position: nextPosition,
        });
      }
    } catch {
      setAddedListIds(prev);
    }
  }

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Add to list</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className={styles.body}>
          {isDemo ? (
            <p className={styles.demoMessage}>
              Lists require a Supabase connection. Set up your environment to
              use this feature.
            </p>
          ) : loading ? (
            <p className={styles.loading}>Loading your lists...</p>
          ) : lists.length === 0 ? (
            <p className={styles.emptyMessage}>
              You don&apos;t have any lists yet. Create one below.
            </p>
          ) : (
            lists.map((list) => (
              <button
                key={list.id}
                className={styles.listRow}
                onClick={() => togglePlace(list.id)}
              >
                <span className={styles.listRowTitle}>{list.title}</span>
                <span
                  className={cn(
                    styles.toggle,
                    addedListIds.has(list.id) && styles.toggleActive
                  )}
                >
                  {addedListIds.has(list.id) && (
                    <Icon name="check" size={14} />
                  )}
                </span>
              </button>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <Link
            href={`/list/create?placeId=${placeId}&placeName=${encodeURIComponent(placeName)}`}
            className={styles.createLink}
            onClick={onClose}
          >
            <Icon name="plus" size={14} />
            Create new list
          </Link>
        </div>
      </div>
    </div>
  );
}
