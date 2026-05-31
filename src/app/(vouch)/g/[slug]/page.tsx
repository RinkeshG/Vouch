"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Wordmark } from "../../../../components/vouch/wordmark";
import { Button } from "../../../../components/vouch/button";
import { GuideArtifact } from "../../../../components/vouch/guide-artifact";
import { getGuideBySlug, type Guide } from "../../../../components/vouch/_guides";
import styles from "../../../../components/vouch/guide-artifact.module.css";

/* The public share page for a user's own guide — what a friend opens from a link.
   Reads the persisted guide by slug (prototype: localStorage, same-device only;
   real share is a server page later). Graceful loading + not-found states. */
export default function SharedGuidePage() {
  const params = useParams();
  const slug = String(params?.slug ?? "");
  const [guide, setGuide] = useState<Guide | null | undefined>(undefined);

  useEffect(() => { setGuide(getGuideBySlug(slug)); }, [slug]);

  if (guide === undefined) {
    return <div className={styles.shareStage}><p className={styles.shareHint}>opening guide…</p></div>;
  }

  if (guide === null) {
    return (
      <div className={styles.shareStage}>
        <Wordmark size={1.4} />
        <p className={styles.shareHint}>this guide isn’t on this device</p>
        <p style={{ fontFamily: "var(--sans)", color: "var(--muted)", maxWidth: "34ch", textAlign: "center", lineHeight: 1.5 }}>
          Share links resolve from the maker’s device in this prototype. Make your own to see how it travels.
        </p>
        <a href="/guides"><Button variant="primary">Open your guides →</Button></a>
      </div>
    );
  }

  return (
    <div className={styles.shareStage}>
      <GuideArtifact
        guide={{ title: guide.title, by: "Rinkesh", ini: "RG", count: guide.items.length, note: guide.note, anchor: guide.anchor, items: guide.items }}
        whenToTrust="Trust him for late-night, date, and the city after 11."
        share
      />
      <p className={styles.shareHint}>shared with you · borrowing requires an invite</p>
    </div>
  );
}
