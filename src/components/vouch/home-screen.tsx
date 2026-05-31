"use client";
import { useMemo, useState } from "react";
import { Avatar, FaceStack } from "./avatar";
import { Stamp } from "./stamp";
import { Tag, OccasionChip } from "./chip";
import { Button } from "./button";
import { EmptyState } from "./misc";
import styles from "./home-screen.module.css";

/* HOME = a decision being made WITH you, not a feed. The user arrives hungry and
   indecisive; the screen answers (one confident hero pick + the why), lets them
   ACT, get ANOTHER, or PIVOT the occasion (which re-ranks the answer). Built from
   the kit, but composed bespoke for THIS job (Constitution §7). Interactive. */

export type Pick = {
  place: string; area: string; tags: string; dist: string; openTill: string;
  line: string; by: { name: string; ini: string };
  savedFaces: string[]; savedCount: number; occasions: string[];
};

const OCCASIONS = ["tonight", "parents", "date", "late night", "coffee", "group dinner"];

export function HomeDecision({ picks, context }: { picks: Pick[]; context: string }) {
  const [occasion, setOccasion] = useState("tonight");
  const [idx, setIdx] = useState(0);

  const matches = useMemo(
    () => (occasion === "tonight" ? picks : picks.filter((p) => p.occasions.includes(occasion))),
    [picks, occasion],
  );
  const hero = matches.length ? matches[idx % matches.length] : null;
  const rest = matches.filter((p) => p !== hero).slice(0, 3);

  function pickOccasion(o: string) { setOccasion(o); setIdx(0); }

  return (
    <div className={styles.screen}>
      <p className={styles.context}>{context}</p>
      <h1 className={styles.lede}>
        {occasion === "tonight" ? "Your people are sending you to —" : `For ${occasion}, they’d send you to —`}
      </h1>

      {hero ? (
        <article className={styles.hero} key={`${occasion}-${idx}`}>
          <div className={styles.heroTop}>
            <span className={styles.open}><i /> open till {hero.openTill}</span>
            <span className={styles.dist}>{hero.dist}</span>
          </div>
          <h2 className={styles.place}>{hero.place}</h2>
          <div className={styles.tags}><Tag>{hero.tags}</Tag></div>
          <p className={styles.line}>“{hero.line}”</p>

          <div className={styles.why}>
            <Avatar initials={hero.by.ini} size={26} />
            <span className={styles.whyText}><b>{hero.by.name}</b> vouched</span>
            <span className={styles.whyDot}>·</span>
            <FaceStack faces={hero.savedFaces} size={22} />
            <span className={styles.whyText}>{hero.savedCount} you follow saved it</span>
          </div>

          <div className={styles.actions}>
            <Button variant="primary" full>Take me there →</Button>
            <div className={styles.actionsRow}>
              <Button variant="ghost">＋ Save for later</Button>
              <button type="button" className={styles.another} onClick={() => setIdx((i) => i + 1)}>
                ↻ Show another
              </button>
            </div>
          </div>
          <span className={styles.stampFloat}><Stamp state="vouched" size="sm" /></span>
        </article>
      ) : (
        <EmptyState
          title={`No ${occasion} spots from your people yet`}
          body="Borrow a palate who knows this occasion, and watch your map fill up."
          action={<Button variant="primary">Borrow a palate →</Button>}
        />
      )}

      <div className={styles.pivot}>
        <span className={styles.pivotLabel}>or, what’s the occasion?</span>
        <div className={styles.pivotChips}>
          {OCCASIONS.map((o) => (
            <OccasionChip key={o} selected={o === occasion} onToggle={() => pickOccasion(o)}>{o}</OccasionChip>
          ))}
        </div>
      </div>

      {rest.length > 0 && (
        <section className={styles.also}>
          <p className={styles.alsoLabel}>Also vouched, open now</p>
          <ul className={styles.alsoList}>
            {rest.map((p) => (
              <li key={p.place} className={styles.alsoRow}>
                <Avatar initials={p.by.ini} size={28} />
                <span className={styles.alsoBody}>
                  <span className={styles.alsoName}>{p.place}</span>
                  <span className={styles.alsoWhy}><b>{p.by.name}</b> vouched · {p.area} · {p.dist}</span>
                </span>
                <span className={styles.alsoGo} aria-hidden="true">→</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
