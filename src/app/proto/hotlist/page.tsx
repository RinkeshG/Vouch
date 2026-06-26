/* PROTOTYPE — Warm & tactile, the PUBLIC shareable page.
   Covers are PHOTOS (with a category-tint fallback). The map is a real warm
   map (Carto Voyager + a terracotta route + numbered pins) — see warm-map.tsx. */

import WarmMap from "../warm-map";

const FONTS =
  "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Caveat:wght@500;600;700&display=swap";

type Cat = "coffee" | "food" | "drink";
const CAT: Record<Cat, { e: string; label: string; tint: string }> = {
  coffee: { e: "☕", label: "Coffee", tint: "#C17A2B" },
  food: { e: "🍽", label: "Food", tint: "#CB613A" },
  drink: { e: "🍸", label: "Drinks", tint: "#9A6A33" },
};

const PH = (id: string) => `https://images.unsplash.com/photo-${id}?w=640&q=80&auto=format&fit=crop`;

const PLACES: { name: string; area: string; lat: number; lng: number; cat: Cat; take: string; meta: string; img: string }[] = [
  { name: "Blue Tokai", area: "Koramangala", lat: 12.9352, lng: 77.6245, cat: "coffee", take: "the cold brew that ruined all others for me. sit upstairs.", meta: "₹₹ · best for working", img: PH("1554118811-1e0d58224f24") },
  { name: "Third Wave", area: "Indiranagar", lat: 12.9783, lng: 77.6400, cat: "coffee", take: "for when you want to taste it, not talk. no laptops after 11.", meta: "₹₹ · quiet mornings", img: PH("1442512595331-e89e73853f31") },
  { name: "Airlines Hotel", area: "Lavelle Rd", lat: 12.9698, lng: 77.5985, cat: "coffee", take: "filter coffee under the rain trees. get there by 8, before it wakes up.", meta: "₹ · an institution", img: PH("1461023058943-07fcbe16d735") },
  { name: "Toit", area: "Indiranagar", lat: 12.9783, lng: 77.6408, cat: "drink", take: "go on a weekday. thank me later. the toit weiss is the move.", meta: "₹₹₹ · with friends", img: PH("1535958636474-b021ee887b13") },
  { name: "Koshy's", area: "St. Marks Rd", lat: 12.9738, lng: 77.6010, cat: "food", take: "nothing's changed in 70 years and the waiters intend to keep it that way.", meta: "₹₹ · a long lunch", img: PH("1517248135467-4c7edcad34c4") },
  { name: "VV Puram", area: "Food Street", lat: 12.9419, lng: 77.5731, cat: "food", take: "go hungry at 7pm. eat with your hands. end on the holige.", meta: "₹ · late evening", img: PH("1504674900247-0877df9cc836") },
];

