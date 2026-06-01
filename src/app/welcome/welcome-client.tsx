"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Stamp, Wordmark } from "@/components/ui/stamp";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import s from "./welcome.module.css";

/* ------------------------------------------------------------------ *
 * Rubber-stamp place badge — the Vouch answer to travel-emoji stickers
 * ------------------------------------------------------------------ */
type StampTone = "seal" | "sage" | "ochre" | "ink";

function PlaceStamp({
  top,
  bottom,
  tone = "seal",
  rotate = 0,
  className,
}: {
  top: string;
  bottom: string;
  tone?: StampTone;
  rotate?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(s.placeStamp, s[`tone_${tone}`], className)}
      style={{ ["--rot" as string]: `${rotate}deg` }}
      aria-hidden="true"
    >
      <span className={s.placeStampRing} />
      <span className={s.placeStampTop}>{top}</span>
      <span className={s.placeStampStar}>&#10022;</span>
      <span className={s.placeStampBottom}>{bottom}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Screen 02 — the taste question (each answer earns a verdict)
 * ------------------------------------------------------------------ */
const ANSWERS = [
  {
    stampTop: "TEXT A",
    stampBottom: "FRIEND",
    tone: "seal" as StampTone,
    kicker: "I text a friend who knows",
    verdict: "Our kind of person.",
    body: "That's the whole idea. The best recommendation was never an average of 400 strangers — it's one human whose taste you actually trust.",
  },
  {
    stampTop: "READ THE",
    stampBottom: "REVIEWS",
    tone: "ochre" as StampTone,
    kicker: "I read 400 reviews first",
    verdict: "Brave soul.",
    body: "Sorted by “most recent,” second-guessing every meal, trusting a 4.1 from someone who orders ketchup with biryani. There's a faster way.",
  },
  {
    stampTop: "ASK THE",
    stampBottom: "ALGORITHM",
    tone: "sage" as StampTone,
    kicker: "I trust the algorithm",
    verdict: "Bless the algorithm.",
    body: "It has never eaten anywhere. Never been let down at 9pm. It doesn't have a favourite dosa. A person who's been there does.",
  },
  {
    stampTop: "JUST",
    stampBottom: "WANDER IN",
    tone: "ink" as StampTone,
    kicker: "I just wander in and hope",
    verdict: "Romantic. Risky.",
    body: "Sometimes it's magic. Sometimes it's sad paneer under fluorescent lights. A good list quietly hedges your bets — without killing the spontaneity.",
  },
];

/* ------------------------------------------------------------------ *
 * Screen 03 — what you can do
 * ------------------------------------------------------------------ */
const ACTIONS = [
  {
    band: "\u{1F319} Late-night Bangalore",
    title: "Build a list",
    body: "Name it, search, tap to add. Feels like making a playlist — two minutes, tops.",
  },
  {
    band: "☕ Cafés worth waking up for",
    title: "Vouch for the good ones",
    body: "A nod from you means more than a 4.2★. No star ratings here — just taste.",
  },
  {
    band: "\u{1F35B} Biryani, ranked",
    title: "Share a link, not a blog",
    body: "One beautiful URL. Drop it in WhatsApp or Instagram — friends see a list, not an SEO essay.",
  },
];

/* ------------------------------------------------------------------ *
 * Screen 04 — Bangalore, vouched (neighbourhood stamps)
 * ------------------------------------------------------------------ */
const HOODS = [
  "Indiranagar",
  "Koramangala",
  "Malleshwaram",
  "Jayanagar",
  "Frazer Town",
  "Church St",
];

const TOTAL_STEPS = 4;

export default function WelcomeClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);

  // pointer swipe for the macro deck
  const down = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback((next: number) => {
    setStep((prev) => Math.min(TOTAL_STEPS - 1, Math.max(0, next)));
  }, []);

  const finish = useCallback(() => {
    router.push("/sign-up");
  }, [router]);

  function onDeckDown(e: React.PointerEvent) {
    down.current = { x: e.clientX, y: e.clientY };
  }
  function onDeckUp(e: React.PointerEvent) {
    if (!down.current) return;
    const dx = e.clientX - down.current.x;
    const dy = e.clientY - down.current.y;
    down.current = null;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) go(step + 1);
    else go(step - 1);
  }

  // the verdict card owns horizontal gestures on screen 2
  const cardDown = useRef<number | null>(null);
  function cycleAnswer(dir: 1 | -1) {
    setAnswer((a) => {
      const base = a ?? 0;
      return (base + dir + ANSWERS.length) % ANSWERS.length;
    });
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
    if (Math.abs(dx) < 48) return;
    cycleAnswer(dx < 0 ? 1 : -1);
  }

  const active = answer ?? 0;
  const a = ANSWERS[active];

  return (
    <div className={s.root}>
      <div className={s.grain} aria-hidden="true" />

      {/* ============ TOP CHROME ============ */}
      <header className={s.chrome}>
        <button
          type="button"
          className={s.chromeBtn}
          onClick={() => (step === 0 ? router.push("/") : go(step - 1))}
          aria-label="Back"
        >
          <Icon name="chevron-left" size={22} />
        </button>

        <div className={s.progress} role="tablist" aria-label="Onboarding progress">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={cn(s.progressSeg, i <= step && s.progressOn)}
              onClick={() => go(i)}
              aria-label={`Go to step ${i + 1}`}
              aria-selected={i === step}
              role="tab"
            />
          ))}
        </div>

        <button type="button" className={s.skip} onClick={finish}>
          Skip
        </button>
      </header>

      {/* ============ DECK ============ */}
      <div
        className={s.deck}
        onPointerDown={onDeckDown}
        onPointerUp={onDeckUp}
      >
        <div
          className={s.track}
          style={{ transform: `translateX(-${step * 100}%)` }}
        >
          {/* ---------- 01 · COVER ---------- */}
          <section className={s.screen}>
            <div className={s.scroll}>
              <div className={s.coverTop}>
                <span className={s.coverIssue}>
                  Issue 01 &middot; Vol. 01
                </span>
                <span className={s.coverLive}>
                  <span className={s.liveDot} /> Bangalore &mdash; live
                </span>
              </div>

              <div className={s.coverStamps} aria-hidden="true">
                <PlaceStamp top="KOSHY'S" bottom="EST. 1940" tone="seal" rotate={-9} className={s.cs1} />
                <PlaceStamp top="SUBKO" bottom="INDIRANAGAR" tone="sage" rotate={7} className={s.cs2} />
                <PlaceStamp top="MTR" bottom="LALBAGH" tone="ochre" rotate={-5} className={s.cs3} />
                <PlaceStamp top="CTR" bottom="MALLESHWARAM" tone="ink" rotate={10} className={s.cs4} />
              </div>

              <div className={s.lockup}>
                <Stamp size={30} animated />
                <Wordmark />
              </div>

              <h1 className={s.coverTitle}>
                The places we&rsquo;d
                <br />
                <em>actually</em> send
                <br />
                a friend to.
              </h1>

              <p className={s.coverSub}>
                Vouch is a home for <strong>curated lists</strong> of the places
                you love. Built for people who&rsquo;d rather text a friend than
                read a thousand reviews.
              </p>

              <div className={s.scribble}>
                <svg viewBox="0 0 44 20" fill="none" aria-hidden="true">
                  <path
                    d="M2 18 C 10 9, 22 4, 42 2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M34 1 L42 2 L38 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                no star ratings. no algorithm. just taste.
              </div>
            </div>

            <footer className={s.footer}>
              <button type="button" className={cn(s.cta, s.ctaInk)} onClick={() => go(1)}>
                Open the issue <span className={s.arrow}>&rarr;</span>
              </button>
            </footer>
          </section>

          {/* ---------- 02 · THE TASTE QUESTION ---------- */}
          <section className={s.screen}>
            <div className={s.scroll}>
              <div className={s.qHead}>
                <h2 className={s.qTitle}>
                  How do you find places
                  <br />
                  worth going to?
                </h2>
                <p className={s.qSwipe}>Swipe to choose &middot; no wrong answers</p>
              </div>

              <div className={s.qStampRow} aria-hidden="true">
                {ANSWERS.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    className={cn(s.qStampBtn, i === active && s.qStampActive)}
                    onClick={() => setAnswer(i)}
                    aria-label={opt.kicker}
                  >
                    <PlaceStamp
                      top={opt.stampTop}
                      bottom={opt.stampBottom}
                      tone={opt.tone}
                      rotate={(i - 1.5) * 5}
                    />
                  </button>
                ))}
              </div>

              <div
                className={s.verdictCard}
                onPointerDown={onCardDown}
                onPointerUp={onCardUp}
              >
                <span className={s.verdictStack1} aria-hidden="true" />
                <span className={s.verdictStack2} aria-hidden="true" />
                <div className={s.verdictInner} key={active}>
                  <div className={cn(s.verdictKicker, s[`text_${a.tone}`])}>
                    {a.kicker}
                  </div>
                  <div className={s.verdictTitle}>{a.verdict}</div>
                  <p className={s.verdictBody}>{a.body}</p>
                </div>
              </div>

              <div className={s.dots} aria-hidden="true">
                {ANSWERS.map((_, i) => (
                  <span key={i} className={cn(s.dot, i === active && s.dotOn)} />
                ))}
              </div>
            </div>

            <footer className={s.footer}>
              <button type="button" className={cn(s.cta, s.ctaSeal)} onClick={() => go(2)}>
                {answer == null ? "That's the idea" : "Continue"}{" "}
                <span className={s.arrow}>&rarr;</span>
              </button>
            </footer>
          </section>

          {/* ---------- 03 · WHAT YOU CAN DO ---------- */}
          <section className={s.screen}>
            <div className={s.scroll}>
              <div className={s.eyebrow}>Hey curator</div>
              <h2 className={s.featTitle}>
                Everything you can do,
                <br />
                in about <em>two minutes.</em>
              </h2>
              <p className={s.featLede}>
                No forms. No nine-step setup. You name a list, add places, share a
                link. That&rsquo;s the entire product.
              </p>

              <div className={s.actionList}>
                {ACTIONS.map((act, i) => (
                  <article key={i} className={s.action}>
                    <div className={s.actionThumb} aria-hidden="true">
                      <div className={s.thumbBand}>{act.band}</div>
                      <div className={s.thumbLines}>
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                    <div className={s.actionText}>
                      <div className={s.actionRow}>
                        <span className={s.actionNum}>0{i + 1}</span>
                        <h3 className={s.actionTitle}>{act.title}</h3>
                      </div>
                      <p className={s.actionBody}>{act.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <footer className={s.footer}>
              <button type="button" className={cn(s.cta, s.ctaInk)} onClick={() => go(3)}>
                Show me Bangalore <span className={s.arrow}>&rarr;</span>
              </button>
            </footer>
          </section>

          {/* ---------- 04 · BANGALORE, VOUCHED ---------- */}
          <section className={s.screen}>
            <div className={s.scroll}>
              <div className={s.mapTabs}>
                <span className={cn(s.mapTab, s.mapTabOn)}>All time</span>
                <span className={s.mapTab}>This week</span>
                <span className={s.mapTab}>2026</span>
              </div>

              <div className={s.mapWrap} aria-hidden="true">
                <svg viewBox="0 0 400 460" fill="none" className={s.map}>
                  <defs>
                    <filter id="w-rough" x="-5%" y="-5%" width="110%" height="110%">
                      <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves={2} seed={3} />
                      <feDisplacementMap in="SourceGraphic" scale={3} />
                    </filter>
                  </defs>
                  <path
                    d="M155 35 L175 40 L195 38 L220 50 L240 48 L260 60 L280 78 L290 100 L302 130 L300 160 L292 188 L298 210 L295 240 L280 270 L260 300 L240 330 L220 360 L205 395 L188 430 L172 455 L158 470 L148 460 L138 440 L130 415 L122 388 L115 360 L108 335 L100 308 L98 280 L100 252 L108 226 L115 200 L118 175 L112 150 L102 128 L92 106 L88 84 L98 62 L120 48 L140 38 Z"
                    stroke="var(--v-ink)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fill="var(--v-seal-dim)"
                    filter="url(#w-rough)"
                  />
                  {/* Bangalore — live pin */}
                  <g transform="translate(180, 380)">
                    <circle r="14" fill="var(--v-seal)" opacity="0.2">
                      <animate attributeName="r" values="14;24;14" dur="2.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0;0.3" dur="2.6s" repeatCount="indefinite" />
                    </circle>
                    <circle r="7" fill="var(--v-seal)" stroke="var(--v-ink)" strokeWidth="1.5" />
                    <circle r="2.5" fill="var(--v-cream)" />
                    <text x="16" y="2" fontFamily="Fraunces" fontStyle="italic" fontSize="18" fill="var(--v-seal)" fontWeight="500">
                      Bangalore
                    </text>
                    <text x="16" y="18" fontFamily="JetBrains Mono" fontSize="9" fill="var(--v-seal)" letterSpacing="2">
                      LIVE NOW
                    </text>
                  </g>
                </svg>
              </div>

              <div className={s.bigStat}>23,400</div>
              <p className={s.bigStatSub}>
                places vouched for so far &mdash; and counting.
                <br />
                Your spot&rsquo;s probably still missing. &#127793;
              </p>

              <button type="button" className={cn(s.cta, s.ctaSeal, s.magicCta)} onClick={finish}>
                <Icon name="vouch" size={17} /> Start with your first list
              </button>

              <div className={s.statCard}>
                <div className={s.statCardHead}>
                  <span className={s.statCardN}>512</span>
                  <span className={s.statCardL}>
                    curators
                    <br />
                    in BLR
                  </span>
                </div>
                <div className={s.hoodRow}>
                  {HOODS.map((h, i) => (
                    <span key={h} className={s.hood} title={h}>
                      <span className={cn(s.hoodSeal, s[`hoodTone_${i % 4}`])}>
                        {h.slice(0, 2)}
                      </span>
                    </span>
                  ))}
                </div>
                <div className={s.viewAll}>
                  View all neighbourhoods <Icon name="chevron-right" size={15} />
                </div>
              </div>
            </div>

            <footer className={s.footer}>
              <button type="button" className={cn(s.cta, s.ctaInk)} onClick={finish}>
                Claim your handle <span className={s.arrow}>&rarr;</span>
              </button>
              <button type="button" className={s.textLink} onClick={finish}>
                I&rsquo;ll explore first
              </button>
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
}
