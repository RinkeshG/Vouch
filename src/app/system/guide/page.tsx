import sf from "../surface.module.css";
import { AppShell } from "../../../components/vouch/app-shell";
import { GuideView } from "../../../components/vouch/guide";
import { Button } from "../../../components/vouch/button";
import { GUIDE_PARENTS } from "../../../components/vouch/_sample";

export const metadata = { title: "Vouch — Guide (stub)" };

export default function GuideStub() {
  return (
    <AppShell active="guides" location="Bengaluru">
      <div className={sf.center}>
        <div className={sf.viewCard}>
          <GuideView
            guide={GUIDE_PARENTS}
            footer={
              <>
                <span className={sf.guideFootNote}>Follow <b>Aditi</b> and this whole guide lands on your map.</span>
                <Button variant="primary">Borrow this guide →</Button>
              </>
            }
          />
        </div>
      </div>
    </AppShell>
  );
}
