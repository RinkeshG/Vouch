import sf from "../surface.module.css";
import { AppShell } from "../../../components/vouch/app-shell";
import { HomeDecision } from "../../../components/vouch/home-screen";
import { StatusChip } from "../../../components/vouch/chip";
import { PICKS } from "../../../components/vouch/_sample";

export const metadata = { title: "Vouch — Home (decide tonight)" };

export default function HomeStub() {
  return (
    <AppShell active="map" location="Indiranagar" topRight={<StatusChip>live</StatusChip>}>
      <div className={sf.center}>
        <HomeDecision picks={PICKS} context="Friday · 7:42pm · Indiranagar" />
      </div>
    </AppShell>
  );
}
