"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import styles from "./landing.module.css";

/* ===========================================================================
   VOUCH — Landing. Identity: "THE LEDGER", re-pointed to the SHARE wedge.
   Spine: you're the friend with the spots → today they're trapped in a Notes
   file → a vouch is one place / one line / your name → a guide is the thing you
   send (one link, no app) → built for the friend who knows AND the one who asks.
   No slot machine, no Konami, no waitlist — delight comes from the product
   itself (a real guide you can open, a link that actually copies).
   Type: Bricolage Grotesque + Space Mono + Space Grotesk. Dark + saffron.
   ========================================================================= */

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap";

function prefersReduced() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/* ---------- reveal-on-scroll (visible by default; SSR / no-JS safe) ------ */
function Reveal({
  children, as: Tag = "div", className = "", delay = 0, id,
}: {
  children: ReactNode; as?: ElementType; className?: string; delay?: number; id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced() || typeof IntersectionObserver === "undefined") return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) return;
    setHidden(true);
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setHidden(false); io.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} id={id}
      className={`${styles.reveal} ${hidden ? styles.revealHidden : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}

/* ---------- dotted leader row ------------------------------------------- */
function Row({ num, name, meta, tail }: {
  num?: string; name: ReactNode; meta?: string; tail?: ReactNode;
}) {
  return (
    <div className={styles.row}>
      {num && <span className={styles.rowNum}>{num}</span>}
      <span className={styles.rowName}>{name}</span>
      <span className={styles.rowDots} aria-hidden="true" />
      {meta && <span className={styles.rowMeta}>{meta}</span>}
      {tail && <span className={styles.rowTail}>{tail}</span>}
    </div>
  );
}

function Wordmark() {
  return (
    <span className={styles.brand}>
      <svg className={styles.brandMark} viewBox="0 0 26 26" fill="none" aria-hidden="true">
        <rect x="0.7" y="0.7" width="24.6" height="24.6" rx="4" stroke="currentColor" strokeWidth="1.3" opacity="0.5" />
        <path d="M7 8.5l6 9 6-9" stroke="#f6a82b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Vouch
    </span>
  );
}

/* copy-to-clipboard with a short "copied" confirmation (no confetti) */
function useCopied(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  function copy(text: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      if (t.current) clearTimeout(t.current);
      t.current = setTimeout(() => setCopied(false), 1900);
    }).catch(() => {});
  }
  useEffect(() => () => { if (t.current) clearTimeout(t.current); }, []);
  return [copied, copy];
}

/* ---------- data: real Bengaluru guides --------------------------------- */
type ListItem = { name: string; tags: string; note?: string };
type VList = {
  title: string; by: string; ini: string; handle: string; slug: string;
  note: string; anchor?: string; items: ListItem[];
};
const LISTS: Record<string, VList> = {
  parents: {
    title: "Where I take my parents", by: "Aditi", ini: "AS", handle: "aditi", slug: "parents",
    note: "no surprises, all delight", anchor: "Safe bets · no surprises",
    items: [
      { name: "Karavalli", tags: "Coastal · Residency Rd · ₹₹₹₹", note: "They’ll talk about it for months." },
      { name: "Vidyarthi Bhavan", tags: "Dosa · Basavanagudi · ₹", note: "Go before 9am, beat the queue." },
      { name: "Koshy’s", tags: "Old-school · St Marks Rd · ₹₹", note: "Chicken stew + appam, always." },
      { name: "MTR", tags: "Tiffin · Lalbagh · ₹", note: "The rava idli origin story." },
      { name: "Sodabottleopenerwala", tags: "Parsi · Lavelle Rd · ₹₹₹", note: "Berry pulao, no debate." },
      { name: "Nagarjuna", tags: "Andhra · Residency Rd · ₹₹", note: "For when they want a little spice." },
    ],
  },
  midnight: {
    title: "Open past midnight", by: "Rinkesh", ini: "RG", handle: "rinkesh", slug: "open-past-midnight",
    note: "for when the night isn’t done", anchor: "After 11pm · still worth it",
    items: [
      { name: "Empire", tags: "Kebabs · Indiranagar · ₹₹", note: "Chicken ghee roast at 1am." },
      { name: "Shawarma Center", tags: "Rolls · Frazer Town · ₹", note: "The original. Accept no copies." },
      { name: "Hotel Savoury", tags: "Rumali · Mosque Rd · ₹₹", note: "Frazer Town’s late shift." },
      { name: "Albert Bakery", tags: "Bakes · Frazer Town · ₹", note: "Mutton samosas, warm." },
      { name: "CTR overflow", tags: "Snacks · Malleshwaram · ₹" },
      { name: "Ranganna Military Hotel", tags: "Non-veg · Jayanagar · ₹₹" },
    ],
  },
  filter: {
    title: "Filter coffee, ranked", by: "Meera", ini: "MK", handle: "meera", slug: "filter-coffee-ranked",
    note: "a genuinely serious investigation", anchor: "Serious only · no chains",
    items: [
      { name: "Brahmin’s Coffee Bar", tags: "Filter · Shankarpuram · ₹", note: "Idli + that chutney. Peak." },
      { name: "Airlines Hotel", tags: "Filter · Lavelle Rd · ₹", note: "Coffee under the trees." },
      { name: "Vidyarthi Bhavan", tags: "Filter · Basavanagudi · ₹", note: "Order the coffee after the benne dosa." },
      { name: "Asha Tiffins", tags: "Filter · Malleshwaram · ₹", note: "Tiny, perfect. Get there when it rains." },
      { name: "CTR · Shri Sagar", tags: "Filter · Malleshwaram · ₹", note: "Benne dosa on the side." },
      { name: "Veena Stores", tags: "Filter · Malleshwaram · ₹" },
      { name: "Maddur Tiffanys", tags: "Filter · worth the drive · ₹" },
    ],
  },
  drive: {
    title: "Worth the drive", by: "Rinkesh", ini: "RG", handle: "rinkesh", slug: "worth-the-drive",
    note: "edge-of-town pilgrimages",
    items: [
      { name: "Maddur Tiffanys", tags: "Maddur · ₹", note: "Maddur vada, mandatory stop." },
      { name: "Kamat Lokaruchi", tags: "Ramanagara · ₹₹", note: "Highway thali done right." },
      { name: "Shivaji Military Hotel", tags: "Donne biryani · ₹₹", note: "Get there by noon or miss it." },
      { name: "Taaza Thindi", tags: "Tiffin · Banashankari · ₹" },
      { name: "Anna Kuteera", tags: "South Indian · ₹" },
    ],
  },
  wine: {
    title: "Natural wine spots", by: "Meera", ini: "MK", handle: "meera", slug: "natural-wine",
    note: "low-intervention, high-vibe",
    items: [
      { name: "Soka", tags: "Small plates · Indiranagar · ₹₹₹", note: "Get the negroni, stay for the plates." },
      { name: "Naru Noodle Bar", tags: "Wine + ramen · Indiranagar · ₹₹₹" },
      { name: "Bar Spirit Forward", tags: "Cocktails · Indiranagar · ₹₹₹" },
      { name: "Dali & Gala", tags: "Wine bar · Ulsoor · ₹₹₹" },
      { name: "The Permit Room", tags: "Tipple · MG Road · ₹₹₹" },
    ],
  },
  biryani: {
    title: "Best biryani, settled", by: "Aditi", ini: "AS", handle: "aditi", slug: "best-biryani",
    note: "the debate ends here",
    items: [
      { name: "Shivaji Military Hotel", tags: "Donne · Jayanagar · ₹₹", note: "Mutton donne, the GOAT." },
      { name: "Meghana Foods", tags: "Andhra · Residency Rd · ₹₹", note: "For the boneless crowd." },
      { name: "Hotel Rahhams", tags: "Frazer Town · ₹₹", note: "Old-Bangalore biryani." },
      { name: "Ambur Star", tags: "Ambur · Koramangala · ₹₹" },
      { name: "Savaari", tags: "Hyderabadi · ₹₹₹" },
    ],
  },
};
const HOME_LISTS = ["parents", "midnight", "filter"];

/* ---------- HERO: the published guide (the thing you send) --------------- */
function HeroGuide() {
  const g = LISTS.parents;
  const url = `vouch.in/${g.handle}/${g.slug}`;
  const [copied, copy] = useCopied();
  return (
    <div className={styles.heroGuide}>
      <span className={styles.hgFloat}>
        <div className={styles.hgTop}>
          <span className={styles.hgBy}>
            <span className={styles.hgAvatar}>{g.ini}</span>
            a guide by <b>{g.by}</b>
          </span>
          <span className={styles.hgStamp}>Bengaluru</span>
        </div>
        <h3 className={styles.hgTitle}>{g.title}</h3>
        <span className={styles.hgMeta}>{g.items.length} spots · {g.note}</span>
        <ol className={styles.hgRows}>
          {g.items.slice(0, 4).map((it, i) => (
            <li className={styles.hgRow} key={it.name}>
              <span className={styles.hgNum}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.hgBody}>
                <span className={styles.hgName}>{it.name}</span>
                {it.note && <span className={styles.hgNote}>&ldquo;{it.note}&rdquo;</span>}
              </span>
            </li>
          ))}
          <li className={styles.hgMore}>+ {g.items.length - 4} more</li>
        </ol>
        <div className={styles.hgShare}>
          <span className={styles.hgUrl}><i aria-hidden="true">🔗</i>{url}</span>
          <button type="button" className={styles.hgCopy}
            onClick={() => copy(`https://${url}`)} aria-label="Copy this guide’s link">
            {copied ? "Copied ✓" : "Copy link"}
          </button>
        </div>
      </span>
    </div>
  );
}

