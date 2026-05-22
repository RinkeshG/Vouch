import { Icon, type IconName } from "@/components/ui/icon";
import styles from "./how-it-works.module.css";

const steps: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "edit",
    title: "Pick your handle",
    body: "Claim a unique handle — that becomes your profile URL. Quick, simple, yours forever.",
  },
  {
    icon: "list",
    title: "Name your list & add places",
    body: "Type a name, search for places, tap to add. Build curated lists of your favorites — cafes, biryani spots, date nights, whatever you love.",
  },
  {
    icon: "share",
    title: "Share your beautiful link",
    body: "Hit publish and share your list anywhere — WhatsApp, Instagram, Twitter. Friends see it, love it, create their own.",
  },
];

export function HowItWorks() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>How it works</h2>
        <p className={styles.intro}>
          From sign-up to your first published list — about two minutes.
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
