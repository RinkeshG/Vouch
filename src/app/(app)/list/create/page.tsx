"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopBar, TopBarIconButton } from "@/components/app/top-bar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import styles from "./create.module.css";

export default function CreateListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const placeId = searchParams.get("placeId");
  const placeName = searchParams.get("placeName");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setError(null);
    setSaving(true);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be signed in.");
        setSaving(false);
        return;
      }

      const { data: newList, error: insertError } = await supabase
        .from("lists")
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          is_public: true,
        })
        .select("id")
        .single();

      if (insertError || !newList) {
        setError("Failed to create list. Try again.");
        setSaving(false);
        return;
      }

      // If a place was specified, add it to the new list
      if (placeId) {
        await supabase.from("list_places").insert({
          list_id: newList.id,
          place_id: placeId,
          position: 0,
        });
      }

      router.push(`/list/${newList.id}`);
    } catch {
      setError("Something went wrong. Try again.");
      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <TopBar
        title="Create list"
        left={
          <TopBarIconButton label="Back" onClick={() => router.back()}>
            <Icon name="x" size={20} />
          </TopBarIconButton>
        }
      />

      <div className={styles.content}>
        {placeId && placeName && (
          <div className={styles.placeBadge}>
            <Icon name="map-pin" size={16} className={styles.placeBadgeIcon} />
            <span className={styles.placeBadgeName}>{placeName}</span>
            <span style={{ color: "var(--v-muted)", fontSize: 13 }}>
              will be added
            </span>
          </div>
        )}

        <div className={styles.fieldGroup}>
          <Input
            label="Title"
            placeholder="e.g. Best date night spots"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 60))}
            maxLength={60}
            autoFocus
          />
          <div className={styles.charCount}>{title.length}/60</div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Description (optional)</label>
          <textarea
            className={styles.textarea}
            placeholder="A short note about this list..."
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 200))}
            maxLength={200}
          />
          <div className={styles.charCount}>{description.length}/200</div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            variant="seal"
            disabled={!title.trim()}
            loading={saving}
            onClick={handleSubmit}
          >
            Create list
          </Button>
        </div>
      </div>
    </div>
  );
}
