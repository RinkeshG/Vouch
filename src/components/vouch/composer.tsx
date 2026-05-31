"use client";
import { useState } from "react";
import { Avatar } from "./avatar";
import { Stamp, type StampState } from "./stamp";
import { OccasionChip, Tag } from "./chip";
import { Button } from "./button";
import { Toast } from "./misc";
import styles from "./composer.module.css";

const OCCASIONS = ["parents", "late night", "date", "solo lunch", "coffee", "group dinner", "worth the drive", "rainy day"];

/* The Add-vouch flow — the sacred ritual (Constitution §7). Pick place → stamp →
   if Vouched: one-line reason (required) + occasion(s). Integrity nudge guards
   empty vouches. The VOUCHED stamp lands on post. */
export function AddVouchComposer({
  place = "Naru Noodle Bar",
  tags = "Ramen · Indiranagar · ₹₹₹",
}: {
  place?: string;
  tags?: string;
}) {
  const [stamp, setStamp] = useState<StampState | null>(null);
  const [reason, setReason] = useState("");
  const [occasions, setOccasions] = useState<string[]>([]);
  const [posted, setPosted] = useState(false);
  const [nudge, setNudge] = useState(false);

  const needsReason = stamp === "vouched";

  function toggle(o: string) {
    setOccasions((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));
  }
  function post() {
    if (needsReason && (!reason.trim() || occasions.length === 0)) { setNudge(true); return; }
    setNudge(false);
    setPosted(true);
  }

  if (posted) {
    return (
      <div className={styles.card}>
        <div className={styles.postedTop}><Stamp state={stamp ?? "vouched"} animate /></div>
        <h3 className={styles.place}>{place}</h3>
        {needsReason && <p className={styles.postedLine}>“{reason}”</p>}
        <div className={styles.postedToast}><Toast tone="success">Your name’s on it. {place} is on your map.</Toast></div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <Avatar initials="RG" size={26} />
        <span>You’re vouching for…</span>
      </div>

      <div className={styles.place}>{place}<span className={styles.tags}><Tag>{tags}</Tag></span></div>

      <div className={styles.stampPick} role="radiogroup" aria-label="Stamp">
        {(["want", "been", "vouched"] as StampState[]).map((st) => (
          <button
            key={st}
            type="button"
            role="radio"
            aria-checked={stamp === st}
            className={`${styles.stampBtn} ${stamp === st ? styles.stampOn : ""}`}
            onClick={() => { setStamp(st); setNudge(false); }}
          >
            <Stamp state={st} />
          </button>
        ))}
      </div>

      {needsReason && (
        <div className={styles.ritual}>
          <label className={styles.fieldLabel}>One line — the whole review</label>
          <div className={styles.lineWrap}>
            <textarea
              className={styles.reason}
              value={reason}
              maxLength={120}
              rows={2}
              placeholder="Why you’d send a friend here…"
              aria-invalid={nudge && !reason.trim()}
              onChange={(e) => { setReason(e.target.value.replace(/\n/g, " ")); setNudge(false); }}
              onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = `${t.scrollHeight}px`; }}
            />
            <span className={styles.reasonCount}>{reason.length}/120</span>
          </div>
          <label className={styles.fieldLabel}>Best for</label>
          <div className={styles.occasions}>
            {OCCASIONS.map((o) => (
              <OccasionChip key={o} selected={occasions.includes(o)} onToggle={() => toggle(o)}>{o}</OccasionChip>
            ))}
          </div>
        </div>
      )}

      {nudge && <p className={styles.nudge}>A vouch needs a reason and an occasion. Your name is on it.</p>}

      <div className={styles.foot}>
        <span className={styles.hint}>{stamp === "vouched" ? "// you’re staking your name on this" : "// pick a stamp"}</span>
        <Button variant="primary" disabled={!stamp} onClick={post}>
          {stamp === "vouched" ? "Put my name on it ↵" : stamp ? "Save it ↵" : "Post"}
        </Button>
      </div>
    </div>
  );
}
