import styles from "./home.module.css";

/* Home = "Where should I go?" — decision support, NOT a feed (Constitution §7).
   Starts from situations: time · area · occasion · your follow-graph. */

export function HomeHeader({ greeting = "Dinner tonight?", sub }: { greeting?: string; sub?: string }) {
  return (
    <header className={styles.head}>
      <span className={styles.kicker}>Where should I go?</span>
      <h1 className={styles.q}>{greeting}</h1>
      {sub && <p className={styles.sub}>{sub}</p>}
    </header>
  );
}

/* Mode bar — horizontal, edge-masked. The home modes / occasions. */
export function ModeBar({ modes, active }: { modes: string[]; active?: string }) {
  return (
    <div className={styles.barWrap}>
      <div className={styles.bar}>
        {modes.map((m) => (
          <span key={m} className={`${styles.mode} ${m === active ? styles.modeOn : ""}`}>{m}</span>
        ))}
      </div>
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className={styles.sectionLabel}>{children}</p>;
}
