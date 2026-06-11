"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { placeTint, monogram } from "./_taste";
import type { Gut, Stamp } from "./_me";
import styles from "./atoms.module.css";

/* THE SHARED ATOMS (mobile-craft-audit §1.2) — the anchor law made concrete.
   · PlaceTile — the place's visual stand-in: cuisine-tinted monogram + register mark.
     50 rows = 50 tints = scan rhythm for free.
   · PlaceRow  — THE place row, everywhere a place is listed (diary, radar, search,
     capture). tile · name(R1) · meta(R4) · right slot.
   · TakeEntry — THE take entry, everywhere your words lead (vouched portfolio,
     palate, guide view). tile+seal · take(R1 italic) · one-line credit.
   · MixBar    — a verdict mix as a visual object; the summary that doubles as filter.
   All text in here sits on ladder rungs (tTitle…tNum in vouch.css). */

export type Mark = Stamp | Gut | null;

/* the register mark a tile wears: vouched = the saffron seal; been verdicts =
   their colour; want = the ghost ring. */
function markClass(mark: Mark): string {
  switch (mark) {
    case "vouched": return styles.mVouched;
    case "absolutely": return styles.mAbsolutely;
    case "maybe": return styles.mMaybe;
    case "no": return styles.mNo;
    case "want": return styles.mWant;
    default: return "";
  }
}

export function PlaceTile({ name, cuisine, size = 36, mark = null }: { name: string; cuisine?: string; size?: number; mark?: Mark }) {
  return (
    <span className={styles.tile} style={{ width: size, height: size, background: placeTint(cuisine ?? "") }} aria-hidden="true">
      <span className={styles.tileMono} style={{ fontSize: Math.round(size * 0.34) }}>{monogram(name)}</span>
      {mark && <i className={`${styles.mark} ${markClass(mark)}`} />}
    </span>
  );
}

/* ── PlaceRow ──────────────────────────────────────────────────────────────── */
export function PlaceRow({ name, meta, cuisine, mark = null, right, href, onClick, highlight = false }: {
  name: string; meta: ReactNode; cuisine?: string; mark?: Mark; right?: ReactNode;
  href?: string; onClick?: () => void; highlight?: boolean;
}) {
  const body = (
    <>
      <PlaceTile name={name} cuisine={cuisine} mark={mark} />
      <span className={styles.prBody}>
        <span className={`tLead ${styles.prName}`}>{name}</span>
        <span className={`tMeta ${styles.prMeta}`}>{meta}</span>
      </span>
    </>
  );
  return (
    <li className={`${styles.prItem} ${highlight ? styles.prHot : ""}`}>
      {href
        ? <Link className={styles.prMain} href={href}>{body}</Link>
        : <button type="button" className={styles.prMain} onClick={onClick}>{body}</button>}
      {right != null && <span className={styles.prRight}>{right}</span>}
    </li>
  );
}

/* ── TakeEntry ─────────────────────────────────────────────────────────────── */
export function TakeEntry({ take, name, meta, cuisine, href, rank, featured = false }: {
  take?: string; name: string; meta: string; cuisine?: string; href: string;
  rank?: number; featured?: boolean;
}) {
  return (
    <li className={`${styles.te} ${featured ? styles.teFeat : ""}`}>
      {rank != null
        ? <span className={styles.teRank} aria-hidden="true">{String(rank).padStart(2, "0")}</span>
        : <PlaceTile name={name} cuisine={cuisine} size={featured ? 56 : 44} mark="vouched" />}
      <Link className={styles.teBody} href={href}>
        {take && <p className={`tTake ${styles.teTake}`}>&ldquo;{take}&rdquo;</p>}
        <span className={styles.teCredit}>
          <span className={styles.teName}>{name}</span>
          <span className={`tMeta ${styles.teMeta}`}>{meta}</span>
        </span>
      </Link>
    </li>
  );
}

/* ── MixBar ────────────────────────────────────────────────────────────────── */
export function MixBar({ counts, active, onSelect, mini = false }: {
  counts: { absolutely: number; maybe: number; no: number };
  active?: Gut | null; onSelect?: (g: Gut | null) => void; mini?: boolean;
}) {
  const total = counts.absolutely + counts.maybe + counts.no;
  if (!total) return null;
  const seg = (g: Gut, cls: string) =>
    counts[g] > 0 && <i key={g} className={`${styles.seg} ${cls} ${active && active !== g ? styles.segDim : ""}`} style={{ flexGrow: counts[g] }} />;
  const bar = (
    <span className={`${styles.bar} ${mini ? styles.barMini : ""}`} aria-hidden="true">
      {seg("absolutely", styles.segAbsolutely)}{seg("maybe", styles.segMaybe)}{seg("no", styles.segNo)}
    </span>
  );
  if (mini) return bar;
  const word = (g: Gut, label: string, cls: string) =>
    counts[g] > 0 && (
      <button key={g} type="button" className={`${styles.mixBtn} ${cls} ${active === g ? styles.mixOn : ""}`} aria-pressed={active === g}
        onClick={() => onSelect?.(active === g ? null : g)}>
        <b>{counts[g]}</b> {label}
      </button>
    );
  return (
    <div className={styles.mix}>
      {bar}
      <div className={styles.mixLegend}>
        {word("absolutely", "absolutely", styles.mixAbsolutely)}
        {word("maybe", "maybe", styles.mixMaybe)}
        {word("no", "no", styles.mixNo)}
      </div>
    </div>
  );
}
