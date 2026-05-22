"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/app/bottom-nav";
import { DemoBanner } from "@/components/app/demo-banner";
import { Avatar } from "@/components/ui/avatar";
import { Stamp } from "@/components/ui/stamp";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import styles from "./app.module.css";

interface SuggestedPerson {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  vouch_count: number;
}

interface TrendingPlace {
  id: string;
  name: string;
  area: string;
  cuisines?: string[];
  vouch_count: number;
}

interface AppShellClientProps {
  handle?: string;
  displayName?: string;
  avatarUrl?: string | null;
  isDemo?: boolean;
  suggestedPeople?: SuggestedPerson[];
  trendingPlaces?: TrendingPlace[];
  children: ReactNode;
}

export function AppShellClient({
  handle,
  displayName,
  isDemo,
  suggestedPeople = [],
  trendingPlaces = [],
  children,
}: AppShellClientProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/home") return pathname === "/home";
    if (path === "/search") return pathname.startsWith("/search");
    if (path === "/saved") return pathname.startsWith("/saved");
    if (path === "/profile") {
      return handle ? pathname === `/${handle}` : false;
    }
    return false;
  };

  const profileHref = handle ? `/${handle}` : "/home";

  const navItems = [
    { id: "home", label: "Home", icon: "home" as const, href: "/home", badge: null },
    { id: "search", label: "Search", icon: "search" as const, href: "/search", badge: null },
    { id: "saved", label: "Saved", icon: "bookmark" as const, href: "/saved", badge: null },
    { id: "profile", label: "Profile", icon: "users" as const, href: profileHref, badge: null },
  ];

  return (
    <>
      {isDemo && <DemoBanner />}

      {/* ---- Desktop Top Nav ---- */}
      <header className={styles.topNav}>
        <div className={styles.topNavLeft}>
          <Stamp size={28} />
          <Link href="/home" className={styles.wordmark}>vouch</Link>
        </div>

        <div className={styles.searchBar}>
          <div className={styles.searchInner}>
            <Icon name="search" size={16} />
            <input
              className={styles.searchInput}
              placeholder="Search places, friends, lists…"
              type="text"
            />
            <kbd className={styles.searchKbd}>⌘K</kbd>
          </div>
        </div>

        <div className={styles.topNavRight}>
          <Link href="/add" className={styles.vouchBtn}>
            <Icon name="plus" size={14} strokeWidth={2} />
            Vouch
          </Link>
          <button className={styles.notifBtn} aria-label="Notifications">
            <Icon name="bell" size={18} />
            <span className={styles.notifDot} />
          </button>
          <Link href={profileHref} className={styles.avatarBtn}>
            <Avatar
              handle={handle || "user"}
              name={displayName || "User"}
              size="sm"
            />
          </Link>
        </div>
      </header>

      {/* ---- 3-column body: Left Rail + Main + Right Rail ---- */}
      <div className={styles.body}>
        {/* Left Rail */}
        <aside className={styles.leftRail}>
          <nav className={styles.railNav}>
            {navItems.map((item) => {
              const active = isActive(item.href === profileHref ? "/profile" : item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(styles.railLink, active && styles.railLinkActive)}
                >
                  <Icon
                    name={item.icon}
                    size={20}
                    strokeWidth={active ? 1.8 : 1.6}
                  />
                  <span className={styles.railLinkLabel}>{item.label}</span>
                  {item.badge && (
                    <span className={styles.railBadge}>{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className={styles.progressWidget}>
            <div className={styles.progressLabel}>Your vouch this month</div>
            <div className={styles.progressNumber}>
              3<span className={styles.progressFraction}>/12</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: "25%" }} />
            </div>
            <div className={styles.progressHint}>
              Vouch a place a week. Keep the canon honest.
            </div>
          </div>

          <div className={styles.railFooter}>
            <a className={styles.railFooterLink}>Invite friends</a>
            <a className={styles.railFooterLink}>Settings</a>
            <a className={styles.railFooterLink}>Help & feedback</a>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>{children}</main>

        {/* Right Rail */}
        <aside className={styles.rightRail}>
          {suggestedPeople.length > 0 && (
            <div className={styles.rightCard}>
              <div className={styles.rightCardLabel}>People you might trust</div>
              <div className={styles.suggestList}>
                {suggestedPeople.slice(0, 3).map((p) => (
                  <div key={p.id} className={styles.suggestRow}>
                    <Avatar
                      handle={p.handle}
                      name={p.display_name}
                      imageUrl={p.avatar_url}
                      size="sm"
                    />
                    <div className={styles.suggestInfo}>
                      <div className={styles.suggestName}>{p.display_name}</div>
                      <div className={styles.suggestSub}>
                        {p.vouch_count} vouches
                      </div>
                    </div>
                    <button className={styles.followBtn}>Follow</button>
                  </div>
                ))}
              </div>
              <Link href="/search" className={styles.seeAll}>See all →</Link>
            </div>
          )}

          {trendingPlaces.length > 0 && (
            <div className={styles.rightCard}>
              <div className={styles.rightCardLabel}>Trending in Bangalore</div>
              <div className={styles.trendList}>
                {trendingPlaces.slice(0, 3).map((pl, i) => (
                  <Link
                    key={pl.id}
                    href={`/place/${pl.id}`}
                    className={styles.trendRow}
                  >
                    <span className={styles.trendIndex}>{i + 1}</span>
                    <div className={styles.trendInfo}>
                      <div className={styles.trendName}>{pl.name}</div>
                      <div className={styles.trendMeta}>
                        {pl.area.toUpperCase()}
                        {pl.cuisines?.[0] && ` · ${pl.cuisines[0].toUpperCase()}`}
                      </div>
                    </div>
                    <span className={styles.trendCount}>+{pl.vouch_count}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className={styles.rightFooter}>
            <a>About</a> · <a>Privacy</a> · <a>Terms</a> · <a>Help</a>
            <br />
            © Vouch, 2026
          </div>
        </aside>
      </div>

      {/* ---- Mobile Bottom Nav ---- */}
      <BottomNav handle={handle} />
    </>
  );
}
