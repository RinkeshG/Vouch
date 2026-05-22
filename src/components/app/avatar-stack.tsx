"use client";

import { Avatar } from "@/components/ui/avatar";
import styles from "./avatar-stack.module.css";

interface Person {
  handle: string;
  name: string;
  avatarUrl?: string | null;
}

interface AvatarStackProps {
  people: Person[];
  max?: number;
  label?: string;
}

/**
 * Stacked overlapping avatars with names — social proof.
 * "Priya, Arjun + 1 more vouch for this"
 */
export function AvatarStack({ people, max = 3, label }: AvatarStackProps) {
  if (people.length === 0) return null;

  const shown = people.slice(0, max);
  const extra = people.length - max;

  // Build name string
  const firstNames = shown.map((p) => p.name.split(" ")[0]);
  let nameStr = "";
  if (firstNames.length === 1) {
    nameStr = firstNames[0];
  } else if (firstNames.length === 2) {
    nameStr = `${firstNames[0]} & ${firstNames[1]}`;
  } else {
    nameStr = `${firstNames[0]}, ${firstNames[1]}`;
  }

  if (extra > 0) {
    nameStr += ` + ${extra} more`;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.stack}>
        {shown.map((p) => (
          <span key={p.handle} className={styles.stackItem}>
            <Avatar
              handle={p.handle}
              name={p.name}
              imageUrl={p.avatarUrl}
              size="xs"
            />
          </span>
        ))}
      </div>
      <span className={styles.names}>
        <strong>{nameStr}</strong>
        {label && ` ${label}`}
      </span>
    </div>
  );
}
