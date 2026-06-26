import s from "./landing.module.css";
import { Reveal } from "./_reveal";

/* Hotlist — landing. A story told through the product (docs/DECISIONS.md D-009/D-010):
   you're already this person → same text every week → add/say-why/send →
   you keep these lists in your head → good company → claim your page.
   Editorial city-zine: cream paper + espresso bands, handwritten takes, mono stamps,
   personality accents. Sell joy + identity; the take is the value; status implied. */

type Place = { name: string; area: string; take: string };
type Guide = { ini: string; tint: string; name: string; handle: string; title: string; meta: string; sent: number; places: Place[]; note?: string };

const HERO = {
  name: "Maya R.", handle: "maya", title: "Maya's Bangalore", meta: "28 places", sent: 14,
  places: [
    { name: "Blue Tokai", area: "Koramangala", cat: "Coffee", take: "the cold brew that ruined all others. sit upstairs." },
    { name: "Toit", area: "Indiranagar", cat: "Beer", take: "weekday only. the toit weiss is the move." },
  ],
};

const COLLECTIONS = [
  { name: "Date spots I actually trust", accent: "--a-plum", count: 6, place: "Dali & Gala", take: "order something you can't pronounce." },
  { name: "Cafés I can sit in for 3 hours", accent: "--a-olive", count: 9, place: "Dyu Art Café", take: "garden seats. nobody rushes you." },
  { name: "Where I take out-of-town friends", accent: "--a-terracotta", count: 11, place: "Karavalli", take: "they'll bring it up for months." },
  { name: "Safe orders when the menu's a minefield", accent: "--a-ochre", count: 8, place: "Truffles", take: "the all-american. every single time." },
  { name: "Worth the 40-minute auto", accent: "--a-teal", count: 5, place: "Vidyarthi Bhavan", take: "before 9am or don't bother." },
  { name: "1am, no judgment", accent: "--a-brick", count: 7, place: "Empire", take: "ghee roast. obviously." },
  { name: "Won't embarrass me in front of the parents", accent: "--a-indigo", count: 6, place: "Koshy's", take: "old-school. never misses." },
];

const GUIDES: Guide[] = [
  { ini: "K", tint: "#7C8C5A", name: "Kabir M.", handle: "kabir", title: "First dates that actually work", meta: "9 places", sent: 31, places: [
    { name: "Dali & Gala", area: "Ulsoor", take: "order whatever sounds weird." },
    { name: "Naru", area: "Indiranagar", take: "book ahead. always worth it." },
  ], note: "this list is elite 🤌" },
  { ini: "A", tint: "#C98A3C", name: "Ananya S.", handle: "ananya", title: "1am in Bangalore", meta: "12 places", sent: 58, places: [
    { name: "Empire", area: "Indiranagar", take: "chicken ghee roast at 1am." },
    { name: "Shawarma Center", area: "Frazer Town", take: "the original. accept no copies." },
  ] },
  { ini: "D", tint: "#3E7C74", name: "Dev P.", handle: "dev", title: "Filter coffee, ranked", meta: "14 places", sent: 22, places: [
    { name: "Brahmin's", area: "Shankarpuram", take: "idli + that chutney. peak." },
    { name: "Vidyarthi Bhavan", area: "Basavanagudi", take: "before 9am, beat the queue." },
  ] },
  { ini: "M", tint: "#CB613A", name: "Maya R.", handle: "maya", title: "Maya's Bangalore", meta: "28 places", sent: 14, places: [
    { name: "Blue Tokai", area: "Koramangala", take: "the cold brew that ruined all others." },
    { name: "Airlines Hotel", area: "Lavelle Rd", take: "filter under the rain trees. by 8am." },
  ] },
  { ini: "R", tint: "#8E5A6B", name: "Rhea T.", handle: "rhea", title: "Goa, the non-touristy bits", meta: "18 places", sent: 47, places: [
    { name: "Bomra's", area: "Candolim", take: "burmese. book it, trust me." },
    { name: "Vinayak", area: "Assagao", take: "the fish thali. go hungry." },
  ], note: "literally my goa bible" },
  { ini: "J", tint: "#6E7F9A", name: "Arjun K.", handle: "arjun", title: "Where I take my parents", meta: "11 places", sent: 19, places: [
    { name: "Karavalli", area: "Residency Rd", take: "they'll talk about it for months." },
    { name: "Koshy's", area: "St Marks Rd", take: "chicken stew + appam, always." },
  ] },
  { ini: "S", tint: "#B0492F", name: "Sana V.", handle: "sana", title: "Cafés you can actually work from", meta: "16 places", sent: 36, places: [
    { name: "Third Wave", area: "Indiranagar", take: "plugs, quiet, no judgement." },
    { name: "Dyu Art Café", area: "Koramangala", take: "the garden seats. all day." },
  ] },
  { ini: "N", tint: "#C17A2B", name: "Nikhil B.", handle: "nikhil", title: "Craft beer crawl", meta: "8 places", sent: 12, places: [
    { name: "Toit", area: "Indiranagar", take: "start here. the toit weiss." },
    { name: "Geist", area: "Hennur", take: "the witbier genuinely slaps." },
  ] },
];

