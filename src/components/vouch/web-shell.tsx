import type { ReactNode } from "react";
import Link from "next/link";
import { Wordmark } from "./wordmark";
import { Avatar } from "./avatar";
import styles from "./web-shell.module.css";

export type NavKey = "map" | "search" | "guides" | "you";

/* The product shell, MOBILE-FIRST. The phone is the real surface: a slim top bar
   for identity/place, the canvas, and a thumb-reachable bottom tab bar with a
   privileged centre ＋ capture. The desktop rail (≥1000px) is the enhancement, not
   the source of truth — it is rendered alongside and revealed by width, never the
   mobile bar stretched. */
// Nav: Map · + · Guides · You (PRD §5). Search lives inside capture + on the map,
// never a tab of its own.
const NAV: { key: NavKey; glyph: string; label: string; href: string }[] = [
  { key: "map", glyph: "◍", label: "Your map", href: "/home" },
  { key: "guides", glyph: "❑", label: "Guides", href: "/guides" },
  { key: "you", glyph: "◆", label: "You", href: "/you" },
];

export function WebShell({
  active,
  onNewVouch,
  you = { ini: "RG", name: "You", line: "Building your map" },
  children,
}: {
  active: NavKey;
  onNewVouch?: () => void;
  you?: { ini: string; name: string; line: string };
  children: ReactNode;
}) {
  return (
    <div className={styles.shell}>
      {/* DESKTOP — persistent left rail (≥1000px) */}
      <aside className={styles.side}>
        <div className={styles.brand}>
          <Wordmark size={1.3} />
          <span className={styles.loc}><i /> Bengaluru</span>
        </div>

        <button type="button" className={styles.new} onClick={onNewVouch}>
          <span className={styles.newPlus} aria-hidden="true">＋</span> Add a place
        </button>

        <nav className={styles.nav} aria-label="Vouch">
          {NAV.map((n) => (
            <Link key={n.key} href={n.href} className={`${styles.navItem} ${active === n.key ? styles.navOn : ""}`} aria-current={active === n.key ? "page" : undefined}>
              <span className={styles.navGlyph} aria-hidden="true">{n.glyph}</span>{n.label}
            </Link>
          ))}
        </nav>

        <div className={styles.you}>
          <Avatar initials={you.ini} size={34} />
          <span className={styles.youText}>
            <b>{you.name}</b>
            <span className={styles.youLine}>{you.line}</span>
          </span>
        </div>
      </aside>

      {/* MOBILE — slim top bar (<1000px) */}
      <header className={styles.topbar}>
        <Wordmark size={1.05} />
        <span className={styles.topLoc}><i /> Bengaluru</span>
      </header>

      <main className={styles.main}>{children}</main>

      {/* MOBILE — bottom tab bar (<1000px): Map · ＋ · Guides · You, evenly spaced,
          the ＋ capture elevated and saffron. */}
      <nav className={styles.tabs} aria-label="Vouch">
        <Link href="/home" className={`${styles.tab} ${active === "map" ? styles.tabOn : ""}`} aria-current={active === "map" ? "page" : undefined}>
          <span className={styles.tabGlyph} aria-hidden="true">◍</span><span className={styles.tabLabel}>Map</span>
        </Link>
        <button type="button" className={styles.tabAdd} onClick={onNewVouch} aria-label="Add a place">
          <span className={styles.tabAddPlus} aria-hidden="true">＋</span>
        </button>
        <Link href="/guides" className={`${styles.tab} ${active === "guides" ? styles.tabOn : ""}`} aria-current={active === "guides" ? "page" : undefined}>
          <span className={styles.tabGlyph} aria-hidden="true">❑</span><span className={styles.tabLabel}>Guides</span>
        </Link>
        <Link href="/you" className={`${styles.tab} ${active === "you" ? styles.tabOn : ""}`} aria-current={active === "you" ? "page" : undefined}>
          <span className={styles.tabGlyph} aria-hidden="true">◆</span><span className={styles.tabLabel}>You</span>
        </Link>
      </nav>
    </div>
  );
}
