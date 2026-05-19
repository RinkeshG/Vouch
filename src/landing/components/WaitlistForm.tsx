import { useEffect, useState } from "react";

const STORAGE_KEY = "vouch_waitlist_signups";
const BASE_COUNT = 418;

type Signup = { email: string; city: string; at: number };

function readSignups(): Signup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Signup[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSignup(entry: Signup) {
  const all = readSignups();
  if (all.some((s) => s.email.toLowerCase() === entry.email.toLowerCase())) return all;
  const next = [...all, entry];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function getWaitlistCount(): number {
  return BASE_COUNT + readSignups().length;
}

const CITIES = ["Bangalore", "Mumbai", "Delhi NCR", "Hyderabad", "Chennai", "Pune", "Goa", "Other"];

type Props = {
  id?: string;
  onSuccess?: () => void;
};

export function WaitlistForm({ id = "waitlist-form", onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Bangalore");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "duplicate">("idle");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qCity = params.get("city");
    if (qCity && CITIES.includes(qCity)) setCity(qCity);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;

    setStatus("submitting");
    const existing = readSignups();
    if (existing.some((s) => s.email === trimmed)) {
      setStatus("duplicate");
      return;
    }

    writeSignup({ email: trimmed, city, at: Date.now() });
    setStatus("done");
    setEmail("");
    onSuccess?.();
  };

  return (
    <form id={id} className="signed-waitlist-form" onSubmit={submit}>
      <div className="signed-waitlist-form__row">
        <label className="signed-waitlist-form__field signed-waitlist-form__field--grow">
          <span className="signed-waitlist-form__label">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "duplicate") setStatus("idle");
            }}
            required
            disabled={status === "done"}
          />
        </label>
        <label className="signed-waitlist-form__field">
          <span className="signed-waitlist-form__label">City</span>
          <select name="city" value={city} onChange={(e) => setCity(e.target.value)} disabled={status === "done"}>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        className="signed-btn signed-btn--primary signed-waitlist-form__submit"
        disabled={status === "submitting" || status === "done"}
      >
        {status === "submitting" ? "Saving..." : status === "done" ? "You're in" : "Join and make my card"}
      </button>

      {status === "done" && (
        <p className="signed-waitlist-form__note signed-waitlist-form__note--success" role="status">
          You are on the list. We will reach out when your city circle opens.
        </p>
      )}
      {status === "duplicate" && (
        <p className="signed-waitlist-form__note" role="status">
          You are already on the list. Your spot is safe.
        </p>
      )}
    </form>
  );
}
