"use client";

import s from "./landing-v3.module.css";

/* ===========================================================================
   VOUCH — landing, v3 system.
   It never says "tastemaker" or "your recs die in your DMs." It positions the
   visitor as the one people ask, lets the ache (given away, never kept) live
   underneath, and sells status + taste by embodying them — warm-dark, amber,
   Hanken, restraint. The artifact is the dream you earn, not the opener.
   ========================================================================= */

const HANKEN =
  "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap";

type Cat = "coffee" | "food" | "drink" | "view";
const TINT: Record<Cat, string> = { coffee: "#E2A65A", food: "#DB7A53", drink: "#D6A647", view: "#C98D5A" };
const CAT_LABEL: Record<Cat, string> = { coffee: "coffee", food: "food", drink: "drinks", view: "the view" };

function mapTile(lat: number, lng: number, z = 14): string {
  const n = 2 ** z;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latR = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.asinh(Math.tan(latR)) / Math.PI) / 2) * n);
  return `https://a.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}@2x.png`;
}

/* the answers given away in a hundred messages — the ache, never spelled out */
const WHISPERS = [
  { t: "go to Airlines — filter coffee under the rain trees", top: "2%", left: "0%", d: "0s" },
  { t: "Toit, but only on a weekday", top: "30%", left: "44%", d: "2.6s" },
  { t: "VV Puram. just walk and eat everything", top: "58%", left: "6%", d: "5.1s" },
  { t: "Byg Brewski for the sunset, not the beer", top: "82%", left: "40%", d: "1.4s" },
];

/* the one that gets kept */
const KEPT = { name: "Airlines Hotel", area: "Lavelle Rd", lat: 12.9698, lng: 77.5985, cat: "coffee" as Cat,
  note: "where i take everyone who's new to the city. filter coffee under the rain trees, before it wakes up and gets loud.", by: "Priya", ini: "PR" };

/* the company you keep — guides, by people worth asking */
const WALL = [
  { title: "where i actually take people", area: "Bengaluru", lat: 12.9783, lng: 77.6408, cat: "coffee" as Cat, name: "Priya R.", ini: "PR", n: 6 },
  { title: "the only filter coffee that matters", area: "Basavanagudi", lat: 12.9417, lng: 77.5731, cat: "coffee" as Cat, name: "Kabir M.", ini: "KM", n: 9 },
  { title: "where to go at 1am", area: "Koramangala", lat: 12.9352, lng: 77.6245, cat: "drink" as Cat, name: "Ananya S.", ini: "AS", n: 7 },
];

function Cover({ lat, lng, cat, height = 150 }: { lat: number; lng: number; cat: Cat; height?: number }) {
  const tint = TINT[cat];
  return (
    <div className={s.cover} style={{ height }}>
      <div className={s.coverTint} style={{ background: `linear-gradient(150deg, color-mix(in srgb, ${tint} 16%, #1a130b), #100c07)` }} />
      <div className={s.coverImg} style={{ backgroundImage: `url("${mapTile(lat, lng)}")` }} />
      <div className={s.coverWarm} />
      <div className={s.coverScrim} />
      <span className={s.pin} />
      <span className={s.catChip} style={{ color: tint, background: `color-mix(in srgb, ${tint} 16%, rgba(16,12,7,.62))`, border: `1px solid color-mix(in srgb, ${tint} 42%, transparent)` }}>
        {CAT_LABEL[cat]}
      </span>
    </div>
  );
}

function Brand() {
  return <span className={s.brand}><span className={s.brandDot} aria-hidden="true" />Vouch</span>;
}

