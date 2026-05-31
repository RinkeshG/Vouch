import s from "./showcase.module.css";
import { Wordmark } from "../../components/vouch/wordmark";
import { Button } from "../../components/vouch/button";
import { Avatar, FaceStack } from "../../components/vouch/avatar";
import { Stamp } from "../../components/vouch/stamp";
import { OccasionChip, Tag, StatusChip } from "../../components/vouch/chip";
import { Receipt, type TrailLine } from "../../components/vouch/receipt";
import { VouchCard } from "../../components/vouch/vouch-card";
import { GuideCard, GuideView, type GuideData } from "../../components/vouch/guide";
import { PalateHeader } from "../../components/vouch/palate";
import { SpotHeader } from "../../components/vouch/spot";
import { SearchField, ComposerField } from "../../components/vouch/input";
import { LeaderRow, SkeletonCard, SkeletonRow, EmptyState, Toast } from "../../components/vouch/misc";
import { AddVouchComposer } from "../../components/vouch/composer";

export const metadata = { title: "Vouch — Design System 2.0" };

const SURFACES = [
  { href: "/system/home", name: "Home · Where should I go?" },
  { href: "/system/spot", name: "Spot · the place page" },
  { href: "/system/palate", name: "Palate · a taste map" },
  { href: "/system/guide", name: "Guide · opened" },
  { href: "/system/add", name: "Add · the ritual" },
];

const TRAIL: TrailLine[] = [
  { kind: "vouched", who: "Aditi", ini: "AS", note: "Take your parents.", time: "2h" },
  { kind: "saved", faces: ["RG", "MK"], extra: 1, names: "Rinkesh, Meera +1", time: "now" },
];

const GUIDE: GuideData = {
  title: "Where I take my parents", by: "Aditi", ini: "AS", count: 6, note: "no surprises, all delight",
  anchor: "Safe bets · no surprises",
  items: [
    { name: "Karavalli", tags: "Coastal · Residency Rd · ₹₹₹₹", note: "They’ll talk about it for months." },
    { name: "Vidyarthi Bhavan", tags: "Dosa · Basavanagudi · ₹", note: "Go before 9am, beat the queue." },
    { name: "Koshy’s", tags: "Old-school · St Marks Rd · ₹₹", note: "Chicken stew + appam, always." },
    { name: "MTR", tags: "Tiffin · Lalbagh · ₹", note: "The rava idli origin story." },
  ],
};

const COLORS: { v: string; name: string }[] = [
  { v: "var(--bg)", name: "bg" }, { v: "var(--surface)", name: "surface" }, { v: "var(--surface-2)", name: "surface-2" },
  { v: "var(--saffron)", name: "saffron" }, { v: "var(--saffron-hi)", name: "saffron-hi" }, { v: "var(--ember)", name: "ember" },
  { v: "var(--jade)", name: "jade" }, { v: "var(--text)", name: "text" }, { v: "var(--muted)", name: "muted" }, { v: "var(--faint)", name: "faint" },
];

function Section({ id, title, desc, children }: { id: string; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className={s.section} id={id}>
      <p className={s.sectionHead}>{title}</p>
      {desc && <p className={s.sectionDesc}>{desc}</p>}
      {children}
    </section>
  );
}

