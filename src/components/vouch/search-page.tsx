"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { WebShell } from "./web-shell";
import { SearchField } from "./input";
import { AddVouchModal } from "./add-vouch";
import { vouches, loadMe, type Entry } from "./_me";
import { RelChip } from "./rel-chip";
import { searchCatalog, type CatalogSpot } from "./_catalog";
import styles from "./search-page.module.css";

/* Search — the missing "where do I go?" surface, over the REAL Bengaluru catalog
   (Supabase `places`, 150+ spots). Read-only, no auth. Results open the Spot page,
   where trust (who vouched) is the hero. */
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
          <p className={styles.eyebrow}>Search · Bengaluru</p>
          <h1 className={styles.h1}>Find a place. See who vouched.</h1>
          <div className={styles.field}>
            <SearchField placeholder="Name, area, or cuisine…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
          </div>
        </header>

        {loading ? (
          <p className={styles.note}>Searching the city…</p>
        ) : results.length === 0 ? (
          <p className={styles.note}>{q ? `Nothing matching “${q}” in the catalog yet.` : "Start typing to search Bengaluru."}</p>
        ) : (
          <ol className={styles.results}>
            {results.map((s) => {
              const e = mine.get(s.name);
              return (
                <li key={s.slug}>
                  <Link className={styles.row} href={`/spot/${s.slug}`}>
                    <span className={styles.rowMain}>
                      <span className={styles.rowName}>{s.name}</span>
                      <span className={styles.rowMeta}>{s.cuisine} · {s.area} · {s.price}</span>
                    </span>
                    {e && <RelChip stamp={e.stamp} gut={e.gut} />}
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <AddVouchModal open={adding} onClose={() => setAdding(false)} onAdded={() => setAdding(false)} />
    </WebShell>
  );
}
