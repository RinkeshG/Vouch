"use client";

import { useEffect, useState } from "react";
import GuideView from "./GuideView";
import { getPublished } from "../lib/published";
import type { Guide } from "../lib/guides";
import s from "./guide.module.css";

/* Fallback for handles that aren't seeded examples — reads the locally published
   guide (Phase 3). When this is backed by a real DB, this whole component goes
   away and the server page just renders the fetched guide. */
export default function LocalGuide({ handle }: { handle: string }) {
  const [guide, setGuide] = useState<Guide | null | undefined>(undefined);
  useEffect(() => { setGuide(getPublished(handle) ?? null); }, [handle]);

  if (guide === undefined) return <main className={s.page} aria-busy="true" />;
  if (guide === null) {
    return (
      <main className={s.page}>
        <div className={s.nf}>
          <p className={s.nfLine}>No Hotlist lives at <b>hotlist.to/{handle}</b> yet.</p>
          <a href="/new" className={s.nfCta}>Make this one <span aria-hidden="true">→</span></a>
          <a href="/" className={s.nfLink}>or browse a few first</a>
        </div>
      </main>
    );
  }
  return <GuideView guide={guide} />;
}
