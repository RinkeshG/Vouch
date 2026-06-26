/* PROTOTYPE — Direction D: "Warm & tactile". DM Sans + Caveat (hand note).
   Cream, warm ink, terracotta, rounded, hand-touched. Feels like a friend. */

const FONTS =
  "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Caveat:wght@500;600&display=swap";

const ENTRIES = [
  { e: "☕", name: "Blue Tokai", area: "Koramangala", take: "the cold brew that ruined all others for me." },
  { e: "🍺", name: "Toit", area: "Indiranagar", take: "go on a weekday. thank me later." },
  { e: "🌅", name: "Airlines Hotel", area: "Lavelle Rd", take: "filter coffee under the trees, 8am sharp." },
];

export default function Warm() {
  const bg = "#FBF2E4", ink = "#2C2418", muted = "#8A7A63", terra = "#CB613A", line = "#EBDDC8";
  return (
    <>
      <link rel="stylesheet" href={FONTS} />
      <main style={{ minHeight: "100vh", background: bg, color: ink, fontFamily: "'DM Sans', sans-serif", padding: "0 clamp(20px,5vw,68px)" }}>
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 82 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 21, letterSpacing: "-0.02em" }}>
            <span style={{ width: 11, height: 11, borderRadius: 999, background: terra }} />Hotlist
          </span>
          <span style={{ fontWeight: 600, fontSize: 14.5, background: ink, color: bg, padding: "11px 19px", borderRadius: 999 }}>Make yours</span>
        </nav>

        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "clamp(28px,5vw,72px)", alignItems: "center", minHeight: "calc(100vh - 82px)", paddingBottom: 44 }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, color: terra, letterSpacing: "0.04em", margin: "0 0 20px" }}>♥ the places you can&rsquo;t stop recommending</p>
            <h1 style={{ fontWeight: 700, fontSize: "clamp(2.6rem,5vw,4.3rem)", lineHeight: 1.06, letterSpacing: "-0.035em", margin: 0 }}>
              Make a little guide to the places you love.
            </h1>
            <p style={{ fontSize: "clamp(1.06rem,1.4vw,1.24rem)", lineHeight: 1.55, color: "#6A5E4B", maxWidth: "42ch", margin: "22px 0 0", fontWeight: 500 }}>
              Add your spots, say why you love them, and you&rsquo;ve got one warm little page to send whenever someone asks &mdash; instead of typing it out again.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 34, flexWrap: "wrap" }}>
              <span style={{ background: terra, color: "#fff", padding: "15px 26px", borderRadius: 999, fontWeight: 700, fontSize: 16, boxShadow: "0 14px 26px -12px rgba(203,97,58,.6)" }}>Make your Hotlist →</span>
              <span style={{ fontFamily: "Caveat, cursive", fontSize: 24, color: muted, transform: "rotate(-4deg)" }}>it&rsquo;s free, btw</span>
            </div>
          </div>

          {/* the output — a warm, rounded card with a hand note */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", top: -26, right: 16, fontFamily: "Caveat, cursive", fontSize: 27, color: terra, transform: "rotate(6deg)", zIndex: 2 }}>made in 4 minutes ✨</span>
            <div style={{ background: "#FFFBF3", border: `1px solid ${line}`, borderRadius: 26, padding: "8px", boxShadow: "0 30px 60px -36px rgba(44,36,24,.4)", transform: "rotate(-1.4deg)" }}>
              <div style={{ background: "#FCEFE0", borderRadius: 20, padding: "20px 22px 14px", border: `1px solid ${line}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 42, height: 42, borderRadius: 999, background: terra, color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 17 }}>M</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 20, margin: 0, letterSpacing: "-0.02em" }}>Maya&rsquo;s Bangalore</p>
                    <p style={{ fontWeight: 500, fontSize: 13, color: muted, margin: "2px 0 0" }}>my forever coffee list ♥</p>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  {ENTRIES.map((e) => (
                    <div key={e.name} style={{ display: "flex", gap: 13, padding: "13px 4px", borderTop: `1px solid ${line}` }}>
                      <span style={{ fontSize: 24 }}>{e.e}</span>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 16, margin: 0 }}>{e.name} <span style={{ fontWeight: 500, color: muted, fontSize: 13 }}>· {e.area}</span></p>
                        <p style={{ fontSize: 14.5, color: "#5F5444", margin: "3px 0 0", lineHeight: 1.45 }}>{e.take}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
