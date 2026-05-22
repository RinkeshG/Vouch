import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Stamp } from "@/components/ui/stamp";
import { Icon } from "@/components/ui/icon";
import styles from "./hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.badge}>
          <Stamp size={20} />
          <span className={styles.badgeText}>Now in Bangalore</span>
        </div>

        <h1 className={styles.headline}>
          Build and share curated lists of your{" "}
          <em className={styles.em}>favorite places</em>
        </h1>

        <p className={styles.sub}>
          Name it, curate it, share it. Create beautiful, shareable lists
          of the places you love — from the best biryani spots to
          your go-to cafes. Your taste, beautifully organized.
        </p>

        <div className={styles.ctas}>
          <Link href="/sign-up">
            <Button size="lg" icon={<Icon name="arrow-right" size={18} />}>
              Create your first list
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="ghost" size="lg">
              Explore lists
            </Button>
          </Link>
        </div>

        <div className={styles.proof}>
          <div className={styles.avatarStack}>
            {["RG", "AS", "NP", "KM", "VT"].map((initials, i) => (
              <span
                key={initials}
                className={styles.stackAvatar}
                style={{
                  backgroundColor: `var(--v-tint-${i})`,
                  zIndex: 5 - i,
                }}
              >
                <span className={styles.stackInitials}>{initials}</span>
              </span>
            ))}
          </div>
          <p className={styles.proofText}>
            Joined by <strong>500+</strong> people curating their lists in Bangalore
          </p>
        </div>
      </div>
    </section>
  );
}