const MAP_TILE = "https://a.basemaps.cartocdn.com/light_all/12/2931/1899@2x.png";
const MAP_PINS = [{ top: "38%", left: "27%" }, { top: "29%", left: "59%" }, { top: "63%", left: "67%" }, { top: "47%", left: "82%" }];

function CityStamp() {
  return <span className={s.cityStamp} aria-hidden="true"><span>BENGALURU</span><span className={s.cityStampStar}>✦</span><span>EST · YOU</span></span>;
}

function HotlistCard({ g }: { g: Guide }) {
  return (
    <article className={s.hcard}>
      <div className={s.hcAccent} style={{ background: g.tint }} />
      {g.note && <span className={s.hcNote}>{g.note}</span>}
      <div className={s.hcHead}>
        <span className={s.hcAv} style={{ background: g.tint }}>{g.ini}</span>
        <span><span className={s.hcName}>{g.name}</span><span className={s.hcHandle}>@{g.handle}</span></span>
      </div>
      <h3 className={s.hcTitle}>{g.title}</h3>
      <p className={s.hcMeta}>{g.meta}</p>
      <div className={s.hcList}>
        {g.places.map((p) => (
          <div className={s.hcEntry} key={p.name}>
            <span className={s.hcPlace}>{p.name} <b>· {p.area}</b></span>
            <p className={s.hcTake}>{p.take}</p>
          </div>
        ))}
      </div>
      <div className={s.hcFoot}><span>hotlist.to/<b>{g.handle}</b></span><span className={s.hcSent}>sent {g.sent}×</span></div>
    </article>
  );
}

function HeroProduct() {
  return (
    <div className={s.product}>
      <div className={s.productBar}>
        <span className={s.productDots}><i /><i /><i /></span>
        <span className={s.productUrl}>hotlist.to/maya</span>
        <span className={s.productShare} aria-hidden="true">↗</span>
      </div>
      <div className={s.productMap} aria-hidden="true">
        <div className={s.productMapImg} style={{ backgroundImage: `url("${MAP_TILE}")` }} />
        <div className={s.productMapTint} />
        <div className={s.productMapWash} />
        {MAP_PINS.map((p, i) => (
          <span key={i} className={s.mapPin} style={{ top: p.top, left: p.left, animationDelay: `${0.25 + i * 0.08}s` }} />
        ))}
        <span className={`${s.mapPin} ${s.mapPinHi}`} style={{ top: "52%", left: "47%", animationDelay: "0.55s" }} />
        <span className={s.mapLabel} style={{ top: "52%", left: "47%" }}>Toit · weekday only</span>
      </div>
      <div className={s.productCurator}>
        <span className={s.productAv}>M</span>
        <span><span className={s.productName}>Maya&rsquo;s Bangalore</span><span className={s.productMeta}>28 places · a guide by Maya</span></span>
        <span className={s.productSent}>sent 14×</span>
      </div>
      <div className={s.productList}>
        {HERO.places.map((e) => (
          <div className={s.pEntry} key={e.name}>
            <div className={s.pEntryTop}>
              <span className={s.pEntryName}>{e.name}</span>
              <span className={s.pEntryArea}>{e.area}</span>
              <span className={s.pEntryCat}>{e.cat}</span>
            </div>
            <p className={s.pEntryTake}>{e.take}</p>
          </div>
        ))}
      </div>
      <div className={s.productFootRow}><span className={s.stamp}>updated 2d ago</span><CityStamp /></div>
    </div>
  );
}

