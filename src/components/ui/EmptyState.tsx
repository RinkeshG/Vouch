import type { ReactNode } from "react";

export function EmptyState({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="empty-state">
      {icon}
      <div className="empty-state-body">{children}</div>
    </div>
  );
}