/* ---------- PROBLEM: the "before" — taste trapped in a notes file -------- */
function NotesCard() {
  return (
    <div className={styles.notes} aria-hidden="true">
      <div className={styles.notesBar}>
        <span className={styles.notesDots}><i /><i /><i /></span>
        <span className={styles.notesName}>blr-food-FINAL-v3.txt</span>
      </div>
      <div className={styles.notesBody}>
        <span className={styles.notesLine}>naru – ramen, indiranagar?? (closed mon)</span>
        <span className={`${styles.notesLine} ${styles.notesStrike}`}>that cafe near work — forgot name</span>
        <span className={styles.notesLine}>EMPIRE for late night 🌙</span>
        <span className={styles.notesLine}>maps pin → “new list (47)”</span>
        <span className={`${styles.notesLine} ${styles.notesStrike}`}>screenshot_2024-11-08.png</span>
        <span className={styles.notesLine}>vidyarthi (parents loved it)</span>
        <span className={styles.notesLine}>ask aditi for the coffee one</span>
      </div>
      <span className={styles.notesMeta}>last edited 7 months ago · sent to 4 people · none of it links</span>
    </div>
  );
}

/* ---------- the three stamps -------------------------------------------- */
const STATES = [
  { name: "Want to go", tone: styles.tWant, desc: "Saved for the night you’re nearby." },
  { name: "Been", tone: styles.tBeen, desc: "Logged & dated. Your diary of the city." },
  { name: "Vouched", tone: styles.tVouch, hi: true, desc: "You’d stake your name on it." },
];

