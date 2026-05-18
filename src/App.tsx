import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { CircleFeedItem, FriendVouchCard } from "./types";
import { friendsVouchingFor } from "./lib/circle";
import { MIN_VOUCHED_PLACES_PER_LIST } from "./lib/collectionRules";
import { fetchFriendVouchCard, fetchPublicVouchByHandle, isCloudEnabled, placesForPublicPayload } from "./lib/cloud";
import { recordPlaceSave } from "./lib/influence";
import { buildInviteUrl, parseInviteFromUrl } from "./lib/invite";
import { slugifyListTitle } from "./lib/listSlug";
import { placesFromFriend } from "./lib/selectors";
import {
  buildCollectionShareBlurb,
  buildInviteLink,
  inviteOrigin,
  buildPlaceShareBlurb,
  buildShareableCardUrl,
  buildTopFourShareBlurb,
  canonicalSiteOrigin,
  copyToClipboard,
  readPublicProfileFromUrl,
  readPublicShareRoute,
  type PublicSharePayload
} from "./lib/share";

function App() {
  const hashProfile = useMemo(() => readPublicProfileFromUrl(), []);
  const publicRoute = useMemo(() => readPublicShareRoute(), []);
  const publicHandle = publicRoute?.handle ?? null;
  const publicListSlug = publicRoute?.listSlug ?? null;
  const [remoteProfile, setRemoteProfile] = useState<Awaited<ReturnType<typeof fetchPublicVouchByHandle>> | undefined>(
    publicHandle ? undefined : null
  );

  const store = useVouchStore();

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

  const publicFeaturedCollectionId = useMemo(() => {
    if (!publicProfile?.collections?.length || !publicListSlug) return null;
    const want = publicListSlug.toLowerCase();
    const bySlug = publicProfile.collections.find((c) => c.slug?.toLowerCase() === want);
    if (bySlug) return bySlug.id;
    return (
      publicProfile.collections.find((c) => slugifyListTitle(c.title).toLowerCase() === want)?.id ?? null
    );
  }, [publicProfile, publicListSlug]);
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
    flushCloudSync,
    ensureInviteHandle,
    circleFeed,
    circleLoading,
    friendVouchCards,
    influenceEvents,
    refreshCircle,
    getFriendCard,
    cloudEnabled,
    authEmail,
    authAnonymous,
    authBusy,
    linkEmail,
    signInEmail,
    addDiscoveredPlace,
    addLinkedFriend
  } = store;

  const tryOpenCollectionSheet = useCallback(() => {
    if (vouched.length < MIN_VOUCHED_PLACES_PER_LIST) {
      showToast(`Vouch ${MIN_VOUCHED_PLACES_PER_LIST} places first — lists only bundle spots you stamped.`);
      return;
    }
    setSheet("collection");
  }, [vouched.length, showToast, setSheet]);

  const [activeFriendId, setActiveFriendId] = useState<string | null>(null);
  const [activeFriendCard, setActiveFriendCard] = useState<FriendVouchCard | null>(null);
  const [activeFriendCardLoading, setActiveFriendCardLoading] = useState(false);
  const activeFriend = activeFriendId ? friends.find((f) => f.id === activeFriendId) : undefined;

  const savedPlaceIds = useMemo(() => new Set(saved.map((s) => s.placeId)), [saved]);

  useEffect(() => {
    if (!profile.onboarded) return;
    if (tab === "home") void refreshCircle();
  }, [tab, profile.onboarded, refreshCircle]);

  useEffect(() => {
    if (!profile.onboarded) return;
    const onFocus = () => void refreshCircle();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [profile.onboarded, refreshCircle]);

  useEffect(() => {
    if (!activeFriend?.profileHandle) {
      setActiveFriendCard(null);
      setActiveFriendCardLoading(false);
      return;
    }
    const handle = activeFriend.profileHandle.toLowerCase();
    const cached = friendVouchCards[handle];
    if (cached) {
      setActiveFriendCard(cached);
      setActiveFriendCardLoading(false);
      return;
    }
    setActiveFriendCardLoading(true);
    let cancelled = false;
    void getFriendCard(activeFriend.profileHandle).then((card) => {
      if (!cancelled) {
        setActiveFriendCard(card);
        setActiveFriendCardLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeFriend?.id, activeFriend?.profileHandle, friendVouchCards, getFriendCard]);

  const handleSaveFromCircle = (item: CircleFeedItem) => {
    saveFromFriend(item.placeId, item.friendId, item.why);

    const myHandle = profile.handle;
    const friend = friends.find((f) => f.id === item.friendId);
    const sourceHandle = friend?.profileHandle ?? item.friendHandle;
    if (cloudEnabled && myHandle && sourceHandle) {
      void recordPlaceSave({
        sourceHandle,
        actorHandle: myHandle,
        actorName: profile.name,
        placeId: item.placeId,
        placeName: item.placeName,
        placeImage: item.image
      });
    }
  };

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

  const shareBlurb = activePlace
    ? buildPlaceShareBlurb(activePlace, profile)
    : activeCollection
      ? buildCollectionShareBlurb(activeCollection, profile)
      : buildTopFourShareBlurb(profile, topPlaces, placeById);
  const shareUrl = useMemo(
    () =>
      buildShareableCardUrl(sharePayload as PublicSharePayload, profile.handle, {
        collection: activeCollection?.slug ? activeCollection : undefined
      }),
    [sharePayload, profile.handle, activeCollection]
  );

  useEffect(() => {
    if (sheet === "share" && cloudEnabled && !profile.handle) {
      flushCloudSync();
    }
  }, [sheet, cloudEnabled, profile.handle, flushCloudSync]);

  const [inviteUrl, setInviteUrl] = useState(() => buildInviteLink(profile));

  useEffect(() => {
    const built = buildInviteLink(profile);
    if (built) {
      setInviteUrl(built);
      return;
    }
    if (sheet !== "friend") return;

    let cancelled = false;
    void (async () => {
      const handle = await ensureInviteHandle();
      if (cancelled || !handle) return;
      setInviteUrl(buildInviteUrl(inviteOrigin(), handle));
    })();

    return () => {
      cancelled = true;
    };
  }, [sheet, profile.handle, profile.name, ensureInviteHandle]);
  const sharePlaces = activePlace
    ? [activePlace]
    : activeCollection
      ? activeCollection.placeIds.map((id) => placeById[id]).filter(Boolean)
      : topPlaces.map((item) => placeById[item.placeId]).filter(Boolean);

  /** Clean URL bar after server redirect (?u=&list=) */
  useEffect(() => {
    if (!hydrated || !publicProfile || !publicHandle) return;
    const tail = publicListSlug ? `/${publicListSlug}` : "";
    window.history.replaceState(window.history.state, "", `/${publicHandle}${tail}`);
  }, [hydrated, publicProfile, publicHandle, publicListSlug]);

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
            featuredCollectionId={publicFeaturedCollectionId}
            onStart={() => {
              window.history.replaceState(window.history.state, "", "/");
              if (invite) {
                window.location.href = `${canonicalSiteOrigin()}/?invite=${encodeURIComponent(invite)}`;
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
            cloudEnabled={cloudEnabled}
            authEmail={authEmail}
            authBusy={authBusy}
            onLinkEmail={linkEmail}
            onSignInEmail={signInEmail}
          />
        ) : (
          <>
            {!inDetail && tab !== "home" && tab !== "you" && <AppHeader tab={tab} onShare={() => setSheet("share")} />}
            <div className="screen">
              {activePlace ? (
                <PlaceDetail
                  place={activePlace}
                  userPlace={activeUserPlace}
                  friend={activeUserPlace?.addedFrom ? friends.find((f) => f.id === activeUserPlace.addedFrom) : undefined}
                  circleVouchers={friendsVouchingFor(activePlace.id, friends, friendVouchCards)}
                  onBack={closeDetail}
                  onWant={() => setPlaceState(activePlace.id, "want")}
                  onVouch={(why, tags) => confirmVouch(activePlace.id, why, tags)}
                  onUpdateNote={(why, tags) => updatePlaceNote(activePlace.id, why, tags)}
                  onRemove={() => removePlace(activePlace.id)}
                  onShare={() => setSheet("share")}
                  onOpenFriend={setActiveFriendId}
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
                  liveCard={activeFriendCard}
                  liveCardLoading={activeFriendCardLoading}
                  savedPlaceIds={savedPlaceIds}
                  onBack={() => setActiveFriendId(null)}
                  onLogRec={() => setSheet("friend-rec")}
                  onOpenPlace={openPlace}
                  onSaveFromLive={(placeId, why) =>
                    saveFromFriend(placeId, activeFriend.id, why)
                  }
                />
              ) : (
                <>
                  {tab === "home" && (
                    <HomeScreen
                      profile={profile}
                      topPlaces={topPlaces}
                      vouched={vouched}
                      want={want}
                      saved={saved}
                      friends={friends}
                      collections={collections}
                      placeById={placeById}
                      circleFeed={circleFeed}
                      circleLoading={circleLoading}
                      influenceEvents={influenceEvents}
                      cloudEnabled={cloudEnabled}
                      onShare={() => setSheet("share")}
                      onOpenTopFour={() => setSheet("top-four")}
                      onOpenPlace={openPlace}
                      onOpenCollection={setActiveCollectionId}
                      onOpenAddPlace={() => setSheet("add")}
                      onAddFriend={() => setSheet("friend")}
                      onLogFriendRec={() => setSheet("friend-rec")}
                      onCreateCollection={tryOpenCollectionSheet}
                      onQuickPlan={(contextId) => {
                        setPlanContext(contextId);
                        setTab("places");
                      }}
                      onRefreshCircle={() => void refreshCircle()}
                      onSaveFromCircle={handleSaveFromCircle}
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
                      circleFeed={circleFeed}
                      onOpenAddSheet={() => setSheet("add")}
                      onOpenPlace={openPlace}
                      onSaveFromCircle={handleSaveFromCircle}
                    />
                  )}
                  {tab === "friends" && (
                    <FriendsScreen
                      friends={friends}
                      userPlaces={userPlaces}
                      friendVouchCards={friendVouchCards}
                      cloudEnabled={cloudEnabled}
                      onInvite={() => setSheet("friend")}
                      onOpenFriend={setActiveFriendId}
                      onLogRecommendation={() => setSheet("friend-rec")}
                      onLookupHandle={fetchFriendVouchCard}
                      onAddLinkedFriend={(card) => {
                        addLinkedFriend(card);
                      }}
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
                      onCreateCollection={tryOpenCollectionSheet}
                      onShare={() => setSheet("share")}
                      onUpdateProfile={updateProfile}
                      onReset={resetApp}
                      cloudEnabled={cloudEnabled}
                      authEmail={authEmail}
                      authAnonymous={authAnonymous}
                      authBusy={authBusy}
                      onLinkEmail={linkEmail}
                      onSignInEmail={signInEmail}
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
            onAddCustomPlace={addCustomPlace}
            onAddGooglePlace={addDiscoveredPlace}
          />
        )}
        {sheet === "share" && (
          <ShareSheet
            profile={profile}
            blurb={shareBlurb}
            url={shareUrl}
            places={sharePlaces}
            cloudEnabled={cloudEnabled}
            cloudSyncing={cloudSyncing}
            onClose={() => setSheet(null)}
            onSyncLink={flushCloudSync}
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
            profile={profile}
            inviteUrl={inviteUrl}
            previewPlaces={topPlaces.map((item) => placeById[item.placeId]).filter(Boolean)}
            hasHandle={Boolean(profile.handle) || inviteUrl.length > 0}
            cloudSyncing={cloudSyncing}
            onClose={() => setSheet(null)}
            onToast={showToast}
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
