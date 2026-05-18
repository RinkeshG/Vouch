import { useState } from "react";
import { Mail } from "lucide-react";

export function EmailAuthCard({
  variant = "save",
  cloudEnabled,
  authEmail,
  authBusy,
  onSaveEmail,
  onSignInEmail
}: {
  variant?: "save" | "signin" | "compact";
  cloudEnabled: boolean;
  authEmail: string | null;
  authBusy: boolean;
  onSaveEmail: (email: string) => Promise<{ ok: boolean; error?: string }>;
  onSignInEmail: (email: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [emailInput, setEmailInput] = useState(authEmail ?? "");
  const [mode, setMode] = useState<"save" | "signin">(variant === "signin" ? "signin" : "save");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!cloudEnabled) {
    return (
      <section className="email-auth-card email-auth-card--muted">
        <p>Cloud sync isn&apos;t configured on this build — your Vouch stays on this device only.</p>
      </section>
    );
  }

  if (authEmail) {
    return (
      <section className="email-auth-card email-auth-card--linked">
        <Mail size={18} aria-hidden />
        <div>
          <strong>Saved to {authEmail}</strong>
          <span>We&apos;ll email you a link if you need this Vouch on another phone.</span>
        </div>
      </section>
    );
  }

  async function submit() {
    setError(null);
    const fn = mode === "save" ? onSaveEmail : onSignInEmail;
    const result = await fn(emailInput);
    if (result.ok) setSent(true);
    else setError(result.error ?? "Something went wrong");
  }

  const isCompact = variant === "compact";

  return (
    <section className={`email-auth-card${isCompact ? " email-auth-card--compact" : ""}`}>
      {!isCompact && (
        <>
          <h3 className="email-auth-card-title">
            {mode === "save" ? "Save your Vouch to email" : "Sign in on this device"}
          </h3>
          <p className="email-auth-card-lede">
            {mode === "save"
              ? "One tap in your inbox — same Top 4 if you switch phones or clear browser data."
              : "We'll send a magic link. Open it on this phone to load your existing Vouch."}
          </p>
        </>
      )}
      {isCompact && (
        <p className="email-auth-card-lede email-auth-card-lede--compact">
          <Mail size={16} aria-hidden /> Save to email so you never lose your picks
        </p>
      )}

      {sent ? (
        <p className="email-auth-card-ok">Check your inbox — tap the link from Vouch to continue.</p>
      ) : (
        <div className="email-auth-card-row">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
          <button type="button" className="primary-button" disabled={authBusy || emailInput.trim().length < 5} onClick={() => void submit()}>
            {authBusy ? "…" : mode === "save" ? "Send link" : "Sign in"}
          </button>
        </div>
      )}

      {error && <p className="email-auth-card-err">{error}</p>}

      {variant !== "signin" && !isCompact && (
        <button
          type="button"
          className="text-link email-auth-card-switch"
          onClick={() => {
            setMode((m) => (m === "save" ? "signin" : "save"));
            setSent(false);
            setError(null);
          }}
        >
          {mode === "save" ? "Already have a Vouch? Sign in with email" : "New here? Save with email instead"}
        </button>
      )}
    </section>
  );
}
