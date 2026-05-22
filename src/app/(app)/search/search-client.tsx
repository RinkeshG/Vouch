"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/app/top-bar";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Tag } from "@/components/ui/tag";
import { EmptyState } from "@/components/app/empty-state";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { CONTEXT_TAGS } from "@/types";
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
}

interface SearchResult {
  type: "place" | "person";
  id: string;
  name: string;
  subtitle: string;
  handle?: string;
  avatarUrl?: string | null;
  vouchCount?: number;
}

interface SearchClientProps {
  suggestedPeople: SuggestedPerson[];
  popularPlaces: PopularPlace[];
  currentUserId: string;
}

export function SearchClient({
  suggestedPeople,
  popularPlaces,
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
      const supabase = createClient();

      try {
        if (searchType === "places") {
          const { data } = await supabase
            .from("places")
            .select("id, name, area, vouch_count")
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
      } catch {
        // Fail silently
      } finally {
        setSearching(false);
      }
    },
    [searchType]
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
      <TopBar title="Search" />

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
          Places
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
          People
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
                <div className={styles.placeResultIcon}>
                  <Icon name="map-pin" size={18} />
                </div>
                <div className={styles.placeResultInfo}>
                  <p className={styles.placeResultName}>{r.name}</p>
                  <div className={styles.placeResultMeta}>
                    <span>{r.subtitle}</span>
                    {r.vouchCount && r.vouchCount > 0 && (
                      <span className={styles.placeResultVouches}>
                        &middot; {r.vouchCount} vouch
                        {r.vouchCount !== 1 ? "es" : ""}
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
                  {r.vouchCount || 0} vouches
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

      {/* Suggestions — shown when not searching */}
      {showSuggestions && (
        <>
          {/* Browse by context */}
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Browse by vibe</p>
          </div>
          <div className={styles.tagGrid}>
            {CONTEXT_TAGS.map((tag) => (
              <Tag key={tag} variant="default" as="span">
                {tag}
              </Tag>
            ))}
          </div>

          {/* Popular places */}
          {popularPlaces.length > 0 && (
            <>
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Popular places</p>
              </div>
              <div className={styles.results}>
                {popularPlaces.map((p) => (
                  <Link
                    key={p.id}
                    href={`/place/${p.id}`}
                    className={styles.placeResult}
                  >
                    <div className={styles.placeResultIcon}>
                      <Icon name="map-pin" size={18} />
                    </div>
                    <div className={styles.placeResultInfo}>
                      <p className={styles.placeResultName}>{p.name}</p>
                      <div className={styles.placeResultMeta}>
                        <span>{p.area}</span>
                        <span className={styles.placeResultVouches}>
                          &middot; {p.vouch_count} vouch
                          {p.vouch_count !== 1 ? "es" : ""}
                        </span>
                      </div>
                    </div>
                    <Icon name="chevron-right" size={16} />
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Suggested people */}
          {suggestedPeople.length > 0 && (
            <>
              <div className={styles.section}>
                <p className={styles.sectionTitle}>People to follow</p>
              </div>
              <div className={styles.results}>
                {suggestedPeople.map((p) => (
                  <Link
                    key={p.id}
                    href={`/${p.handle}`}
                    className={styles.personResult}
                  >
                    <Avatar
                      handle={p.handle}
                      name={p.display_name}
                      imageUrl={p.avatar_url}
                      size="md"
                    />
                    <div className={styles.personInfo}>
                      <p className={styles.personName}>{p.display_name}</p>
                      <p className={styles.personHandle}>@{p.handle}</p>
                    </div>
                    <span className={styles.personVouches}>
                      {p.vouch_count} vouches
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
