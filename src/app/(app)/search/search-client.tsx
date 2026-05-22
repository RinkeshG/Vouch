"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/app/top-bar";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Stamp } from "@/components/ui/stamp";
import { EmptyState } from "@/components/app/empty-state";
import { getCuisineVisual, getCuisineIcon, getTagIcon } from "@/lib/cuisine";
import { cn } from "@/lib/utils";
import { CONTEXT_TAGS } from "@/types";
import { searchDemoPlaces, searchDemoPeople } from "@/lib/demo";
import styles from "./search.module.css";

interface SuggestedPerson {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  vouch_count: number;
}

interface PopularPlace {
  id: string;
  name: string;
  area: string;
  vouch_count: number;
  cuisines?: string[];
}

interface SearchResult {
  type: "place" | "person";
  id: string;
  name: string;
  subtitle: string;
  handle?: string;
  avatarUrl?: string | null;
  vouchCount?: number;
  cuisines?: string[];
}

interface SearchClientProps {
  suggestedPeople: SuggestedPerson[];
  popularPlaces: PopularPlace[];
  currentUserId: string;
  isDemo?: boolean;
}

// Tag colors for mood cards
const MOOD_COLORS: Record<string, string> = {
  "date night": "linear-gradient(135deg, #8B6B8E 0%, #6A4B5E 100%)",
  "group dinner": "linear-gradient(135deg, #C47040 0%, #A05830 100%)",
  "solo meal": "linear-gradient(135deg, #8B8178 0%, #6A6158 100%)",
  "family friendly": "linear-gradient(135deg, #6B8E5E 0%, #4A6E3E 100%)",
  "late night": "linear-gradient(135deg, #3D3D5C 0%, #2A2A40 100%)",
  "quick bite": "linear-gradient(135deg, #C4893A 0%, #A06820 100%)",
  "special occasion": "linear-gradient(135deg, #BF3A2B 0%, #9A2A1B 100%)",
  "work lunch": "linear-gradient(135deg, #6B8E7E 0%, #4A6E5E 100%)",
  brunch: "linear-gradient(135deg, #D49A4A 0%, #B07830 100%)",
  drinks: "linear-gradient(135deg, #7A5B6E 0%, #5A3B4E 100%)",
  "cafe vibes": "linear-gradient(135deg, #8B6E4E 0%, #6A4E2E 100%)",
  "outdoor seating": "linear-gradient(135deg, #6B8E5E 0%, #5A7E4E 100%)",
  "delivery worthy": "linear-gradient(135deg, #C45A3A 0%, #A03A1A 100%)",
  "worth the wait": "linear-gradient(135deg, #B08A30 0%, #907020 100%)",
};

