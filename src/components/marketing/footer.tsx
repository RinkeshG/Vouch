import Link from "next/link";
import { Stamp, Wordmark } from "@/components/ui/stamp";
import styles from "./footer.module.css";

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { label: "Explore", href: "/explore" },
      { label: "Create a list", href: "/sign-up" },
    ],
  },
  cities: {
    title: "Cities",
    links: [
      { label: "Bangalore", href: "/explore" },
      { label: "Bombay", href: "#", disabled: true },
      { label: "Delhi", href: "#", disabled: true },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
};

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.lockup}>
            <Stamp size={28} variant="dark" />
            <Wordmark />
          </div>
          <p className={styles.tagline}>
            Curated lists of the places you love.
          </p>
        </div>

        <div className={styles.columns}>
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key} className={styles.column}>
              <h3 className={styles.columnTitle}>{section.title}</h3>
              <ul className={styles.columnLinks}>
                {section.links.map((link) => (
                  <li key={link.label}>
                    {"disabled" in link && link.disabled ? (
                      <span className={styles.disabledLink}>
                        {link.label}
                        <span className={styles.soon}>Soon</span>
                      </span>
                    ) : (
                      <Link href={link.href} className={styles.footerLink}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            &copy; {new Date().getFullYear()} Vouch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
