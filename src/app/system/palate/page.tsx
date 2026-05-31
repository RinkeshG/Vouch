import sf from "../surface.module.css";
import { AppShell } from "../../../components/vouch/app-shell";
import { PalateHeader } from "../../../components/vouch/palate";
import { GuideCard } from "../../../components/vouch/guide";
import { SectionLabel } from "../../../components/vouch/home";
import { VouchCard } from "../../../components/vouch/vouch-card";
import { GUIDE_PARENTS } from "../../../components/vouch/_sample";

export const metadata = { title: "Vouch — Palate (stub)" };

export default function PalateStub() {
  return (
    <AppShell active="you" location="Indiranagar">
      <div className={sf.center}>
        <PalateHeader
          name="Aditi Sharma" handle="@aditi" ini="AS"
          whenToTrust="Old-school South Indian, anything you’d take family to, and the filter-coffee canon. Less so for late-night or cocktails."
          occasions={["parents", "coffee", "veg-safe", "quiet to talk"]}
          stats={{ guides: 4, vouches: 38, followers: "410" }}
        />

        <div className={sf.block}>
          <SectionLabel>Guides</SectionLabel>
          <div className={sf.guidesGrid}>
            <GuideCard guide={GUIDE_PARENTS} />
          </div>
        </div>

        <div className={sf.block}>
          <SectionLabel>Recent vouches</SectionLabel>
          <VouchCard
            variant="compact"
            place="Brahmin’s Coffee Bar"
            tags="Filter · Shankarpuram · ₹"
            line="Idli, kara bath, one-by-two filter. A morning religion."
            palate={{ name: "Aditi", ini: "AS" }}
            occasions={["coffee", "solo lunch"]}
          />
        </div>
      </div>
    </AppShell>
  );
}
