"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Stamp } from "@/components/ui/stamp";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import styles from "./welcome.module.css";

interface VouchPreview {
  placeName: string;
  area: string;
  take: string;
}

export default function WelcomePage() {
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tasteLine, setTasteLine] = useState("");
  const [vouches, setVouches] = useState<VouchPreview[]>([]);
  const [copied, setCopied] = useState(false);
  const [activeFormat, setActiveFormat] = useState<"og" | "story" | "square">("og");
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("handle, display_name, taste_line")
        .eq("id", user.id)
        .single();

      if (profile) {
        setHandle(profile.handle);
        setDisplayName(profile.display_name);
        setTasteLine(profile.taste_line || "");
      }

      // Load vouches for the preview card
      const { data: vouchesData } = await supabase
        .from("vouches")
        .select(`
          id, take,
          places!vouches_place_id_fkey ( name, area )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(4);

      if (vouchesData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setVouches(vouchesData.map((v: any) => ({
          placeName: v.places?.name || "Unknown",
          area: v.places?.area || "",
          take: v.take,
        })));
      }
    }

    loadProfile();
  }, [supabase]);

  const profileUrl = `https://vouch.app/@${handle}`;

  const shareText = `I just built my taste profile on Vouch — four places I'd stake my reputation on. See my picks: ${profileUrl}`;

  function shareWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  }

  function shareTwitter() {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  }

  async function copyLink() {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadImage() {
    const format = activeFormat;
    // dl=1 triggers Content-Disposition: attachment so browser downloads the image
    const url = `/api/og/four-card/${handle}?format=${format}&dl=1`;
    window.open(url, "_blank");
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName}'s Four Vouches`,
          text: shareText,
          url: profileUrl,
        });
      } catch {
        // User cancelled
      }
    }
  }

  const firstName = displayName.split(" ")[0] || "friend";

  return (
    <div className={styles.page}>
      {/* Celebration header */}
      <div className={styles.celebration}>
        <Stamp size={56} animated />
        <h1 className={styles.title}>
          You&rsquo;re live, {firstName}
        </h1>
        <p className={styles.sub}>
          Your taste profile is public at{" "}
          <strong className={styles.handle}>vouch.app/@{handle}</strong>.
          Now share your Four Vouches with the world.
        </p>
      </div>

      {/* The Four Card preview — HTML recreation of the OG image */}
      <div className={styles.cardSection}>
        <div className={styles.cardLabel}>Your shareable card</div>

        <div className={styles.cardPreview}>
          {/* Dark card */}
          <div className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.cardLogo}>
                <div className={styles.cardStamp}>V</div>
                <span className={styles.cardBrand}>vouch.app</span>
              </div>
              <span className={styles.cardHandle}>@{handle}</span>
            </div>

            <div className={styles.cardTitle}>
              <span className={styles.cardKicker}>THE CANON</span>
              <span className={styles.cardName}>
                {displayName}&rsquo;s Four Vouches
              </span>
              {tasteLine && (
                <span className={styles.cardTaste}>
                  &ldquo;{tasteLine}&rdquo;
                </span>
              )}
            </div>

            <div className={styles.cardGrid}>
              {vouches.map((v, i) => (
                <div key={i} className={styles.cardVouch}>
                  <span className={styles.cardVouchNum}>
                    {String(i + 1).padStart(2, "0")} / 04
                  </span>
                  <div className={styles.cardVouchInfo}>
                    <span className={styles.cardVouchPlace}>{v.placeName}</span>
                    <span className={styles.cardVouchArea}>
                      {v.area.split(",")[0]}
                    </span>
                    <span className={styles.cardVouchTake}>
                      &ldquo;{v.take}&rdquo;
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.cardFooterLeft}>
                Built on trust, not strangers.
              </span>
              <span className={styles.cardFooterRight}>
                vouch.app/@{handle}
              </span>
            </div>
          </div>
        </div>

        {/* Format selector */}
        <div className={styles.formatRow}>
          {(["og", "story", "square"] as const).map((fmt) => (
            <button
              key={fmt}
              className={`${styles.formatBtn} ${activeFormat === fmt ? styles.formatActive : ""}`}
              onClick={() => setActiveFormat(fmt)}
            >
              {fmt === "og" ? "Link preview" : fmt === "story" ? "Story" : "Square"}
            </button>
          ))}
        </div>
      </div>

      {/* Share actions */}
      <div className={styles.shareSection}>
        <div className={styles.shareLabel}>Share your four</div>

        <div className={styles.shareGrid}>
          <button className={styles.shareBtn} onClick={shareWhatsApp}>
            <div className={styles.shareBtnIcon} style={{ backgroundColor: "#25D366" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <span>WhatsApp</span>
          </button>

          <button className={styles.shareBtn} onClick={shareTwitter}>
            <div className={styles.shareBtnIcon} style={{ backgroundColor: "#0F0F0E" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <span>X / Twitter</span>
          </button>

          <button className={styles.shareBtn} onClick={downloadImage}>
            <div className={styles.shareBtnIcon} style={{ backgroundColor: "var(--v-seal)" }}>
              <Icon name="external" size={18} />
            </div>
            <span>Download</span>
          </button>

          <button className={styles.shareBtn} onClick={copyLink}>
            <div className={styles.shareBtnIcon} style={{ backgroundColor: "var(--v-ink2)" }}>
              <Icon name={copied ? "check" : "share"} size={18} />
            </div>
            <span>{copied ? "Copied!" : "Copy link"}</span>
          </button>
        </div>

        {typeof navigator !== "undefined" && "share" in navigator && (
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={nativeShare}
            icon={<Icon name="share" size={18} />}
          >
            More sharing options
          </Button>
        )}
      </div>

      {/* Continue to product */}
      <div className={styles.continueSection}>
        <div className={styles.continueDivider} />
        <p className={styles.continueHint}>
          You can always share your card later from your profile. For now —
        </p>
        <Link href="/home" className={styles.continueLink}>
          <Button variant="seal" size="lg" fullWidth>
            Start exploring Vouch
            <Icon name="arrow-right" size={18} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
