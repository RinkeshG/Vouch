import { ChevronRight, Share2, UserPlus } from "lucide-react";
import type { Friend, Place, UserPlace } from "../../types";
import { placesFromFriend } from "../../lib/selectors";

export function FriendsScreen({
  friends,
  userPlaces,
  placeById,
  onInvite,
  onOpenFriend,
  onLogRecommendation
}: {
  friends: Friend[];
  userPlaces: UserPlace[];
  placeById: Record<string, Place>;
  onInvite: () => void;
  onOpenFriend: (friendId: string) => void;
  onLogRecommendation: () => void;
}) {
  return (
    <div className="content-stack">
      <section className="friends-invite-hero">
        <div className="friends-invite-icon">
          <Share2 size={22} />
        </div>
        <h2>Grow your circle</h2>
        <p>Share your Vouch with people whose taste you trust. When they make theirs, you'll be connected.</p>
        <button type="button" className="primary-button" onClick={onInvite}>
          <UserPlus size={16} /> Invite a friend
        </button>
      </section>

      {friends.length > 0 && (
        <section className="friends-list-section">
          <div className="friends-list-header">
            <strong>{friends.length} friend{friends.length === 1 ? "" : "s"}</strong>
            <button type="button" className="small-button" onClick={onLogRecommendation}>
              Log a rec
            </button>
          </div>
          <div className="friends-list">
            {friends.map((friend) => {
              const recs = placesFromFriend(userPlaces, friend.id);
              return (
                <button
                  type="button"
                  className="friend-card"
                  key={friend.id}
                  onClick={() => onOpenFriend(friend.id)}
                >
                  <div className="friend-avatar">
                    {friend.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="friend-card-copy">
                    <strong>{friend.name}</strong>
                    <span>
                      {recs.length > 0
                        ? `${recs.length} rec${recs.length === 1 ? "" : "s"} · ${friend.trustedFor.slice(0, 2).join(", ")}`
                        : friend.trustedFor.slice(0, 2).join(", ") || friend.city}
                    </span>
                  </div>
                  <ChevronRight size={16} />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {friends.length === 0 && (
        <section className="friends-empty">
          <p>
            Your circle is how Vouch works. When you invite someone and they make their own Vouch, their recommendations show up in your app.
          </p>
        </section>
      )}
    </div>
  );
}
