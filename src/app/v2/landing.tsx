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
   VOUCH — Landing. Identity: "THE LEDGER" + a real "decide for me" slot machine.
   Hero = a web slot machine that spins through trusted vouches and lands on one
   (with a JACKPOT, a share-to-clipboard, a live spin counter, a time-aware
   greeting). §01 = the group-chat death spiral everyone has lived.
   Easter eggs: emoji confetti on signup + jackpot, Konami "secret menu",
   click-to-cycle name in the headline.
   Type: Bricolage Grotesque + Space Mono + Space Grotesk. Dark + saffron.
   Wire `submitInvite` to /api/waitlist (Supabase) when the backend is ready.
   ========================================================================= */

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FOOD = ["🍜", "🍕", "☕", "🥘", "🍷", "🌮", "🍣", "🧇", "🍛", "🥟"];

function prefersReduced() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/* burst of food emoji from a point — pure WAAPI, self-cleaning */
function burst(x: number, y: number, count = 16) {
  if (typeof document === "undefined" || prefersReduced()) return;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.textContent = FOOD[Math.floor(Math.random() * FOOD.length)];
    s.style.cssText =
      `position:fixed;left:${x}px;top:${y}px;font-size:${16 + Math.random() * 18}px;` +
      `pointer-events:none;z-index:9999;will-change:transform,opacity;`;
    document.body.appendChild(s);
    const dx = (Math.random() - 0.5) * 300;
    const dy = -130 - Math.random() * 210;
    const rot = (Math.random() - 0.5) * 240;
    s.animate(
      [
        { transform: "translate(-50%,-50%) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) rotate(${rot}deg)`, opacity: 1, offset: 0.65 },
        { transform: `translate(${dx * 1.15}px,${dy + 400}px) rotate(${rot * 1.4}deg)`, opacity: 0 },
      ],
      { duration: 1500 + Math.random() * 700, easing: "cubic-bezier(.2,.7,.3,1)" }
    ).onfinish = () => s.remove();
  }
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

/* dotted leader row */
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

/* ---------- sound + haptics (subtle, only after a user gesture) --------- */
let audioCtx: AudioContext | null = null;
function tone(freq: number, dur: number, type: OscillatorType = "sine", gain = 0.04) {
  if (typeof window === "undefined" || prefersReduced()) return;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(audioCtx.destination);
    const t = audioCtx.currentTime;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur);
  } catch { /* audio unavailable — silent */ }
}
const clickTick = () => tone(360, 0.025, "square", 0.016);
function chime() { tone(680, 0.12, "sine", 0.05); window.setTimeout(() => tone(1020, 0.16, "sine", 0.04), 95); }
function haptic(p: number | number[]) { try { navigator.vibrate?.(p); } catch { /* no haptics */ } }

/* ---------- the slot machine: time-aware "decide for me" ----------------- */
const SLOT = [
  { name: "Naru Noodle Bar", tags: "Ramen · Indiranagar · ₹₹₹", by: "Rinkesh", ini: "RG", note: "Best bowl in the city. Get there at 6 sharp." },
  { name: "Vidyarthi Bhavan", tags: "Dosa · Basavanagudi · ₹", by: "Aditi", ini: "AS", note: "The crisp-dosa benchmark. Go before 9am." },
  { name: "Karavalli", tags: "Coastal · Residency Rd · ₹₹₹₹", by: "Meera", ini: "MK", note: "Take your parents. They'll talk about it for months." },
  { name: "Empire", tags: "Kebabs · Indiranagar · ₹₹", by: "Rinkesh", ini: "RG", note: "Midnight hunger, fully solved." },
  { name: "Brahmin's Coffee Bar", tags: "Filter · Shankarpuram · ₹", by: "Meera", ini: "MK", note: "Idli, kara bath, filter. A morning religion." },
  { name: "CTR · Shri Sagar", tags: "Benne Dosa · Malleshwaram · ₹", by: "Aditi", ini: "AS", note: "Benne masala dosa. Don't even debate it." },
  { name: "Toit", tags: "Brewpub · Indiranagar · ₹₹₹", by: "Rinkesh", ini: "RG", note: "Tintin Toit + the wood-fired pizzas. Go early, it fills up." },
  { name: "Airlines Hotel", tags: "Filter coffee · Lavelle Rd · ₹", by: "Aditi", ini: "AS", note: "Coffee under the trees. Order the benne dosa too." },
  { name: "Truffles", tags: "Burgers · St Marks Rd · ₹₹", by: "Meera", ini: "MK", note: "The mutton burger. Worth the queue, always a queue." },
  { name: "Nagarjuna", tags: "Andhra meals · Residency Rd · ₹₹", by: "Rinkesh", ini: "RG", note: "The Andhra thali. Bring napkins and an appetite." },
  { name: "Corner House", tags: "Ice cream · everywhere · ₹", by: "Meera", ini: "MK", note: "Death by Chocolate. A non-negotiable nightcap." },
];
const JACKPOT = {
  name: "The Founder's Table", tags: "secret · invite inside", by: "Vouch", ini: "★",
  note: "You spun a hidden vouch. Email us “JACKPOT” and your invite skips the line.",
};

