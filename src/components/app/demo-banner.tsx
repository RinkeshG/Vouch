"use client";

import styles from "./demo-banner.module.css";

export function DemoBanner() {
  return (
    <>
      <div className={styles.banner}>
        <span className={styles.badge}>Preview</span>
        <span className={styles.text}>
          Demo mode — using sample data
        </span>
      </div>
      <div className={styles.bannerSpacer} />
    </>
  );
}
