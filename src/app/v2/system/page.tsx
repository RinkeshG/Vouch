import type { Metadata } from "next";
import landing from "../landing.module.css";
import s from "./system.module.css";

export const metadata: Metadata = {
  title: "Vouch — Design System v1.0",
  description: "The Vouch brand book & design system. After Dark. Built for people who care where they eat.",
};

const FONTS =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap";

function Mark({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 26 26" fill="none" aria-hidden="true" width={size} height={size}>
      <rect x="0.7" y="0.7" width="24.6" height="24.6" rx="4" stroke="currentColor" strokeWidth="1.3" opacity="0.5" />
      <path d="M7 8.5l6 9 6-9" stroke="#f6a82b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const PRINCIPLES = [
  ["01", "Trust has a face", "Nothing is anonymous. Every recommendation shows who vouched — and who you follow that saved it. Never a number where we could show a name."],
  ["02", "Show, don't describe", "A real card beats a paragraph about the card. When we can let someone use the magic, we do."],
  ["03", "Appetite is the brief", "This is food. It should feel like the warm glow from a kitchen at night — not a SaaS dashboard."],
  ["04", "Editorial, not corporate", "A field guide with a point of view. Confident display type, mono catalog labels, real opinions in the copy."],
  ["05", "Mobile is the room", "Most people meet Vouch one-handed, deciding dinner. Phone first; desktop inherits."],
  ["06", "Motion is seasoning", "It rewards action and signals life. Never blocks, never nags, always yields to reduced-motion."],
  ["07", "Everything earns its place", "If you can't say why an element is there and what job it does, delete it."],
];

const INK = [
  ["--footer-bg", "#0c0b09", "Footer, deepest wells"],
  ["--bg", "#100f0d", "App background"],
  ["--bg-alt", "#16140f", "Alt bands, sunken areas"],
  ["--surface", "#1a1712", "Cards, sheets — the raised plane"],
  ["--surface-2", "#221d16", "Chips on cards, stacked faces"],
];
const PAPER = [
  ["--text", "#f3eee3", "Primary text & headlines"],
  ["--muted", "#a79e90", "Secondary / body-secondary"],
  ["--faint", "#756c5f", "Tertiary, meta, hints (large/UI only)"],
];
const ACCENT = [
  ["--accent", "#f6a82b", "The brand. Appetite, active, 'this matters'"],
  ["--accent-hi", "#ffc658", "Gradient top, hover sheen"],
  ["--danger", "#ff5b33", "Heat, errors, the struck 'no'"],
  ["--success", "#76d29b", "Live, saved, joined, 'go'"],
];
const LINES = [
  ["--line", "rgba(244,238,227,.12)", "Default divider"],
  ["--line-2", "rgba(244,238,227,.20)", "Stronger border"],
  ["--rule", "rgba(244,238,227,.28)", "Dotted leader lines"],
];

const LEXICON = [
  ["Vouch", "verb / noun", <>To put your name on a place; the atomic unit of trust. The one review allowed to exist here. <b>“I vouched for Naru.”</b></>],
  ["Palate", "noun", <>A person on Vouch <b>and</b> their taste. You follow palates, not users. <b>“What's your palate?”</b></>],
  ["Guide", "noun", <>A curated, named collection of vouches by one palate. (Never say <b>list</b> in product.)</>],
  ["Spot", "noun", <>A single place worth returning to. <b>“your spots.”</b></>],
  ["Map", "noun", <>Your personal surface — everything your palates have vouched, where you are. The feed <b>is</b> a map.</>],
];

function Swatch({ token, value, role }: { token: string; value: string; role: string }) {
  return (
    <div className={s.swatch}>
      <div className={s.swatchChip} style={{ background: value }} />
      <div className={s.swatchMeta}>
        <div className={s.swatchName}>{token}</div>
        <div className={s.swatchHex}>{value}</div>
        <div className={s.swatchRole}>{role}</div>
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <>
      <link rel="stylesheet" href={FONTS} />
      <div className={landing.page}>
        <span className={landing.grain} aria-hidden="true" />

        <div className={s.wrap}>
          {/* COVER */}
          <header className={s.cover}>
            <p className={s.coverTag}><i /> Vouch · Design System · v1.0</p>
            <h1 className={s.coverTitle}>After Dark.<br />The system behind <em>the name on it.</em></h1>
            <p className={s.coverLede}>
              The brand book and design system we build the whole product from. Distilled
              from the landing, formalised into tokens, and <b>opinionated on purpose</b> —
              so the team moves fast and stays coherent.
            </p>
          </header>

          {/* PRINCIPLES */}
          <section className={s.sec}>
            <div className={s.secHead}>
              <p className={s.secLabel}><i /> 01 — <b>Principles</b></p>
              <h2 className={s.secTitle}>The seven tie-breakers.</h2>
              <p className={s.secBody}>When two designs both “look fine,” the one that honours these wins.</p>
            </div>
            <div className={s.principles}>
              {PRINCIPLES.map(([n, t, b]) => (
                <div className={s.principle} key={n as string}>
                  <span className={s.principleNum}>{n}</span>
                  <h3 className={s.principleTitle}>{t}</h3>
                  <p className={s.principleBody}>{b}</p>
                </div>
              ))}
            </div>
          </section>

          {/* LOGO */}
          <section className={s.sec}>
            <div className={s.secHead}>
              <p className={s.secLabel}><i /> 02 — <b>Logo & wordmark</b></p>
              <h2 className={s.secTitle}>The V in the seal.</h2>
              <p className={s.secBody}>A passport stamp containing a checkmark V — <b>vouch</b> and <b>ledger mark</b> at once. Bricolage 800, saffron V. Clearspace = the mark's height. Below 20px, drop the mark.</p>
            </div>
            <div className={s.logoRow}>
              <div className={s.logoTile}>
                <span className={s.logoLockup} style={{ color: "var(--text)" }}><Mark /> Vouch</span>
                <span className={s.logoCaption}>Primary lockup · on surface</span>
              </div>
              <div className={`${s.logoTile} ${s.logoTileDark}`}>
                <span className={s.logoLockup} style={{ color: "var(--text)" }}><Mark /> Vouch</span>
                <span className={s.logoCaption}>On ink</span>
              </div>
              <div className={`${s.logoTile} ${s.logoTileSaffron}`}>
                <span className={`${s.logoLockup} ${s.logoOnSaffron}`}>
                  <svg viewBox="0 0 26 26" fill="none" aria-hidden="true" width="40" height="40">
                    <rect x="0.7" y="0.7" width="24.6" height="24.6" rx="4" stroke="#1c1408" strokeWidth="1.3" opacity="0.55" />
                    <path d="M7 8.5l6 9 6-9" stroke="#1c1408" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Vouch
                </span>
                <span className={s.logoCaption} style={{ color: "rgba(28,20,8,.6)" }}>On saffron · ink V</span>
              </div>
            </div>
          </section>

          {/* COLOUR */}
          <section className={s.sec}>
            <div className={s.secHead}>
              <p className={s.secLabel}><i /> 03 — <b>Colour</b></p>
              <h2 className={s.secTitle}>A near-black room, one warm lamp.</h2>
              <p className={s.secBody}>Dark-first and warm. Light is precious — used for type and for the one colour that means appetite: <b>saffron</b>. One saffron moment per view.</p>
            </div>
            <div className={s.swatchGroup}>
              <p className={s.swatchGroupName}>Ink · backgrounds & surfaces</p>
              <div className={s.swatchGrid}>{INK.map(([t, v, r]) => <Swatch key={t} token={t} value={v} role={r} />)}</div>
            </div>
            <div className={s.swatchGroup}>
              <p className={s.swatchGroupName}>Paper · text</p>
              <div className={s.swatchGrid}>{PAPER.map(([t, v, r]) => <Swatch key={t} token={t} value={v} role={r} />)}</div>
            </div>
            <div className={s.swatchGroup}>
              <p className={s.swatchGroupName}>Accents · used with intent</p>
              <div className={s.swatchGrid}>{ACCENT.map(([t, v, r]) => <Swatch key={t} token={t} value={v} role={r} />)}</div>
            </div>
            <div className={s.swatchGroup}>
              <p className={s.swatchGroupName}>Lines · paper at low alpha</p>
              <div className={s.swatchGrid}>{LINES.map(([t, v, r]) => <Swatch key={t} token={t} value={v} role={r} />)}</div>
            </div>
          </section>

          {/* TYPE */}
          <section className={s.sec}>
            <div className={s.secHead}>
              <p className={s.secLabel}><i /> 04 — <b>Typography</b></p>
              <h2 className={s.secTitle}>Three families, three jobs.</h2>
              <p className={s.secBody}>The contrast between them <b>is</b> the editorial voice. Bricolage for display & numerals, Space Grotesk for body, Space Mono for the catalog labels.</p>
            </div>
            <div className={s.specimens}>
              <div className={s.specimen}>
                <div className={s.specimenMeta}><b>Display XL</b>Bricolage 800<br />clamp 2.5–4.7rem</div>
                <div className={s.spDisplayXl}>Where to eat, from people you trust.</div>
              </div>
              <div className={s.specimen}>
                <div className={s.specimenMeta}><b>Display L</b>Bricolage 700<br />section headers</div>
                <div className={s.spDisplayL}>Guides are how taste becomes shareable.</div>
              </div>
              <div className={s.specimen}>
                <div className={s.specimenMeta}><b>Display S</b>Bricolage 700<br />card titles, places</div>
                <div className={s.spDisplayS}>Naru Noodle Bar</div>
              </div>
              <div className={s.specimen}>
                <div className={s.specimenMeta}><b>Body</b>Space Grotesk 400<br />root 17px / 1.6</div>
                <div>
                  <p className={s.spBody} style={{ margin: 0 }}>Follow the palates you trust. Their vouches — not star ratings — tell you where to eat tonight.</p>
                  <p className={s.spBodyMuted} style={{ margin: "8px 0 0" }}>Secondary copy sits in muted paper, never below AA for body.</p>
                </div>
              </div>
              <div className={s.specimen}>
                <div className={s.specimenMeta}><b>Label / Mono</b>Space Mono 700<br />uppercase · tracked</div>
                <div className={s.spLabel}>ON YOUR MAP · TONIGHT · ● LIVE · 01 / THE PROBLEM</div>
              </div>
            </div>
          </section>

          {/* LEXICON */}
          <section className={s.sec}>
            <div className={s.secHead}>
              <p className={s.secLabel}><i /> 05 — <b>The lexicon</b></p>
              <h2 className={s.secTitle}>Our words.</h2>
              <p className={s.secBody}>A vocabulary that only makes sense inside Vouch is half the brand. Use these precisely — in product, in marketing, in code.</p>
            </div>
            <div className={s.lex}>
              {LEXICON.map(([w, k, d], i) => (
                <div className={s.lexRow} key={i}>
                  <div><span className={s.lexWord}>{w as string}</span><span className={s.lexKind}>{k as string}</span></div>
                  <p className={s.lexDef}>{d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* COMPONENTS */}
          <section className={s.sec}>
            <div className={s.secHead}>
              <p className={s.secLabel}><i /> 06 — <b>Components</b></p>
              <h2 className={s.secTitle}>The kit.</h2>
              <p className={s.secBody}>Build screens from these. The full spec — states, do/don't — lives in <b>components.md</b>.</p>
            </div>
            <div className={s.demoGrid}>
              {/* buttons */}
              <div className={s.demo}>
                <span className={s.demoLabel}>Buttons — there are only three</span>
                <div className={s.demoStageCol}>
                  <button className={s.btnPrimary} type="button">Request invite →</button>
                  <button className={s.btnGhost} type="button">Add to a guide</button>
                  <button className={s.btnMono} type="button">Request invite →</button>
                </div>
              </div>
              {/* stamps */}
              <div className={s.demo}>
                <span className={s.demoLabel}>The three vouch stamps</span>
                <div className={s.demoStageCol}>
                  <span className={`${s.stamp} ${s.stampGold}`}><span className={s.stampDot} /> Want to go</span>
                  <span className={`${s.stamp} ${s.stampJade}`}><span className={s.stampDot} /> Been</span>
                  <span className={`${s.stamp} ${s.stampSaffron}`}><span className={s.stampDot} /> Vouched</span>
                </div>
              </div>
              {/* tags + avatars */}
              <div className={s.demo}>
                <span className={s.demoLabel}>Tags · avatar · face stack</span>
                <div className={s.demoStage}>
                  <span className={s.tag}>Ramen</span><span className={s.tag}>Indiranagar</span><span className={s.tag}>₹₹₹</span>
                </div>
                <div className={s.demoStage}>
                  <span className={s.aAvatar}>RG</span>
                  <span className={s.aFaces} aria-hidden="true"><i>RG</i><i>MK</i><i>AS</i><i>+3</i></span>
                </div>
              </div>
              {/* input */}
              <div className={s.demo}>
                <span className={s.demoLabel}>Invite field</span>
                <div className={s.field}>
                  <input className={s.fieldInput} placeholder="you@where-you-eat.com" aria-label="Email demo" />
                  <button className={s.fieldBtn} type="button">Request →</button>
                </div>
                <span className={s.demoLabel}>// invite-only · no spam · a seat at the table</span>
              </div>
              {/* leader rows */}
              <div className={`${s.demo} ${s.demoFull}`}>
                <span className={s.demoLabel}>Leader row — the ledger primitive</span>
                <div>
                  <div className={s.lrow}><span className={s.lrowNum}>01</span><span className={s.lrowName}>Karavalli</span><span className={s.lrowDots} /><span className={s.lrowMeta}>Coastal · ₹₹₹₹</span></div>
                  <div className={s.lrow}><span className={s.lrowNum}>02</span><span className={s.lrowName}>Vidyarthi Bhavan</span><span className={s.lrowDots} /><span className={s.lrowMeta}>Dosa · ₹</span></div>
                  <div className={s.lrow}><span className={s.lrowNum}>03</span><span className={s.lrowName}>Koshy's</span><span className={s.lrowDots} /><span className={s.lrowMeta}>Old-school · ₹₹</span></div>
                </div>
              </div>
              {/* rec card */}
              <div className={`${s.demo} ${s.demoFull}`}>
                <span className={s.demoLabel}>The recommendation card — a place with its receipts (brand-critical)</span>
                <div className={s.vcard}>
                  <div className={s.vTop}>
                    <span className={s.vLabel}>On your map · tonight</span>
                    <span className={s.vLive}><i /> 1.2 km</span>
                  </div>
                  <h3 className={s.vName}>Karavalli</h3>
                  <span className={s.vTags}>Coastal · Residency Rd · ₹₹₹₹</span>
                  <div className={s.vWhy}>
                    <span className={s.vWhyLabel}>Why you're seeing this</span>
                    <div className={s.vTrailRow}>
                      <span className={s.aAvatar} style={{ width: 30, height: 30, fontSize: "0.6rem" }}>AS</span>
                      <span className={s.vTrailText}><b>Aditi</b> vouched it — “Take your parents…”</span>
                      <span className={s.vTrailTime}>2h</span>
                    </div>
                    <div className={s.vTrailRow}>
                      <span className={s.aFaces} aria-hidden="true"><i>RG</i><i>MK</i></span>
                      <span className={s.vTrailText}><b>Rinkesh, Meera</b> +1 you follow saved it</span>
                      <span className={s.vTrailTime}>now</span>
                    </div>
                  </div>
                  <div className={s.vActions}>
                    <button className={s.btnPrimary} type="button">＋ Save</button>
                    <button className={s.btnGhost} type="button">Add to a guide</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TOKENS QUICK-REF */}
          <section className={s.sec}>
            <div className={s.secHead}>
              <p className={s.secLabel}><i /> 07 — <b>Tokens</b></p>
              <h2 className={s.secTitle}>The source of truth.</h2>
              <p className={s.secBody}>Never hard-code a colour, radius, or easing. Read from <b>tokens.css</b>. A few you'll reach for constantly:</p>
            </div>
            <table className={s.tokenTable}>
              <tbody>
                <tr><td style={{ width: 34 }}><span className={s.tokenSwatch} style={{ background: "var(--accent-gradient)" }} /></td><td className={s.tokenName}>--accent-gradient</td><td className={s.tokenVal}>135deg #ffc658→#f6a82b</td><td className={s.tokenRole}>Every primary button, the highlight</td></tr>
                <tr><td><span className={s.tokenSwatch} style={{ background: "var(--surface)" }} /></td><td className={s.tokenName}>--surface</td><td className={s.tokenVal}>#1a1712</td><td className={s.tokenRole}>The default raised plane</td></tr>
                <tr><td /><td className={s.tokenName}>--ease</td><td className={s.tokenVal}>cubic-bezier(.2,.7,.2,1)</td><td className={s.tokenRole}>The “Vouch ease” — ~90% of motion</td></tr>
                <tr><td /><td className={s.tokenName}>--radius-xl</td><td className={s.tokenVal}>14px</td><td className={s.tokenRole}>Cards</td></tr>
                <tr><td /><td className={s.tokenName}>--section-y</td><td className={s.tokenVal}>clamp(56px,8vw,112px)</td><td className={s.tokenRole}>Section vertical rhythm</td></tr>
                <tr><td /><td className={s.tokenName}>--shadow-pop</td><td className={s.tokenVal}>0 12px 26px -12px saffron</td><td className={s.tokenRole}>Saffron buttons glow, don't drop-shadow</td></tr>
              </tbody>
            </table>
          </section>

          {/* FOOTER */}
          <footer className={s.bookFoot}>
            <p>
              Vouch Design System · v1.0 · After Dark<br />
              Full reference in <b>/docs/design-system</b> — brand · foundations · components · patterns · tokens<br />
              Built for people who care where they eat · Bengaluru edition
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