function Slot() {
  const [idx, setIdx] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [jackpot, setJackpot] = useState(false);
  const [count, setCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [greet, setGreet] = useState("Dinner tonight?");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const h = new Date().getHours();
    setGreet(
      h >= 22 || h < 5 ? "Late-night craving?" :
      h < 11 ? "Breakfast?" :
      h < 15 ? "Lunch run?" :
      h < 18 ? "Coffee o’clock?" : "Dinner tonight?"
    );
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function land() {
    const jp = Math.random() < 0.1;
    setSpinning(false);
    setJackpot(jp);
    chime();
    haptic(jp ? [22, 40, 22] : 16);
    const el = document.getElementById("slot-reel");
    if (el) { const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, jp ? 36 : 16); }
  }

  function spin() {
    if (spinning) return;
    setCopied(false);
    setJackpot(false);
    setCount((c) => c + 1);
    haptic(8);
    // land on a random highly-vouched pick, at least 3 away (always changes)
    const target = (idx + 3 + Math.floor(Math.random() * (SLOT.length - 1))) % SLOT.length;
    if (prefersReduced()) { setIdx(target); land(); return; }
    setSpinning(true);
    const delays = [60, 60, 60, 65, 70, 80, 95, 115, 150, 200, 255, 320];
    let step = 0;
    const tick = () => {
      step++;
      if (step >= delays.length) { setIdx(target); land(); return; }
      setIdx((p) => (p + 1) % SLOT.length);
      clickTick();
      timer.current = setTimeout(tick, delays[step]);
    };
    timer.current = setTimeout(tick, delays[0]);
  }

  function share() {
    const c = jackpot ? JACKPOT : SLOT[idx];
    const text = `Vouch sent me to ${c.name} tonight 🍽️ — vouched by ${c.by}. ${c.note}`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1900);
    }).catch(() => {});
  }

  const cur = jackpot ? JACKPOT : SLOT[idx];
  const prev = SLOT[(idx + SLOT.length - 1) % SLOT.length];
  const next = SLOT[(idx + 1) % SLOT.length];

  return (
    <div className={styles.slot}>
      {jackpot && <span className={styles.slotJackpot}>★ Jackpot — hidden vouch</span>}
      <div className={styles.slotHead}>
        <span className={styles.slotKicker}>{greet} <b>can’t decide?</b></span>
        <span className={styles.slotLive}><i className={styles.slotLiveDot} /> live</span>
      </div>

      <div id="slot-reel" className={`${styles.reel} ${spinning ? styles.reelSpin : ""}`} aria-live="polite">
        <span className={styles.reelGhost}>{prev.name}</span>
        <span className={styles.reelCur} key={`${idx}-${jackpot}-${spinning}`}>{cur.name}</span>
        <span className={styles.reelGhost}>{next.name}</span>
        <span className={styles.reelBracket} aria-hidden="true" />
      </div>

      <div className={`${styles.slotMeta} ${spinning ? styles.slotMetaSpin : ""}`}>
        <span className={styles.slotTags}>{cur.tags}</span>
        <p className={styles.slotNote}>&ldquo;{cur.note}&rdquo;</p>
        <div className={styles.slotBy}>
          <span className={styles.slotAvatar}>{cur.ini}</span>
          vouched by <b>{cur.by}</b>
          {!spinning && (
            <button type="button" className={styles.slotShare} onClick={share}>
              {copied ? "copied ✓" : "↗ share"}
            </button>
          )}
        </div>
      </div>

      <button type="button" className={styles.slotPull} onClick={spin} aria-label="Spin for a vouch near you">
        {spinning ? "Rolling…" : "Pull the lever"} <span aria-hidden="true">⤓</span>
      </button>
      <div className={styles.slotFoot}>
        {count > 0 ? `${count} dinner${count > 1 ? "s" : ""} decided — still hungry?` : "the city’s most-vouched, one pull away"}
      </div>
    </div>
  );
}

/* ---------- invite form (confetti on success) --------------------------- */
function InviteForm({ id }: { id?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  function submitInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) { setStatus("error"); return; }
    const btn = e.currentTarget.querySelector("button");
    if (btn) { const r = btn.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 22); }
    // TODO(backend): POST to /api/waitlist (Supabase `waitlist` table).
    setStatus("success");
    setEmail("");
  }
  if (status === "success") {
    return <WaitlistStatus />;
  }
  return (
    <form className={styles.form} onSubmit={submitInvite} noValidate>
      <div className={styles.formRow}>
        <label htmlFor={id} className={styles.srOnly}>Email address</label>
        <input id={id} className={styles.input} type="email" inputMode="email" autoComplete="email"
          placeholder="you@where-you-eat.com" value={email}
          onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
          aria-invalid={status === "error"} />
        <button type="submit" className={styles.formBtn}>Request invite <span aria-hidden="true">→</span></button>
      </div>
      <p className={`${styles.formNote} ${status === "error" ? styles.formErr : ""}`}>
        {status === "error" ? "// that doesn't look like an email — check it?" : "// invite-only · no spam · a seat at the table"}
      </p>
    </form>
  );
}

/* ---------- data --------------------------------------------------------- */
const CHAT = [
  { who: "you", text: "where do we eat tonight?" },
  { who: "them", text: "idk, you pick 🙃" },
  { who: "them", text: "anywhere’s fine honestly" },
  { who: "you", text: "not the usual place again pls" },
  { who: "them", text: "…should we just order in?" },
];

const STATES = [
  { name: "Want to go", tone: styles.tWant, desc: "Saved for the night you’re nearby." },
  { name: "Been", tone: styles.tBeen, desc: "Logged & dated. Your diary of the city." },
  { name: "Vouched", tone: styles.tVouch, hi: true, desc: "You’d stake your name on it." },
];

