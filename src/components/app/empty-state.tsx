import { type ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import styles from "./empty-state.module.css";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <div className={styles.icon}>
        <Icon name={icon} size={48} strokeWidth={1} />
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
      {action}
    </div>
  );
}
