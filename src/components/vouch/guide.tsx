import type { ReactNode } from "react";
import { Avatar } from "./avatar";
import { Tag } from "./chip";
import styles from "./guide.module.css";

/* The Guide — an authored, occasion-titled collection by one palate. The preview
   card and the opened view share the SAME row language (inside == outside,
   patterns.md §0). Curator-led; imagery is people + type. */

export type GuideItem = { name: string; tags?: string; note?: string };
export type GuideData = {
  title: string;
  note?: string;
  anchor?: string;
  by: string;
  ini: string;
  count: number;
  items: GuideItem[];
};

function CuratorLine({ ini, by }: { ini: string; by: string }) {
  return (
    <span className={styles.curator}>
      <Avatar initials={ini} size={28} />
      <span className={styles.curatorText}>a guide by <b>{by}</b></span>
    </span>
  );
}

export function GuideRow({ rank, item, showTags = false, save = false }: {
  rank: number; item: GuideItem; showTags?: boolean; save?: boolean;
}) {
  return (
    <li className={styles.row}>
      <span className={styles.num}>{String(rank).padStart(2, "0")}</span>
      <span className={styles.body}>
        <span className={styles.name}>{item.name}</span>
        {showTags && item.tags && <span className={styles.tags}><Tag>{item.tags}</Tag></span>}
        {item.note && <span className={styles.note}>“{item.note}”</span>}
      </span>
      {save && <span className={styles.save} aria-hidden="true">＋</span>}
    </li>
  );
}

/* Preview card (home / grid). Clickable, opens the full guide. */
export function GuideCard({ guide, onOpen }: { guide: GuideData; onOpen?: () => void }) {
  return (
    <button type="button" className={styles.card} onClick={onOpen}>
      <div className={styles.cardHead}>
        <CuratorLine ini={guide.ini} by={guide.by} />
      </div>
      {guide.anchor && <span className={styles.anchor}>{guide.anchor}</span>}
      <h3 className={styles.title}>{guide.title}</h3>
      <span className={styles.meta}>{guide.count} places{guide.note ? ` · ${guide.note}` : ""}</span>
      <ol className={styles.rows}>
        {guide.items.slice(0, 3).map((it, i) => <GuideRow key={it.name} rank={i + 1} item={it} />)}
      </ol>
      <div className={styles.foot}>
        <span />
        <span className={styles.view}>Open all {guide.count} →</span>
      </div>
    </button>
  );
}

/* Opened full guide (modal / page). Same rows, now with tags + save. */
export function GuideView({ guide, footer }: { guide: GuideData; footer?: ReactNode }) {
  return (
    <div className={styles.view}>
      <div className={styles.viewHead}>
        <CuratorLine ini={guide.ini} by={guide.by} />
        {guide.anchor && <span className={styles.anchor}>{guide.anchor}</span>}
        <h2 className={styles.viewTitle}>{guide.title}</h2>
        <span className={styles.viewMeta}>{guide.count} places{guide.note ? ` · ${guide.note}` : ""}</span>
      </div>
      <ol className={`${styles.rows} ${styles.viewRows}`}>
        {guide.items.map((it, i) => <GuideRow key={it.name} rank={i + 1} item={it} showTags save />)}
      </ol>
      {footer && <div className={styles.viewFoot}>{footer}</div>}
    </div>
  );
}
