"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import { Stamp } from "@/components/ui/stamp";
import { CONTEXT_TAGS } from "@/types";
import styles from "./onboarding.module.css";

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry?: { location: { lat: number; lng: number } };
}

interface VouchDraft {
  place: PlaceResult;
  take: string;
  contextTags: string[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [vouches, setVouches] = useState<VouchDraft[]>([]);
  const [currentStep, setCurrentStep] = useState<"search" | "take">("search");

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

  // Take state
  const [take, setTake] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Saving state
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
      // Fail silently — user can retry
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
    const alreadyVouched = vouches.some(
      (v) => v.place.place_id === place.place_id
    );
    if (alreadyVouched) return;

    setSelectedPlace(place);
    setCurrentStep("take");
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

  function addVouch() {
    if (!selectedPlace || take.length < 20) return;

    setVouches((prev) => [
      ...prev,
      { place: selectedPlace, take, contextTags: selectedTags },
    ]);

    setSelectedPlace(null);
    setTake("");
    setSelectedTags([]);
    setCurrentStep("search");
  }

  function removeVouch(index: number) {
    setVouches((prev) => prev.filter((_, i) => i !== index));
  }

  async function finishOnboarding() {
    if (vouches.length < 4) return;
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      for (const vouch of vouches) {
        let placeId: string;

        // Upsert place
        const { data: existingPlace } = await supabase
          .from("places")
          .select("id")
          .eq("google_place_id", vouch.place.place_id)
          .maybeSingle();

        if (existingPlace) {
          placeId = existingPlace.id;
        } else {
          const area = vouch.place.formatted_address.split(",")[0] || "Bangalore";
          const { data: newPlace } = await supabase
            .from("places")
            .insert({
              google_place_id: vouch.place.place_id,
              name: vouch.place.name,
              area,
              city: "bangalore",
              latitude: vouch.place.geometry?.location.lat,
              longitude: vouch.place.geometry?.location.lng,
            })
            .select("id")
            .single();

          if (!newPlace) continue;
          placeId = newPlace.id;
        }

        // Insert vouch
        await supabase.from("vouches").insert({
          user_id: user.id,
          place_id: placeId,
          take: vouch.take,
          context_tags: vouch.contextTags,
        });
      }

      // Update onboarding step
      await supabase
        .from("profiles")
        .update({ onboarding_step: 4, is_public: true })
        .eq("id", user.id);

      router.push("/welcome");
    } catch {
      setSaving(false);
    }
  }

  const remaining = 4 - vouches.length;

  return (
    <div className={styles.page}>
      <div className={styles.progress}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={
              i < vouches.length ? styles.dotFilled : styles.dot
            }
          />
        ))}
      </div>

      <h1 className={styles.title}>
        Vouch for your four
      </h1>
      <p className={styles.sub}>
        {remaining > 0
          ? `${remaining} more place${remaining === 1 ? "" : "s"} to go. These are the spots you'd stake your reputation on.`
          : "You've got your four! Review and finish."}
      </p>

      {/* Picked vouches */}
      {vouches.length > 0 && (
        <div className={styles.picked}>
          {vouches.map((v, i) => (
            <div key={v.place.place_id} className={styles.pickedCard}>
              <div className={styles.pickedInfo}>
                <Stamp size={20} />
                <div>
                  <p className={styles.pickedName}>{v.place.name}</p>
                  <p className={styles.pickedTake}>&ldquo;{v.take}&rdquo;</p>
                </div>
              </div>
              <button
                className={styles.removeBtn}
                onClick={() => removeVouch(i)}
                aria-label={`Remove ${v.place.name}`}
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search step */}
      {currentStep === "search" && vouches.length < 4 && (
        <div className={styles.search}>
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

          {results.length > 0 && (
            <div className={styles.results}>
              {results.map((place) => {
                const alreadyPicked = vouches.some(
                  (v) => v.place.place_id === place.place_id
                );
                return (
                  <button
                    key={place.place_id}
                    className={styles.result}
                    onClick={() => selectPlace(place)}
                    disabled={alreadyPicked}
                  >
                    <Icon name="map-pin" size={16} className={styles.resultIcon} />
                    <div>
                      <p className={styles.resultName}>{place.name}</p>
                      <p className={styles.resultAddr}>
                        {place.formatted_address}
                      </p>
                    </div>
                    {alreadyPicked && (
                      <span className={styles.pickedBadge}>Added</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {query.length >= 2 && !searching && results.length === 0 && (
            <p className={styles.noResults}>
              No places found for &ldquo;{query}&rdquo;. Try a different search.
            </p>
          )}
        </div>
      )}

      {/* Take step */}
      {currentStep === "take" && selectedPlace && (
        <div className={styles.takeStep}>
          <div className={styles.takePlace}>
            <Icon name="map-pin" size={16} />
            <span>{selectedPlace.name}</span>
          </div>

          <div className={styles.takeInput}>
            <label className={styles.takeLabel}>Your take</label>
            <textarea
              className={styles.textarea}
              placeholder="Write your take — the way you'd tell a friend..."
              value={take}
              onChange={(e) => setTake(e.target.value)}
              maxLength={120}
              rows={3}
              autoFocus
            />
            <span className={styles.charCount}>
              {take.length}/120
              {take.length > 0 && take.length < 20 && (
                <span className={styles.charWarn}> — {20 - take.length} more chars needed</span>
              )}
            </span>
          </div>

          <div className={styles.tags}>
            <p className={styles.tagLabel}>Context (up to 3)</p>
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

          <div className={styles.takeActions}>
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedPlace(null);
                setTake("");
                setSelectedTags([]);
                setCurrentStep("search");
              }}
            >
              Back
            </Button>
            <Button
              disabled={take.length < 20}
              onClick={addVouch}
            >
              Add vouch
            </Button>
          </div>
        </div>
      )}

      {/* Finish */}
      {vouches.length >= 4 && (
        <div className={styles.finish}>
          <Button
            variant="seal"
            size="lg"
            fullWidth
            loading={saving}
            onClick={finishOnboarding}
          >
            Go live — make my profile public
          </Button>
        </div>
      )}
    </div>
  );
}
