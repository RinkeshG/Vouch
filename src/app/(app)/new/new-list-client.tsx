"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Stamp } from "@/components/ui/stamp";
import { ShareRow } from "@/components/app/share-row";
import { parseCSV } from "@/lib/csv-parser";
import { publishList } from "./actions";
import styles from "./new-list.module.css";

/* ---- Types ---- */

interface SearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry?: { location: { lat: number; lng: number } };
  types?: string[];
  photo_reference?: string | null;
}

interface ListItem {
  localId: string; // client-side key
  placeId: string;
  name: string;
  area: string;
  note: string;
  lat: number | null;
  lng: number | null;
  photoRef: string | null;
}

interface NewListClientProps {
  userId: string;
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

/* ---- Cover style palettes ---- */
const COVER_STYLES = [
  { label: "Crimson", gradient: "linear-gradient(135deg, #BF3A2B 0%, #E8614A 100%)" },
  { label: "Forest", gradient: "linear-gradient(135deg, #1B4332 0%, #40916C 100%)" },
  { label: "Ocean", gradient: "linear-gradient(135deg, #1D3557 0%, #457B9D 100%)" },
  { label: "Plum", gradient: "linear-gradient(135deg, #7B2D8E 0%, #B56BC8 100%)" },
  { label: "Amber", gradient: "linear-gradient(135deg, #C97B1A 0%, #E8B44A 100%)" },
];

/* ---- Component ---- */

export function NewListClient({ userId, handle, city }: NewListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // List state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<ListItem[]>([]);
  const [coverStyle, setCoverStyle] = useState(0);
  const [emoji, setEmoji] = useState("");

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // CSV import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importNotice, setImportNotice] = useState("");
  const importFromUrl = searchParams.get("import") === "csv";

  // Publish state
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState("");
  const [publishError, setPublishError] = useState("");

  // Note editing
  const [editingNote, setEditingNote] = useState<string | null>(null);

  // Drag state
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Derived
  const slug = toSlug(title);
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

  /* ---- CSV import ---- */

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== "string") return;

      const result = parseCSV(text);

      if (result.places.length === 0) {
        setImportNotice("No valid places found in this file. Check the format and try again.");
        return;
      }

      const timestamp = Date.now();
      const newItems: ListItem[] = result.places.map((p, index) => ({
        localId: `csv-${index}-${timestamp}`,
        placeId: `csv_${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 60)}`,
        name: p.name,
        area: p.area || "",
        note: p.note || "",
        lat: null,
        lng: null,
        photoRef: null,
      }));

      setItems(newItems);

      let msg = `Imported ${result.places.length} place${result.places.length !== 1 ? "s" : ""} from CSV`;
      if (result.skippedRows > 0) {
        msg += ` · ${result.skippedRows} row${result.skippedRows !== 1 ? "s" : ""} skipped (empty or over limit)`;
      }
      setImportNotice(msg);

      // Clear the notice after a few seconds
      setTimeout(() => setImportNotice(""), 6000);
    };

    reader.readAsText(file);

    // Reset the input so the same file can be re-selected
    e.target.value = "";
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
      photoRef: result.photo_reference || null,
    };
    setItems((prev) => [...prev, newItem]);
    setQuery("");
    setResults([]);
    setFocusedIdx(-1);
    // Re-focus search input for rapid tap-tap-tap
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

  /* ---- Publish (server action) ---- */

  async function handlePublish() {
    if (!canPublish || publishing) return;
    setPublishing(true);
    setPublishError("");

    try {
      const result = await publishList({
        title: title.trim(),
        description: description.trim(),
        slug,
        emoji,
        coverStyle,
        city,
        items: items.map((item) => ({
          placeId: item.placeId,
          name: item.name,
          area: item.area,
          note: item.note,
          lat: item.lat,
          lng: item.lng,
          photoRef: item.photoRef,
        })),
      });

      if (!result.success) {
        setPublishError(result.error || "Something went wrong. Please try again.");
        setPublishing(false);
        return;
      }

      setPublishedSlug(result.slug || slug);
      setPublished(true);
    } catch (err) {
      console.error("Publish error:", err);
      setPublishError("Something went wrong. Please try again.");
    } finally {
      setPublishing(false);
    }
  }

  /* ---- Published overlay ---- */

  if (published) {
    const listUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/@${handle}/${publishedSlug}`
        : `/@${handle}/${publishedSlug}`;

    return (
      <div className={styles.celebration}>
        <div className={styles.confettiWrap}>
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className={styles.confettiPiece}
              style={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ["--i" as any]: i,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ["--x" as any]: `${(Math.random() - 0.5) * 300}px`,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ["--y" as any]: `${-Math.random() * 200 - 100}px`,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ["--r" as any]: `${Math.random() * 720 - 360}deg`,
              }}
            />
          ))}
        </div>

        <div className={styles.celebStamp}>
          <Stamp size={64} variant="filled" animated />
        </div>

        <h1 className={styles.celebTitle}>Published!</h1>
        <p className={styles.celebSub}>{title}</p>
        <p className={styles.celebUrl}>vouch.app/@{handle}/{publishedSlug}</p>

        <div className={styles.celebShare}>
          <ShareRow
            url={listUrl}
            title={title}
            text={`Check out my list "${title}" on Vouch`}
          />
        </div>

        <div className={styles.celebActions}>
          <Button
            variant="seal"
            onClick={() => router.push(`/${handle}/${publishedSlug}`)}
          >
            View your list
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setPublished(false);
              setTitle("");
              setDescription("");
              setItems([]);
              setEmoji("");
              setCoverStyle(0);
            }}
          >
            Create another
          </Button>
        </div>
      </div>
    );
  }

  /* ---- Main creation UI ---- */

  return (
    <div className={styles.page}>
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

      {/* Import zone (shown when no items) */}
      {items.length === 0 && (
        <div
          className={`${styles.importZone} ${importFromUrl ? styles.importZoneHighlight : ""}`}
        >
          <span className={styles.importText}>Have a list already?</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          <button
            className={styles.importBtn}
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon name="upload" size={16} />
            Import from CSV
          </button>
          <span className={styles.importOr}>or search and add places below</span>
        </div>
      )}

      {/* Import notice */}
      {importNotice && (
        <div className={styles.importNotice}>
          <Icon name="check" size={16} className={styles.importNoticeIcon} />
          {importNotice}
        </div>
      )}

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

      {/* Fixed publish bar */}
      <div className={styles.publishBar}>
        {publishError && (
          <div className={styles.publishError}>{publishError}</div>
        )}
        <div className={styles.publishBarInner}>
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

          <Button
            variant="seal"
            size="md"
            disabled={!canPublish}
            loading={publishing}
            onClick={handlePublish}
          >
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
