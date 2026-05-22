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
  types?: string[];
}

interface VouchDraft {
  place: PlaceResult;
  take: string;
  contextTags: string[];
}

type Phase = "vouching" | "tasteline";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [vouches, setVouches] = useState<VouchDraft[]>([]);
  const [currentStep, setCurrentStep] = useState<"search" | "take">("search");
  const [phase, setPhase] = useState<Phase>("vouching");

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

  // Take state
  const [take, setTake] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Tasteline state
  const [tasteLine, setTasteLine] = useState("");

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

  function moveToTasteLine() {
    if (vouches.length < 4) return;
    setPhase("tasteline");
  }

  async function finishOnboarding() {
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
          const addressParts = vouch.place.formatted_address.split(",");
          const area = addressParts[0]?.trim() || "Bangalore";

          // Extract cuisine hint from Google types
          const types = vouch.place.types || [];
          const cuisineTypes = types.filter(
            (t) => !["restaurant", "food", "point_of_interest", "establishment"].includes(t)
          );
          const cuisines = cuisineTypes.length > 0
            ? cuisineTypes.slice(0, 3).map((t) => t.replace(/_/g, " "))
            : [];

          const { data: newPlace } = await supabase
            .from("places")
            .insert({
              google_place_id: vouch.place.place_id,
              name: vouch.place.name,
              area,
              city: "bangalore",
              cuisines,
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

      // Update profile — onboarding complete + tasteline
      const profileUpdate: Record<string, unknown> = {
        onboarding_step: 4,
        is_public: true,
      };
      if (tasteLine.trim()) {
        profileUpdate.taste_line = tasteLine.trim();
      }

      await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user.id);

      router.push("/welcome");
    } catch {
      setSaving(false);
    }
  }

  const filled = vouches.length;
  const remaining = 4 - filled;

  // Tasteline phase
  if (phase === "tasteline") {
    return (
      <div className={styles.page}>
        <div className={styles.progress}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={styles.progressStep}>
              <span className={styles.dotFilled} />
              <span className={styles.progressStepLabel}>
                {vouches[i]?.place.name}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.tastelineSection}>
          <div className={styles.tastelineIcon}>
            <Stamp size={48} />
          </div>
          <h1 className={styles.title}>Almost there</h1>
          <p className={styles.sub}>
            One last thing — describe your food philosophy in a single sentence.
            This shows up on your profile as your tasteline.
          </p>

          <div className={styles.tastelineInput}>
            <textarea
              className={styles.tastelineTextarea}
              placeholder={`"I eat like a local tourist — street food first, fine dining if I have to."`}
              value={tasteLine}
              onChange={(e) => setTasteLine(e.target.value)}
              maxLength={120}
              rows={3}
              autoFocus
            />
            <span className={styles.charCount}>
              {tasteLine.length}/120
            </span>
          </div>

          <div className={styles.tastelineActions}>
            <Button
              variant="ghost"
              onClick={() => setPhase("vouching")}
            >
              Back
            </Button>
            <div className={styles.tastelineRight}>
              <button
                className={styles.skipBtn}
                onClick={finishOnboarding}
                disabled={saving}
              >
                Skip for now
              </button>
              <Button
                variant="seal"
                size="lg"
                loading={saving}
                onClick={finishOnboarding}
                disabled={!tasteLine.trim()}
              >
                Go live
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Progress: labeled steps */}
      <div className={styles.progress}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={styles.progressStep}>
            <span className={i < filled ? styles.dotFilled : styles.dot} />
            <span className={styles.progressStepLabel}>
              {i < filled
                ? vouches[i].place.name
                : i === filled
                  ? "Next place"
                  : ""}
            </span>
          </div>
        ))}
      </div>

      <h1 className={styles.title}>
        {filled === 0
          ? "Vouch for your four"
          : filled < 4
            ? `${remaining} more to go`
            : "Your four are set"}
      </h1>
      <p className={styles.sub}>
        {filled === 0
          ? "Pick four places you'd stake your reputation on. These become your canon — the spots that define your taste."
          : filled < 4
            ? `You've vouched for ${filled}. Keep going — ${remaining} more place${remaining === 1 ? "" : "s"} to complete your four.`
            : "Looking good. Review your picks, then we'll add your tasteline."}
      </p>

      {/* Picked vouches — rich cards */}
      {vouches.length > 0 && (
        <div className={styles.picked}>
          {vouches.map((v, i) => (
            <div key={v.place.place_id} className={styles.pickedCard}>
              <div className={styles.pickedIndex}>
                <span className={styles.pickedIndexNumber}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className={styles.pickedContent}>
                <p className={styles.pickedName}>{v.place.name}</p>
                <p className={styles.pickedTake}>&ldquo;{v.take}&rdquo;</p>
                {v.contextTags.length > 0 && (
                  <div className={styles.pickedTags}>
                    {v.contextTags.map((tag) => (
                      <span key={tag} className={styles.pickedTag}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <button
                className={styles.removeBtn}
                onClick={() => removeVouch(i)}
                aria-label={`Remove ${v.place.name}`}
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search step */}
      {currentStep === "search" && vouches.length < 4 && (
        <div className={styles.search}>
          <div className={styles.searchLabel}>
            Place {filled + 1} of 4
          </div>
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
          <div className={styles.takeHeader}>
            <div className={styles.takeNumber}>
              Vouch {filled + 1} of 4
            </div>
            <div className={styles.takePlace}>
              <Icon name="map-pin" size={16} />
              <span className={styles.takePlaceName}>{selectedPlace.name}</span>
            </div>
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
                <span className={styles.charWarn}> — {20 - take.length} more chars</span>
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
              variant="seal"
              disabled={take.length < 20}
              onClick={addVouch}
            >
              <Icon name="check" size={14} />
              Seal vouch {filled + 1}
            </Button>
          </div>
        </div>
      )}

      {/* Ready to continue — show "Next: Tasteline" */}
      {vouches.length >= 4 && currentStep === "search" && (
        <div className={styles.finish}>
          <Button
            variant="seal"
            size="lg"
            fullWidth
            onClick={moveToTasteLine}
          >
            Continue — add your tasteline
          </Button>
        </div>
      )}
    </div>
  );
}