/* ---------- live "Bengaluru is publishing" pulse ------------------------ */
const PEOPLE = ["Aditi", "Rinkesh", "Meera", "Karan", "Sneha", "Dev", "Priya", "Arjun", "Nikhil", "Tara", "Ishaan", "Ananya"];
const ACTS: { e: string; t: (who: string) => string }[] = [
  { e: "📓", t: (w) => `${w} published a new guide` },
  { e: "✍️", t: (w) => `${w} vouched for a spot just now` },
  { e: "↗", t: (w) => `${w}’s guide got sent again` },
];
const NEIGHBORHOODS = ["Indiranagar", "Koramangala", "Jayanagar", "Frazer Town", "Malleshwaram", "HSR Layout"];
const PULSE_FACTS: { e: string; label: string; t: string }[] = [
  { e: "🏆", label: "Top guide", t: "“Where I take my parents” · sent 312 times" },
  { e: "📈", label: "Picking up", t: "“Open past midnight” — 9 new saves this week" },
  { e: "☕", label: "Did you know", t: "1 in 3 Bengaluru vouches mention filter coffee" },
  { e: "🔗", label: "Did you know", t: "the average guide gets sent 14 times" },
  { e: "🌙", label: "Did you know", t: "40% of late-night vouches are near Indiranagar" },
  { e: "📓", label: "This week", t: "287 guides shared across Bengaluru" },
];
type PulseItem =
  | { kind: "act"; e: string; name: string; t: string; ago: string }
  | { kind: "fact"; e: string; label: string; t: string };

