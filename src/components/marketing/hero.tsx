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
          The only restaurant guide that matters is your{" "}
          <em className={styles.em}>friends&rsquo;</em>
        </h1>

        <p className={styles.sub}>
          No strangers. No algorithms. Just honest takes from the people
          you actually trust. Vouch for the places you love, discover
          through your circle.
        </p>

        <div className={styles.ctas}>
          <Link href="/sign-up">
            <Button size="lg" icon={<Icon name="arrow-right" size={18} />}>
              Build your list
            </Button>
          </Link>
          <Link href="/home">
            <Button variant="ghost" size="lg">
              Preview the app
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
            Joined by <strong>500+</strong> people building their lists in Bangalore
          </p>
        </div>
      </div>
    </section>
  );
}
