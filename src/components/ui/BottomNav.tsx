import { Bookmark, Home, Stamp, UserRound, UsersRound } from "lucide-react";
import type { Tab } from "../../types";

export function BottomNav({
  tab,
  onChange,
  onVouch
}: {
  tab: Tab;
  onChange: (tab: Tab) => void;
  onVouch: () => void;
}) {
  const items: Array<{ id: Tab | "vouch"; label: string; icon: React.ReactNode; action?: () => void }> = [
    { id: "home", label: "Home", icon: <Home size={18} /> },
    { id: "places", label: "Places", icon: <Bookmark size={18} /> },
    { id: "vouch", label: "Vouch", icon: <Stamp size={20} />, action: onVouch },
    { id: "friends", label: "Friends", icon: <UsersRound size={18} /> },
    { id: "you", label: "You", icon: <UserRound size={18} /> }
  ];

  return (
    <nav className="bottom-nav" aria-label="Main">
      {items.map((item) =>
        item.id === "vouch" ? (
          <button
            type="button"
            key="vouch"
            className="nav-vouch"
            onClick={item.action}
            aria-label="Vouch a place"
          >
            {item.icon}
          </button>
        ) : (
          <button
            type="button"
            key={item.id}
            className={tab === item.id ? "active" : ""}
            onClick={() => onChange(item.id as Tab)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        )
      )}
    </nav>
  );
}
