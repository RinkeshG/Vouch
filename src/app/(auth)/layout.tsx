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
      <div className={styles.formSide}>
        <div className={styles.formInner}>
          <div className={styles.logo}>
            <Stamp size={32} />
          </div>
          {children}
        </div>
      </div>
      <div className={styles.editorialSide}>
        <div className={styles.editorialContent}>
          <p className={styles.quote}>
            &ldquo;Everyone has a list. The cafes you swear by, the biryani
            spot that never misses, the place you take every guest.
            Now give it a beautiful home.&rdquo;
          </p>
          <div className={styles.attribution}>
            <span className={styles.attributionName}>Vouch</span>
          </div>
        </div>
      </div>
    </div>
  );
}
