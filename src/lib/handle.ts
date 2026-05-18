/** URL-safe handle from display name */
export function slugifyHandle(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

  if (base.length >= 3) return base;
  return `vouch-${Math.random().toString(36).slice(2, 8)}`;
}

export function withHandleSuffix(handle: string, suffix: string): string {
  const trimmed = handle.slice(0, 20);
  return `${trimmed}-${suffix}`;
}
