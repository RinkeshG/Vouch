import { Share2 } from "lucide-react";
import type { Tab } from "../../types";

const meta: Record<Tab, { title: string; subtitle: string }> = {
  home: { title: "Today", subtitle: "Plans & your circle" },
  places: { title: "Places", subtitle: "Your picks" },
  friends: { title: "Friends", subtitle: "Trusted taste" },
  you: { title: "You", subtitle: "Your public Vouch" }
};

export function AppHeader({
  tab,
  onShare,
  showShare = true
}: {
  tab: Tab;
  onShare: () => void;
  showShare?: boolean;
}) {
  const { title, subtitle } = meta[tab];
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">{subtitle}</p>
        <h1>{title}</h1>
      </div>
      {showShare && (
        <button type="button" className="icon-button" onClick={onShare} aria-label="Share">
          <Share2 size={19} />
        </button>
      )}
    </header>
  );
}
