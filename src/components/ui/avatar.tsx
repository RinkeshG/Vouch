import { cn, avatarTint, getInitials } from "@/lib/utils";
import styles from "./avatar.module.css";

type AvatarSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<AvatarSize, number> = {
  sm: 28,
  md: 40,
  lg: 56,
  xl: 72,
};

interface AvatarProps {
  handle: string;
  name: string;
  imageUrl?: string | null;
  size?: AvatarSize;
  ring?: boolean;
  className?: string;
}

export function Avatar({
  handle,
  name,
  imageUrl,
  size = "md",
  ring = false,
  className,
}: AvatarProps) {
  const px = sizeMap[size];
  const tintIndex = avatarTint(handle);
  const initials = getInitials(name);
  const fontSize = px * 0.38;

  return (
    <span
      className={cn(styles.avatar, styles[size], ring && styles.ring, className)}
      style={{
        width: px,
        height: px,
        backgroundColor: imageUrl
          ? "var(--v-faint)"
          : `var(--v-tint-${tintIndex})`,
      }}
      role="img"
      aria-label={name}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className={styles.image}
          loading="lazy"
        />
      ) : (
        <span
          className={styles.initials}
          style={{ fontSize }}
        >
          {initials}
        </span>
      )}
    </span>
  );
}
