"use client";

import { useCallback, useRef, useState } from "react";
import s from "./welcome.module.css";

const cn = (...x: (string | false | undefined)[]) => x.filter(Boolean).join(" ");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOTAL = 4;

/* ---- the square mark + wordmark (from the product landing) ---- */
function Wordmark({ size = 1 }: { size?: number }) {
  return (
    <span className={s.brand} style={{ fontSize: `${size}rem` }}>
      <svg className={s.brandMark} viewBox="0 0 26 26" fill="none" aria-hidden="true">
        <rect x="0.7" y="0.7" width="24.6" height="24.6" rx="4" stroke="currentColor" strokeWidth="1.3" opacity="0.5" />
        <path d="M7 8.5l6 9 6-9" stroke="#f6a82b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Vouch
    </span>
  );
}

/* ---- screen 02: every answer earns a verdict that lands the argument ---- */
const ANSWERS = [
  {
    tab: "Ask a friend",
    kicker: "I text the one friend who just knows",
    verdict: "That’s a palate.",
    body: "The friend whose taste you’d bet on. On Vouch you follow them — and their spots land on your map. That’s the entire product.",
    tone: "vouch" as const,
  },
  {
    tab: "Read reviews",
    kicker: "I read 400 reviews first",
    verdict: "Brave. Exhausting.",
    body: "Sorted by “most recent,” trusting a 4.2★ from total strangers. One name you actually trust beats a thousand you don’t.",
    tone: "want" as const,
  },
  {
    tab: "Trust the ★",
    kicker: "I go with the 4.2★ average",
    verdict: "An average of strangers.",
    body: "It has never eaten there. Never been let down at 9pm. It doesn’t have a favourite dosa. A person who’s been does.",
    tone: "ember" as const,
  },
  {
    tab: "Same spots",
    kicker: "Same three places, always",
    verdict: "Ride-or-die. Respect.",
    body: "Zero gambles — and zero new joy. Borrow a palate you trust, and your safe three quietly becomes thirty.",
    tone: "been" as const,
  },
];

/* ---- screen 03: three moves ---- */
const MOVES = [
  {
    n: "01",
    title: "Vouch a place",
    body: "One place, one line, your name. That’s the whole review — no stars, no essay.",
    thumb: "vouch" as const,
  },
  {
    n: "02",
    title: "Build a guide",
    body: "“Where I take my parents.” Your taste, set in type — and shareable.",
    thumb: "guide" as const,
  },
  {
    n: "03",
    title: "Follow a palate",
    body: "Their vouches land on your map. So tonight already has an answer.",
    thumb: "follow" as const,
  },
];

const HOODS = ["Indiranagar", "Koramangala", "Malleshwaram", "Jayanagar", "Frazer Town"];

/* a small stylised "your map" — pins on a dark grid, one live */
const PINS = [
  { x: 24, y: 30, k: "been" },
  { x: 62, y: 22, k: "want" },
  { x: 78, y: 52, k: "vouched" },
  { x: 40, y: 60, k: "been" },
  { x: 18, y: 70, k: "want" },
  { x: 70, y: 78, k: "vouched" },
] as const;

