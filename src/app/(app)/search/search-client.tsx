"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/app/top-bar";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Stamp } from "@/components/ui/stamp";
import { EmptyState } from "@/components/app/empty-state";
import { cn } from "@/lib/utils";
import { searchDemoPlaces, searchDemoPeople } from "@/lib/demo";
import styles from "./search.module.css";

interface SuggestedPerson {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  vouch_count: number;
  taste_line?: string | null;
  bio?: string | null;
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
  isDemo?: boolean;
}

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
              ? "Search places..."
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
                className={styles.resultRow}
              >
                <div className={styles.resultInfo}>
                  <p className={styles.resultName}>{r.name}</p>
                  <p className={styles.resultSub}>{r.subtitle}</p>
                </div>
                {r.vouchCount && r.vouchCount > 0 && (
                  <span className={styles.resultVouches}>
                    <Stamp size={10} variant="outline" />
                    {r.vouchCount}
                  </span>
                )}
                <Icon name="chevron-right" size={16} />
              </Link>
            ) : (
              <Link
                key={r.id}
                href={`/${r.handle}`}
                className={styles.resultRow}
              >
                <Avatar
                  handle={r.handle || ""}
                  name={r.name}
                  imageUrl={r.avatarUrl}
                  size="sm"
                />
                <div className={styles.resultInfo}>
                  <p className={styles.resultName}>{r.name}</p>
                  <p className={styles.resultSub}>{r.subtitle}</p>
                </div>
                <span className={styles.resultVouches}>
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
          message={`No ${searchType} found for "${query}".`}
        />
      )}

      {/* ---- Suggestions ---- */}
      {showSuggestions && (
        <>
          {/* People with taste */}
          {suggestedPeople.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionLabel}>People with taste</h3>
              <div className={styles.peopleList}>
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
                    <div className={styles.personInfo}>
                      <p className={styles.personName}>{p.display_name}</p>
                      {p.taste_line && (
                        <p className={styles.personTasteLine}>
                          {p.taste_line}
                        </p>
                      )}
                      <span className={styles.personVouches}>
                        <Stamp size={10} variant="outline" />
                        {p.vouch_count} vouches
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Most vouched places */}
          {popularPlaces.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionLabel}>Most vouched</h3>
              <div className={styles.placeList}>
                {popularPlaces.map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/place/${p.id}`}
                    className={styles.placeRow}
                  >
                    <span className={styles.placeIndex}>{i + 1}</span>
                    <div className={styles.placeInfo}>
                      <p className={styles.placeName}>{p.name}</p>
                      <p className={styles.placeArea}>{p.area}</p>
                    </div>
                    <span className={styles.placeVouches}>
                      <Stamp size={10} variant="outline" />
                      {p.vouch_count}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <div className={styles.bottomSpacer} />
    </div>
  );
}
