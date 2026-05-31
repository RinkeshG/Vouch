import { GuideArtifact } from "../../../../components/vouch/guide-artifact";
import { GUIDE_PARENTS } from "../../../../components/vouch/_sample";
import styles from "../../../../components/vouch/guide-artifact.module.css";

export const metadata = {
  title: "Where I take my parents — a guide by Aditi · Vouch",
  description: "A guide by Aditi on Vouch — six Bengaluru spots she'd put her name on for taking your parents. Invite-only.",
};

/* The public share page — what a friend opens from WhatsApp. Standalone artifact,
   invite-gated CTA, no app chrome. */
export default function ParentsGuidePage() {
  return (
    <div className={styles.shareStage}>
      <GuideArtifact
        guide={GUIDE_PARENTS}
        whenToTrust="Trust her for parents, coffee, and the old-school South Indian canon."
        share
        palateHref="/p/aditi"
        linkSpots
      />
      <p className={styles.shareHint}>shared with you · borrowing requires an invite</p>
    </div>
  );
}
