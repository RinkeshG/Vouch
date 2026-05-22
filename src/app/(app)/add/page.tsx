"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopBar, TopBarIconButton } from "@/components/app/top-bar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Tag } from "@/components/ui/tag";
import { Stamp } from "@/components/ui/stamp";
import { createClient } from "@/lib/supabase/client";
import { CONTEXT_TAGS } from "@/types";
import styles from "./add.module.css";

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry?: { location: { lat: number; lng: number } };
}

interface ExistingPlace {
  id: string;
  name: string;
}

export default function AddVouchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // If coming from a place page, pre-select that place
  const preselectedPlaceId = searchParams.get("placeId");
  const preselectedPlaceName = searchParams.get("placeName");

  const [step, setStep] = useState<"search" | "take" | "success">(
    preselectedPlaceId ? "take" : "search"
  );

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Selected place
  const [selectedPlace, setSelectedPlace] = useState<{
    placeId: string;
    googlePlaceId?: string;
    name: string;
    address: string;
    lat?: number;
    lng?: number;
    isExisting: boolean;
  } | null>(
    preselectedPlaceId
      ? {
          placeId: preselectedPlaceId,
          name: preselectedPlaceName || "Selected place",
          address: "",
          isExisting: true,
        }
      : null
  );

  // Take state
  const [take, setTake] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const searchPlaces = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `/api/places/search?q=${encodeURIComponent(q)}&city=bangalore`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch {
      // Fail silently
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.length < 2) {
      setResults([]);
      return;
    }
    searchTimeout.current = setTimeout(() => searchPlaces(query), 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query, searchPlaces]);

  function selectPlace(place: PlaceResult) {
    setSelectedPlace({
      googlePlaceId: place.place_id,
      placeId: "",
      name: place.name,
      address: place.formatted_address,
      lat: place.geometry?.location.lat,
      lng: place.geometry?.location.lng,
      isExisting: false,
    });
    setStep("take");
    setQuery("");
    setResults([]);
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 3
          ? [...prev, tag]
          : prev
    );
  }

  async function submitVouch() {
    if (!selectedPlace || take.length < 20) return;
    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      let placeId = selectedPlace.placeId;

      // If this is a new place from Google, upsert it
      if (!selectedPlace.isExisting && selectedPlace.googlePlaceId) {
        const { data: existingPlace } = await supabase
          .from("places")
          .select("id")
          .eq("google_place_id", selectedPlace.googlePlaceId)
          .maybeSingle();

        if (existingPlace) {
          placeId = existingPlace.id;
        } else {
          const area =
            selectedPlace.address.split(",")[0] || "Bangalore";
          const { data: newPlace } = await supabase
            .from("places")
            .insert({
              google_place_id: selectedPlace.googlePlaceId,
              name: selectedPlace.name,
              area,
              city: "bangalore",
              latitude: selectedPlace.lat,
              longitude: selectedPlace.lng,
            })
            .select("id")
            .single();

          if (!newPlace) {
            setSaving(false);
            return;
          }
          placeId = newPlace.id;
        }
      }

      // Check if user already vouched for this place
      const { data: existingVouch } = await supabase
        .from("vouches")
        .select("id")
        .eq("user_id", user.id)
        .eq("place_id", placeId)
        .maybeSingle();

      if (existingVouch) {
        // Update existing vouch
        await supabase
          .from("vouches")
          .update({
            take,
            context_tags: selectedTags,
          })
          .eq("id", existingVouch.id);
      } else {
        // Insert new vouch
        await supabase.from("vouches").insert({
          user_id: user.id,
          place_id: placeId,
          take,
          context_tags: selectedTags,
        });
      }

      setStep("success");
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <TopBar
        title="Add vouch"
        left={
          <TopBarIconButton label="Close" onClick={() => router.back()}>
            <Icon name="x" size={20} />
          </TopBarIconButton>
        }
      />

      {/* Search step */}
      {step === "search" && (
        <div className={styles.content}>
          <p className={styles.stepLabel}>Step 1 — Find a place</p>

          <div className={styles.searchWrap}>
            <Input
              placeholder="Search for a restaurant, cafe, bar..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              adornStart={<Icon name="search" size={18} />}
              adornEnd={
                searching ? <span className={styles.spinner} /> : null
              }
              autoFocus
            />
          </div>

          {results.length > 0 && (
            <div className={styles.results}>
              {results.map((place) => (
                <button
                  key={place.place_id}
                  className={styles.result}
                  onClick={() => selectPlace(place)}
                >
                  <Icon
                    name="map-pin"
                    size={16}
                    className={styles.resultIcon}
                  />
                  <div className={styles.resultInfo}>
                    <p className={styles.resultName}>{place.name}</p>
                    <p className={styles.resultAddr}>
                      {place.formatted_address}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query.length >= 2 && !searching && results.length === 0 && (
            <p className={styles.noResults}>
              No places found. Try a different search.
            </p>
          )}
        </div>
      )}

      {/* Take step */}
      {step === "take" && selectedPlace && (
        <div className={styles.content}>
          <p className={styles.stepLabel}>Step 2 — Your take</p>

          {/* Selected place */}
          <div className={styles.selectedPlace}>
            <Icon
              name="map-pin"
              size={16}
              className={styles.selectedPlaceIcon}
            />
            <span className={styles.selectedPlaceName}>
              {selectedPlace.name}
            </span>
            {!preselectedPlaceId && (
              <button
                className={styles.changeBtn}
                onClick={() => {
                  setSelectedPlace(null);
                  setStep("search");
                  setTake("");
                  setSelectedTags([]);
                }}
              >
                Change
              </button>
            )}
          </div>

          {/* Take textarea */}
          <label className={styles.takeLabel}>
            Write your take — the way you&apos;d tell a friend
          </label>
          <textarea
            className={styles.textarea}
            placeholder="This place has the best..."
            value={take}
            onChange={(e) => setTake(e.target.value)}
            maxLength={120}
            autoFocus
          />
          <div className={styles.charCount}>
            <span>
              {take.length}/120
              {take.length > 0 && take.length < 20 && (
                <span className={styles.charWarn}>
                  {" "}
                  — {20 - take.length} more chars needed
                </span>
              )}
            </span>
          </div>

          {/* Tags */}
          <div className={styles.tagsSection}>
            <p className={styles.tagsLabel}>Context (up to 3)</p>
            <div className={styles.tagGrid}>
              {CONTEXT_TAGS.map((tag) => (
                <Tag
                  key={tag}
                  variant={selectedTags.includes(tag) ? "active" : "default"}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <Button
              variant="ghost"
              onClick={() => {
                if (preselectedPlaceId) {
                  router.back();
                } else {
                  setSelectedPlace(null);
                  setStep("search");
                  setTake("");
                  setSelectedTags([]);
                }
              }}
            >
              Back
            </Button>
            <Button
              variant="seal"
              disabled={take.length < 20}
              loading={saving}
              onClick={submitVouch}
            >
              Seal your vouch
            </Button>
          </div>
        </div>
      )}

      {/* Success */}
      {step === "success" && (
        <div className={styles.success}>
          <Stamp size={48} animated />
          <h2 className={styles.successTitle}>Vouched!</h2>
          <p className={styles.successSub}>
            Your vouch for {selectedPlace?.name} is now live.
          </p>
          <div className={styles.actions}>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedPlace(null);
                setTake("");
                setSelectedTags([]);
                setStep("search");
              }}
            >
              Vouch for another
            </Button>
            <Button variant="primary" onClick={() => router.push("/home")}>
              Back to feed
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
