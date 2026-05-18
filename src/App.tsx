import { useEffect, useMemo, useState } from "react";
import { HomeScreen } from "./components/screens/HomeScreen";
import { CollectionDetail } from "./components/screens/CollectionDetail";
import { FriendDetail } from "./components/screens/FriendDetail";
import { FriendsScreen } from "./components/screens/FriendsScreen";
import { Onboarding } from "./components/screens/Onboarding";
import { PlaceDetail } from "./components/screens/PlaceDetail";
import { PlacesScreen } from "./components/screens/PlacesScreen";
import { ProfileScreen } from "./components/screens/ProfileScreen";
import { PublicProfileScreen } from "./components/screens/PublicProfileScreen";
import {
  AddFriendSheet,
  AddPlaceSheet,
  CollectionSheet,
  FriendRecSheet,
  ShareSheet,
  TopFourSheet
} from "./components/sheets";
import { AppHeader } from "./components/ui/AppHeader";
import { BottomNav } from "./components/ui/BottomNav";
import { StampOverlay } from "./components/ui/StampOverlay";
import { Toast } from "./components/ui/Toast";
import { useVouchStore } from "./hooks/useVouchStore";
import { fetchPublicVouchByHandle, isCloudEnabled, placesForPublicPayload } from "./lib/cloud";
import { parseInviteFromUrl } from "./lib/invite";
import { placesFromFriend } from "./lib/selectors";
import {
  buildCollectionShareText,
  buildInviteLink,
  buildPlaceShareText,
  buildPublicProfileUrl,
  buildTopFourShareText,
  copyToClipboard,
  inviteMessage,
  nativeShare,
  openWhatsApp,
  readHandleFromUrl,
  readPublicProfileFromUrl
} from "./lib/share";

