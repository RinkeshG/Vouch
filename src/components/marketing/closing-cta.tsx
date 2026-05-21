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
          Your friends already know{"\n"}where to eat
        </h2>
        <p className={styles.body}>
          Start building your list. It takes three minutes.
        </p>
        <Link href="/sign-up">
          <Button
            size="lg"
            variant="seal"
            icon={<Icon name="arrow-right" size={18} />}
          >
            Build your list
          </Button>
        </Link>
      </div>
    </section>
  );
}