export default function PublicHotlist() {
  const bg = "#FBF2E4", surf = "#FFFBF3", ink = "#2C2418", muted = "#8A7A63", terra = "#CB613A", line = "#EBDDC8";
  const chips = ["All", "☕ Coffee", "🍽 Food", "🍸 Drinks", "🌅 Views"];
  const spots = PLACES.map((p, i) => ({ name: p.name, lat: p.lat, lng: p.lng, n: i + 1, cat: p.cat }));
  return (
    <>
      <link rel="stylesheet" href={FONTS} />
      <main style={{ minHeight: "100vh", background: bg, color: ink, fontFamily: "'DM Sans', sans-serif" }}>
        <nav style={{ position: "relative", zIndex: 10, background: bg, borderBottom: `1px solid ${line}` }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 clamp(18px,4vw,40px)", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em" }}><span style={{ width: 10, height: 10, borderRadius: 999, background: terra }} />Hotlist</span>
            <span style={{ fontWeight: 600, fontSize: 14, background: ink, color: bg, padding: "10px 17px", borderRadius: 999 }}>Make your own →</span>
          </div>
        </nav>

        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 clamp(18px,4vw,40px)" }}>
          <header style={{ paddingTop: 48, paddingBottom: 12, display: "flex", gap: 22, alignItems: "flex-start", flexWrap: "wrap" }}>
            <span style={{ width: 72, height: 72, borderRadius: 999, background: terra, color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 30, flex: "none", boxShadow: "0 12px 24px -12px rgba(203,97,58,.6)" }}>M</span>
            <div style={{ flex: 1, minWidth: 260 }}>
              <h1 style={{ fontWeight: 700, fontSize: "clamp(2.1rem,4vw,3rem)", letterSpacing: "-0.03em", margin: 0, lineHeight: 1.05 }}>Maya&rsquo;s Bangalore</h1>
              <p style={{ fontSize: "1.12rem", color: "#6A5E4B", margin: "10px 0 0", maxWidth: "52ch", lineHeight: 1.5, fontWeight: 500 }}>my forever list &mdash; the places I take everyone who visits. mostly coffee, obviously. ♥</p>
              <p style={{ fontSize: 14, color: muted, margin: "12px 0 0", fontWeight: 500 }}>📍 Bangalore · 28 places · updated last week</p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 600, fontSize: 14.5, color: ink, background: surf, border: `1px solid ${line}`, padding: "11px 16px", borderRadius: 999 }}>♥ Save</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 600, fontSize: 14.5, color: "#fff", background: terra, padding: "11px 18px", borderRadius: 999 }}>↗ Share</span>
            </div>
          </header>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", padding: "20px 0 26px" }}>
            {chips.map((c, i) => (
              <span key={c} style={{ fontWeight: 600, fontSize: 14, padding: "8px 16px", borderRadius: 999, background: i === 0 ? ink : surf, color: i === 0 ? bg : "#6A5E4B", border: `1px solid ${i === 0 ? ink : line}` }}>{c}</span>
            ))}
          </div>

          {/* places — PHOTO covers, with a category-tint fallback */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 18, paddingBottom: 8 }}>
            {PLACES.map((p) => (
              <article key={p.name} style={{ background: surf, border: `1px solid ${line}`, borderRadius: 22, overflow: "hidden", boxShadow: "0 18px 40px -32px rgba(44,36,24,.5)" }}>
                <div style={{ position: "relative", height: 168, overflow: "hidden", background: `linear-gradient(150deg, ${CAT[p.cat].tint}, #2C2418)` }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${p.img}")`, backgroundSize: "cover", backgroundPosition: "center" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,14,6,.10) 0%, transparent 34%, rgba(20,14,6,.30) 100%)" }} />
                  <span style={{ position: "absolute", left: 12, bottom: 12, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: ink, background: "rgba(255,251,243,.94)", padding: "5px 11px", borderRadius: 999 }}>{CAT[p.cat].e} {CAT[p.cat].label}</span>
                  <span style={{ position: "absolute", right: 12, top: 12, width: 34, height: 34, borderRadius: 999, background: "rgba(255,251,243,.94)", display: "grid", placeItems: "center", fontSize: 15 }}>♡</span>
                </div>
                <div style={{ padding: "15px 17px 17px" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "1.22rem", letterSpacing: "-0.02em", margin: 0 }}>{p.name} <span style={{ fontWeight: 500, fontSize: 13, color: muted }}>· {p.area}</span></h3>
                  <p style={{ fontSize: 15, color: "#5F5444", margin: "8px 0 0", lineHeight: 1.46 }}>{p.take}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 13, paddingTop: 12, borderTop: `1px solid ${line}` }}>
                    <span style={{ fontSize: 12.5, color: muted, fontWeight: 500 }}>{p.meta}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: terra }}>open in maps ↗</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* the map view — a real, richer warm map */}
          <section style={{ paddingTop: 40 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-0.02em", margin: 0 }}>The whole list, walked in order</h2>
              <span style={{ fontFamily: "Caveat, cursive", fontSize: 22, color: terra, transform: "rotate(-3deg)" }}>follow the trail →</span>
            </div>
            <div style={{ position: "relative" }}>
              <WarmMap spots={spots} height={440} />
              {/* floating selected-place card */}
              <div style={{ position: "absolute", left: 18, bottom: 18, width: 264, background: surf, border: `1px solid ${line}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 18px 40px -20px rgba(44,36,24,.55)" }}>
                <div style={{ height: 96, backgroundImage: `url("${PLACES[3].img}")`, backgroundSize: "cover", backgroundPosition: "center" }} />
                <div style={{ padding: "11px 13px 13px" }}>
                  <p style={{ fontWeight: 700, fontSize: 15.5, margin: 0 }}>4 · Toit <span style={{ fontWeight: 500, fontSize: 12, color: muted }}>· Indiranagar</span></p>
                  <p style={{ fontSize: 13, color: "#5F5444", margin: "5px 0 0", lineHeight: 1.4 }}>go on a weekday. the toit weiss is the move.</p>
                  <span style={{ display: "inline-block", marginTop: 9, fontSize: 12.5, fontWeight: 700, color: terra }}>↗ Directions</span>
                </div>
              </div>
              {/* map controls */}
              <div style={{ position: "absolute", right: 16, top: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {["＋", "－"].map((g) => (
                  <span key={g} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,251,243,.95)", border: `1px solid ${line}`, display: "grid", placeItems: "center", fontSize: 16, fontWeight: 600, color: ink, boxShadow: "0 6px 14px -8px rgba(0,0,0,.4)" }}>{g}</span>
                ))}
              </div>
            </div>
          </section>

          <section style={{ margin: "44px 0 60px", background: ink, borderRadius: 28, padding: "clamp(32px,5vw,52px)", textAlign: "center" }}>
            <p style={{ fontFamily: "Caveat, cursive", fontSize: 26, color: "#F0C9A6", margin: 0, transform: "rotate(-2deg)" }}>maya made this in 4 minutes</p>
            <h2 style={{ fontWeight: 700, fontSize: "clamp(1.9rem,4vw,2.8rem)", letterSpacing: "-0.03em", color: bg, margin: "10px 0 0" }}>Your turn.</h2>
            <p style={{ fontSize: "1.08rem", color: "#D8C9B2", margin: "12px auto 0", maxWidth: "40ch", fontWeight: 500 }}>Make your own little guide to the places you love. Free, and yours to share anywhere.</p>
            <span style={{ display: "inline-block", marginTop: 26, fontWeight: 700, fontSize: 16, color: "#fff", background: terra, padding: "15px 30px", borderRadius: 999, boxShadow: "0 16px 30px -14px rgba(203,97,58,.7)" }}>Make your Hotlist →</span>
          </section>

          <footer style={{ borderTop: `1px solid ${line}`, padding: "26px 0 40px", display: "flex", justifyContent: "space-between", color: muted, fontSize: 14, fontWeight: 500 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><span style={{ width: 9, height: 9, borderRadius: 999, background: terra }} />Hotlist</span>
            <span>made with ♥ in Bangalore</span>
          </footer>
        </div>
      </main>
    </>
  );
}
