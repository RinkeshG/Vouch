"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { Lockup } from "@/components/ui/stamp";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import styles from "./app.module.css";

interface AppShellClientProps {
  handle?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  isAuthed: boolean;
  children: ReactNode;
}

export function AppShellClient({
  handle,
  displayName,
  avatarUrl,
  isAuthed,
  children,
}: AppShellClientProps) {
  const profileHref = handle ? `/@${handle}` : "/new";

  return (
    <>
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link href="/" className={styles.logoLink}>
            <Lockup size={24} />
          </Link>

          <div className={styles.actions}>
            {isAuthed ? (
              <>
                <Link href="/new" className={styles.newListBtn}>
                  <Icon name="plus" size={14} strokeWidth={2.5} />
                  New list
                </Link>
                <Link href={profileHref} className={styles.avatarLink}>
                  <Avatar
                    handle={handle || "user"}
                    name={displayName || "User"}
                    imageUrl={avatarUrl}
                    size="sm"
                  />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className={`${styles.authLink} ${styles.authLinkGhost}`}
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className={`${styles.authLink} ${styles.authLinkPrimary}`}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>{children}</main>
    </>
  );
}
