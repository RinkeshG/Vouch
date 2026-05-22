"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import styles from "./claim-handle.module.css";

type HandleStatus = "idle" | "checking" | "available" | "taken" | "invalid";

/**
 * Interstitial for Google OAuth users who got an auto-generated handle.
 * They need to pick a real handle before proceeding to onboarding.
 */
export default function ClaimHandlePage() {
  const router = useRouter();
  const supabase = createClient();

  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [handleStatus, setHandleStatus] = useState<HandleStatus>("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load existing display name from Google profile
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (profile?.display_name && profile.display_name !== "New User") {
        setDisplayName(profile.display_name);
      }
    }
    load();
  }, [supabase]);

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
      const { data } = await supabase
        .from("profiles")
        .select("handle")
        .eq("handle", handle)
        .maybeSingle();

      setHandleStatus(data ? "taken" : "available");
    }, 400);

    return () => clearTimeout(timer);
  }, [handle, handleStatus, supabase]);

  function onHandleChange(value: string) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setHandle(cleaned);
    validateHandle(cleaned);
  }

  function statusMessage(): string | undefined {
    switch (handleStatus) {
      case "checking": return "Checking...";
      case "taken": return "Already taken";
      case "invalid": return "3–20 chars, lowercase letters, numbers, underscores";
      default: return undefined;
    }
  }

  function statusHint(): string | undefined {
    if (handleStatus === "available") return "Available!";
    return undefined;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (handleStatus !== "available") return;
    if (!displayName.trim()) return;

    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          handle,
          display_name: displayName.trim(),
        })
        .eq("id", user.id);

      if (updateError) {
        if (updateError.message.includes("unique")) {
          setHandleStatus("taken");
          setError("This handle was just taken. Try another.");
        } else {
          setError("Something went wrong. Please try again.");
        }
        setLoading(false);
        return;
      }

      router.push("/onboarding");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className={styles.title}>Claim your handle</h1>
      <p className={styles.sub}>
        One more thing — pick a unique handle for your Vouch profile.
        This is how friends will find you.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Handle"
          placeholder="yourname"
          value={handle}
          onChange={(e) => onHandleChange(e.target.value)}
          error={statusMessage()}
          hint={statusHint()}
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
          autoFocus
        />

        {handle && handleStatus === "available" && (
          <p className={styles.preview}>
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

        {error && <p className={styles.error}>{error}</p>}

        <Button
          type="submit"
          variant="seal"
          size="lg"
          fullWidth
          loading={loading}
          disabled={handleStatus !== "available" || !displayName.trim()}
        >
          Continue to onboarding
        </Button>
      </form>
    </div>
  );
}
