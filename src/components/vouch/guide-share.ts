/* Sharing a guide (PRD §7.9): the guide travels as a JPEG through WhatsApp more than
   as a URL, so we hand the platform BOTH — the 4:5 image card (from /api/guide-card)
   and the link, together. Where file-sharing isn't supported, we copy the link and
   download the image so the user can drop both into the chat by hand. */

type Item = { name: string; note?: string; tags?: string };
/* pts: [itemIndex, lat, lng] — the index keys each pin's number to its row on the card */
type ShareGuide = { slug: string; title: string; by?: string; note?: string; items: Item[]; pts?: [number, number, number][] };

export function guideCardUrl(g: ShareGuide): string {
  const p = new URLSearchParams();
  p.set("title", g.title || "A guide");
  p.set("by", g.by || "You");
  if (g.note) p.set("note", g.note);
  p.set("count", String(g.items.length));
  // n = Name::take::Area — the area is the middle of the "cuisine · area · price" tags
  g.items.slice(0, 4).forEach((it) => {
    const area = (it.tags || "").split("·")[1]?.trim() || "";
    p.append("n", `${it.name}::${it.note || ""}::${area}`);
  });
  // real coordinates → pins land where the places actually stand, numbered by row
  (g.pts || []).forEach(([i, la, ln]) => p.append("pt", `${i},${la},${ln}`));
  return `/api/guide-card?${p.toString()}`;
}

export type ShareResult = "shared" | "image-downloaded" | "link-copied";

export async function shareGuideCard(g: ShareGuide, link: string): Promise<ShareResult> {
  let file: File | null = null;
  try {
    const res = await fetch(guideCardUrl(g));
    if (res.ok) file = new File([await res.blob()], `${g.slug || "guide"}.png`, { type: "image/png" });
  } catch { /* image generation failed → still share the link below */ }

  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (file && nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: g.title, text: `${g.title} — a Vouch guide`, url: link });
      return "shared";
    } catch { /* user cancelled or share failed → fall back */ }
  }

  try { await navigator.clipboard?.writeText(link); } catch { /* ignore */ }
  if (file) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return "image-downloaded";
  }
  return "link-copied";
}
