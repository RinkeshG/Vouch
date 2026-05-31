import sf from "../surface.module.css";
import { AppShell } from "../../../components/vouch/app-shell";
import { AddVouchComposer } from "../../../components/vouch/composer";
import { HomeHeader } from "../../../components/vouch/home";

export const metadata = { title: "Vouch — Add (stub)" };

export default function AddStub() {
  return (
    <AppShell active="search" location="Indiranagar">
      <div className={sf.center}>
        <HomeHeader greeting="Put your name on it." sub="One place, one line, one occasion. That’s the whole thing." />
        <div className={sf.block}>
          <AddVouchComposer />
        </div>
      </div>
    </AppShell>
  );
}
