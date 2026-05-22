"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { checkHandleAvailable, checkEmailAvailable } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rule } from "@/components/ui/rule";
import { Icon } from "@/components/ui/icon";
import styles from "./sign-up.module.css";

type HandleStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [handle, setHandle] = useState("");
  const [handleStatus, setHandleStatus] = useState<HandleStatus>("idle");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Step state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const validateHandle = useCallback((value: string) => {
    if (!value) {
      setHandleStatus("idle");
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(value)) {
      setHandleStatus("invalid");
      return;
    }
    setHandleStatus("checking");
  }, []);

  useEffect(() => {
    if (handleStatus !== "checking") return;

    const timer = setTimeout(async () => {
      const available = await checkHandleAvailable(handle);
      setHandleStatus(available ? "available" : "taken");
    }, 400);

    return () => clearTimeout(timer);
  }, [handle, handleStatus]);

  function onHandleChange(value: string) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setHandle(cleaned);
    validateHandle(cleaned);
  }

  function handleStatusMessage(): string | undefined {
    switch (handleStatus) {
      case "checking": return "Checking availability...";
      case "available": return undefined;
      case "taken": return "This username is already taken";
      case "invalid": return "3–20 chars, lowercase letters, numbers, underscores only";
      default: return undefined;
    }
  }

  function handleStatusHint(): string | undefined {
    if (handleStatus === "available") return "This username is available!";
    return undefined;
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (handleStatus !== "available" || !email.trim() || !displayName.trim()) return;

    setLoading(true);
    setError("");

    // Check email uniqueness before sending magic link
    const emailAvailable = await checkEmailAvailable(email.trim());
    if (!emailAvailable) {
      setLoading(false);
      setError("This email already has an account. Please sign in instead.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/new`,
        data: {
          handle: handle,
          display_name: displayName.trim(),
        },
      },
    });

    setLoading(false);

    if (error) {
      if (error.status === 429 || error.message?.toLowerCase().includes("rate")) {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      return;
    }

    setMagicLinkSent(true);
  }

  async function handleGoogleSignUp() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/new`,
      },
    });

    if (error) {
      setError("Could not connect to Google. Please try again.");
    }
  }

  if (magicLinkSent) {
    return (
      <div className={styles.sent}>
        <div className={styles.sentIcon}>
          <Icon name="check" size={28} />
        </div>
        <h1 className={styles.sentTitle}>Check your email</h1>
        <p className={styles.sentBody}>
          We sent a sign-in link to <strong>{email}</strong>.
          Click it to claim <strong>@{handle}</strong> and start building your taste profile.
        </p>
        <button
          className={styles.resend}
          onClick={() => setMagicLinkSent(false)}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Pick your username</h1>
      <p className={styles.sub}>
        Your username is your identity on Vouch — it&rsquo;s how friends
        find you and how your taste profile lives on the web.
      </p>

      <form onSubmit={handleSignUp} className={styles.form}>
        <Input
          label="Username"
          placeholder="yourname"
          value={handle}
          onChange={(e) => onHandleChange(e.target.value)}
          error={handleStatusMessage()}
          hint={handleStatusHint()}
          adornStart={<span className={styles.at}>@</span>}
          adornEnd={
            handleStatus === "available" ? (
              <Icon name="check" size={16} className={styles.checkIcon} />
            ) : handleStatus === "checking" ? (
              <span className={styles.spinner} />
            ) : null
          }
          autoComplete="username"
          maxLength={20}
        />

        {handle && handleStatus === "available" && (
          <p className={styles.handlePreview}>
            Your profile → <strong>vouch.app/@{handle}</strong>
          </p>
        )}

        <Input
          label="Display name"
          placeholder="Your Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          autoComplete="name"
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        {error && <p className={styles.error}>{error}</p>}

        <Button
          type="submit"
          variant="seal"
          size="lg"
          fullWidth
          loading={loading}
          disabled={handleStatus !== "available" || !email.trim() || !displayName.trim()}
        >
          Continue with email
        </Button>
      </form>

      <Rule label="or" />

      <div className={styles.social}>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={handleGoogleSignUp}
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          }
        >
          Continue with Google
        </Button>
      </div>

      <p className={styles.footer}>
        Already have an account?{" "}
        <Link href="/sign-in" className={styles.link}>
          Sign in
        </Link>
      </p>

      <p className={styles.footer} style={{ marginTop: "8px" }}>
        Just exploring?{" "}
        <Link href="/explore" className={styles.link}>
          Browse lists &rarr;
        </Link>
      </p>
    </div>
  );
}
