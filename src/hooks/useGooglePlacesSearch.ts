import { useEffect, useState } from "react";
import { autocompletePlaces, isGooglePlacesEnabled, type GooglePlaceSuggestion } from "../lib/googlePlaces";
import { useDebouncedValue } from "./useDebouncedValue";

export function useGooglePlacesSearch(query: string, city: string, enabled: boolean) {
  const debounced = useDebouncedValue(query, 350);
  const [results, setResults] = useState<GooglePlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || debounced.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void autocompletePlaces(debounced, city).then((items) => {
      if (!cancelled) {
        setResults(items);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [debounced, city, enabled]);

  return {
    results,
    loading,
    enabled: enabled && (isGooglePlacesEnabled() || typeof window !== "undefined")
  };
}