function nextPulse(prevText: string): PulseItem {
  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
  for (let g = 0; g < 8; g++) {
    const r = Math.random();
    let item: PulseItem;
    if (r < 0.5) {
      const who = pick(PEOPLE); const act = pick(ACTS);
      item = { kind: "act", e: act.e, name: who, t: act.t(who).replace(who, "").trim(), ago: "just now" };
    } else if (r < 0.6) {
      item = { kind: "fact", e: "👋", label: "Just joined", t: `${pick(PEOPLE)} from ${pick(NEIGHBORHOODS)}` };
    } else {
      const f = pick(PULSE_FACTS);
      item = { kind: "fact", e: f.e, label: f.label, t: f.t };
    }
    if (item.t !== prevText) return item;
  }
  return { kind: "fact", e: "🍽️", label: "Did you know", t: "Bengaluru runs on filter coffee and faith" };
}

function LivePulse() {
  const [item, setItem] = useState<PulseItem>({ kind: "act", e: "📓", name: "Sneha", t: "published a new guide", ago: "just now" });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (prefersReduced()) return;
    let to: ReturnType<typeof setTimeout>;
    let prevText = "published a new guide";
    const schedule = () => {
      to = setTimeout(() => {
        const it = nextPulse(prevText);
        prevText = it.t;
        setItem(it);
        setTick((n) => n + 1);
        schedule();
      }, 5500 + Math.random() * 4200);
    };
    schedule();
    return () => clearTimeout(to);
  }, []);
  return (
    <div className={styles.pulse}>
      <span className={styles.pulseLive}><i className={styles.pulseDot} /> Live in Bengaluru</span>
      <span className={styles.pulseLine} key={tick}>
        <span className={styles.pulseEmoji} aria-hidden="true">{item.e}</span>
        <span className={styles.pulseText}>
          {item.kind === "act" ? (
            <><b>{item.name}</b> {item.t}<span className={styles.pulseAgo}> · {item.ago}</span></>
          ) : (
            <><span className={styles.pulseTag}>{item.label}</span> {item.t}</>
          )}
        </span>
      </span>
    </div>
  );
}

/* ---------- shared modal shell (scroll-lock · esc · focus-trap) -------- */
function Modal({ open, onClose, label, children }: {
  open: boolean; onClose: () => void; label: string; children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const prevFocus = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => ref.current?.querySelector<HTMLElement>("button, input, a[href]")?.focus(), 40);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      prevFocus?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className={styles.modalScrim} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} className={styles.modal} role="dialog" aria-modal="true" aria-label={label}>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        {children}
      </div>
    </div>
  );
}

