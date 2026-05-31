import sf from "../surface.module.css";
import { AppShell } from "../../../components/vouch/app-shell";
import { SpotHeader } from "../../../components/vouch/spot";
import { Receipt } from "../../../components/vouch/receipt";
import { Button } from "../../../components/vouch/button";
import { SectionLabel } from "../../../components/vouch/home";
import { VouchCard } from "../../../components/vouch/vouch-card";
import { TRAIL } from "../../../components/vouch/_sample";

export const metadata = { title: "Vouch — Spot (stub)" };

export default function SpotStub() {
  return (
    <AppShell active="map" location="Residency Rd">
      <div className={sf.center}>
        <SpotHeader
          name="Karavalli" tags="Coastal · Residency Rd · ₹₹₹₹" distance="1.2 km"
          verdict="Take your parents. They’ll talk about it for months."
          verdictBy="Aditi vouched"
          occasions={["parents", "worth the drive", "group dinner"]}
        />

        <div className={sf.block}><Receipt lines={TRAIL} /></div>

        <div className={sf.actions}>
          <Button variant="primary">＋ Save for later</Button>
          <Button variant="ghost">Been</Button>
          <Button variant="ghost">Add to a guide</Button>
        </div>

        <div className={`${sf.block} ${sf.practical}`}>
          <span className={sf.practicalLabel}>What to order · practical</span>
          <div className={sf.practicalRow}><span>Order</span><b>The crab, the appams, the prawn ghee roast</b></div>
          <div className={sf.practicalRow}><span>Skip</span><b>The desserts — leave room next door</b></div>
          <div className={sf.practicalRow}><span>Open</span><b>Daily · 12:30–3, 7–11pm</b></div>
        </div>

        <div className={sf.block}>
          <SectionLabel>More vouches for Karavalli</SectionLabel>
          <VouchCard
            variant="compact"
            place="Karavalli"
            line="The one place I never worry about taking anyone."
            palate={{ name: "Meera", ini: "MK" }}
            occasions={["date", "group dinner"]}
          />
        </div>
      </div>
    </AppShell>
  );
}
