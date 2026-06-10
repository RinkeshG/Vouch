"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Wordmark } from "../../../../components/vouch/wordmark";
import { Button } from "../../../../components/vouch/button";
import { GuideArtifact } from "../../../../components/vouch/guide-artifact";
import { getGuideBySlug, type GuideItem } from "../../../../components/vouch/_guides";
import { getSharedGuide, type SharedGuide } from "../../../../components/vouch/_share";
import { findSpot, coord, type Spot } from "../../../../components/vouch/_taste";
import { useMyMap } from "../../../../components/vouch/_map-context";
import { shareGuideCard } from "../../../../components/vouch/guide-share";
import styles from "../../../../components/vouch/guide-artifact.module.css";

/* A guide item → a Spot we can drop on the map. Curated places resolve from SEED
   (real coords + cuisine); anything else is parsed from its "cuisine · area · price"
   tag line and pinned near the city centre until enrichment fills coords. */
function itemToSpot(it: GuideItem): Spot {
  const seed = findSpot(it.name);
  if (seed) return seed;
  const [cuisine, area, price] = (it.tags || "").split("·").map((s) => s.trim());
  const c = coord(it.name);
  return { name: it.name, area: area || "Bengaluru", cuisine: cuisine || "", price: price || "₹₹", occasions: [], lat: c.lat, lng: c.lng };
}

/* The public share page — what a friend opens from a link, on ANY device. Reads the
   published guide from Supabase (`shared_guides`) first; falls back to localStorage
   for a guide you made but haven't shared yet. Graceful loading + not-found. */
export default function SharedGuidePage() {
  const params = useParams();
  const slug = String(params?.slug ?? "");
  const { setStamp } = useMyMap();
  const [guide, setGuide] = useState<SharedGuide | null | undefined>(undefined);
  const [wanted, setWanted] = useState(false);

  // "Want all of these" (PRD §7.1b) — the growth loop's payoff: a friend's whole list
  // drops onto YOUR map as Wants (sourced guide_import), so their taste reaches you.
  function wantAll() {
    if (!guide) return;
    guide.items.forEach((it) => setStamp(itemToSpot(it), "want", { source: "guide_import" }));
    setWanted(true);
  }

  useEffect(() => {
    let dead = false;
    getSharedGuide(slug).then((s) => {
      if (dead) return;
      if (s) { setGuide(s); return; }
      const local = getGuideBySlug(slug);
      setGuide(local ? { slug, title: local.title, by: "You", note: local.note, anchor: local.anchor, items: local.items } : null);
    });
    return () => { dead = true; };
  }, [slug]);

  if (guide === undefined) {
    return <div className={styles.shareStage}><p className={styles.shareHint}>opening guide…</p></div>;
  }

  if (guide === null) {
    return (
      <div className={styles.shareStage}>
        <Wordmark size={1.4} />
        <p className={styles.shareHint}>this guide isn’t available</p>
        <p style={{ fontFamily: "var(--sans)", color: "var(--muted)", maxWidth: "34ch", textAlign: "center", lineHeight: 1.5 }}>
          The link may be mistyped, or the guide hasn’t been shared yet. Make your own and send it.
        </p>
        <a href="/guides"><Button variant="primary">Open your guides →</Button></a>
      </div>
    );
  }

  const ini = guide.by === "You" ? "RG" : guide.by.slice(0, 2).toUpperCase();
  return (
    <div className={styles.shareStage}>
      <GuideArtifact
        guide={{ title: guide.title, by: guide.by, ini, count: guide.items.length, note: guide.note, anchor: guide.anchor, items: guide.items }}
        share
        linkSpots
        onWantAll={wantAll}
        wanted={wanted}
        onShare={() => shareGuideCard({ slug, title: guide.title, by: guide.by, note: guide.note, items: guide.items, pts: guide.items.slice(0, 4).flatMap((it, i) => { const s = findSpot(it.name); return s ? [[i, s.lat, s.lng] as [number, number, number]] : []; }) }, window.location.href)}
      />
      <p className={styles.shareHint}>a guide on Vouch · Bengaluru</p>
    </div>
  );
}
