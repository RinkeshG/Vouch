import Link from "next/link";
import "../components/vouch/vouch.css";
import styles from "./not-found.module.css";

/* The dead end speaks the brand (warm, human, no blame — never a system 404).
   Self-contained like the vouch layout: loads the families, wraps in .vouch. */
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=Space+Grotesk:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap";

export default function NotFound() {
  return (
    <>
      <link rel="stylesheet" href={FONTS_HREF} />
      <div className="vouch vouchRoot">
        <main className={styles.page}>
          <span className={styles.ring} aria-hidden="true" />
          <div className={styles.head}>
            <p className={styles.eyebrow}>404 · off your map</p>
            <h1 className={styles.title}>Nothing’s vouched for here.</h1>
          </div>
          <p className={styles.line}>Whatever this address was, nobody’s put their name on it.</p>
          <Link href="/home" className={styles.back}>← Back to the map</Link>
        </main>
      </div>
    </>
  );
}