export default function SystemPage() {
  return (
    <main className={s.page}>
      <div className={s.wrap}>
        <header className={s.masthead}>
          <Wordmark size={1.6} />
          <span className={s.mastTitle}>Design System 2.0 · the product OS</span>
        </header>

        <Section id="color" title="Foundations · Colour" desc="After-Dark / Ledger. Dark near-black + one saffron accent; ember & jade carry heat and 'go'. Identity is settled.">
          <div className={s.swatches}>
            {COLORS.map((c) => (
              <div className={s.swatch} key={c.name}>
                <div className={s.swatchChip} style={{ background: c.v }} />
                <div className={s.swatchMeta}><b>{c.name}</b></div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="type" title="Foundations · Type ramp" desc="Bricolage Grotesque (display) · Space Grotesk (body/UI) · Space Mono (labels). The contrast between them is the editorial voice.">
          <div className={s.typeRow}><span className={s.typeTag}>Display</span><span className={s.tDisplay}>A name on it</span></div>
          <div className={s.typeRow}><span className={s.typeTag}>H1</span><span className={s.tH1}>Where I take my parents</span></div>
          <div className={s.typeRow}><span className={s.typeTag}>H2</span><span className={s.tH2}>Not an algorithm</span></div>
          <div className={s.typeRow}><span className={s.typeTag}>H3</span><span className={s.tH3}>Naru Noodle Bar</span></div>
          <div className={s.typeRow}><span className={s.typeTag}>Body</span><span className={s.tBody}>Follow the palates you trust. Their vouches tell you where to eat tonight.</span></div>
          <div className={s.typeRow}><span className={s.typeTag}>Label</span><span className={s.tLabel}>Ramen · Indiranagar · ₹₹₹</span></div>
        </Section>

        <Section id="buttons" title="Primitives · Buttons" desc="Three roles, sans, sentence case. Mono UPPERCASE is for labels — never an action.">
          <div className={s.stage}>
            <Button variant="primary">Request invite →</Button>
            <Button variant="ghost">Add to a guide</Button>
            <Button variant="compact">Borrow palate</Button>
            <Button variant="primary" disabled>Posting…</Button>
          </div>
        </Section>

        <Section id="people" title="Primitives · People" desc="Imagery is people + type. Monogram avatars and face stacks carry 'who' — the whole product.">
          <div className={s.stage}>
            <Avatar initials="AS" size={42} />
            <Avatar initials="RG" size={30} />
            <Avatar initials="MK" size={26} />
            <FaceStack faces={["RG", "MK", "SD"]} extra={3} size={30} />
          </div>
        </Section>

        <Section id="stamps" title="Primitives · The three stamps" desc="A vouch's state. Colour = meaning. Vouched is the glowing currency.">
          <div className={s.stage}>
            <Stamp state="want" />
            <Stamp state="been" />
            <Stamp state="vouched" />
            <Stamp state="vouched" animate />
          </div>
        </Section>

        <Section id="chips" title="Primitives · Occasion & tags" desc="Occasion is a controlled vocabulary — life moments, not cuisines. Selectable (filter) or static (label).">
          <div className={s.cell}>
            <div className={s.cellLabel}>Occasion — selectable</div>
            <div className={s.rowTight}>
              <OccasionChip selected>parents</OccasionChip>
              <OccasionChip>late night</OccasionChip>
              <OccasionChip>date</OccasionChip>
              <OccasionChip selected>coffee</OccasionChip>
              <OccasionChip>worth the drive</OccasionChip>
            </div>
          </div>
          <div className={s.cell}>
            <div className={s.cellLabel}>Meta tags &amp; status</div>
            <div className={s.row}>
              <Tag>Ramen · Indiranagar · ₹₹₹</Tag>
              <StatusChip>live in Bengaluru</StatusChip>
              <StatusChip tone="saffron">1.2 km away</StatusChip>
            </div>
          </div>
        </Section>

        <Section id="receipt" title="Objects · The Receipt" desc="Why a place reached you. Present on every surface. Derived from the trust graph — never anonymous.">
          <div className={s.stage}>
            <div style={{ width: "min(420px, 100%)" }}>
              <Receipt lines={TRAIL} />
            </div>
          </div>
        </Section>

        <Section id="vouch" title="Objects · The Vouch card" desc="The atomic unit. One place · one line · one name · one occasion. A stamp, not a post. Full and compact.">
          <div className={s.objGrid}>
            <VouchCard
              place="Naru Noodle Bar"
              tags="Ramen · Indiranagar · ₹₹₹"
              line="Best bowl in the city. Get there at 6 sharp."
              palate={{ name: "Aditi", ini: "AS" }}
              occasions={["date", "rainy day"]}
              receipt={<Receipt lines={TRAIL} />}
              actions={<><Button variant="primary">＋ Save</Button><Button variant="ghost">Add to a guide</Button></>}
            />
            <VouchCard
              variant="compact"
              place="Empire"
              tags="Kebabs · Indiranagar · ₹₹"
              line="Midnight hunger, fully solved."
              palate={{ name: "Rinkesh", ini: "RG" }}
              occasions={["late night"]}
            />
          </div>
        </Section>

        <Section id="guide" title="Objects · The Guide" desc="Authored, occasion-titled. The preview card and the opened view share the same rows — inside == outside.">
          <div className={s.objGrid}>
            <GuideCard guide={GUIDE} />
            <div className={s.viewStage}>
              <GuideView guide={GUIDE} footer={<><span className={s.footNote}>Follow <b>Aditi</b> and this whole guide lands on your map.</span><Button variant="primary">Request an invite →</Button></>} />
            </div>
          </div>
        </Section>

        <Section id="palate" title="Objects · The Palate" desc="A person AND their taste — a taste map, not a profile. When to trust them, strongest occasions.">
          <PalateHeader
            name="Aditi Sharma" handle="@aditi" ini="AS"
            whenToTrust="Old-school South Indian, anything you’d take family to, and the filter-coffee canon. Less so for late-night or cocktails."
            occasions={["parents", "coffee", "veg-safe", "quiet to talk"]}
            stats={{ guides: 4, vouches: 38, followers: "410" }}
          />
        </Section>

        <Section id="spot" title="Objects · The Spot (place page hero)" desc="Leads with the trusted verdict and the Receipt — never Google-Maps chrome.">
          <div className={s.spotStage}>
            <SpotHeader
              name="Karavalli" tags="Coastal · Residency Rd · ₹₹₹₹" distance="1.2 km"
              verdict="Take your parents. They’ll talk about it for months." verdictBy="Aditi vouched"
              occasions={["parents", "worth the drive", "group dinner"]}
            />
            <Receipt lines={TRAIL} label="Why you’re seeing this" />
          </div>
        </Section>

        <Section id="composer" title="Objects · Add a vouch (the ritual)" desc="Pick a stamp → if Vouched, one line + occasion. Try to post a vouch with nothing written — the integrity nudge guards it. Interactive.">
          <div className={s.spotStage}>
            <AddVouchComposer />
          </div>
        </Section>

        <Section id="inputs" title="Primitives · Inputs" desc="Search starts the add flow; the dashed composer field is 'the whole review'.">
          <div className={s.col} style={{ width: "min(440px, 100%)" }}>
            <SearchField placeholder="Search a place…" />
            <ComposerField placeholder="Why you’d send a friend here…" />
            <ComposerField value="Best bowl in the city. Get there at 6 sharp." />
          </div>
        </Section>

        <Section id="states" title="Primitives · Loading, empty & delight" desc="Skeletons (never spinners), empty states that never dead-end, and toasts that carry meaning.">
          <div className={s.cell}>
            <div className={s.cellLabel}>Loading — skeletons</div>
            <div className={s.objGrid}>
              <SkeletonCard />
              <div><SkeletonRow /><SkeletonRow /><SkeletonRow /></div>
            </div>
          </div>
          <div className={s.cell}>
            <div className={s.cellLabel}>Empty — never a dead end</div>
            <EmptyState title="Your map’s empty" body="You follow no one yet. Borrow a palate and watch it fill up." action={<Button variant="primary">Borrow a palate →</Button>} />
          </div>
          <div className={s.cell}>
            <div className={s.cellLabel}>Leader row &amp; toasts</div>
            <div className={s.col}>
              <div style={{ width: "min(440px, 100%)" }}>
                <LeaderRow num="01" name="Karavalli" meta="Coastal" tail="₹₹₹₹" />
                <LeaderRow num="02" name="Vidyarthi Bhavan" meta="Dosa" tail="₹" />
              </div>
              <Toast tone="success">This reached you through <b>Meera</b>.</Toast>
            </div>
          </div>
        </Section>

        <Section id="surfaces" title="Surfaces · the product, assembled from the kit" desc="Static stubs of the five MVP surfaces — built only from the components above. Open each (best viewed at phone width).">
          <div className={s.surfaceNav}>
            {SURFACES.map((su) => (
              <a key={su.href} href={su.href} className={s.surfaceLink}>{su.name} <span aria-hidden="true">→</span></a>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}
