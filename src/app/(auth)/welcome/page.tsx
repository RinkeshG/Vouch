"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Stamp } from "@/components/ui/stamp";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import styles from "./welcome.module.css";

export default function WelcomePage() {
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("handle, display_name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setHandle(profile.handle);
        setDisplayName(profile.display_name);
      }
    }

    loadProfile();
  }, [supabase]);

  const shareText = `I just built my list on Vouch — the food guide that runs on trust, not strangers. Check it out: vouch.club/${handle}`;

  function shareWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  }

  function copyLink() {
    navigator.clipboard.writeText(`https://vouch.club/${handle}`);
  }

  return (
    <div className={styles.page}>
      <Stamp size={64} animated />

      <h1 className={styles.title}>
        You&rsquo;re in, {displayName.split(" ")[0] || "friend"}
      </h1>
      <p className={styles.sub}>
        Your profile is now live at{" "}
        <strong className={styles.handle}>@{handle}</strong>. Your circle can
        see your four vouches and start discovering through you.
      </p>

      <div className={styles.actions}>
        <Button
          size="lg"
          fullWidth
          onClick={shareWhatsApp}
          icon={<Icon name="share" size={18} />}
        >
          Share on WhatsApp
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={copyLink}
          icon={<Icon name="external" size={18} />}
        >
          Copy profile link
        </Button>
      </div>

      <div className={styles.divider} />

      <Link href="/home" className={styles.continueLink}>
        <Button variant="ghost" size="lg" fullWidth>
          Start exploring your feed
          <Icon name="arrow-right" size={18} />
        </Button>
      </Link>
    </div>
  );
}
