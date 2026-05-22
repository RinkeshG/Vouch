import Link from "next/link";
import { Stamp } from "@/components/ui/stamp";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import styles from "./closing-cta.module.css";

export function ClosingCta() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <Stamp size={48} animated />
        <h2 className={styles.heading}>
          Your taste deserves{"\n"}a beautiful home
        </h2>
        <p className={styles.body}>
          Create your first list in two minutes. Share it everywhere.
        </p>
        <Link href="/sign-up">
          <Button
            size="lg"
            variant="seal"
            icon={<Icon name="arrow-right" size={18} />}
          >
            Create your first list
          </Button>
        </Link>
      </div>
    </section>
  );
}
