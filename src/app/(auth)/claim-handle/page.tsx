"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkHandle, getProfile, saveProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import styles from "./claim-handle.module.css";

type HandleStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export default function ClaimHandlePage() {
  const router = useRouter();

  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [handleStatus, setHandleStatus] = useState<HandleStatus>("idle");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  // Load profile data via server action
  useEffect(() => {
    async function load() {
      const result = await getProfile();

      if (!result.userId) {
        // Not authenticated
        router.push("/sign-in");
        return;
      }

      // Already has a proper handle → go to /new
      if (result.exists && result.handle && !result.handle.startsWith("user_")) {
        router.push("/new");
        return;
      }

      // Pre-fill display name
      if (result.displayName && result.displayName !== "New User") {
        setDisplayName(result.displayName);
      }

      setPageLoading(false);
    }
    load();
  }, [router]);

  // Debounced handle availability check via server action
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
      const result = await checkHandle(handle);
      if (result.error === "invalid") {
        setHandleStatus("invalid");
      } else {
        setHandleStatus(result.available ? "available" : "taken");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [handle, handleStatus]);

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

    const result = await saveProfile(handle, displayName.trim());

    if (!result.success) {
      if (result.error?.includes("taken")) {
        setHandleStatus("taken");
      }
      setError(result.error || "Something went wrong.");
      setLoading(false);

      if (result.error?.includes("session")) {
        setTimeout(() => router.push("/sign-in"), 1500);
      }
      return;
    }

    router.push("/new");
  }

  if (pageLoading) {
    return (
      <div>
        <h1 className={styles.title}>Setting up...</h1>
      </div>
    );
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
