import { useEffect, useState } from "react";
import {
  autocompletePlaces,
  type GooglePlaceSuggestion,
  type PlacesSearchStatus
} from "../lib/googlePlaces";
import { useDebouncedValue } from "./useDebouncedValue";

export function useGooglePlacesSearch(query: string, city: string, enabled: boolean) {
  const debounced = useDebouncedValue(query, 350);
  const [results, setResults] = useState<GooglePlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<PlacesSearchStatus>("idle");
  const [message, setMessage] = useState<string | undefined>();

  useEffect(() => {
    if (!enabled || debounced.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setStatus("idle");
      setMessage(undefined);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void autocompletePlaces(debounced, city).then((outcome) => {
      if (!cancelled) {
        setResults(outcome.items);
        setStatus(outcome.status);
        setMessage(outcome.message);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [debounced, city, enabled]);

  return { results, loading, status, message };
}
