import type { ReactNode } from "react";
import { Wordmark } from "./wordmark";
import { Avatar } from "./avatar";
import styles from "./web-shell.module.css";

export type NavKey = "map" | "search" | "guides" | "palate";

/* The WEB product shell (desktop-first). A persistent left rail carries the brand,
   nav, and the privileged ＋Vouch — the web idiom, not a phone's bottom tab bar.
   The main area is free to be a full-height, multi-pane canvas. Mobile gets its
   own shell (app-shell.tsx) and its own layout, designed separately. */
const NAV: { key: NavKey; glyph: string; label: string }[] = [
  { key: "map", glyph: "◍", label: "Your map" },
  { key: "search", glyph: "⌕", label: "Search" },
  { key: "guides", glyph: "❑", label: "Guides" },
  { key: "palate", glyph: "◆", label: "Your palate" },
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
      <aside className={styles.side}>
        <div className={styles.brand}>
          <Wordmark size={1.3} />
          <span className={styles.loc}><i /> Bengaluru</span>
        </div>

        <button type="button" className={styles.new} onClick={onNewVouch}>
          <span className={styles.newPlus} aria-hidden="true">＋</span> Vouch a place
        </button>

        <nav className={styles.nav} aria-label="Vouch">
          {NAV.map((n) => (
            <span key={n.key} className={`${styles.navItem} ${active === n.key ? styles.navOn : ""}`} aria-current={active === n.key ? "page" : undefined}>
              <span className={styles.navGlyph} aria-hidden="true">{n.glyph}</span>
              {n.label}
            </span>
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

      <div className={styles.main}>{children}</div>
    </div>
  );
}