/* ---------- guide detail (opens the full guide) ------------------------- */
function GuideModal({ list, onClose }: { list: VList | null; onClose: () => void }) {
  const [copied, copy] = useCopied();
  return (
    <Modal open={!!list} onClose={onClose} label={list ? list.title : "Guide"}>
      {list && (
        <>
          <div className={styles.modalHead}>
            <span className={styles.modalByLine}>
              <span className={styles.modalAvatar}>{list.ini}</span>
              a guide by <b>{list.by}</b>
            </span>
            <h3 className={styles.modalTitle}>{list.title}</h3>
            <span className={styles.modalMeta}>{list.items.length} spots · {list.note}</span>
          </div>
          <div className={styles.modalList}>
            {list.items.map((it, i) => (
              <div className={styles.modalRow} key={it.name}>
                <span className={styles.modalNum}>{String(i + 1).padStart(2, "0")}</span>
                <div className={styles.modalRowBody}>
                  <span className={styles.modalPlace}>{it.name}</span>
                  <span className={styles.modalTags}>{it.tags}</span>
                  {it.note && <span className={styles.modalNote}>&ldquo;{it.note}&rdquo;</span>}
                </div>
                <span className={styles.modalSave} aria-hidden="true">＋</span>
              </div>
            ))}
          </div>
          <div className={styles.modalFoot}>
            <span>This is what your friend opens — <b>no app, no login.</b></span>
            <button type="button" className={styles.modalCta}
              onClick={() => copy(`https://vouch.in/${list.handle}/${list.slug}`)}>
              {copied ? "Link copied ✓" : "Copy the link ↗"}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ---------- open a real guide (the creator's surface, browsable) -------- */
const CREATORS: Record<string, { ini: string; handle: string; line: string; guides: string[] }> = {
  Aditi: { ini: "AS", handle: "@aditi", line: "old-Bangalore loyalist", guides: ["parents", "biryani"] },
  Rinkesh: { ini: "RG", handle: "@rinkesh", line: "lives after 11pm", guides: ["midnight", "drive"] },
  Meera: { ini: "MK", handle: "@meera", line: "filter coffee fundamentalist", guides: ["filter", "wine"] },
};
function OpenGuides({ onOpen }: { onOpen: (id: string) => void }) {
  const [who, setWho] = useState("Aditi");
  const p = CREATORS[who];
  return (
    <div className={styles.persona}>
      <span className={styles.personaTag}>The friend with the spots</span>
      <div className={styles.borrowTabs} role="tablist" aria-label="Open a creator’s guides">
        {Object.keys(CREATORS).map((k) => (
          <button key={k} type="button" role="tab" aria-selected={k === who}
            className={`${styles.borrowTab} ${k === who ? styles.borrowTabOn : ""}`}
            onClick={() => setWho(k)}>{k}</button>
        ))}
      </div>
      <div className={styles.borrowBody} key={who}>
        <div className={styles.pfHead}>
          <span className={styles.pfAvatar}>{p.ini}</span>
          <span>
            <span className={styles.pfName}>{who}</span>
            <span className={styles.pfMeta}>{p.handle} · {p.line}</span>
          </span>
        </div>
        <div className={styles.pfLists}>
          {p.guides.map((id) => {
            const l = LISTS[id];
            return (
              <button key={id} type="button" className={styles.pfList} onClick={() => onOpen(id)}>
                <span className={styles.pfListName}>{l.title}</span>
                <b>{String(l.items.length).padStart(2, "0")}</b>
                <span className={styles.pfListArrow} aria-hidden="true">→</span>
              </button>
            );
          })}
        </div>
      </div>
      <p className={styles.personaCap}>Open one — this is exactly what lands when someone sends you their link.</p>
    </div>
  );
}

/* ======================================================================== */
export default function VouchLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [openList, setOpenList] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (prefersReduced()) return;
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => { document.documentElement.style.scrollBehavior = prev; };
  }, []);

  return (
    <>
      <link rel="stylesheet" href={FONTS_HREF} />

      <div className={styles.page}>
        <span className={styles.grain} aria-hidden="true" />

        <GuideModal list={openList ? LISTS[openList] : null} onClose={() => setOpenList(null)} />

        {/* ---------- TICKER ---------- */}
        <div className={styles.ticker} aria-hidden="true">
          <div className={styles.tickerTrack}>
            {Array.from({ length: 2 }).map((_, k) => (
              <span className={styles.tickerSeq} key={k}>
                <span>Vouch · Bengaluru</span><span className={styles.tDot} />
                <span>make your own city guide</span><span className={styles.tDot} />
                <span>the spots you’d actually send</span><span className={styles.tDot} />
                <span>one link · no app · no login</span><span className={styles.tDot} />
                <span>your name on every pick</span><span className={styles.tDot} />
                <span>no star averages, ever</span><span className={styles.tDot} />
              </span>
            ))}
          </div>
        </div>

        {/* ---------- NAV ---------- */}
        <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
          <div className={styles.wrap}>
            <div className={styles.navInner}>
              <a href="#top" className={styles.brandLink}><Wordmark /></a>
              <nav className={styles.navLinks}>
                <a href="#guides" className={styles.navLink}>Guides</a>
                <a href="#how" className={styles.navLink}>How it works</a>
                <a href="/guides" className={styles.navBtn}>Start your guide <span aria-hidden="true">→</span></a>
              </nav>
            </div>
          </div>
        </header>

        <main id="top">
          {/* ---------- HERO ---------- */}
          <section className={styles.hero}>
            <div className={styles.heroGlow} aria-hidden="true" />
            <div className={styles.wrap}>
              <div className={styles.heroGrid}>
                <div className={styles.heroText}>
                  <span className={styles.heroKicker}>For the friend everyone asks</span>
                  <h1 className={styles.h1}>
                    Stop gatekeeping<br />your <span className={styles.hlWord}>spots</span>.
                  </h1>
                  <p className={styles.heroSub}>
                    You&rsquo;re the one people text for a recommendation. Vouch gives that a
                    home — the places you&rsquo;d actually send, with <b>your one-line takes
                    and your name on them</b>, in a guide you share with a single link.
                  </p>
                  <div className={styles.heroCtas}>
                    <a href="/guides" className={styles.btnPrimary}>Start your guide <span aria-hidden="true">→</span></a>
                    <a href="#guides" className={styles.btnGhost}>See a real one <span aria-hidden="true">↓</span></a>
                  </div>
                  <p className={styles.heroTrust}>// free · no app to download · your name on every pick</p>
                </div>
                <div className={styles.heroAside}><HeroGuide /></div>
              </div>
            </div>
          </section>

          {/* ---------- 01 — THE PROBLEM ---------- */}
          <section className={styles.section} id="problem">
            <div className={styles.wrap}>
              <div className={styles.block}>
                <Reveal className={styles.rail}>
                  <span className={styles.railKicker}>01 / The problem</span>
                  <span className={styles.idx}>01</span>
                </Reveal>
                <div className={styles.blockBody}>
                  <Reveal as="h2" className={styles.h2}>
                    Your taste deserves better than a <span className={styles.u}>Notes file.</span>
                  </Reveal>
                  <div className={styles.problemGrid}>
                    <div>
                      <Reveal as="p" className={styles.lede}>
                        Right now your best spots are scattered across a note called
                        <b> blr-food-FINAL-v3</b>, a dozen screenshots, and a Maps list you
                        can&rsquo;t really share. You&rsquo;re the one everyone asks — and you&rsquo;re
                        stuck copy-pasting the same five places into every group chat.
                      </Reveal>
                      <Reveal as="p" className={styles.problemPunch} delay={60}>
                        That&rsquo;s not a guide. That&rsquo;s a <em>hostage situation.</em>
                        <span className={styles.problemTurn}>Vouch is where it finally goes.</span>
                      </Reveal>
                    </div>
                    <Reveal className={styles.notesWrap} delay={80}>
                      <NotesCard />
                    </Reveal>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------- 02 — THE UNIT (vouch composer + stamps) ---------- */}
          <section className={styles.section} id="how">
            <div className={styles.wrap}>
              <div className={styles.block}>
                <Reveal className={styles.rail}>
                  <span className={styles.railKicker}>02 / The unit</span>
                  <span className={styles.idx}>02</span>
                </Reveal>
                <div className={styles.blockBody}>
                  <Reveal as="h2" className={styles.h2}>
                    A vouch is one place, one line, <span className={styles.u}>your name.</span>
                  </Reveal>
                  <Reveal as="p" className={styles.lede} delay={40}>
                    No stars. No paragraphs. The way you&rsquo;d actually text it — except it
                    counts, because your name is on it.
                  </Reveal>
                  <div className={styles.vouchSplit}>
                    <Reveal className={styles.composer} delay={60}>
                      <div className={styles.composerHead}>
                        <span className={styles.composerAvatar}>RG</span>
                        <span>You&rsquo;re vouching for…</span>
                      </div>
                      <div className={styles.composerPlace}>
                        Naru Noodle Bar
                        <span className={styles.composerTags}>Ramen · Indiranagar · ₹₹₹</span>
                      </div>
                      <div className={styles.composerField}>
                        Best bowl in the city. Get there at 6 sharp.<span className={styles.caret} />
                      </div>
                      <div className={styles.composerFoot}>
                        <span className={styles.composerHint}>one line — that&rsquo;s the whole review</span>
                        <span className={styles.composerPost}>Post vouch ↵</span>
                      </div>
                    </Reveal>
                    <div className={styles.stampsCol}>
                      {STATES.map((s, k) => (
                        <Reveal key={s.name} className={`${styles.stampRow} ${s.hi ? styles.stampRowHi : ""}`} delay={120 + k * 70}>
                          <span className={`${styles.stampDot} ${s.tone}`} />
                          <span className={styles.stampName}>{s.name}</span>
                          <span className={styles.stampDesc}>{s.desc}</span>
                        </Reveal>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------- 03 — THE ARTIFACT (the guide you send) ---------- */}
          <section className={styles.section} id="guides">
            <div className={styles.wrap}>
              <div className={styles.block}>
                <Reveal className={styles.rail}>
                  <span className={styles.railKicker}>03 / The artifact</span>
                  <span className={styles.idx}>03</span>
                </Reveal>
                <div className={styles.blockBody}>
                  <Reveal as="h2" className={styles.h2}>
                    Your guide is the thing you <span className={styles.u}>send.</span>
                  </Reveal>
                  <Reveal as="p" className={styles.lede} delay={40}>
                    Group your vouches into a guide — &ldquo;where I take my parents&rdquo;,
                    &ldquo;open past midnight&rdquo;, &ldquo;filter coffee, ranked&rdquo;. It gets a
                    link. The link opens for anyone — no app, no login — and looks like you
                    made it on purpose. <b>Tap one:</b>
                  </Reveal>
                  <div className={styles.menus}>
                    {HOME_LISTS.map((id, i) => {
                      const m = LISTS[id];
                      return (
                        <Reveal key={id} delay={i * 70}>
                          <button type="button" className={styles.menu} onClick={() => setOpenList(id)}>
                            <div className={styles.menuCurator}>
                              <span className={styles.menuCuratorAvatar}>{m.ini}</span>
                              <span className={styles.menuCuratorText}>a guide by <b>{m.by}</b></span>
                            </div>
                            <div className={styles.menuHead}>
                              {m.anchor && <span className={styles.menuAnchor}>{m.anchor}</span>}
                              <h3 className={styles.menuTitle}>{m.title}</h3>
                              <span className={styles.menuMeta}>{m.items.length} spots · {m.note}</span>
                            </div>
                            <ol className={styles.menuRows}>
                              {m.items.slice(0, 3).map((it, j) => (
                                <li className={styles.menuRow} key={it.name}>
                                  <span className={styles.menuRowNum}>{String(j + 1).padStart(2, "0")}</span>
                                  <span className={styles.menuRowBody}>
                                    <span className={styles.menuRowName}>{it.name}</span>
                                    {it.note && <span className={styles.menuRowNote}>&ldquo;{it.note}&rdquo;</span>}
                                  </span>
                                </li>
                              ))}
                            </ol>
                            <div className={styles.menuFoot}>
                              <span className={styles.menuViewCount}>{m.items.length} spots</span>
                              <span className={styles.menuView}>Open the guide →</span>
                            </div>
                          </button>
                        </Reveal>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------- 04 — FOR WHOM ---------- */}
          <section className={styles.section} id="who">
            <div className={styles.wrap}>
              <div className={styles.block}>
                <Reveal className={styles.rail}>
                  <span className={styles.railKicker}>04 / For whom</span>
                  <span className={styles.idx}>04</span>
                </Reveal>
                <div className={styles.blockBody}>
                  <Reveal as="h2" className={styles.h2}>
                    For the friend who always knows. <span className={styles.u}>And everyone who keeps asking.</span>
                  </Reveal>
                  <div className={styles.who}>
                    <Reveal><OpenGuides onOpen={setOpenList} /></Reveal>
                    <Reveal className={styles.persona} delay={80}>
                      <span className={styles.personaTag}>The one always asking</span>
                      <div className={styles.pfHead}>
                        <span className={styles.pfFollowing} aria-hidden="true">
                          <i>RG</i><i>AS</i><i>MK</i><i>+3</i>
                        </span>
                        <span className={styles.pfMeta}>follows 6 people they actually trust</span>
                      </div>
                      <div className={styles.pfSurfaced}>
                        <Row name="Naru Noodle Bar" meta="vouched · Rinkesh" />
                      </div>
                      <p className={styles.personaCap}>
                        Skip the 4.1&#9733; averages. Open a guide from someone you believe.
                      </p>
                    </Reveal>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* ---------- CTA ---------- */}
        <section className={styles.cta} id="start">
          <div className={styles.wrap}>
            <LivePulse />
            <Reveal className={styles.stub}>
              <div className={styles.stubMain}>
                <span className={styles.stubKicker}>Bengaluru, first</span>
                <h2 className={styles.stubTitle}>Put your spots on the map.</h2>
                <p className={styles.stubSub}>
                  Start your guide free. Share it with one link. Your name&rsquo;s on every
                  pick — <b>no stars, no algorithm, no strangers.</b>
                </p>
                <a href="/guides" className={styles.stubCta}>Start your guide <span aria-hidden="true">→</span></a>
              </div>
              <div className={styles.stubEnd} aria-hidden="true">
                <span className={styles.stubEndText}>Vouch</span>
                <span className={styles.stubEndNo}>NO. 001</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- FOOTER ---------- */}
        <footer className={styles.footer}>
          <div className={styles.wrap}>
            <div className={styles.footTop}>
              <div>
                <span className={styles.footBrand}><Wordmark /></span>
                <p className={styles.footLine}>Give your taste a home.</p>
              </div>
              <a href="/guides" className={styles.footCta}>Start your guide <span aria-hidden="true">→</span></a>
            </div>
            <div className={styles.footBottom}>
              <span>© 2026 Vouch · Bengaluru</span>
              <span>the spots you&rsquo;d actually send</span>
              <span>no star averages, ever</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