function App() {
  const hashProfile = useMemo(() => readPublicProfileFromUrl(), []);
  const publicHandle = useMemo(() => readHandleFromUrl(), []);
  const [remoteProfile, setRemoteProfile] = useState<Awaited<ReturnType<typeof fetchPublicVouchByHandle>> | undefined>(
    publicHandle ? undefined : null
  );

  useEffect(() => {
    parseInviteFromUrl();
  }, []);

  useEffect(() => {
    if (!publicHandle || !isCloudEnabled) {
      if (publicHandle && !isCloudEnabled) setRemoteProfile(null);
      return;
    }
    let cancelled = false;
    void fetchPublicVouchByHandle(publicHandle).then((payload) => {
      if (!cancelled) setRemoteProfile(payload);
    });
    return () => {
      cancelled = true;
    };
  }, [publicHandle]);

  const publicProfile = publicHandle ? remoteProfile ?? undefined : hashProfile;

  const store = useVouchStore();
  const {
    hydrated,
    cloudSyncing,
    profile,
    tab,
    setTab,
    userPlaces,
    collections,
    friends,
    placeById,
    vouched,
    want,
    saved,
    topPlaces,
    contextVouched,
    savesFromFriends,
    activePlace,
    activeUserPlace,
    activeCollection,
    sheet,
    setSheet,
    toast,
    stampPlaceId,
    setStampPlaceId,
    query,
    setQuery,
    searchedPlaces,
    updateProfile,
    showToast,
    setPlaceState,
    confirmVouch,
    saveFromFriend,
    updatePlaceNote,
    removePlace,
    toggleTopSlot,
    addCustomPlace,
    addFriend,
    addCollection,
    reorderTop,
    setPlanContext,
    openPlace,
    closeDetail,
    setActiveCollectionId,
    finishOnboarding,
    resetApp,
    flushCloudSync
  } = store;

  const [activeFriendId, setActiveFriendId] = useState<string | null>(null);
  const activeFriend = activeFriendId ? friends.find((f) => f.id === activeFriendId) : undefined;

  const queryTerm = query.trim().toLowerCase();
  const filteredVouched = useMemo(
    () =>
      vouched.filter((item) => {
        if (!queryTerm) return true;
        const place = placeById[item.placeId];
        if (!place) return false;
        const content = `${place.name} ${place.area} ${item.why} ${item.tags.join(" ")}`.toLowerCase();
        return content.includes(queryTerm);
      }),
    [queryTerm, vouched, placeById]
  );
  const filteredWant = useMemo(
    () =>
      want.filter((item) => {
        if (!queryTerm) return true;
        const place = placeById[item.placeId];
        if (!place) return false;
        return `${place.name} ${place.area} ${item.tags.join(" ")}`.toLowerCase().includes(queryTerm);
      }),
    [queryTerm, want, placeById]
  );
  const filteredSaved = useMemo(
    () =>
      saved.filter((item) => {
        if (!queryTerm) return true;
        const place = placeById[item.placeId];
        const friend = item.addedFrom ? friends.find((f) => f.id === item.addedFrom) : undefined;
        if (!place) return false;
        return `${place.name} ${place.area} ${friend?.name ?? ""}`.toLowerCase().includes(queryTerm);
      }),
    [queryTerm, saved, placeById, friends]
  );

  const sharePayload = useMemo(
    () => ({
      profile: {
        name: profile.name,
        city: profile.city,
        tasteTags: profile.tasteTags
      },
      userPlaces,
      collections,
      sharedAt: Date.now()
    }),
    [profile, userPlaces, collections]
  );

  const shareTitle = activePlace ? activePlace.name : activeCollection ? activeCollection.title : "Share your Top 4";
  const shareBody = activePlace
    ? buildPlaceShareText(activePlace, activeUserPlace?.why || activePlace.tip, profile)
    : activeCollection
      ? buildCollectionShareText(activeCollection, profile, placeById)
      : buildTopFourShareText(profile, topPlaces, placeById);
  const shareUrl = buildPublicProfileUrl(sharePayload, profile.handle);
  const inviteUrl = buildInviteLink(profile);
  const sharePlaces = activePlace
    ? [activePlace]
    : activeCollection
      ? activeCollection.placeIds.map((id) => placeById[id]).filter(Boolean)
      : topPlaces.map((item) => placeById[item.placeId]).filter(Boolean);

  if (!hydrated && !publicProfile && publicHandle && remoteProfile === undefined) {
    return (
      <div className="app-shell">
        <main className="phone-frame loading-screen">
          <p className="loading-copy">Loading Vouch…</p>
        </main>
      </div>
    );
  }

  if (!hydrated && !publicProfile && !publicHandle) {
    return (
      <div className="app-shell">
        <main className="phone-frame loading-screen">
          <p className="loading-copy">Loading your Vouch…</p>
        </main>
      </div>
    );
  }

  if (publicHandle && remoteProfile === null) {
    return (
      <div className="app-shell">
        <main className="phone-frame">
          <div className="public-profile public-missing">
            <h1>Vouch not found</h1>
            <p>This link may be old, or they haven't finished setting up yet.</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                window.history.replaceState(null, "", window.location.pathname);
                window.location.reload();
              }}
            >
              Make my own Vouch
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (publicProfile) {
    const publicPlaces = placesForPublicPayload(publicProfile);
    const invite = publicHandle ?? undefined;
    return (
      <div className="app-shell">
        <main className="phone-frame">
          <PublicProfileScreen
            payload={publicProfile}
            placeById={publicPlaces}
            inviterHandle={invite}
            onStart={() => {
              window.history.replaceState(null, "", window.location.pathname);
              if (invite) {
                window.location.href = `${window.location.origin}${window.location.pathname}?invite=${invite}`;
              } else {
                window.location.reload();
              }
            }}
          />
        </main>
      </div>
    );
  }

  const inDetail = Boolean(activePlace || activeCollection || activeFriend);

  return (
    <div className="app-shell">
      <main className="phone-frame">
        {cloudSyncing && <div className="sync-bar" role="status">Saving…</div>}
        {!profile.onboarded ? (
          <Onboarding
            step={profile.onboardingStep}
            profile={profile}
            userPlaces={userPlaces}
            placeById={placeById}
            onProfile={(partial) => updateProfile(partial)}
            onToggleTag={(tag) => {
              const has = profile.tasteTags.includes(tag);
              const next = has ? profile.tasteTags.filter((current) => current !== tag) : [...profile.tasteTags, tag];
              updateProfile({ tasteTags: next });
            }}
            onNext={() => updateProfile({ onboardingStep: Math.min(3, profile.onboardingStep + 1) as 0 | 1 | 2 | 3 })}
            onBack={() => updateProfile({ onboardingStep: Math.max(0, profile.onboardingStep - 1) as 0 | 1 | 2 | 3 })}
            onVouch={(placeId) => setPlaceState(placeId, "vouched", { silent: true })}
            onFinish={finishOnboarding}
            onShare={() => {
              flushCloudSync();
              setSheet("share");
            }}
          />
        ) : (
          <>
            {!inDetail && tab !== "home" && <AppHeader tab={tab} onShare={() => setSheet("share")} />}
            <div className="screen">
              {activePlace ? (
                <PlaceDetail
                  place={activePlace}
                  userPlace={activeUserPlace}
                  friend={activeUserPlace?.addedFrom ? friends.find((f) => f.id === activeUserPlace.addedFrom) : undefined}
                  onBack={closeDetail}
                  onWant={() => setPlaceState(activePlace.id, "want")}
                  onVouch={(why, tags) => confirmVouch(activePlace.id, why, tags)}
                  onUpdateNote={(why, tags) => updatePlaceNote(activePlace.id, why, tags)}
                  onRemove={() => removePlace(activePlace.id)}
                  onShare={() => setSheet("share")}
                />
              ) : activeCollection ? (
                <CollectionDetail
                  collection={activeCollection}
                  placeById={placeById}
                  userPlaces={userPlaces}
                  onBack={closeDetail}
                  onShare={() => setSheet("share")}
                  onOpenPlace={openPlace}
                />
              ) : activeFriend ? (
                <FriendDetail
                  friend={activeFriend}
                  recsFromFriend={placesFromFriend(userPlaces, activeFriend.id)}
                  placeById={placeById}
                  onBack={() => setActiveFriendId(null)}
                  onLogRec={() => setSheet("friend-rec")}
                  onOpenPlace={openPlace}
                />
              ) : (
                <>
                  {tab === "home" && (
                    <HomeScreen
                      profile={profile}
                      topPlaces={topPlaces}
                      vouched={vouched}
                      saved={saved}
                      friends={friends}
                      collections={collections}
                      placeById={placeById}
                      onShare={() => setSheet("share")}
                      onOpenTopFour={() => setSheet("top-four")}
                      onOpenPlace={openPlace}
                      onOpenCollection={setActiveCollectionId}
                      onAddFriend={() => setSheet("friend")}
                      onLogFriendRec={() => setSheet("friend-rec")}
                      onCreateCollection={() => setSheet("collection")}
                      onQuickPlan={(contextId) => {
                        setPlanContext(contextId);
                        setTab("places");
                      }}
                    />
                  )}
                  {tab === "places" && (
                    <PlacesScreen
                      query={query}
                      onQueryChange={setQuery}
                      planContext={store.planContext}
                      onPlanContext={setPlanContext}
                      vouched={
                        store.planContext
                          ? contextVouched.filter((item) => {
                              if (!queryTerm) return true;
                              const place = placeById[item.placeId];
                              if (!place) return false;
                              const content = `${place.name} ${place.area} ${item.why} ${item.tags.join(" ")}`.toLowerCase();
                              return content.includes(queryTerm);
                            })
                          : filteredVouched
                      }
                      want={filteredWant}
                      saved={filteredSaved}
                      placeById={placeById}
                      friends={friends}
                      onOpenAddSheet={() => setSheet("add")}
                      onOpenPlace={openPlace}
                    />
                  )}
                  {tab === "friends" && (
                    <FriendsScreen
                      friends={friends}
                      userPlaces={userPlaces}
                      placeById={placeById}
                      onInvite={() => setSheet("friend")}
                      onOpenFriend={setActiveFriendId}
                      onLogRecommendation={() => setSheet("friend-rec")}
                    />
                  )}
                  {tab === "you" && (
                    <ProfileScreen
                      profile={profile}
                      topPlaces={topPlaces}
                      vouched={vouched}
                      savesFromFriends={savesFromFriends}
                      collections={collections}
                      placeById={placeById}
                      onOpenPlace={openPlace}
                      onOpenCollection={setActiveCollectionId}
                      onOpenTopFour={() => setSheet("top-four")}
                      onCreateCollection={() => setSheet("collection")}
                      onShare={() => setSheet("share")}
                      onUpdateProfile={updateProfile}
                      onReset={resetApp}
                    />
                  )}
                </>
              )}
            </div>

            {!inDetail && <BottomNav tab={tab} onChange={setTab} onVouch={() => setSheet("add")} />}
          </>
        )}

        {sheet === "add" && (
          <AddPlaceSheet
            query={query}
            onQuery={setQuery}
            searchedPlaces={searchedPlaces}
            userPlaces={userPlaces}
            profile={profile}
            onClose={() => setSheet(null)}
            onOpenPlace={openPlace}
            onWant={(placeId) => {
              setPlaceState(placeId, "want");
              setSheet(null);
            }}
            onVouch={(placeId, why, tags) => confirmVouch(placeId, why, tags)}
            onAddCustomPlace={addCustomPlace}
          />
        )}
        {sheet === "share" && (
          <ShareSheet
            title={shareTitle}
            body={shareBody}
            url={shareUrl}
            places={sharePlaces}
            onClose={() => setSheet(null)}
            onCopy={async (text) => {
              const copied = await copyToClipboard(text);
              showToast(copied ? "Copied to clipboard" : "Copy failed");
              setSheet(null);
            }}
          />
        )}
        {sheet === "collection" && (
          <CollectionSheet
            vouched={vouched}
            placeById={placeById}
            onClose={() => setSheet(null)}
            onCreate={(collection) => addCollection(collection)}
          />
        )}
        {sheet === "friend" && (
          <AddFriendSheet
            inviteUrl={inviteUrl}
            hasHandle={Boolean(profile.handle)}
            onClose={() => setSheet(null)}
            onWhatsApp={() => {
              openWhatsApp(`${inviteMessage(profile)}\n\n${inviteUrl}`);
            }}
            onCopyLink={async () => {
              const copied = await copyToClipboard(inviteUrl);
              showToast(copied ? "Invite link copied" : "Copy failed");
            }}
            onNativeShare={async () => {
              const result = await nativeShare({
                title: "Join me on Vouch",
                text: inviteMessage(profile),
                url: inviteUrl
              });
              showToast(result === "shared" ? "Sent!" : result === "copied" ? "Copied to clipboard" : "Share failed");
            }}
            onAdd={(name) => {
              addFriend(name, profile.tasteTags.slice(0, 3));
            }}
          />
        )}
        {sheet === "friend-rec" && (
          <FriendRecSheet
            friends={friends}
            places={searchedPlaces}
            onClose={() => setSheet(null)}
            onSave={(placeId, friendId, why) => saveFromFriend(placeId, friendId, why)}
          />
        )}
        {sheet === "top-four" && (
          <TopFourSheet
            topPlaces={topPlaces}
            allVouched={vouched}
            placeById={placeById}
            onClose={() => setSheet(null)}
            onMove={(placeId, direction) => reorderTop(placeId, direction)}
            onToggleSlot={toggleTopSlot}
          />
        )}

        {stampPlaceId && placeById[stampPlaceId] && (
          <StampOverlay place={placeById[stampPlaceId]} onDone={() => setStampPlaceId(null)} />
        )}
        <Toast toast={toast} />
      </main>
    </div>
  );
}

export default App;
