"use client";
import { useEffect, useState } from "react";
import { WebShell } from "./web-shell";
import { SearchField } from "./input";
import { AddVouchModal } from "./add-vouch";
import { vouches, loadMe, type Entry } from "./_me";
import { PlaceRow } from "./atoms";
import { RelChip } from "./rel-chip";
import { searchCatalog, type CatalogSpot } from "./_catalog";
import styles from "./search-page.module.css";

/* Search — the missing "where do I go?" surface, over the REAL Bengaluru catalog
   (Supabase `places`, 150+ spots). Results are THE PlaceRow (atoms.tsx) — the same
   tiled row as the diary/radar/capture, so a place looks like itself everywhere. */
export function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<CatalogSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [mine, setMine] = useState<Map<string, Entry>>(new Map());

  useEffect(() => { setMine(new Map(loadMe().entries.map((e) => [e.spot.name, e]))); }, []);
  useEffect(() => {
    let dead = false;
    setLoading(true);
    searchCatalog(q).then((r) => { if (!dead) { setResults(r); setLoading(false); } });
    return () => { dead = true; };
  }, [q]);

  return (
    <WebShell active="search" onNewVouch={() => setAdding(true)} you={{ ini: "RG", name: "You", line: vouches().length ? `${vouches().length} ${vouches().length === 1 ? "vouch" : "vouches"} · Bengaluru` : "Your palate" }}>
      <div className={styles.page}>
        <header className={styles.head}>
          <p className={`tLabel ${styles.eyebrow}`}>Search · Bengaluru</p>
          <h1 className={`tTitle ${styles.h1}`}>Find a place.<br />See who vouched.</h1>
          <div className={styles.field}>
            <SearchField placeholder="Name, area, or cuisine…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
          </div>
        </header>

        {loading ? (
          <p className={`tSupport ${styles.note}`}>Searching the city…</p>
        ) : results.length === 0 ? (
          <p className={`tSupport ${styles.note}`}>{q ? `Nothing matching “${q}” in the catalog yet.` : "Start typing to search Bengaluru."}</p>
        ) : (
          <ol className={styles.results}>
            {results.map((s) => {
              const e = mine.get(s.name);
              return (
                <PlaceRow key={s.slug} name={s.name} cuisine={s.cuisine} meta={`${s.cuisine} · ${s.area}`}
                  mark={e ? (e.stamp === "been" ? e.gut ?? "maybe" : e.stamp) : null}
                  href={`/spot/${s.slug}`}
                  right={e ? <RelChip stamp={e.stamp} mode="state" variant="quiet" /> : undefined}
                />
              );
            })}
          </ol>
        )}
      </div>

      <AddVouchModal open={adding} onClose={() => setAdding(false)} onAdded={() => setAdding(false)} />
    </WebShell>
  );
}
