import { Icon, type IconName } from "@/components/ui/icon";
import styles from "./how-it-works.module.css";

const steps: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "edit",
    title: "Claim your handle",
    body: "Pick a unique handle and tell us your city. That's your identity on Vouch — short, simple, yours.",
  },
  {
    icon: "vouch",
    title: "Vouch for four places",
    body: "Share the places you actually go back to. Write a take for each — the way you'd tell a friend. Your profile goes live once you hit four.",
  },
  {
    icon: "users",
    title: "Build your circle",
    body: "Follow the people whose taste you trust. Friends, food friends, that one colleague who always picks the right spot.",
  },
  {
    icon: "search",
    title: "Discover through trust",
    body: "Your feed shows only recommendations from your circle. No noise, no strangers, no sponsored posts. Just signal.",
  },
];

export function HowItWorks() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>How it works</h2>
        <p className={styles.intro}>
          From sign-up to your first discovery — it takes about three minutes.
        </p>

        <div className={styles.steps}>
          {steps.map((step, i) => (
            <div key={step.title} className={styles.step}>
              <div className={styles.stepIcon}>
                <Icon name={step.icon} size={22} />
              </div>
              <div className={styles.connector}>
                <span className={styles.dot}>{i + 1}</span>
                {i < steps.length - 1 && <span className={styles.line} />}
              </div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
