"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { updateList, deleteList, togglePublish } from "./actions";
import styles from "./edit.module.css";

/* ---- Types ---- */

interface SearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry?: { location: { lat: number; lng: number } };
  types?: string[];
}

interface ListItem {
  localId: string; // client-side key
  placeId: string;
  name: string;
  area: string;
  note: string;
  lat: number | null;
  lng: number | null;
}

interface EditListClientProps {
  listId: string;
  initialTitle: string;
  initialDescription: string;
  initialSlug: string;
  initialEmoji: string;
  initialCoverStyle: number;
  initialIsPublished: boolean;
  initialItems: Array<{
    placeId: string;
    name: string;
    area: string;
    note: string;
    lat: number | null;
    lng: number | null;
  }>;
  handle: string;
  city: string;
}

/* ---- Slug helper ---- */

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .slice(0, 80);
}

/* ---- Cover style palettes (matching landing page card bands) ---- */
const COVER_STYLES = [
  { label: "Rust", gradient: "#B8412C" },
  { label: "Sage", gradient: "#7A8472" },
  { label: "Aubergine", gradient: "#3D2B3D" },
  { label: "Ochre", gradient: "#C49A4A" },
  { label: "Wine", gradient: "#8A2E1F" },
];

/* ---- Component ---- */

