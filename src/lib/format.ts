import type { PriceTier } from "../types";

export function priceLabel(price: PriceTier): string {
  const labels: Record<PriceTier, string> = {
    easy: "Easy on the wallet",
    treat: "Treat yourself",
    splurge: "Splurge night"
  };
  return labels[price];
}

export function priceShort(price: PriceTier): string {
  const labels: Record<PriceTier, string> = {
    easy: "Easy",
    treat: "Treat",
    splurge: "Splurge"
  };
  return labels[price];
}

export function greeting(name: string): string {
  const hour = new Date().getHours();
  const first = name.trim().split(/\s+/)[0] || "there";
  if (hour < 12) return `Good morning, ${first}`;
  if (hour < 17) return `Good afternoon, ${first}`;
  return `Good evening, ${first}`;
}

export function relativeTime(at: number): string {
  const diff = Date.now() - at;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(at).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function tasteBio(tags: string[]): string {
  if (tags.length === 0) return "Building a taste profile";
  const shown = tags.slice(0, 3).join(" · ");
  return `Ask me for ${shown}`;
}