export default function WelcomeClient() {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState(false);

  const go = useCallback((n: number) => setStep(Math.min(TOTAL - 1, Math.max(0, n))), []);

  // macro deck swipe (disabled on the question screen — the card owns gestures)
  const down = useRef<{ x: number; y: number } | null>(null);
  function onDeckDown(e: React.PointerEvent) {
    down.current = { x: e.clientX, y: e.clientY };
  }
  function onDeckUp(e: React.PointerEvent) {
    if (!down.current || step === 1) return;
    const dx = e.clientX - down.current.x;
    const dy = e.clientY - down.current.y;
    down.current = null;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) return;
    go(step + (dx < 0 ? 1 : -1));
  }

  // verdict card swipe
  const cardDown = useRef<number | null>(null);
  function cycle(dir: 1 | -1) {
    setAnswer((a) => ((a ?? 0) + dir + ANSWERS.length) % ANSWERS.length);
  }
  function onCardDown(e: React.PointerEvent) {
    e.stopPropagation();
    cardDown.current = e.clientX;
  }
  function onCardUp(e: React.PointerEvent) {
    e.stopPropagation();
    if (cardDown.current == null) return;
    const dx = e.clientX - cardDown.current;
    cardDown.current = null;
    if (Math.abs(dx) >= 48) cycle(dx < 0 ? 1 : -1);
  }

  function submitInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setErr(true);
      return;
    }
    setErr(false);
    setSent(true);
  }

  const active = answer ?? 0;
  const a = ANSWERS[active];

  return (
    <div className={s.root}>
      <span className={s.grain} aria-hidden="true" />

      {/* ===== top chrome ===== */}
      <header className={s.chrome}>
        <button
          type="button"
          className={s.chromeBtn}
          onClick={() => go(step - 1)}
          aria-label="Back"
          disabled={step === 0}
        >
          ←
        </button>
        <div className={s.bars} role="tablist" aria-label="Progress">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === step}
              className={cn(s.bar, i <= step && s.barOn)}
              onClick={() => go(i)}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>
        <span className={s.stepMono}>
          {String(step + 1).padStart(2, "0")}<span className={s.stepSlash}>/</span>0{TOTAL}
        </span>
      </header>

      {/* ===== deck ===== */}
      <div className={s.deck} onPointerDown={onDeckDown} onPointerUp={onDeckUp}>
        <div className={s.track} style={{ transform: `translateX(-${step * 100}%)` }}>

          {/* ---------- 01 · COVER ---------- */}
          <section className={s.screen}>
            <div className={s.scroll}>
              <div className={s.coverTop}>
                <Wordmark size={1.25} />
                <span className={s.tag}>Bengaluru · invite-only</span>
              </div>

              <h1 className={s.h1}>
                The only review
                <br /> that matters has
                <br /> a <span className={s.hl}>name</span> on it.
              </h1>

              <p className={s.heroSub}>
                Follow the palates you trust. Their <b>vouches</b> — not star
                ratings — tell you where to eat tonight.
              </p>

              {/* the unit: a vouch card */}
              <div className={s.vouchCard}>
                <span className={s.vcGlow} aria-hidden="true" />
                <div className={s.vcTop}>
                  <span className={s.avatar}>AS</span>
                  <span className={s.vcWho}>
                    <b>Aditi</b> vouches for
                  </span>
                  <span className={s.vcStamp}>
                    <i className={cn(s.dot, s.dVouched)} /> Vouched
                  </span>
                </div>
                <div className={s.vcPlace}>Naru Noodle Bar</div>
                <div className={s.vcTags}>Ramen · Indiranagar · ₹₹₹</div>
                <p className={s.vcLine}>“Best bowl in the city. Get there at 6 sharp.”</p>
              </div>

              <p className={s.mono}>// no star ratings, ever</p>
            </div>

            <footer className={s.footer}>
              <button type="button" className={cn(s.btn, s.primary)} onClick={() => go(1)}>
                Start your map <span aria-hidden="true">→</span>
              </button>
            </footer>
          </section>

          {/* ---------- 02 · THE TASTE QUESTION ---------- */}
          <section className={s.screen}>
            <div className={s.scroll}>
              <p className={s.kicker}>Find your palate</p>
              <h2 className={s.h2}>How do you decide where to eat?</h2>
              <p className={s.swipe}>Swipe the card · no wrong answers</p>

              <div className={s.tabs} role="tablist" aria-label="Choose an answer">
                {ANSWERS.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    className={cn(s.tab, i === active && s.tabOn)}
                    onClick={() => setAnswer(i)}
                  >
                    {opt.tab}
                  </button>
                ))}
              </div>

              <div className={s.verdict} onPointerDown={onCardDown} onPointerUp={onCardUp}>
                <span className={s.verdictGlow} aria-hidden="true" />
                <div className={s.verdictInner} key={active}>
                  <div className={s.verdictKicker}>
                    <i className={cn(s.dot, s[`d_${a.tone}`])} /> {a.kicker}
                  </div>
                  <h3 className={s.verdictName}>{a.verdict}</h3>
                  <p className={s.verdictBody}>{a.body}</p>
                </div>
              </div>

              <div className={s.dots} aria-hidden="true">
                {ANSWERS.map((_, i) => (
                  <i key={i} className={cn(s.pdot, i === active && s.pdotOn)} />
                ))}
              </div>
            </div>

            <footer className={s.footer}>
              <button type="button" className={cn(s.btn, s.primary)} onClick={() => go(2)}>
                {answer == null ? "Vouch is that friend" : "Continue"}{" "}
                <span aria-hidden="true">→</span>
              </button>
            </footer>
          </section>

          {/* ---------- 03 · THREE MOVES ---------- */}
          <section className={s.screen}>
            <div className={s.scroll}>
              <p className={s.kicker}>The whole app</p>
              <h2 className={s.h2}>
                Three moves. <span className={s.u}>That’s it.</span>
              </h2>
              <p className={s.lede}>
                No nine-step setup. No forms. You vouch, you collect into guides,
                you follow people you trust.
              </p>

              <div className={s.moves}>
                {MOVES.map((m) => (
                  <article key={m.n} className={s.move}>
                    <div className={s.moveThumb} aria-hidden="true">
                      {m.thumb === "vouch" && (
                        <div className={s.tVouch}>
                          <span className={cn(s.dot, s.dVouched)} />
                          <span className={s.tLineA} />
                          <span className={s.tLineB} />
                        </div>
                      )}
                      {m.thumb === "guide" && (
                        <div className={s.tGuide}>
                          <i><b>01</b><span /></i>
                          <i><b>02</b><span /></i>
                          <i><b>03</b><span /></i>
                        </div>
                      )}
                      {m.thumb === "follow" && (
                        <div className={s.tFollow}>
                          <span>RG</span>
                          <span>MK</span>
                          <span>AS</span>
                        </div>
                      )}
                    </div>
                    <div className={s.moveText}>
                      <div className={s.moveHead}>
                        <span className={s.moveNum}>{m.n}</span>
                        <h3 className={s.moveTitle}>{m.title}</h3>
                      </div>
                      <p className={s.moveBody}>{m.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <footer className={s.footer}>
              <button type="button" className={cn(s.btn, s.primary)} onClick={() => go(3)}>
                See the city eating <span aria-hidden="true">→</span>
              </button>
            </footer>
          </section>

          {/* ---------- 04 · THE PAYOFF ---------- */}
          <section className={s.screen}>
            <div className={s.scroll}>
              <p className={s.kicker}>Bengaluru, already eating</p>
              <h2 className={s.h2}>Your map fills as you vouch.</h2>

              <div className={s.map} aria-hidden="true">
                <span className={s.mapGrid} />
                {PINS.map((p, i) => (
                  <i
                    key={i}
                    className={cn(s.pin, s[`pin_${p.k}`])}
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  />
                ))}
                <i className={cn(s.pin, s.pinLive)} style={{ left: "48%", top: "44%" }}>
                  <span className={s.pinPulse} />
                </i>
                <span className={s.mapTag}>You · Indiranagar</span>
              </div>

              <div className={s.statRow}>
                <div className={s.stat}>
                  <span className={s.statN}>1,204</span>
                  <span className={s.statL}>vouches logged</span>
                </div>
                <div className={s.stat}>
                  <span className={s.statN}>318</span>
                  <span className={s.statL}>palates</span>
                </div>
              </div>

              <div className={s.pulse}>
                <span className={s.pulseLive}>
                  <i className={s.pulseDot} /> Live
                </span>
                <span className={s.pulseLine}>
                  <span aria-hidden="true">🥞</span> <b>Sneha</b> vouched for
                  Vidyarthi Bhavan · Basavanagudi
                </span>
              </div>

              <div className={s.hoods}>
                {HOODS.map((h, i) => (
                  <span key={h} className={cn(s.hood, s[`hood_${i % 3}`])}>
                    {h}
                  </span>
                ))}
              </div>
            </div>

            <footer className={s.footer}>
              {!sent ? (
                <form className={s.invite} onSubmit={submitInvite} noValidate>
                  <div className={s.inviteRow}>
                    <input
                      className={s.input}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@where-you-eat.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (err) setErr(false);
                      }}
                      aria-invalid={err}
                      aria-label="Email address"
                    />
                    <button type="submit" className={cn(s.btn, s.primary, s.inviteBtn)}>
                      Request invite <span aria-hidden="true">→</span>
                    </button>
                  </div>
                  <p className={cn(s.mono, err && s.monoErr)}>
                    {err
                      ? "// that doesn’t look like an email — check it?"
                      : "// invite-only · a handful go out every week"}
                  </p>
                </form>
              ) : (
                <div className={s.done} role="status">
                  <div className={s.donePos}>
                    <span className={s.doneNo}>No.</span>
                    <span className={s.doneNum}>482</span>
                    <span className={s.doneIn}>
                      in line
                      <br />
                      <b>you’re in</b>
                    </span>
                  </div>
                  <p className={s.doneMsg}>
                    Pull up a chair. We’ll email your invite — then your first
                    vouch goes on the map.
                  </p>
                </div>
              )}
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
}
