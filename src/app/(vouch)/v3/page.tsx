"use client";
import { SEED } from "../../../components/v2/data";
import { Button, CatIcon, Curator, Monogram, PlaceCard } from "../../../components/v3/kit";

/* The landing — the front door.
   Spine: Julian Shapiro's above-the-fold (value title → how → visual → proof → CTA).
   Voice: StoryBrand (the visitor is the hero with taste; Vouch is the guide).
   Below fold: PAS (name the pain → agitate → relieve). Show the product, never
   list features. Built on the locked foundation: Hanken · warm-dark · amber. */

const wrap: React.CSSProperties = { maxWidth: 1120, margin: "0 auto", padding: "0 28px" };

function Stat({ ini }: { ini: string }) {
  return <span style={{ width: 30, height: 30, borderRadius: "50%", marginLeft: -8, border: "2px solid var(--bg)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600, color: "var(--accent-ink)", background: "linear-gradient(140deg,var(--accent-2),var(--accent))" }}>{ini}</span>;
}

export default function Landing() {
  return (
    <main style={{ minHeight: "100dvh", overflow: "hidden" }}>
      {/* nav */}
      <nav style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 22, paddingBottom: 22 }}>
        <span style={{ fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>vouch<span style={{ color: "var(--accent)" }}>.</span></span>
        <span style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <a href="/v3/g/priya" style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}>see an example</a>
          <a href="/v3/new" style={{ textDecoration: "none" }}><Button>Make your guide</Button></a>
        </span>
      </nav>

      {/* HERO */}
      <section style={{ ...wrap, paddingTop: "clamp(36px,6vw,72px)", paddingBottom: "clamp(48px,7vw,96px)", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 48, alignItems: "center" }} className="v3-hero">
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", width: 420, height: 300, top: -80, left: -120, borderRadius: "50%", filter: "blur(90px)", opacity: 0.16, background: "radial-gradient(circle,var(--accent),transparent 70%)", pointerEvents: "none" }} />
          <p style={{ position: "relative", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500, color: "var(--accent)", margin: 0 }}>no stars · no strangers</p>
          <h1 style={{ position: "relative", fontWeight: 600, fontSize: "clamp(2.5rem,5.2vw,4rem)", lineHeight: 1.0, letterSpacing: "-0.03em", color: "var(--ink)", margin: "16px 0 0", maxWidth: "16ch" }}>You're the friend people ask where to go.</h1>
          <p style={{ position: "relative", fontSize: "clamp(1.05rem,1.5vw,1.25rem)", lineHeight: 1.55, color: "var(--muted)", margin: "20px 0 0", maxWidth: "46ch" }}>Vouch turns your answer into a page worth sending — your places, in your words, with your name on every one. Make it once, send it forever.</p>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16, margin: "30px 0 0", flexWrap: "wrap" }}>
            <a href="/v3/new" style={{ textDecoration: "none" }}><Button>Make your guide →</Button></a>
            <a href="/v3/g/priya" style={{ textDecoration: "none" }}><Button variant="ghost">see an example</Button></a>
          </div>
          <p style={{ position: "relative", fontSize: "0.78rem", color: "var(--faint)", margin: "12px 0 0" }}>free · about two minutes · no app to download</p>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, marginTop: 30 }}>
            <span style={{ display: "flex" }}><Stat ini="PR" /><Stat ini="AK" /><Stat ini="ME" /><Stat ini="RG" /></span>
            <span style={{ fontSize: "0.82rem", color: "var(--muted)", maxWidth: "26ch", lineHeight: 1.4 }}>Guides from the people who actually know their city.</span>
          </div>
        </div>

        {/* the visual — the product itself */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: -30, borderRadius: 28, background: "radial-gradient(60% 50% at 70% 20%, rgba(230,162,62,.14), transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", background: "linear-gradient(165deg,var(--surface),#100c07)", border: "1px solid var(--line-2)", borderRadius: "var(--r-xl)", padding: 20, boxShadow: "var(--shadow-lift)" }}>
            <div style={{ marginBottom: 16 }}><Curator name="Priya R." ini="PR" bio="Indiranagar · six years" size={38} /></div>
            <p style={{ fontWeight: 600, fontSize: "1.15rem", letterSpacing: "-0.01em", margin: "0 0 14px" }}>Bangalore, the way I'd give it to you.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <PlaceCard place={SEED.places[0]} rank={1} />
              <PlaceCard place={SEED.places[2]} rank={2} />
            </div>
          </div>
        </div>
      </section>

      {/* PAIN — PAS */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ ...wrap, padding: "clamp(56px,8vw,96px) 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="v3-row">
          <div>
            <h2 style={{ fontWeight: 600, fontSize: "clamp(1.8rem,3.4vw,2.6rem)", lineHeight: 1.08, letterSpacing: "-0.02em", color: "var(--ink)", margin: 0, maxWidth: "15ch" }}>Your best recommendations are dying in your DMs.</h2>
            <p style={{ fontSize: "1.08rem", lineHeight: 1.6, color: "var(--muted)", margin: "18px 0 0", maxWidth: "44ch" }}>Retyped in every group chat. Buried in a note you'll never find again. Or dumped into a maps list that looks like everyone else's. The good stuff you actually know deserves better than that.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[["where do i eat in blr?? 😩", "them"], ["didn't you have a list somewhere", "them"], ["wait what was that coffee place", "them"], ["…", "me"]].map(([t, who], i) => (
              <div key={i} style={{ alignSelf: who === "me" ? "flex-end" : "flex-start", maxWidth: "78%", background: who === "me" ? "var(--accent-dim)" : "var(--surface-2)", border: `1px solid ${who === "me" ? "var(--accent-line)" : "var(--line-2)"}`, color: who === "me" ? "var(--accent)" : "var(--muted)", borderRadius: 16, borderBottomRightRadius: who === "me" ? 5 : 16, borderBottomLeftRadius: who === "me" ? 16 : 5, padding: "10px 14px", fontSize: "0.92rem" }}>{t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW — 3 steps, shown */}
      <section style={{ ...wrap, padding: "clamp(56px,8vw,96px) 28px" }}>
        <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500, color: "var(--accent)", margin: 0, textAlign: "center" }}>how it works</p>
        <h2 style={{ fontWeight: 600, fontSize: "clamp(1.8rem,3.4vw,2.5rem)", letterSpacing: "-0.02em", color: "var(--ink)", margin: "12px 0 0", textAlign: "center" }}>Three minutes, start to send.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginTop: 44 }} className="v3-steps">
          {[
            { n: "01", t: "Add your places", d: "Search a spot and it's in — name, neighbourhood, the works. No data entry.", icon: <CatIcon cat="coffee" size={22} /> },
            { n: "02", t: "Say why you love it", d: "One honest line and what to order. Your voice is the whole point.", icon: <span style={{ fontStyle: "italic", fontSize: 20 }}>"</span> },
            { n: "03", t: "Send the link", d: "It lands in a chat looking like you made something — because you did.", icon: <span style={{ fontSize: 18 }}>↗</span> },
          ].map((s) => (
            <div key={s.n} style={{ background: "linear-gradient(165deg,var(--card-top),var(--card-bot))", border: "1px solid var(--line-2)", borderRadius: "var(--r-xl)", padding: "24px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ width: 42, height: 42, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", color: "var(--accent)", background: "var(--accent-dim)", border: "1px solid var(--accent-line)" }}>{s.icon}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--faint)" }}>{s.n}</span>
              </div>
              <h3 style={{ fontWeight: 600, fontSize: "1.2rem", color: "var(--ink)", margin: "16px 0 0" }}>{s.t}</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.55, color: "var(--muted)", margin: "8px 0 0" }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY DIFFERENT — own the niche */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ ...wrap, padding: "clamp(56px,8vw,96px) 28px", display: "grid", gridTemplateColumns: "1fr 0.85fr", gap: 48, alignItems: "center" }} className="v3-row">
          <div>
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500, color: "var(--accent)", margin: 0 }}>why it's different</p>
            <h2 style={{ fontWeight: 600, fontSize: "clamp(1.8rem,3.4vw,2.6rem)", lineHeight: 1.08, letterSpacing: "-0.02em", color: "var(--ink)", margin: "12px 0 0", maxWidth: "16ch" }}>A recommendation is only as good as who it's from.</h2>
            <p style={{ fontSize: "1.08rem", lineHeight: 1.6, color: "var(--muted)", margin: "18px 0 0", maxWidth: "44ch" }}>No star averages. No strangers. No SEO'd listicle pretending to know your city. Just the places someone you trust would actually take you — with their name on every single one.</p>
          </div>
          <div style={{ maxWidth: 330, justifySelf: "center" }}><PlaceCard place={SEED.places[3]} rank={1} /></div>
        </div>
      </section>

      {/* FOR YOU / FOR THEM */}
      <section style={{ ...wrap, padding: "clamp(56px,8vw,96px) 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }} className="v3-row">
        {[
          { k: "for you", t: "Give it once. Beautifully.", d: "Stop retyping. Make the guide people keep asking you for, and feel a little proud every time you send it." },
          { k: "for them", t: "Like having a local friend.", d: "They open it, they trust it, they go. The relief of being taken care of by someone who actually knows." },
        ].map((c) => (
          <div key={c.k} style={{ padding: "8px 4px" }}>
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--faint)", margin: 0 }}>{c.k}</p>
            <h3 style={{ fontWeight: 600, fontSize: "clamp(1.4rem,2.4vw,1.9rem)", letterSpacing: "-0.015em", color: "var(--ink)", margin: "10px 0 0" }}>{c.t}</h3>
            <p style={{ fontSize: "1.02rem", lineHeight: 1.6, color: "var(--muted)", margin: "12px 0 0", maxWidth: "40ch" }}>{c.d}</p>
          </div>
        ))}
      </section>

      {/* CLOSE */}
      <section style={{ ...wrap, padding: "clamp(64px,9vw,120px) 28px", textAlign: "center" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <div style={{ position: "absolute", width: 360, height: 220, top: -40, left: "50%", transform: "translateX(-50%)", borderRadius: "50%", filter: "blur(90px)", opacity: 0.16, background: "radial-gradient(circle,var(--accent),transparent 70%)", pointerEvents: "none" }} />
          <h2 style={{ position: "relative", fontWeight: 600, fontSize: "clamp(2rem,4.4vw,3.2rem)", lineHeight: 1.05, letterSpacing: "-0.025em", color: "var(--ink)", margin: 0, maxWidth: "18ch" }}>The best things you know, given well.</h2>
        </div>
        <p style={{ fontSize: "1.1rem", color: "var(--muted)", margin: "18px auto 0", maxWidth: "40ch" }}>Make the guide you keep getting asked for.</p>
        <div style={{ marginTop: 28 }}><a href="/v3/new" style={{ textDecoration: "none" }}><Button>Make your guide →</Button></a></div>
        <p style={{ fontSize: "0.78rem", color: "var(--faint)", margin: "12px 0 0" }}>free · about two minutes</p>
      </section>

      <footer style={{ borderTop: "1px solid var(--line)" }}>
        <div style={{ ...wrap, padding: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: "0.78rem", color: "var(--muted)" }}><Monogram ini="V" size={24} /> vouch · the recommendations worth keeping</span>
          <span style={{ fontSize: "0.74rem", color: "var(--faint)" }}>Bengaluru · and your city next</span>
        </div>
      </footer>

      <style>{`@media(max-width:820px){.v3-hero,.v3-row{grid-template-columns:1fr !important;}.v3-steps{grid-template-columns:1fr !important;}}`}</style>
    </main>
  );
}
