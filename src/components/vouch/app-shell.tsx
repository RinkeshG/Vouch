import type { ReactNode } from "react";
import { Wordmark } from "./wordmark";
import styles from "./app-shell.module.css";

export type Tab = "map" | "search" | "guides" | "you";

/* The product shell. Top bar carries context (location, "can't decide?"); the
   mobile bottom tab bar is the nav. ＋Vouch is the only saffron item — creating
   is the privileged action (patterns.md). */
export function AppShell({
  active,
  location = "Indiranagar",
  topRight,
  children,
}: {
  active: Tab;
  location?: string;
  topRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <Wordmark size={1.25} />
        <span className={styles.loc} aria-hidden="true"><i /> {location}</span>
        <span className={styles.topRight}>{topRight}</span>
      </header>

      <main className={styles.body}>{children}</main>

      <nav className={styles.tabs} aria-label="Vouch">
        <TabItem glyph="◍" label="Map" on={active === "map"} />
        <TabItem glyph="⌕" label="Search" on={active === "search"} />
        <span className={styles.plus} aria-label="New vouch"><span>＋</span><b>Vouch</b></span>
        <TabItem glyph="❑" label="Guides" on={active === "guides"} />
        <TabItem glyph="◆" label="You" on={active === "you"} />
      </nav>
    </div>
  );
}

function TabItem({ glyph, label, on }: { glyph: string; label: string; on: boolean }) {
  return (
    <span className={`${styles.tab} ${on ? styles.tabOn : ""}`}>
      <span className={styles.tabGlyph} aria-hidden="true">{glyph}</span>
      <span className={styles.tabLabel}>{label}</span>
    </span>
  );
}
