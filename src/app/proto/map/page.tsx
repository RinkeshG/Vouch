/* PROTOTYPE — the warm map, on its own, so the richness is legible:
   Carto Voyager (detailed, warm) + a terracotta route through the spots in
   order + numbered teardrop pins + a floating place card + controls. */

import WarmMap from "../warm-map";

const FONTS =
  "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Caveat:wght@500;600;700&display=swap";

const bg = "#FBF2E4", surf = "#FFFBF3", ink = "#2C2418", muted = "#8A7A63", terra = "#CB613A", line = "#EBDDC8";

const SPOTS = [
  { name: "Airlines Hotel", lat: 12.9698, lng: 77.5985, n: 1, cat: "coffee" },
  { name: "Koshy's", lat: 12.9738, lng: 77.6010, n: 2, cat: "food" },
  { name: "Third Wave", lat: 12.9783, lng: 77.6400, n: 3, cat: "coffee" },
  { name: "Toit", lat: 12.9783, lng: 77.6408, n: 4, cat: "drink" },
  { name: "Blue Tokai", lat: 12.9352, lng: 77.6245, n: 5, cat: "coffee" },
  { name: "VV Puram", lat: 12.9419, lng: 77.5731, n: 6, cat: "food" },
];

export default function MapShowcase() {
  return (
    <>
      <link rel="stylesheet" href={FONTS} />
      <main style={{ minHeight: "100vh", background: bg, color: ink, fontFamily: "'DM Sans', sans-serif", padding: "clamp(20px,4vw,40px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em" }}><span style={{ width: 10, height: 10, borderRadius: 999, background: terra }} />Maya&rsquo;s Bangalore</span>
              <p style={{ fontSize: 14, color: muted, margin: "4px 0 0", fontWeight: 500 }}>the whole list, walked in order — coffee → lunch → a drink</p>
            </div>
            <span style={{ fontFamily: "Caveat, cursive", fontSize: 23, color: terra, transform: "rotate(-3deg)" }}>follow the trail →</span>
          </div>

          <div style={{ position: "relative" }}>
            <WarmMap spots={SPOTS} height={540} />

            {/* floating selected place */}
            <div style={{ position: "absolute", zIndex: 30, left: 18, bottom: 18, width: 280, background: surf, border: `1px solid ${line}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 18px 44px -18px rgba(44,36,24,.6)" }}>
              <div style={{ height: 110, backgroundImage: `url("https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=560&q=80&auto=format&fit=crop")`, backgroundSize: "cover", backgroundPosition: "center" }} />
              <div style={{ padding: "12px 14px 14px" }}>
                <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>4 · Toit <span style={{ fontWeight: 500, fontSize: 12.5, color: muted }}>· Indiranagar</span></p>
                <p style={{ fontSize: 13.5, color: "#5F5444", margin: "5px 0 0", lineHeight: 1.42 }}>&ldquo;go on a weekday. thank me later. the toit weiss is the move.&rdquo;</p>
                <div style={{ display: "flex", gap: 8, marginTop: 11 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", background: terra, padding: "8px 13px", borderRadius: 999 }}>↗ Directions</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: ink, background: bg, border: `1px solid ${line}`, padding: "8px 13px", borderRadius: 999 }}>♥ Save</span>
                </div>
              </div>
            </div>

            {/* controls */}
            <div style={{ position: "absolute", zIndex: 30, right: 16, top: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {["＋", "－", "⌖"].map((g) => (
                <span key={g} style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,251,243,.96)", border: `1px solid ${line}`, display: "grid", placeItems: "center", fontSize: 17, fontWeight: 600, color: ink, boxShadow: "0 6px 14px -8px rgba(0,0,0,.4)" }}>{g}</span>
              ))}
            </div>

            {/* legend */}
            <div style={{ position: "absolute", zIndex: 30, right: 16, bottom: 18, display: "inline-flex", alignItems: "center", gap: 9, background: "rgba(255,251,243,.96)", border: `1px solid ${line}`, borderRadius: 999, padding: "8px 14px", fontSize: 12.5, fontWeight: 600, color: "#5F5444", boxShadow: "0 6px 14px -8px rgba(0,0,0,.3)" }}>
              <span style={{ width: 16, height: 0, borderTop: `2px dashed ${terra}` }} /> her route · 6 stops
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