export function SearchClient({
  suggestedPeople,
  popularPlaces,
  isDemo = false,
}: SearchClientProps) {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"places" | "people">("places");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const doSearch = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setSearching(true);
      setHasSearched(true);

      try {
        if (isDemo) {
          if (searchType === "places") {
            const places = searchDemoPlaces(q);
            setResults(
              places.map((p) => ({
                type: "place" as const,
                id: p.id,
                name: p.name,
                subtitle: p.area,
                vouchCount: p.vouchCount,
                cuisines: p.cuisines,
              }))
            );
          } else {
            const people = searchDemoPeople(q);
            setResults(
              people.map((p) => ({
                type: "person" as const,
                id: p.id,
                name: p.displayName,
                subtitle: `@${p.handle}`,
                handle: p.handle,
                avatarUrl: p.avatarUrl,
                vouchCount: p.vouchCount,
              }))
            );
          }
        } else {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();

          if (searchType === "places") {
            const { data } = await supabase
              .from("places")
              .select("id, name, area, vouch_count, cuisines")
              .or(`name.ilike.%${q}%,area.ilike.%${q}%`)
              .order("vouch_count", { ascending: false })
              .limit(15);

            setResults(
              (data || []).map((p) => ({
                type: "place" as const,
                id: p.id,
                name: p.name,
                subtitle: p.area,
                vouchCount: p.vouch_count,
                cuisines: p.cuisines || [],
              }))
            );
          } else {
            const { data } = await supabase
              .from("profiles")
              .select("id, handle, display_name, avatar_url, vouch_count")
              .eq("is_public", true)
              .or(`handle.ilike.%${q}%,display_name.ilike.%${q}%`)
              .order("vouch_count", { ascending: false })
              .limit(15);

            setResults(
              (data || []).map((p) => ({
                type: "person" as const,
                id: p.id,
                name: p.display_name,
                subtitle: `@${p.handle}`,
                handle: p.handle,
                avatarUrl: p.avatar_url,
                vouchCount: p.vouch_count,
              }))
            );
          }
        }
      } catch {
        // Fail silently
      } finally {
        setSearching(false);
      }
    },
    [searchType, isDemo]
  );

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    searchTimeout.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query, doSearch]);

  const showSuggestions = !hasSearched && query.length < 2;

  return (
    <div className={styles.page}>
      <TopBar title="Explore" />

      {/* Search input */}
      <div className={styles.searchWrap}>
        <Input
          placeholder={
            searchType === "places"
              ? "Search places in Bangalore..."
              : "Search people..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          adornStart={<Icon name="search" size={18} />}
          adornEnd={
            query.length > 0 ? (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setHasSearched(false);
                }}
                aria-label="Clear search"
              >
                <Icon name="x" size={16} />
              </button>
            ) : null
          }
          autoFocus
        />
      </div>

      {/* Search type tabs */}
      <div className={styles.searchTabs}>
        <button
          className={cn(
            styles.searchTab,
            searchType === "places" && styles.searchTabActive
          )}
          onClick={() => {
            setSearchType("places");
            setResults([]);
            setHasSearched(false);
          }}
        >
          <Icon name="map-pin" size={14} /> Places
        </button>
        <button
          className={cn(
            styles.searchTab,
            searchType === "people" && styles.searchTabActive
          )}
          onClick={() => {
            setSearchType("people");
            setResults([]);
            setHasSearched(false);
          }}
        >
          <Icon name="users" size={14} /> People
        </button>
      </div>

      {/* Loading */}
      {searching && (
        <div className={styles.loading}>
          <span className={styles.spinner} />
        </div>
      )}

      {/* Results */}
      {!searching && results.length > 0 && (
        <div className={styles.results}>
          {results.map((r) =>
            r.type === "place" ? (
              <Link
                key={r.id}
                href={`/place/${r.id}`}
                className={styles.placeResult}
              >
                <div
                  className={styles.placeResultIcon}
                  style={{
                    background: getCuisineVisual(r.cuisines || []).gradient,
                  }}
                >
                  <span className={styles.placeResultEmoji}>
                    {getCuisineIcon(r.cuisines || [])}
                  </span>
                </div>
                <div className={styles.placeResultInfo}>
                  <p className={styles.placeResultName}>{r.name}</p>
                  <div className={styles.placeResultMeta}>
                    <span>{r.subtitle}</span>
                    {r.vouchCount && r.vouchCount > 0 && (
                      <span className={styles.placeResultVouches}>
                        <Stamp size={10} variant="outline" />
                        {r.vouchCount}
                      </span>
                    )}
                  </div>
                </div>
                <Icon name="chevron-right" size={16} />
              </Link>
            ) : (
              <Link
                key={r.id}
                href={`/${r.handle}`}
                className={styles.personResult}
              >
                <Avatar
                  handle={r.handle || ""}
                  name={r.name}
                  imageUrl={r.avatarUrl}
                  size="md"
                />
                <div className={styles.personInfo}>
                  <p className={styles.personName}>{r.name}</p>
                  <p className={styles.personHandle}>{r.subtitle}</p>
                </div>
                <span className={styles.personVouches}>
                  <Stamp size={10} variant="outline" />
                  {r.vouchCount || 0}
                </span>
              </Link>
            )
          )}
        </div>
      )}

      {/* No results */}
      {!searching && hasSearched && results.length === 0 && (
        <EmptyState
          icon="search"
          title="No results"
          message={`No ${searchType} found for "${query}". Try a different search.`}
        />
      )}

      {/* ---- Suggestions (when not searching) ---- */}
      {showSuggestions && (
        <>
          {/* Browse by mood — visual mood cards */}
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Browse by mood</h3>
          </div>
          <div className={styles.moodGrid}>
            {CONTEXT_TAGS.map((tag) => (
              <button
                key={tag}
                className={styles.moodCard}
                style={{
                  background: MOOD_COLORS[tag] || "var(--v-faint)",
                }}
                onClick={() => {
                  setQuery(tag);
                  setSearchType("places");
                }}
              >
                <span className={styles.moodEmoji}>{getTagIcon(tag)}</span>
                <span className={styles.moodLabel}>{tag}</span>
              </button>
            ))}
          </div>

          {/* Popular places — visual cards */}
          {popularPlaces.length > 0 && (
            <>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Most vouched</h3>
              </div>
              <div className={styles.results}>
                {popularPlaces.map((p) => {
                  const cuisines = (p as PopularPlace).cuisines || [];
                  return (
                    <Link
                      key={p.id}
                      href={`/place/${p.id}`}
                      className={styles.placeResult}
                    >
                      <div
                        className={styles.placeResultIcon}
                        style={{
                          background: getCuisineVisual(cuisines).gradient,
                        }}
                      >
                        <span className={styles.placeResultEmoji}>
                          {getCuisineIcon(cuisines)}
                        </span>
                      </div>
                      <div className={styles.placeResultInfo}>
                        <p className={styles.placeResultName}>{p.name}</p>
                        <div className={styles.placeResultMeta}>
                          <span>{p.area}</span>
                          <span className={styles.placeResultVouches}>
                            <Stamp size={10} variant="outline" />
                            {p.vouch_count}
                          </span>
                        </div>
                      </div>
                      <Icon name="chevron-right" size={16} />
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {/* Suggested people — visual cards */}
          {suggestedPeople.length > 0 && (
            <>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>People to follow</h3>
              </div>
              <div className={styles.peopleGrid}>
                {suggestedPeople.map((p) => (
                  <Link
                    key={p.id}
                    href={`/${p.handle}`}
                    className={styles.personCard}
                  >
                    <Avatar
                      handle={p.handle}
                      name={p.display_name}
                      imageUrl={p.avatar_url}
                      size="lg"
                    />
                    <p className={styles.personCardName}>{p.display_name}</p>
                    <p className={styles.personCardHandle}>@{p.handle}</p>
                    <div className={styles.personCardBadge}>
                      <Stamp size={10} variant="outline" />
                      <span>
                        {p.vouch_count} vouch{p.vouch_count !== 1 ? "es" : ""}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <div className={styles.bottomSpacer} />
    </div>
  );
}
