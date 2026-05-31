import sf from "../surface.module.css";
import { AppShell } from "../../../components/vouch/app-shell";
import { HomeHeader, ModeBar, SectionLabel } from "../../../components/vouch/home";
import { VouchCard } from "../../../components/vouch/vouch-card";
import { ReceiptInline } from "../../../components/vouch/receipt";
import { StatusChip } from "../../../components/vouch/chip";
import { TONIGHT, HOME_MODES } from "../../../components/vouch/_sample";

export const metadata = { title: "Vouch — Home (stub)" };

export default function HomeStub() {
  return (
    <AppShell active="map" location="Indiranagar" topRight={<StatusChip>live</StatusChip>}>
      <div className={sf.center}>
        <HomeHeader greeting="Dinner tonight?" sub="3 places your people vouched, open now, near you." />
        <ModeBar modes={HOME_MODES} active="Tonight" />
        <SectionLabel>Tonight · from people you follow</SectionLabel>
        <div className={sf.stack}>
          {TONIGHT.map((t) => (
            <VouchCard
              key={t.place}
              variant="compact"
              place={t.place}
              tags={t.tags}
              line={t.line}
              palate={t.palate}
              occasions={t.occasions}
              receipt={<ReceiptInline faces={t.faces}><b>{t.via}</b> · 2 you follow saved it</ReceiptInline>}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