export default function VouchLandingV3() {
  return (
    <>
      <link rel="stylesheet" href={HANKEN} />
      <div className={s.page}>
        <span className={s.grain} aria-hidden="true" />

        <header className={s.nav}>
          <div className={s.wrap}>
            <div className={s.navInner}>
              <a href="#top" style={{ textDecoration: "none" }}><Brand /></a>
              <a href="/guides" className={s.navLink}>Start yours</a>
            </div>
          </div>
        </header>

        {/* ---- ACT I — the room (positioning, felt) ---- */}
        <section className={s.hero} id="top">
          <span className={s.heroGlow} aria-hidden="true" />
          <span className={s.sky} aria-hidden="true">
            <i className={s.star} style={{ top: "22%", left: "58%", animationDelay: "0s" }} />
            <i className={s.star} style={{ top: "36%", left: "78%", animationDelay: "1.2s" }} />
            <i className={s.star} style={{ top: "62%", left: "66%", animationDelay: "2.4s" }} />
            <i className={s.star} style={{ top: "30%", left: "90%", animationDelay: "3.1s" }} />
            <i className={s.star} style={{ top: "74%", left: "84%", animationDelay: "1.8s" }} />
            <i className={s.star} style={{ top: "50%", left: "52%", animationDelay: "4s" }} />
          </span>
          <div className={s.wrap}>
            <div className={s.heroBody}>
              <p className={s.eyebrow}><i />the places people ask you for</p>
              <h1 className={s.h1}>
                <span className={s.l1}>Everyone knows someone with the answers.</span>
                <span className={s.l2}>You&rsquo;re theirs.</span>
              </h1>
              <p className={s.sub}>
                The spots you text, screenshot, and send again &mdash; kept somewhere that
                finally does them justice. <b>Your name on every one.</b>
              </p>
              <div className={s.heroCta}>
                <a href="/guides" className={s.btn}>Start your collection <span aria-hidden="true">&rarr;</span></a>
                <a href="#kept" className={s.btnQuiet}>see one <span aria-hidden="true">&darr;</span></a>
              </div>
            </div>
          </div>
          <span className={s.scrollHint}><span aria-hidden="true" /></span>
        </section>

        {/* ---- ACT II — the ache (given away → kept) ---- */}
        <section className={s.act} id="kept">
          <div className={s.wrap}>
            <h2 className={s.actLine}>
              <span className={s.dim}>You&rsquo;ve given the same answer a hundred times.</span><br />
              Not once was it <span className={s.amber}>yours to keep.</span>
            </h2>
            <div className={s.ephem} aria-hidden="true">
              {WHISPERS.map((w) => (
                <span key={w.t} className={s.msg} style={{ top: w.top, left: w.left, animationDelay: w.d }}>{w.t}</span>
              ))}
            </div>
            <div className={s.kept}>
              <article className={s.card}>
                <Cover lat={KEPT.lat} lng={KEPT.lng} cat={KEPT.cat} />
                <span className={s.byTag}><span>{KEPT.ini}</span>by {KEPT.by}</span>
                <div className={s.cardBody}>
                  <h3 className={s.placeName}>{KEPT.name}</h3>
                  <span className={s.loc}>◍ {KEPT.area} <span style={{ opacity: 0.6 }}>↗</span></span>
                  <p className={s.note}>&ldquo;{KEPT.note}&rdquo;</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ---- ACT III — the company you keep (status by association) ---- */}
        <section className={s.act}>
          <div className={s.wrap}>
            <div className={s.actHead}>
              <p className={s.actKicker}>kept by people worth asking</p>
              <h2 className={s.actTitle}>You&rsquo;d be in good company.</h2>
            </div>
            <div className={s.wall}>
              {WALL.map((g) => (
                <article key={g.title} className={s.card}>
                  <Cover lat={g.lat} lng={g.lng} cat={g.cat} height={132} />
                  <span className={s.byTag}><span>{g.ini}</span>{g.name}</span>
                  <div className={s.cardBody}>
                    <h3 className={s.placeName} style={{ fontSize: "1.18rem" }}>{g.title}</h3>
                    <span className={s.loc}>◍ {g.area} · {g.n} spots</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---- ACT IV — the door (the ask) ---- */}
        <section className={s.door}>
          <span className={s.doorGlow} aria-hidden="true" />
          <div className={s.wrap}>
            <h2 className={s.doorTitle}>Start your <em>collection.</em></h2>
            <p className={s.doorSub}>The places you&rsquo;re known for, kept somewhere worthy of them &mdash; and yours alone.</p>
            <div className={s.doorCta}>
              <a href="/guides" className={s.btn}>Start your collection <span aria-hidden="true">&rarr;</span></a>
            </div>
            <p className={s.doorMeta}>free · Bengaluru, for now</p>
          </div>
        </section>

        <footer className={s.footer}>
          <div className={s.wrap}>
            <div className={s.footInner}>
              <Brand />
              <span>kept in Bengaluru</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
