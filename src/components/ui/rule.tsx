import { cn } from "@/lib/utils";
import styles from "./rule.module.css";

interface RuleProps {
  label?: string;
  className?: string;
}

export function Rule({ label, className }: RuleProps) {
  if (label) {
    return (
      <div className={cn(styles.labeled, className)} role="separator">
        <span className={styles.line} />
        <span className={styles.label}>{label}</span>
        <span className={styles.line} />
      </div>
    );
  }

  return <hr className={cn(styles.rule, className)} />;
}
