export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function avatarTint(handle: string): number {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = handle.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 9;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;

  return `${Math.floor(months / 12)}y`;
}

export function firstName(fullName: string): string {
  return fullName.split(" ")[0] || fullName;
}

/**
 * Editorial uppercase time label — "TODAY", "YESTERDAY", "3 DAYS AGO", etc.
 * Used in list hero meta and card footers.
 */
export function timeAgoLabel(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "TODAY";
  if (diffDays === 1) return "YESTERDAY";
  if (diffDays < 7) return `${diffDays} DAYS AGO`;
  if (diffDays < 14) return "1 WEEK AGO";
  const weeks = Math.floor(diffDays / 7);
  if (weeks < 5) return `${weeks} WEEKS AGO`;
  const months = Math.floor(diffDays / 30);
  if (months < 2) return "1 MONTH AGO";
  if (months < 12) return `${months} MONTHS AGO`;
  const years = Math.floor(months / 12);
  if (years === 1) return "1 YEAR AGO";
  return `${years} YEARS AGO`;
}

/**
 * Compact number formatting — "1.5K", "23", "2.1M", etc.
 * Used for save counts and follower counts.
 */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) {
    const k = n / 1000;
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  if (n < 1000000) return `${Math.floor(n / 1000)}K`;
  const m = n / 1000000;
  return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
}