export function EditListClient({
  listId,
  initialTitle,
  initialDescription,
  initialSlug,
  initialEmoji,
  initialCoverStyle,
  initialIsPublished,
  initialItems,
  handle,
  city,
}: EditListClientProps) {
  const router = useRouter();

  // List state (pre-filled from server)
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [items, setItems] = useState<ListItem[]>(
    initialItems.map((item, idx) => ({
      localId: `${item.placeId}-${idx}`,
      ...item,
    }))
  );
  const [coverStyle, setCoverStyle] = useState(initialCoverStyle);
  const [emoji, setEmoji] = useState(initialEmoji);
  const [isPublished, setIsPublished] = useState(initialIsPublished);

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Save/action state
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Note editing
  const [editingNote, setEditingNote] = useState<string | null>(null);

  // Drag state
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Derived
  const slug = toSlug(title) || initialSlug;
  const canSave = title.trim().length > 0;
  const canPublish = title.trim().length > 0 && items.length >= 3;
  const placesNeeded = Math.max(0, 3 - items.length);

  /* ---- Search with debounce ---- */
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(
          `/api/places/search?q=${encodeURIComponent(q)}&city=${encodeURIComponent(city)}`
        );
        const data = await res.json();
        // Filter out places already in the list
        const existingIds = new Set(items.map((i) => i.placeId));
        setResults(
          (data.results || [])
            .filter((r: SearchResult) => !existingIds.has(r.place_id))
            .slice(0, 6)
        );
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    },
    [city, items]
  );

  function handleQueryChange(val: string) {
    setQuery(val);
    setFocusedIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  }

  /* ---- Add place ---- */

  function addPlace(result: SearchResult) {
    const area = result.formatted_address.split(",").slice(0, 2).join(",").trim();
    const newItem: ListItem = {
      localId: `${result.place_id}-${Date.now()}`,
      placeId: result.place_id,
      name: result.name,
      area,
      note: "",
      lat: result.geometry?.location.lat ?? null,
      lng: result.geometry?.location.lng ?? null,
    };
    setItems((prev) => [...prev, newItem]);
    setQuery("");
    setResults([]);
    setFocusedIdx(-1);
    setTimeout(() => searchRef.current?.focus(), 50);
  }

  function removePlace(localId: string) {
    setItems((prev) => prev.filter((i) => i.localId !== localId));
  }

  function updateNote(localId: string, note: string) {
    setItems((prev) =>
      prev.map((i) => (i.localId === localId ? { ...i, note: note.slice(0, 140) } : i))
    );
  }

  /* ---- Keyboard nav in search dropdown ---- */

  function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIdx((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && focusedIdx >= 0) {
      e.preventDefault();
      addPlace(results[focusedIdx]);
    } else if (e.key === "Escape") {
      setResults([]);
      setFocusedIdx(-1);
    }
  }

  /* ---- Move up/down (mobile alternative to drag) ---- */

  function moveItem(idx: number, direction: "up" | "down") {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next;
    });
  }

  /* ---- Drag reorder ---- */

  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setDragOverIdx(idx);
  }

  function handleDrop(idx: number) {
    if (dragIdx === null || dragIdx === idx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDragIdx(null);
    setDragOverIdx(null);
  }

  function handleDragEnd() {
    setDragIdx(null);
    setDragOverIdx(null);
  }

  /* ---- Close dropdown on outside click ---- */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setResults([]);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ---- Update (server action) ---- */

  async function handleUpdate() {
    if (!canSave || saving) return;
    setSaving(true);
    setActionError("");

    try {
      const result = await updateList({
        listId,
        title: title.trim(),
        description: description.trim(),
        slug,
        emoji,
        coverStyle,
        city,
        isPublished,
        items: items.map((item) => ({
          placeId: item.placeId,
          name: item.name,
          area: item.area,
          note: item.note,
          lat: item.lat,
          lng: item.lng,
        })),
      });

      if (!result.success) {
        setActionError(result.error || "Something went wrong. Please try again.");
        setSaving(false);
        return;
      }

      // Navigate to the list or refresh
      if (isPublished) {
        router.push(`/@${handle}/${slug}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("Update error:", err);
      setActionError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  /* ---- Publish / Unpublish ---- */

  async function handleTogglePublish() {
    if (toggling) return;

    const willPublish = !isPublished;

    // If publishing, validate first
    if (willPublish && items.length < 3) {
      setActionError("You need at least 3 places to publish.");
      return;
    }

    setToggling(true);
    setActionError("");

    try {
      // Save current state first, then toggle
      const saveResult = await updateList({
        listId,
        title: title.trim(),
        description: description.trim(),
        slug,
        emoji,
        coverStyle,
        city,
        isPublished: willPublish,
        items: items.map((item) => ({
          placeId: item.placeId,
          name: item.name,
          area: item.area,
          note: item.note,
          lat: item.lat,
          lng: item.lng,
        })),
      });

      if (!saveResult.success) {
        setActionError(saveResult.error || "Something went wrong. Please try again.");
        setToggling(false);
        return;
      }

      setIsPublished(willPublish);

      if (willPublish) {
        router.push(`/@${handle}/${slug}`);
      }
    } catch (err) {
      console.error("Toggle publish error:", err);
      setActionError("Something went wrong. Please try again.");
    } finally {
      setToggling(false);
    }
  }

  /* ---- Delete ---- */

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    setActionError("");

    try {
      const result = await deleteList(listId);

      if (!result.success) {
        setActionError(result.error || "Something went wrong. Please try again.");
        setDeleting(false);
        setShowDeleteConfirm(false);
        return;
      }

      router.push(`/@${handle}`);
    } catch (err) {
      console.error("Delete error:", err);
      setActionError("Something went wrong. Please try again.");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  /* ---- Main edit UI ---- */

  return (
    <div className={styles.page}>
      {/* Status bar */}
      <div className={styles.statusBar}>
        <span
          className={`${styles.statusBadge} ${
            isPublished ? styles.statusPublished : styles.statusDraft
          }`}
        >
          <Icon name={isPublished ? "globe" : "lock"} size={12} />
          {isPublished ? "Published" : "Draft"}
        </span>

        {isPublished && slug && (
          <a
            href={`/@${handle}/${slug}`}
            className={styles.viewLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            View list <Icon name="external" size={12} />
          </a>
        )}
      </div>

      {/* Zone 1: List header */}
      <div className={styles.headerZone}>
        <input
          className={styles.titleInput}
          placeholder="Name your list..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
          autoFocus
        />
        <input
          className={styles.descInput}
          placeholder="Add a description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
        />

        {/* Cover style picker + emoji */}
        <div className={styles.styleRow}>
          <div className={styles.stylePicker}>
            {COVER_STYLES.map((s, i) => (
              <button
                key={i}
                className={`${styles.styleSwatch} ${i === coverStyle ? styles.styleSwatchActive : ""}`}
                style={{ background: s.gradient }}
                onClick={() => setCoverStyle(i)}
                aria-label={s.label}
                title={s.label}
              />
            ))}
          </div>
          <input
            className={styles.emojiInput}
            placeholder="🍕"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
            maxLength={2}
            title="Add an emoji"
          />
        </div>

        {slug && title.trim() && (
          <div className={styles.urlPreview}>
            vouch.app/@{handle}/{slug}
          </div>
        )}
      </div>

      {/* Zone 2: Search + add */}
      <div className={styles.searchZone}>
        <div className={styles.searchWrap}>
          <Icon name="search" size={16} className={styles.searchIcon} />
          <input
            ref={searchRef}
            className={styles.searchInput}
            placeholder="Add a place..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {searching && (
            <div className={styles.searchSpinner}>
              <Icon name="loader" size={16} />
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div ref={dropdownRef} className={styles.dropdown}>
            {results.map((r, i) => (
              <button
                key={r.place_id}
                className={`${styles.dropdownItem} ${i === focusedIdx ? styles.dropdownItemFocused : ""}`}
                onClick={() => addPlace(r)}
                onMouseEnter={() => setFocusedIdx(i)}
              >
                <Icon name="map-pin" size={14} className={styles.dropdownPin} />
                <div className={styles.dropdownInfo}>
                  <div className={styles.dropdownName}>{r.name}</div>
                  <div className={styles.dropdownAddr}>
                    {r.formatted_address.split(",").slice(0, 2).join(",")}
                  </div>
                </div>
                <Icon name="plus" size={14} className={styles.dropdownAdd} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zone 3: Live list preview */}
      {items.length > 0 && (
        <div className={styles.listZone}>
          {items.map((item, idx) => (
            <div
              key={item.localId}
              className={`${styles.listRow} ${dragOverIdx === idx ? styles.listRowDragOver : ""} ${dragIdx === idx ? styles.listRowDragging : ""}`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
              style={{ animationDelay: `${Math.min(idx * 40, 200)}ms` }}
            >
              <div className={styles.dragHandle} title="Drag to reorder">
                <Icon name="grip" size={14} />
              </div>

              {/* Mobile: move up/down buttons (shown via CSS) */}
              <div className={styles.moveBtns}>
                <button
                  className={styles.moveBtn}
                  onClick={() => moveItem(idx, "up")}
                  disabled={idx === 0}
                  aria-label="Move up"
                >
                  <Icon name="chevron-up" size={12} />
                </button>
                <button
                  className={styles.moveBtn}
                  onClick={() => moveItem(idx, "down")}
                  disabled={idx === items.length - 1}
                  aria-label="Move down"
                >
                  <Icon name="chevron-down" size={12} />
                </button>
              </div>

              <span className={styles.listNum}>
                {String(idx + 1).padStart(2, "0")}
              </span>

              <div className={styles.listInfo}>
                <div className={styles.listName}>{item.name}</div>
                <div className={styles.listArea}>
                  {item.area.split(",")[0].toUpperCase()}
                </div>

                {editingNote === item.localId ? (
                  <input
                    className={styles.noteInput}
                    placeholder="Your take (optional, 140 chars)"
                    value={item.note}
                    onChange={(e) => updateNote(item.localId, e.target.value)}
                    onBlur={() => setEditingNote(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingNote(null)}
                    maxLength={140}
                    autoFocus
                  />
                ) : item.note ? (
                  <button
                    className={styles.noteDisplay}
                    onClick={() => setEditingNote(item.localId)}
                  >
                    &ldquo;{item.note}&rdquo;
                  </button>
                ) : (
                  <button
                    className={styles.addNote}
                    onClick={() => setEditingNote(item.localId)}
                  >
                    + Add a note
                  </button>
                )}
              </div>

              <button
                className={styles.removeBtn}
                onClick={() => removePlace(item.localId)}
                aria-label={`Remove ${item.name}`}
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Danger zone */}
      <div className={styles.dangerZone}>
        <div className={styles.dangerTitle}>Danger zone</div>

        {/* Unpublish row (only for published lists) */}
        {isPublished && (
          <div className={styles.dangerRow} style={{ marginBottom: "var(--v-sp3)" }}>
            <div className={styles.dangerInfo}>
              <div className={styles.dangerLabel}>Unpublish this list</div>
              <div className={styles.dangerDesc}>
                Remove from your public profile. You can republish later.
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              loading={toggling}
              onClick={handleTogglePublish}
            >
              Unpublish
            </Button>
          </div>
        )}

        {/* Delete row */}
        <div className={styles.dangerRow}>
          <div className={styles.dangerInfo}>
            <div className={styles.dangerLabel}>Delete this list</div>
            <div className={styles.dangerDesc}>
              Permanently remove this list and all its places. This cannot be undone.
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Icon name="trash" size={14} />
            Delete
          </Button>
        </div>

        {showDeleteConfirm && (
          <div className={styles.deleteConfirm}>
            <div className={styles.deleteConfirmText}>
              Are you sure you want to delete <strong>&ldquo;{title}&rdquo;</strong>?
              This action cannot be undone.
            </div>
            <div className={styles.deleteConfirmActions}>
              <button
                className={styles.deleteBtnConfirm}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, delete permanently"}
              </button>
              <button
                className={styles.deleteBtnCancel}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fixed action bar */}
      <div className={styles.actionBar}>
        {actionError && (
          <div className={styles.actionError}>{actionError}</div>
        )}
        <div className={styles.actionBarInner}>
          <div className={styles.placeCounter}>
            <span className={styles.placeCountNum} key={items.length}>
              {items.length}
            </span>
            <span className={styles.placeCountLabel}>
              {" "}place{items.length !== 1 ? "s" : ""}
            </span>
            {placesNeeded > 0 && (
              <span className={styles.placeCountHint}>
                &nbsp;· Add {placesNeeded} more to publish
              </span>
            )}
          </div>

          <div className={styles.actionButtons}>
            {isPublished ? (
              <Button
                variant="seal"
                size="md"
                disabled={!canSave}
                loading={saving}
                onClick={handleUpdate}
              >
                Update
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="md"
                  disabled={!canSave}
                  loading={saving}
                  onClick={handleUpdate}
                >
                  Save draft
                </Button>
                <Button
                  variant="seal"
                  size="md"
                  disabled={!canPublish}
                  loading={toggling}
                  onClick={handleTogglePublish}
                >
                  Publish
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
