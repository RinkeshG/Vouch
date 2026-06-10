import { GuideRow, type GuideData } from "./guide";
import { Avatar } from "./avatar";
import { Wordmark } from "./wordmark";
import { Button } from "./button";
import { slugify } from "./_guides";
import styles from "./guide-artifact.module.css";

/* The Guide as a shareable ARTIFACT (J3) — the most shareable object: an authored,
   occasion-titled collection that wins a group chat and leaves the app as a link.
   Inside == outside (shares GuideRow with the kit). Used both as the public share
   page and as the live preview while building. No scores, names only. */
export function GuideArtifact({
  guide,
  whenToTrust,
  share = false,
  palateHref,
  linkSpots = false,
  onWantAll,
  wanted = false,
  onShare,
}: {
  guide: GuideData;
  whenToTrust?: string;
  share?: boolean;
  palateHref?: string;
  linkSpots?: boolean;
  onWantAll?: () => void;
  wanted?: boolean;
  onShare?: () => void;
}) {
  return (
    <article className={styles.guide}>
      <header className={styles.head}>
        <span className={styles.seal}>
          <Wordmark size={0.95} />
          <span className={styles.sealTag}>a guide · Bengaluru</span>
        </span>

        <span className={styles.curator}>
          <Avatar initials={guide.ini} size={42} />
          <span className={styles.curatorText}>
            <b>A guide by {guide.by}</b>
            {whenToTrust && <span className={styles.trust}>{whenToTrust}</span>}
          </span>
        </span>

        {guide.anchor && <span className={styles.anchor}>{guide.anchor}</span>}
        <h1 className={styles.title}>{guide.title || "Untitled guide"}</h1>
        <span className={styles.meta}>{guide.count} {guide.count === 1 ? "place" : "places"}{guide.note ? ` · ${guide.note}` : ""}</span>
      </header>

      {guide.items.length > 0 ? (
        <ol className={styles.rows}>
          {guide.items.map((it, i) => <GuideRow key={it.name} rank={i + 1} item={it} showTags save href={linkSpots ? `/spot/${slugify(it.name)}` : undefined} />)}
        </ol>
      ) : (
        <p className={styles.empty}>Add a few of your spots — they’ll line up here, each with your name on it.</p>
      )}

      {share && (
        <footer className={styles.foot}>
          {wanted ? (
            <a href="/home" className={styles.primaryLink}><Button variant="primary">On your map — open it →</Button></a>
          ) : (
            <Button variant="primary" onClick={onWantAll}>Want all of these →</Button>
          )}
          {onShare && <button type="button" className={styles.ghost} onClick={onShare}>Share this guide ↗</button>}
          {palateHref && <a className={styles.ghost} href={palateHref}>See {guide.by}’s palate →</a>}
          <p className={styles.gate}>{wanted
            ? `${guide.count} ${guide.count === 1 ? "place" : "places"} dropped on your map — each with ${guide.by}’s name on it. Next time you’re near one, you’ll know.`
            : `Saves the whole list to your map — each place with ${guide.by}’s name on it, not a star.`}</p>
        </footer>
      )}
    </article>
  );
}
