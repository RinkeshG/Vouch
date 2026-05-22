"use client";

import { useState } from "react";
import Link from "next/link";
import { Lockup } from "@/components/ui/stamp";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import styles from "./nav.module.css";

export function MarketingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href="/" className={styles.logo} aria-label="Vouch home">
          <Lockup size={26} />
        </Link>

        <div className={styles.links}>
          <Link href="/explore" className={styles.link}>
            Explore
          </Link>
        </div>

        <div className={styles.actions}>
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="primary" size="sm">
              Create a list
            </Button>
          </Link>
        </div>

        <button
          className={styles.menuBtn}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <Icon name={menuOpen ? "x" : "menu"} size={22} />
        </button>
      </nav>

      {menuOpen && (
        <div className={styles.mobileMenu} role="dialog" aria-label="Mobile menu">
          <div className={styles.mobileLinks}>
            <Link
              href="/explore"
              className={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              Explore
            </Link>
          </div>
          <div className={styles.mobileActions}>
            <Link href="/sign-in" style={{ width: "100%" }}>
              <Button variant="secondary" size="lg" fullWidth>
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up" style={{ width: "100%" }}>
              <Button variant="primary" size="lg" fullWidth>
                Create a list
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
