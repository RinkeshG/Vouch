import { useState } from "react";
import { Check, Mail } from "lucide-react";

export function AccountSection({
  cloudEnabled,
  email,
  isAnonymous,
  busy,
  onLinkEmail,
  onSignInEmail
}: {
  cloudEnabled: boolean;
  email: string | null;
  isAnonymous: boolean;
  busy: boolean;
  onLinkEmail: (email: string) => Promise<{ ok: boolean; error?: string }>;
  onSignInEmail: (email: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [input, setInput] = useState(email ?? "");
  const [mode, setMode] = useState<"save" | "signin">(isAnonymous ? "save" : "signin");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!cloudEnabled) {
    return null;
  }

  if (email && !isAnonymous) {
    return (
      <section className="account-section account-linked">
        <div className="account-status">
          <Mail size={18} />
          <div>
            <strong>Signed in</strong>
            <span>{email}</span>
          </div>
        </div>
        <p className="account-muted">Your Vouch syncs to this account on every device.</p>
      </section>
    );
  }

  async function submit() {
    setError(null);
    const fn = mode === "save" ? onLinkEmail : onSignInEmail;
    const result = await fn(input);
    if (result.ok) {
      setSent(true);
    } else {
      setError(result.error ?? "Something went wrong");
    }
  }

  return (
    <section className="account-section">
      <p className="account-lede">
        {isAnonymous
          ? "Save your Vouch to your email so a new phone or cleared browser doesn't wipe your card."
          : "Already have a Vouch? Sign in with the email you used before."}
      </p>

      <div className="account-mode-toggle">
        <button
          type="button"
          className={mode === "save" ? "active" : ""}
          onClick={() => {
            setMode("save");
            setSent(false);
            setError(null);
          }}
        >
          Save this device
        </button>
        <button
          type="button"
          className={mode === "signin" ? "active" : ""}
          onClick={() => {
            setMode("signin");
            setSent(false);
            setError(null);
          }}
        >
          Sign in elsewhere
        </button>
      </div>

      {sent ? (
        <div className="account-sent">
          <Check size={18} />
          <div>
            <strong>Check your inbox</strong>
            <span>
              We sent a link to <strong>{input}</strong>. Tap it on this device
              {mode === "signin" ? " to load your Vouch." : " to confirm your email — your data stays on this account."}
            </span>
          </div>
        </div>
      ) : (
        <>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          {error && <p className="account-error">{error}</p>}
          <button type="button" className="primary-button" disabled={busy || input.trim().length < 5} onClick={submit}>
            {busy ? "Sending…" : mode === "save" ? "Send save link" : "Send sign-in link"}
          </button>
        </>
      )}
    </section>
  );
}
