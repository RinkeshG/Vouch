import Link from "next/link";
import { Stamp } from "@/components/ui/stamp";
import styles from "./auth.module.css";

export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <nav className={styles.topBar}>
        <Link href="/" className={styles.logo}>
          <Stamp size={32} />
        </Link>
        <Link href="/explore" className={styles.topLink}>
          Browse lists →
        </Link>
      </nav>

      <div className={styles.formWrap}>
        {children}
      </div>

      <footer className={styles.footer}>
        <span className={styles.footerBrand}>Vouch</span>
        <span className={styles.footerDot}>·</span>
        <span className={styles.footerNote}>Made in Bangalore</span>
      </footer>
    </div>
  );
}
