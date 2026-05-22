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
 * Set up your Vouch profile — pick a handle and display name.
 * Covers two cases:
 *   1. Profile exists with auto-generated handle (user_XXXXX) → UPDATE
 *   2. Profile doesn't exist at all (trigger didn't fire) → INSERT
 */
export default function ClaimHandlePage() {
  const router = useRouter();
  const supabase = createClient();

  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [handleStatus, setHandleStatus] = useState<HandleStatus>("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileExists, setProfileExists] = useState<boolean | null>(null);

  // Check if profile exists + load any existing data
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/sign-in");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, handle")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setProfileExists(true);
        // If they already have a proper handle, send them to /new
        if (profile.handle && !profile.handle.startsWith("user_")) {
          router.push("/new");
          return;
        }
        if (profile.display_name && profile.display_name !== "New User") {
          setDisplayName(profile.display_name);
        }
      } else {
        setProfileExists(false);
        // Pre-fill display name from auth metadata
        const name = user.user_metadata?.display_name
          || user.user_metadata?.full_name
          || user.user_metadata?.name
          || user.email?.split("@")[0]
          || "";
        if (name) setDisplayName(name);
      }
    }
    load();
  }, [supabase, router]);

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
      case "taken": return "This username is taken";
      case "invalid": return "3–20 chars, lowercase letters, numbers, underscores";
      default: return undefined;
    }
  }

  function statusHint(): string | undefined {
    if (handleStatus === "available") return "Username available!";
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

      if (profileExists) {
        // Profile exists — update handle + display name
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
            setError("This username was just taken. Try another.");
          } else {
            setError("Something went wrong. Please try again.");
            console.error("Profile update error:", updateError.message);
          }
          setLoading(false);
          return;
        }
      } else {
        // No profile row — insert a new one
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            handle,
            display_name: displayName.trim(),
            avatar_tint: Math.floor(Math.random() * 9),
          });

        if (insertError) {
          if (insertError.message.includes("unique")) {
            setHandleStatus("taken");
            setError("This username was just taken. Try another.");
          } else {
            setError("Something went wrong. Please try again.");
            console.error("Profile insert error:", insertError.message);
          }
          setLoading(false);
          return;
        }
      }

      router.push("/new");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className={styles.title}>Pick your username</h1>
      <p className={styles.sub}>
        Choose a unique username for your Vouch profile.
        This is how people will find your lists.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Username"
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
          Continue
        </Button>
      </form>
    </div>
  );
}
