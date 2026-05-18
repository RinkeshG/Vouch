import type { Collection } from "../types";

/** URL segment for lists: lowercase, hyphenated, latin only */
export function slugifyListTitle(title: string): string {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/['"\u2018\u2019]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "list"
  );
}

function isSafeSlug(s: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) && s.length <= 56;
}

/** Assign stable slugs to saved lists for public URLs (`/you/my-date-spots`). */
export function migrateCollectionSlugs(collections: Collection[]): Collection[] {
  const taken = new Set<string>();
  return collections.map((c) => {
    let slug = c.slug?.toLowerCase();
    if (slug && isSafeSlug(slug) && !taken.has(slug)) {
      taken.add(slug);
      return { ...c, slug };
    }
    const base = slugifyListTitle(c.title);
    let candidate = base;
    let n = 0;
    while (taken.has(candidate)) {
      n += 1;
      candidate = `${base}-${n}`;
    }
    taken.add(candidate);
    return { ...c, slug: candidate };
  });
}

/** New list row — avoids collisions within the user's lists */
export function allocateListSlug(title: string, excluding: Pick<Collection, "slug">[]): string {
  const taken = new Set(
    excluding.map((e) => e.slug?.toLowerCase()).filter(Boolean) as string[]
  );
  const base = slugifyListTitle(title);
  let candidate = base;
  let n = 0;
  while (taken.has(candidate)) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
}