export default function Landing() {
  const rowA = GUIDES.slice(0, 4);
  const rowB = GUIDES.slice(4, 8);
  return (
    <main>
      <header className={s.nav}>
        <div className={s.wrap}>
          <div className={s.navInner}>
            <span className={s.brand}><span className={s.brandDot} aria-hidden="true" />Hotlist</span>
            <nav className={s.navLinks}>
              <a href="#gallery" className={`${s.navLink} ${s.hideSm}`}>Examples</a>
              <a href="/new" className={`${s.btnPrimary} ${s.sm}`}>Make yours</a>
            </nav>
          </div>
        </div>
      </header>

      {/* BEAT 1 — HERO: you're already this person */}
      <section className={s.hero}>
        <div className={`${s.wrap} ${s.wrapWide}`}>
          <div className={s.heroGrid}>
            <div className={s.heroCopy}>
              <p className={`${s.stamp} ${s.heroEyebrow}`}>for the friend everyone asks</p>
              <h1 className={s.h1}>The link you send when someone asks <span className={s.em}>where to eat.</span></h1>
              <p className={s.sub}>Your spots, your takes, your name &mdash; one page. Stop retyping the same places in every group chat.</p>
              <div className={s.heroCta}>
                <a href="/new" className={s.btnPrimary}>Make yours &mdash; free <span aria-hidden="true">→</span></a>
                <a href="#examples" className={s.btnGhost}>see a real one ↓</a>
              </div>
              <p className={`${s.stamp} ${s.heroProof}`}>2 min · any phone · no app</p>
            </div>
            <div className={s.heroArt}>
              <span className={s.heroRing} aria-hidden="true" />
              <span className={s.heroSticky} aria-hidden="true">send me this one!!<br /><span>— your sister</span></span>
              <HeroProduct />
            </div>
          </div>
        </div>
      </section>

      {/* BEAT 2 — THE SEND: same text every week (espresso band) */}
      <section className={s.dmSec}>
        <div className={`${s.wrap} ${s.wrapWide}`}>
          <div className={s.dmGrid}>
            <Reveal className={s.dmCopy}>
              <p className={`${s.stamp} ${s.dmKicker}`}>the situation</p>
              <h2 className={s.dmTitle}>Same text. <span className={s.em}>Every week.</span></h2>
              <p className={s.dmSub}>You know the places. You just hate typing them out again. Hotlist is the link you send instead.</p>
              <p className={s.dmTag}>One link. Every time.</p>
            </Reveal>
            <Reveal className={s.dmChat}>
              <div className={`${s.dmB} ${s.dmIn}`} style={{ ["--i" as string]: 0 }}>moving to blr next month 🥹 where do i even start</div>
              <div className={`${s.dmB} ${s.dmIn}`} style={{ ["--i" as string]: 1 }}>date spot for friday?? something nice 🙏</div>
              <div className={`${s.dmB} ${s.dmIn}`} style={{ ["--i" as string]: 2 }}>3 days in your city. go.</div>
              <div className={s.dmUnfurl} style={{ ["--i" as string]: 3 }}>
                <div className={s.dmUnfurlMap} aria-hidden="true">
                  <div className={s.productMapImg} style={{ backgroundImage: `url("${MAP_TILE}")` }} />
                  <div className={s.productMapWash} />
                  <span className={`${s.mapPin} ${s.mapPinHi}`} style={{ top: "46%", left: "44%" }} />
                  <span className={s.mapPin} style={{ top: "62%", left: "66%" }} />
                  <span className={s.mapPin} style={{ top: "33%", left: "61%" }} />
                </div>
                <div className={s.dmUnfurlBody}>
                  <span className={s.dmUnfurlAv}>M</span>
                  <div><div className={s.dmUnfurlTitle}>Maya&rsquo;s Bangalore</div><div className={s.dmUnfurlMeta}>28 places · a guide by Maya</div></div>
                  <div className={s.dmUnfurlUrl}>hotlist.to/maya</div>
                </div>
              </div>
              <div className={s.dmReact} style={{ ["--i" as string]: 4 }}>ok saving this forever 🤍</div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* BEAT 3 — THE LOOP: add, say why, send */}
      <section className={s.loopSec}>
        <div className={`${s.wrap} ${s.wrapWide}`}>
          <Reveal>
            <div className={s.loopHead}>
              <p className={s.kicker}>the whole thing</p>
              <h2 className={`${s.h2} ${s.center}`}>Add a place. Say why. <span className={s.em}>Send the link.</span></h2>
              <p className={`${s.lead} ${s.center}`}>That&rsquo;s the product. The &ldquo;say why&rdquo; is the part that makes it yours.</p>
            </div>
          </Reveal>
          <Reveal className={s.loopFlow} delay={100}>
            <div className={s.loopStep}>
              <span className={`${s.stamp} ${s.loopNum}`}>01</span>
              <div className={`${s.loopCard} ${s.loopAdd}`}>
                <div className={s.loopSearch}><span aria-hidden="true">⌕</span> toit</div>
                <div className={s.loopResult}><span className={s.loopPin} aria-hidden="true" />Toit <span>· Indiranagar</span></div>
              </div>
              <p className={s.loopLabel}>Add your spots</p>
            </div>
            <span className={s.loopArrow} aria-hidden="true" />
            <div className={`${s.loopStep} ${s.loopStepHero}`}>
              <span className={`${s.stamp} ${s.loopNum}`}>02</span>
              <div className={`${s.loopCard} ${s.loopSay}`}>
                <p className={s.loopTakeLabel}>your take</p>
                <p className={s.loopTake}>weekday only. the toit weiss is the move &mdash; and sit upstairs.<span className={s.loopCaret} aria-hidden="true" /></p>
              </div>
              <p className={`${s.loopLabel} ${s.loopLabelHero}`}>Write your take</p>
            </div>
            <span className={s.loopArrow} aria-hidden="true" />
            <div className={s.loopStep}>
              <span className={`${s.stamp} ${s.loopNum}`}>03</span>
              <div className={`${s.loopCard} ${s.loopPage}`}>
                <div className={s.loopUrl}>hotlist.to/<b>maya</b></div>
                <div className={s.loopRows}><span /><span /><span /></div>
                <span className={`${s.stamp} ${s.loopLive}`}>● live</span>
              </div>
              <p className={s.loopLabel}>Get your page &amp; send it</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* BEAT 4 — TASTE IDENTITY: you already keep these lists in your head */}
      <section className={s.tasteSec}>
        <div className={`${s.wrap} ${s.wrapWide}`}>
          <Reveal>
            <div className={s.tasteHead}>
              <p className={s.kicker}>your taste, sorted</p>
              <h2 className={s.h2}>You already keep these lists <span className={s.em}>in your head.</span></h2>
              <p className={s.lead}>Hotlist just gives them a home &mdash; and a link.</p>
            </div>
          </Reveal>
          <Reveal className={s.tasteDeck} delay={100}>
            {COLLECTIONS.map((c, i) => (
              <div className={s.tasteTag} key={c.name} style={{ ["--tag" as string]: `var(${c.accent})`, ["--r" as string]: `${(i % 3) - 1}deg` }}>
                <div className={s.tasteTagTop}>
                  <span className={s.tasteName}>{c.name}</span>
                  <span className={`${s.stamp} ${s.tasteCount}`}>{c.count} spots</span>
                </div>
                <div className={s.tastePeek}>
                  <span className={s.tastePlace}>{c.place}</span>
                  <span className={s.tasteTake}>{c.take}</span>
                </div>
              </div>
            ))}
            <p className={s.tasteCloser}>Yours will sound like <em>you.</em><br />That&rsquo;s the point.</p>
          </Reveal>
        </div>
      </section>

      {/* BEAT 5 — GALLERY: you'd be in good company */}
      <section className={s.gallerySec} id="gallery">
        <div className={s.galleryHead} id="examples">
          <Reveal>
            <p className={s.kicker}>good company</p>
            <h2 className={`${s.h2} ${s.center}`}>Pages people actually send.</h2>
            <p className={`${s.lead} ${s.center}`}>From the filter-coffee purist to the 1am-biryani loyalist &mdash; everyone keeps a city only they know.</p>
          </Reveal>
        </div>
        <div className={s.gallery}>
          <div className={`${s.galRow} ${s.galRowA}`}>{[...rowA, ...rowA].map((g, i) => <HotlistCard key={`a${i}`} g={g} />)}</div>
          <div className={`${s.galRow} ${s.galRowB}`}>{[...rowB, ...rowB].map((g, i) => <HotlistCard key={`b${i}`} g={g} />)}</div>
        </div>
      </section>

      {/* BEAT 6 — FINAL CTA: claim your page (espresso band) */}
      <section className={s.claimSec}>
        <div className={`${s.wrap} ${s.wrapWide}`}>
          <Reveal>
            <p className={`${s.stamp} ${s.claimKicker}`}>your turn</p>
            <h2 className={s.claimTitle}>Someone&rsquo;s about to ask you <span className={s.em}>where to eat.</span></h2>
            <p className={s.claimSub}>Be ready with the link.</p>
            <div className={s.claimField}>
              <span className={s.claimUrl}>hotlist.to/</span><span className={s.claimHandle}>yourname</span><span className={s.claimCursor} aria-hidden="true" />
              <span className={`${s.stamp} ${s.claimOk}`}>✓ available</span>
            </div>
            <a href="/new" className={`${s.btnPrimary} ${s.claimBtn}`}>Claim your Hotlist <span aria-hidden="true">→</span></a>
            <p className={`${s.stamp} ${s.claimMeta}`}>free · two minutes · yours to keep</p>
          </Reveal>
        </div>
      </section>

      <footer className={s.footer}>
        <div className={s.wrap}>
          <div className={s.footInner}>
            <span className={s.brand}><span className={s.brandDot} aria-hidden="true" />Hotlist</span>
            <span className={s.stamp}>made with ♥ in Bangalore</span>
          </div>
        </div>
      </footer>

      <a href="/new" className={s.stickyCta}>Make yours — free <span aria-hidden="true">→</span></a>
    </main>
  );
}
