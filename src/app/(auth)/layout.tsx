import Link from "next/link";
import { Stamp } from "@/components/ui/stamp";
import styles from "./auth.module.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <div className={styles.formInner}>
        <Link href="/" className={styles.logo}>
          <Stamp size={32} />
        </Link>
        {children}
      </div>
    </div>
  );
}
