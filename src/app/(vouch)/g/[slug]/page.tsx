"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Wordmark } from "../../../../components/vouch/wordmark";
import { Button } from "../../../../components/vouch/button";
import { GuideArtifact } from "../../../../components/vouch/guide-artifact";
import { getGuideBySlug } from "../../../../components/vouch/_guides";
import { getSharedGuide, type SharedGuide } from "../../../../components/vouch/_share";
import styles from "../../../../components/vouch/guide-artifact.module.css";

/* The public share page — what a friend opens from a link, on ANY device. Reads the
   published guide from Supabase (`shared_guides`) first; falls back to localStorage
   for a guide you made but haven't shared yet. Graceful loading + not-found. */
export default function SharedGuidePage() {
  const params = useParams();
  const slug = String(params?.slug ?? "");
  const [guide, setGuide] = useState<SharedGuide | null | undefined>(undefined);

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
      />
      <p className={styles.shareHint}>shared with you · invite-only · Bengaluru</p>
    </div>
  );
}