type ListItem = { name: string; tags: string; note?: string };
type VList = { title: string; by: string; ini: string; note: string; anchor?: string; items: ListItem[] };
const LISTS: Record<string, VList> = {
  parents: {
    title: "Where I take my parents", by: "Aditi", ini: "AS", note: "no surprises, all delight", anchor: "Safe bets · no surprises",
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
    title: "Open past midnight", by: "Rinkesh", ini: "RG", note: "for when the night isn’t done", anchor: "After 11pm · still worth it",
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
    title: "Filter coffee, ranked", by: "Meera", ini: "MK", note: "a genuinely serious investigation", anchor: "Serious only · no chains",
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
    title: "Worth the drive", by: "Rinkesh", ini: "RG", note: "edge-of-town pilgrimages",
    items: [
      { name: "Maddur Tiffanys", tags: "Maddur · ₹", note: "Maddur vada, mandatory stop." },
      { name: "Kamat Lokaruchi", tags: "Ramanagara · ₹₹", note: "Highway thali done right." },
      { name: "Shivaji Military Hotel", tags: "Donne biryani · ₹₹", note: "Get there by noon or miss it." },
      { name: "Taaza Thindi", tags: "Tiffin · Banashankari · ₹" },
      { name: "Anna Kuteera", tags: "South Indian · ₹" },
    ],
  },
  wine: {
    title: "Natural wine spots", by: "Meera", ini: "MK", note: "low-intervention, high-vibe",
    items: [
      { name: "Soka", tags: "Small plates · Indiranagar · ₹₹₹", note: "Get the negroni, stay for the plates." },
      { name: "Naru Noodle Bar", tags: "Wine + ramen · Indiranagar · ₹₹₹" },
      { name: "Bar Spirit Forward", tags: "Cocktails · Indiranagar · ₹₹₹" },
      { name: "Dali & Gala", tags: "Wine bar · Ulsoor · ₹₹₹" },
      { name: "The Permit Room", tags: "Tipple · MG Road · ₹₹₹" },
    ],
  },
  biryani: {
    title: "Best biryani, settled", by: "Aditi", ini: "AS", note: "the debate ends here",
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

/* ---------- the journey: how one vouch travels to your map (motion demo) ----
   One looping diagram that teaches BOTH "what a vouch is" (node 1 = the unit:
   place + line + name) AND "how it reaches you" (the chain → your map). Imagery
   here is PEOPLE (monograms/faces) + type — no photos. Pure CSS so it's
   reduced-motion safe: the base state is the full, legible diagram; the motion
   only sweeps the eye through it. Decorative — meaning also lives in the copy. */
function VouchJourney() {
  return (
    <div className={styles.journey} aria-hidden="true">
      <div className={`${styles.jNode} ${styles.jBeat1}`}>
        <span className={styles.jTag}>A vouch is made</span>
        <div className={styles.jVouch}>
          <div className={styles.jVouchTop}>
            <span className={styles.jAvatar}>AS</span>
            <span className={styles.jWho}><b>Aditi</b> vouches for</span>
            <span className={styles.jStamp}>◆ Vouched</span>
          </div>
          <div className={styles.jPlace}>Naru Noodle Bar</div>
          <div className={styles.jLine}>&ldquo;Best bowl in the city. Go at 6.&rdquo;</div>
        </div>
      </div>

      <div className={styles.jConn}><span className={styles.jConnFill} /></div>

      <div className={`${styles.jNode} ${styles.jBeat2}`}>
        <span className={styles.jTag}>Through people you follow</span>
        <div className={styles.jFaces}>
          <i>RG</i><i>MK</i><i>SD</i><i>TA</i><b>+3</b>
        </div>
      </div>

      <div className={styles.jConn}><span className={`${styles.jConnFill} ${styles.jConnFill2}`} /></div>

      <div className={`${styles.jNode} ${styles.jBeat3}`}>
        <span className={styles.jTag}>Onto your map, tonight</span>
        <div className={styles.jRec}>
          <div className={styles.jRecTop}>
            <span className={styles.jRecLabel}>On your map · tonight</span>
            <span className={styles.jRecDist}><i />1.2 km</span>
          </div>
          <div className={styles.jPlace}>Naru Noodle Bar</div>
          <div className={styles.jWhy}>
            <span className={styles.jWhyFaces}><i>AS</i><i>RG</i></span>
            <span><b>Aditi</b> vouched · <b>Rinkesh</b> saved it</span>
          </div>
        </div>
      </div>
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

/* ---------- live "the city is eating" pulse ----------------------------- */
const PEOPLE = ["Aditi", "Rinkesh", "Meera", "Karan", "Sneha", "Dev", "Priya", "Arjun", "Nikhil", "Tara", "Ishaan", "Ananya", "Rohan", "Kavya"];
const SPOTS = [
  { place: "Karavalli", area: "Residency Rd", emoji: "🦐" },
  { place: "Empire", area: "Indiranagar", emoji: "🍢" },
  { place: "Brahmin’s Coffee Bar", area: "Shankarpuram", emoji: "☕" },
  { place: "Toit", area: "Indiranagar", emoji: "🍕" },
  { place: "Vidyarthi Bhavan", area: "Basavanagudi", emoji: "🥞" },
  { place: "Nagarjuna", area: "Residency Rd", emoji: "🍛" },
  { place: "Corner House", area: "Koramangala", emoji: "🍨" },
  { place: "CTR · Shri Sagar", area: "Malleshwaram", emoji: "🧈" },
  { place: "Truffles", area: "St Marks Rd", emoji: "🍔" },
  { place: "Airlines Hotel", area: "Lavelle Rd", emoji: "🌳" },
];
type PulseItem =
  | { kind: "vouch"; e: string; name: string; t: string; ago: string }
  | { kind: "fact"; e: string; label: string; t: string };

const NEIGHBORHOODS = ["Indiranagar", "Koramangala", "Jayanagar", "Frazer Town", "Malleshwaram", "HSR Layout", "Cooke Town"];
const PULSE_FACTS: { e: string; label: string; t: string }[] = [
  { e: "🏆", label: "Top this week", t: "Brahmin’s Coffee Bar — 41 vouches" },
  { e: "📈", label: "Heating up", t: "Naru Noodle Bar — 18 vouches in 3 days" },
  { e: "📈", label: "Climbing", t: "Toit — on 26 new guides this week" },
  { e: "💡", label: "Did you know", t: "1 in 3 Bengaluru vouches mention filter coffee" },
  { e: "🌙", label: "Did you know", t: "40% of late-night vouches are near Indiranagar" },
  { e: "🏆", label: "Top guide", t: "“Where I take my parents” · 312 followers" },
  { e: "🍽️", label: "Did you know", t: "the average palate follows 7 people they trust" },
  { e: "🔥", label: "Hot guide", t: "“Open past midnight” added 9 places this week" },
];

function nextPulse(prevText: string): PulseItem {
  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
  for (let g = 0; g < 8; g++) {
    const r = Math.random();
    let item: PulseItem;
    if (r < 0.45) {
      const who = pick(PEOPLE); const spot = pick(SPOTS);
      item = { kind: "vouch", e: spot.emoji, name: who, t: `vouched for ${spot.place} · ${spot.area}`, ago: "just now" };
    } else if (r < 0.56) {
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
  const [item, setItem] = useState<PulseItem>({ kind: "vouch", e: "🥞", name: "Sneha", t: "vouched for Vidyarthi Bhavan · Basavanagudi", ago: "just now" });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (prefersReduced()) return;
    let to: ReturnType<typeof setTimeout>;
    let prevText = "vouched for Vidyarthi Bhavan · Basavanagudi";
    const schedule = () => {
      // slow, irregular, and a real mix of signals — never one thing on a loop
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
          {item.kind === "vouch" ? (
            <><b>{item.name}</b> {item.t}<span className={styles.pulseAgo}> · {item.ago}</span></>
          ) : (
            <><span className={styles.pulseTag}>{item.label}</span> {item.t}</>
          )}
        </span>
      </span>
    </div>
  );
}

/* ---------- waitlist as a status game (#3) ------------------------------ */
function WaitlistStatus() {
  const [pos, setPos] = useState(482);
  const [vouched, setVouched] = useState(0);
  const [referred, setReferred] = useState(false);
  const [adding, setAdding] = useState(false);
  const [place, setPlace] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  function addVouch(e: React.FormEvent) {
    e.preventDefault();
    if (!place.trim() || vouched >= 3) return;
    setVouched((v) => Math.min(3, v + 1));
    setPos((p) => Math.max(7, p - 11));
    setPlace("");
    setAdding(false);
    haptic(12);
  }
  function refer() {
    if (!referred) { setPos((p) => Math.max(7, p - 40)); setReferred(true); }
    navigator.clipboard?.writeText("https://vouch.app/i/482").then(() => {
      setLinkCopied(true); window.setTimeout(() => setLinkCopied(false), 1900);
    }).catch(() => {});
    haptic(8);
  }

  return (
    <div className={styles.wl} role="status">
      <div className={styles.wlPos}>
        <span className={styles.wlNo}>No.</span>
        <span className={styles.wlNum} key={pos}>{pos}</span>
        <span className={styles.wlInLine}>in line<br /><b>you’re in</b></span>
      </div>
      <p className={styles.wlHint}>Jump the queue — two ways:</p>
      <div className={styles.wlActions}>
        {adding ? (
          <form className={styles.wlAdd} onSubmit={addVouch}>
            <input className={styles.wlInput} placeholder="Name a place you love…" value={place}
              onChange={(e) => setPlace(e.target.value)} autoFocus aria-label="A place you vouch for" />
            <button type="submit" className={styles.wlAddBtn}>Vouch</button>
          </form>
        ) : (
          <button type="button" className={styles.wlAction} onClick={() => setAdding(true)} disabled={vouched >= 3}>
            <span className={styles.wlActionMain}>Vouch a place you love</span>
            <span className={styles.wlActionMeta}>{vouched >= 3 ? "done ✓" : `−11 each · ${vouched}/3`}</span>
          </button>
        )}
        <button type="button" className={styles.wlAction} onClick={refer}>
          <span className={styles.wlActionMain}>
            {referred ? (linkCopied ? "Link copied ✓" : "Invite link copied ✓") : "Invite a friend"}
          </span>
          <span className={styles.wlActionMeta}>{referred ? "−40 · jumped ahead" : "skip 40 spots ↗"}</span>
        </button>
      </div>
    </div>
  );
}

/* ---------- borrow a palate (#2) ---------------------------------------- */
const PALATES: Record<string, { ini: string; handle: string; followers: string; lists: string[] }> = {
  Aditi: { ini: "AS", handle: "@aditi", followers: "410", lists: ["parents", "biryani"] },
  Rinkesh: { ini: "RG", handle: "@rinkesh", followers: "340", lists: ["midnight", "drive"] },
  Meera: { ini: "MK", handle: "@meera", followers: "512", lists: ["filter", "wine"] },
};
function BorrowPalate({ onOpenList }: { onOpenList: (id: string) => void }) {
  const [who, setWho] = useState("Aditi");
  const p = PALATES[who];
  return (
    <div className={styles.persona}>
      <span className={styles.personaTag}>Borrow a palate →</span>
      <div className={styles.borrowTabs} role="tablist" aria-label="Browse a palate">
        {Object.keys(PALATES).map((k) => (
          <button key={k} type="button" role="tab" aria-selected={k === who}
            className={`${styles.borrowTab} ${k === who ? styles.borrowTabOn : ""}`}
            onClick={() => { setWho(k); haptic(5); }}>{k}</button>
        ))}
      </div>
      <div className={styles.borrowBody} key={who}>
        <div className={styles.pfHead}>
          <span className={styles.pfAvatar}>{p.ini}</span>
          <span>
            <span className={styles.pfName}>{who}</span>
            <span className={styles.pfMeta}>{p.handle} · {p.lists.length} guides · {p.followers} followers</span>
          </span>
          <span className={styles.pfFollow}>Follow</span>
        </div>
        <div className={styles.pfLists}>
          {p.lists.map((id) => {
            const l = LISTS[id];
            return (
              <button key={id} type="button" className={styles.pfList} onClick={() => onOpenList(id)}>
                <span className={styles.pfListName}>{l.title}</span>
                <b>{String(l.items.length).padStart(2, "0")}</b>
                <span className={styles.pfListArrow} aria-hidden="true">→</span>
              </button>
            );
          })}
        </div>
      </div>
      <p className={styles.personaCap}>Tap a guide to open it — this is what following someone gets you.</p>
    </div>
  );
}

/* ---------- shared modal shell (scroll-lock · esc · focus-trap) -------- */
function Modal({ open, onClose, label, variant = "", children }: {
  open: boolean; onClose: () => void; label: string; variant?: string; children: ReactNode;
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
      <div ref={ref} className={`${styles.modal} ${variant}`} role="dialog" aria-modal="true" aria-label={label}>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        {children}
      </div>
    </div>
  );
}

/* ---------- guide detail (opens the full guide) ------------------------- */
function ListModal({ list, onClose, onRequestInvite }: { list: VList | null; onClose: () => void; onRequestInvite: () => void }) {
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
            <span className={styles.modalMeta}>{list.items.length} places · {list.note}</span>
          </div>
          <div className={styles.modalList}>
            {list.items.map((it, i) => (
              <div className={styles.modalRow} key={it.name}>
                <span className={styles.modalNum}>{String(i + 1).padStart(2, "0")}</span>
                <div className={styles.modalRowBody}>
                  <span className={styles.modalPlace}>{it.name}</span>
                  <span className={styles.modalTags}>{it.tags}</span>
                  {it.note && <span className={styles.modalNote}>“{it.note}”</span>}
                </div>
                <span className={styles.modalSave} aria-hidden="true">＋</span>
              </div>
            ))}
          </div>
          <div className={styles.modalFoot}>
            <span>Follow <b>{list.by}</b> and this whole guide lands on your map.</span>
            <button type="button" className={styles.modalCta} onClick={onRequestInvite}>Request an invite →</button>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ---------- request-invite modal (the whole flow, in place) ------------ */
function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} label="Request an invite" variant={styles.inviteModal}>
      <div className={styles.inviteBody}>
        <span className={styles.inviteKicker}>Invite-only · Bengaluru</span>
        <h3 className={styles.inviteTitle}>Pull up a chair.</h3>
        <p className={styles.inviteSub}>Leave your email — a handful of invites go out every week.</p>
        <InviteForm id="email-modal" />
      </div>
    </Modal>
  );
}

/* ---------- palate quiz: a shareable taste identity (#4) ---------------- */
const ARCHETYPES: Record<string, { name: string; emoji: string; desc: string; spots: string[] }> = {
  forager: { name: "The Midnight Forager", emoji: "🌙", desc: "Your best meals start after 11pm, end with greasy fingers, and never had a menu. Plastic chairs optional, joy mandatory.", spots: ["Empire · Indiranagar", "Shawarma Center · Frazer Town", "CTR · Shri Sagar"] },
  purist: { name: "The Filter-Coffee Fundamentalist", emoji: "☕", desc: "Idli, kara bath, a degree filter, by 8am. You would, genuinely, argue about dosa crispness in a court of law.", spots: ["Brahmin’s Coffee Bar", "Vidyarthi Bhavan", "Airlines Hotel"] },
  romantic: { name: "The Small-Plates Romantic", emoji: "🍷", desc: "It’s the room, the bottle, the person across the table. The food shows up and politely agrees with the vibe.", spots: ["Toit · Indiranagar", "Naru Noodle Bar", "Karavalli"] },
  maximalist: { name: "The Thali Maximalist", emoji: "🍛", desc: "If you can still see the table, you under-ordered. Napkins are a personality. Leftovers are a love language.", spots: ["Nagarjuna", "Karavalli", "Vidyarthi Bhavan"] },
  chaser: { name: "The Opening-Night Chaser", emoji: "✨", desc: "You’d been there before it had a signboard — and you’ll remind everyone, gently, forever.", spots: ["Naru Noodle Bar", "Toit", "Truffles"] },
  loyalist: { name: "The Ride-or-Die Regular", emoji: "🔁", desc: "Three places. Zero gambles. The waiters know your order, your face, and roughly how your week is going.", spots: ["Corner House", "Airlines Hotel", "Koshy’s"] },
};
const QUIZ = [
  { q: "9pm. The group chat is dying. You drop:", opts: [
    { t: "“Trust me, I know a place.”", a: "forager" }, { t: "“Let’s get wine and figure it out.”", a: "romantic" },
    { t: "“Saw a new spot on the timeline…”", a: "chaser" }, { t: "“The usual? The usual.”", a: "loyalist" },
  ] },
  { q: "Filter coffee is, fundamentally:", opts: [
    { t: "A degree filter, or we’re not friends", a: "purist" }, { t: "Cute. Make it a flat white", a: "romantic" },
    { t: "The warm-up act before the dosa", a: "forager" }, { t: "Dessert. I said what I said.", a: "loyalist" },
  ] },
  { q: "You’d cross all of Bengaluru for:", opts: [
    { t: "A dosa that ends the dosa debate", a: "purist" }, { t: "A thali that needs a bigger table", a: "maximalist" },
    { t: "A broth simmered longer than a grudge", a: "chaser" }, { t: "A 1am roll, zero judgment", a: "forager" },
  ] },
  { q: "The menu arrives. Your move:", opts: [
    { t: "One of everything. We’ll manage.", a: "maximalist" }, { t: "Ask what the chef can’t stop making", a: "romantic" },
    { t: "Whatever that table’s having", a: "chaser" }, { t: "The usual. Undefeated since 2019.", a: "loyalist" },
  ] },
];
function PalateQuiz() {
  const [step, setStep] = useState(0);
  const [votes, setVotes] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function choose(a: string) {
    haptic(6);
    const next = [...votes, a];
    if (step + 1 >= QUIZ.length) {
      const tally: Record<string, number> = {};
      next.forEach((k) => { tally[k] = (tally[k] || 0) + 1; });
      let best = next[0];
      let bestN = 0;
      Object.keys(ARCHETYPES).forEach((k) => { if ((tally[k] || 0) > bestN) { bestN = tally[k] || 0; best = k; } });
      setVotes(next);
      setResult(best);
      window.setTimeout(() => {
        const el = document.getElementById("palate-card");
        if (el) { const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + 50, 24); }
        chime();
      }, 80);
    } else {
      setVotes(next);
      setStep(step + 1);
    }
  }
  function retake() { setStep(0); setVotes([]); setResult(null); setCopied(false); }
  function share() {
    if (!result) return;
    const a = ARCHETYPES[result];
    const text = `My Vouch palate: ${a.emoji} ${a.name} — ${a.desc}\nWhat’s yours? → vouch.app`;
    navigator.clipboard?.writeText(text).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1900); }).catch(() => {});
  }

  if (result) {
    const a = ARCHETYPES[result];
    return (
      <div className={styles.palateResult}>
        <div className={styles.palateCard} id="palate-card">
          <span className={styles.palateGlyph} aria-hidden="true">{a.emoji}</span>
          <div className={styles.palateBrand}>
            <span className={styles.palateBrandMark}>
              <svg viewBox="0 0 26 26" fill="none" aria-hidden="true" width="20" height="20">
                <rect x="0.7" y="0.7" width="24.6" height="24.6" rx="4" stroke="currentColor" strokeWidth="1.3" opacity="0.5" />
                <path d="M7 8.5l6 9 6-9" stroke="#f6a82b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Vouch
            </span>
            <span className={styles.palateBrandTag}>Palate Card</span>
          </div>
          <span className={styles.palateBadge}>Your palate is</span>
          <h3 className={styles.palateName}>{a.name}</h3>
          <p className={styles.palateDesc}>{a.desc}</p>
          <div className={styles.palateSpots}>
            <span className={styles.palateSpotsLabel}>Where you should start</span>
            {a.spots.map((s) => <div key={s} className={styles.palateSpot}>{s}</div>)}
          </div>
          <div className={styles.palateFooter}>
            What&rsquo;s yours? &rarr; <b>vouch.app</b> · Bengaluru edition
          </div>
        </div>
        <div className={styles.palateActions}>
          <button type="button" className={styles.palateShare} onClick={share}>{copied ? "Copied ✓" : "↗ Share my palate"}</button>
          <button type="button" className={styles.palateRetake} onClick={retake}>↻ Retake</button>
        </div>
      </div>
    );
  }

  const Q = QUIZ[step];
  return (
    <div className={styles.quizCard}>
      <div className={styles.quizProg}>
        {QUIZ.map((_, i) => <i key={i} className={i <= step ? styles.quizDotOn : styles.quizDot} />)}
        <span className={styles.quizStep}>{step + 1} / {QUIZ.length}</span>
      </div>
      <h3 className={styles.quizQ} key={step}>{Q.q}</h3>
      <div className={styles.quizOpts}>
        {Q.opts.map((o) => (
          <button key={o.t} type="button" className={styles.quizOpt} onClick={() => choose(o.a)}>
            <span>{o.t}</span><span className={styles.quizOptArrow} aria-hidden="true">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const NAMES = ["name", "Rinkesh", "Aditi", "Meera", "a friend"];

export default function VouchLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [nameIdx, setNameIdx] = useState(0);
  const [secret, setSecret] = useState(false);
  const [openList, setOpenList] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

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

  useEffect(() => {
    const seq = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
    let idx = 0;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === seq[idx]) {
        idx++;
        if (idx === seq.length) {
          idx = 0;
          setSecret(true);
          for (let n = 0; n < 5; n++) {
            const x = (window.innerWidth / 6) * (n + 1);
            window.setTimeout(() => burst(x, 90, 14), n * 120);
          }
          window.setTimeout(() => setSecret(false), 5200);
        }
      } else { idx = k === seq[0] ? 1 : 0; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <link rel="stylesheet" href={FONTS_HREF} />

      <div className={styles.page}>
        <span className={styles.grain} aria-hidden="true" />

        <ListModal
          list={openList ? LISTS[openList] : null}
          onClose={() => setOpenList(null)}
          onRequestInvite={() => { setOpenList(null); setInviteOpen(true); }}
        />
        <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />

        {secret && (
          <div className={styles.secret} role="status">
            🤫 Secret menu unlocked — your invite’s on the house. Email us “KONAMI”.
          </div>
        )}

        {/* ---------- TICKER ---------- */}
        <div className={styles.ticker} aria-hidden="true">
          <div className={styles.tickerTrack}>
            {Array.from({ length: 2 }).map((_, k) => (
              <span className={styles.tickerSeq} key={k}>
                <span>Vouch · Bengaluru edition</span><span className={styles.tDot} />
                <span>1,204 vouches logged</span><span className={styles.tDot} />
                <span>318 palates</span><span className={styles.tDot} />
                <span>invite-only</span><span className={styles.tDot} />
                <span>no star ratings, ever</span><span className={styles.tDot} />
              </span>
            ))}
          </div>
        </div>

        {/* ---------- NAV ---------- */}
        <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
          <div className={styles.wrap}>
            <div className={styles.navInner}>
              <a href="#top" className={styles.brandLink}><Wordmark /></a>
              <button type="button" className={styles.navBtn} onClick={() => setInviteOpen(true)}>Request invite <span aria-hidden="true">→</span></button>
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
                  <h1 className={styles.h1}>
                    The only review that matters has a{" "}
                    <button type="button" className={styles.hl}
                      onClick={() => setNameIdx((n) => (n + 1) % NAMES.length)} title="go on, click me">
                      {NAMES[nameIdx]}
                    </button>{" "}
                    on it.
                  </h1>
                  <p className={styles.heroSub}>
                    Follow the palates you trust. Their vouches — not star ratings — tell
                    you where to eat tonight.
                  </p>
                  <div className={styles.heroForm} id="invite"><InviteForm id="email-hero" /></div>
                </div>
                <div className={styles.heroAside}><Slot /></div>
              </div>
            </div>
          </section>

          {/* ---------- 01 — PROBLEM (the group-chat spiral) ---------- */}
          <section className={styles.section} id="problem">
            <div className={styles.wrap}>
              <div className={styles.block}>
                <Reveal className={styles.rail}>
                  <span className={styles.railKicker}>01 / The problem</span>
                  <span className={styles.idx}>01</span>
                </Reveal>
                <div className={styles.blockBody}>
                  <Reveal as="h2" className={styles.h2}>
                    Dinner dies in the <span className={styles.u}>group chat.</span>
                  </Reveal>
                  <div className={styles.problemGrid}>
                    <div>
                      <Reveal as="p" className={styles.lede}>
                        Five &ldquo;anywhere&rsquo;s fine&rdquo;s, zero decisions, and you
                        settle for the usual — <b>again.</b>
                      </Reveal>
                      <Reveal as="p" className={styles.problemPunch} delay={60}>
                        You don&rsquo;t need 3,000 reviews or one more 4.2★. You need the
                        one friend who just <em>knows</em>. <span className={styles.problemTurn}>Vouch is that friend.</span>
                      </Reveal>
                    </div>
                    <Reveal className={styles.chat} delay={80}>
                      <div className={styles.chatHead}>
                        <span>Dinner plans · 5</span>
                        <span>7:4{CHAT.length}pm</span>
                      </div>
                      <div className={styles.chatBody}>
                        {CHAT.map((m, i) => (
                          <span key={i} className={`${styles.bubble} ${m.who === "you" ? styles.bubbleYou : styles.bubbleThem}`}>
                            {m.text}
                          </span>
                        ))}
                        <span className={styles.typing} aria-hidden="true"><i /><i /><i /></span>
                      </div>
                      <span className={styles.chatCap}>every. single. time.</span>
                    </Reveal>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------- HOW A VOUCH REACHES YOU (what it is + the chain, animated) ---------- */}
          <section className={styles.trust} id="what">
            <div className={styles.wrap}>
              <div className={styles.trustGrid}>
                <div className={styles.trustText}>
                  <Reveal as="p" className={styles.trustKicker}>
                    <i /> How a vouch reaches you
                  </Reveal>
                  <Reveal as="h2" className={styles.trustTitle} delay={40}>
                    Not an algorithm. A name that travels to you.
                  </Reveal>
                  <Reveal as="p" className={styles.trustBody} delay={80}>
                    A vouch is the opposite of a star rating: <b>one place, one line, one real
                    name.</b> When someone you follow puts their name down, it travels straight
                    to your map — you see exactly who vouched, and who else you trust saved it.
                  </Reveal>
                  <Reveal as="p" className={styles.trustNote} delay={120}>
                    Tap a name, see their whole map. No black box, no 4.1★ average.
                  </Reveal>
                </div>

                <Reveal className={styles.trustVisual} delay={120}>
                  <VouchJourney />
                </Reveal>
              </div>
            </div>
          </section>

          {/* ---------- 02 — THE VOUCH (composer + stamps, the depth) ---------- */}
          <section className={styles.section} id="vouch">
            <div className={styles.wrap}>
              <div className={styles.block}>
                <Reveal className={styles.rail}>
                  <span className={styles.railKicker}>02 / The unit</span>
                  <span className={styles.idx}>02</span>
                </Reveal>
                <div className={styles.blockBody}>
                  <Reveal as="h2" className={styles.h2}>
                    Anyone can rate. A vouch you’d <span className={styles.u}>stake your name on.</span>
                  </Reveal>
                  <div className={styles.vouchSplit}>
                    <Reveal className={styles.composer} delay={60}>
                      <div className={styles.composerHead}>
                        <span className={styles.composerAvatar}>RG</span>
                        <span>You’re vouching for…</span>
                      </div>
                      <div className={styles.composerPlace}>
                        Naru Noodle Bar
                        <span className={styles.composerTags}>Ramen · Indiranagar · ₹₹₹</span>
                      </div>
                      <div className={styles.composerField}>
                        Best bowl in the city. Get there at 6 sharp.<span className={styles.caret} />
                      </div>
                      <div className={styles.composerFoot}>
                        <span className={styles.composerHint}>one line — that’s the whole review</span>
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

          {/* ---------- 03 — LISTS ---------- */}
          <section className={styles.section} id="lists">
            <div className={styles.wrap}>
              <div className={styles.block}>
                <Reveal className={styles.rail}>
                  <span className={styles.railKicker}>03 / Your taste, set in type</span>
                  <span className={styles.idx}>03</span>
                </Reveal>
                <div className={styles.blockBody}>
                  <Reveal as="h2" className={styles.h2}>
                    Guides are how taste becomes <span className={styles.u}>shareable.</span>
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
                              <span className={styles.menuMeta}>{m.items.length} places · {m.note}</span>
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
                              <span className={styles.menuViewCount}>{m.items.length} places</span>
                              <span className={styles.menuView}>Open all {m.items.length} →</span>
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

          {/* ---------- 04 — FOR WHOM (profile UIs) ---------- */}
          <section className={styles.section} id="who">
            <div className={styles.wrap}>
              <div className={styles.block}>
                <Reveal className={styles.rail}>
                  <span className={styles.railKicker}>04 / For whom</span>
                  <span className={styles.idx}>04</span>
                </Reveal>
                <div className={styles.blockBody}>
                  <Reveal as="h2" className={styles.h2}>
                    For the friend who always knows. <span className={styles.u}>And the friend who always asks.</span>
                  </Reveal>
                  <div className={styles.who}>
                    <Reveal><BorrowPalate onOpenList={setOpenList} /></Reveal>

                    <Reveal className={styles.persona} delay={80}>
                      <span className={styles.personaTag}>The one always asking</span>
                      <div className={styles.pfHead}>
                        <span className={styles.pfFollowing} aria-hidden="true">
                          <i>RG</i><i>AS</i><i>MK</i><i>+3</i>
                        </span>
                        <span className={styles.pfMeta}>following 6 palates you trust</span>
                      </div>
                      <div className={styles.pfSurfaced}>
                        <Row name="Naru Noodle Bar" meta="vouched · Rinkesh" />
                      </div>
                      <p className={styles.personaCap}>Skip the averages. Borrow a palate you believe.</p>
                    </Reveal>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------- FIND YOUR PALATE ---------- */}
          <section className={styles.quiz} id="palate">
            <div className={styles.wrap}>
              <Reveal as="p" className={styles.quizKicker}>Find your palate</Reveal>
              <Reveal as="h2" className={styles.quizTitle} delay={40}>What kind of eater are you?</Reveal>
              <Reveal as="p" className={styles.quizSub} delay={70}>
                Four taps, one honest verdict on your taste — and the spots that match it.
              </Reveal>
              <Reveal delay={100}><PalateQuiz /></Reveal>
            </div>
          </section>
        </main>

        {/* ---------- CTA ---------- */}
        <section className={styles.cta} id="reserve">
          <div className={styles.wrap}>
            <LivePulse />
            <Reveal className={styles.stub}>
              <div className={styles.stubMain}>
                <span className={styles.stubKicker}>Admit one</span>
                <h2 className={styles.stubTitle}>Pull up a chair.</h2>
                <p className={styles.stubSub}>Invite-only while we get Bengaluru right. A handful go out <b>every week.</b></p>
                <InviteForm id="email-cta" />
              </div>
              <div className={styles.stubEnd} aria-hidden="true">
                <span className={styles.stubEndText}>Vouch</span>
                <span className={styles.stubEndNo}>NO. 001</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- FOOTER (minimal) ---------- */}
        <footer className={styles.footer}>
          <div className={styles.wrap}>
            <div className={styles.footTop}>
              <div>
                <span className={styles.footBrand}><Wordmark /></span>
                <p className={styles.footLine}>Eat like your most-trusted friend.</p>
              </div>
              <button type="button" className={styles.footCta} onClick={() => setInviteOpen(true)}>Request an invite <span aria-hidden="true">→</span></button>
            </div>
            <div className={styles.footBottom}>
              <span>© 2026 Vouch · Bengaluru · invite-only</span>
              <span className={styles.footSecret} title="you know what to do">↑↑↓↓←→←→ B A</span>
              <span>no star ratings, ever</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
