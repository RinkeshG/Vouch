"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Stamp } from "@/components/ui/stamp";
import { cn } from "@/lib/utils";
import styles from "./bottom-nav.module.css";

interface BottomNavProps {
  handle?: string;
}

export function BottomNav({ handle }: BottomNavProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/home") return pathname === "/home";
    if (path === "/search") return pathname.startsWith("/search");
    if (path === "/saved") return pathname.startsWith("/saved");
    if (path === "/profile") {
      return handle ? pathname === `/${handle}` : pathname === "/profile";
    }
    return false;
  };

  const profileHref = handle ? `/${handle}` : "/home";

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <div className={styles.inner}>
        {/* Logo — desktop only */}
        <div className={styles.logo}>
          <Stamp size={28} />
        </div>

        <Link
          href="/home"
          className={cn(styles.tab, isActive("/home") && styles.tabActive)}
          aria-label="Home"
          aria-current={isActive("/home") ? "page" : undefined}
        >
          <Icon
            name="home"
            size={22}
            strokeWidth={isActive("/home") ? 2 : 1.6}
          />
          <span className={styles.tabLabel}>Home</span>
        </Link>

        <Link
          href="/search"
          className={cn(styles.tab, isActive("/search") && styles.tabActive)}
          aria-label="Search"
          aria-current={isActive("/search") ? "page" : undefined}
        >
          <Icon
            name="search"
            size={22}
            strokeWidth={isActive("/search") ? 2 : 1.6}
          />
          <span className={styles.tabLabel}>Search</span>
        </Link>

        {/* Add vouch — special button */}
        <Link href="/add" className={styles.addTab} aria-label="Add vouch">
          <span className={styles.addButton}>
            <Icon name="plus" size={20} strokeWidth={2} />
          </span>
        </Link>

        <Link
          href="/saved"
          className={cn(styles.tab, isActive("/saved") && styles.tabActive)}
          aria-label="Saved"
          aria-current={isActive("/saved") ? "page" : undefined}
        >
          <Icon
            name={isActive("/saved") ? "bookmark-filled" : "bookmark"}
            size={22}
            strokeWidth={isActive("/saved") ? 2 : 1.6}
          />
          <span className={styles.tabLabel}>Saved</span>
        </Link>

        <Link
          href={profileHref}
          className={cn(styles.tab, isActive("/profile") && styles.tabActive)}
          aria-label="Profile"
          aria-current={isActive("/profile") ? "page" : undefined}
        >
          <Icon
            name="users"
            size={22}
            strokeWidth={isActive("/profile") ? 2 : 1.6}
          />
          <span className={styles.tabLabel}>Profile</span>
        </Link>

        {/* Spacer + settings — desktop only */}
        <div className={styles.spacer} />
      </div>
    </nav>
  );
}
