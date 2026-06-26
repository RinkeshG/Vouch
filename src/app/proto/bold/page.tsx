/* PROTOTYPE — Direction B: "Bold & expressive". Unbounded + Inter.
   Oversized rounded display, punchy colour, flaunt energy. First fold only. */

const FONTS =
  "https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;800&family=Inter:wght@400;500;600&display=swap";

const ENTRIES = [
  { e: "☕", name: "Blue Tokai", take: "cold brew that ruined all others." },
  { e: "🍺", name: "Toit", take: "weekdays only. thank me later." },
  { e: "🌅", name: "Airlines Hotel", take: "filter coffee under the trees." },
];

export default function Bold() {
  const bg = "#FBF7EE", ink = "#16120C", pop = "#FF4B17", pop2 = "#1E5AE6";
  return (
    <>
      <link rel="stylesheet" href={FONTS} />
      <main style={{ minHeight: "100vh", background: bg, color: ink, fontFamily: "Inter, sans-serif", padding: "0 clamp(20px,5vw,64px)", overflow: "hidden" }}>
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 84 }}>
          <span style={{ fontFamily: "Unbounded, sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em" }}>Hotlist</span>
          <span style={{ fontFamily: "Unbounded, sans-serif", fontWeight: 700, fontSize: 14, background: ink, color: bg, padding: "12px 20px", borderRadius: 999 }}>Make yours</span>
        </nav>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "clamp(28px,4vw,56px)", alignItems: "center", minHeight: "calc(100vh - 84px)", paddingBottom: 40 }}>
          <div>
            <span style={{ display: "inline-block", fontWeight: 600, fontSize: 14, color: pop2, background: "#E4ECFF", padding: "7px 14px", borderRadius: 999, marginBottom: 24 }}>your taste, finally somewhere good</span>
            <h1 style={{ fontFamily: "Unbounded, sans-serif", fontWeight: 800, fontSize: "clamp(2.6rem,5.4vw,4.6rem)", lineHeight: 1.04, letterSpacing: "-0.04em", margin: 0 }}>
              Make a guide to the{" "}
              <span style={{ background: pop, color: bg, padding: "0 .12em", borderRadius: 8, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>places</span>{" "}
              you love.
            </h1>
            <p style={{ fontSize: "clamp(1.05rem,1.4vw,1.25rem)", lineHeight: 1.5, color: "#4A443B", maxWidth: "40ch", margin: "24px 0 0", fontWeight: 500 }}>
              Drop your spots, add your hot takes, and get one link you&rsquo;ll actually want to share. It&rsquo;s your city, your way.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 34, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "Unbounded, sans-serif", fontWeight: 700, fontSize: 17, background: pop, color: bg, padding: "16px 28px", borderRadius: 999, boxShadow: `0 16px 30px -12px ${pop}99` }}>Make your Hotlist →</span>
              <span style={{ fontWeight: 600, fontSize: 15 }}>see an example ↓</span>
            </div>
          </div>

          {/* the output — a chunky, colourful card */}
          <div style={{ background: ink, borderRadius: 28, padding: 8, transform: "rotate(2deg)", boxShadow: "0 40px 70px -30px rgba(0,0,0,.4)" }}>
            <div style={{ background: bg, borderRadius: 22, overflow: "hidden" }}>
              <div style={{ background: pop, padding: "20px 22px", color: bg }}>
                <p style={{ fontFamily: "Unbounded, sans-serif", fontWeight: 800, fontSize: 26, margin: 0, letterSpacing: "-0.03em" }}>Maya&rsquo;s Bangalore</p>
                <p style={{ fontWeight: 600, fontSize: 13, margin: "6px 0 0", opacity: .9 }}>23 spots · the only list you need</p>
              </div>
              <div style={{ padding: "10px 14px 16px" }}>
                {ENTRIES.map((e) => (
                  <div key={e.name} style={{ display: "flex", gap: 14, alignItems: "center", padding: "13px 8px", borderBottom: "1px solid #ECE6D9" }}>
                    <span style={{ fontSize: 26 }}>{e.e}</span>
                    <div>
                      <p style={{ fontFamily: "Unbounded, sans-serif", fontWeight: 700, fontSize: 16, margin: 0, letterSpacing: "-0.02em" }}>{e.name}</p>
                      <p style={{ fontSize: 14, color: "#5A5347", margin: "3px 0 0", fontWeight: 500 }}>{e.take}</p>
                    </div>
                  </div>
                ))}
                <p style={{ fontWeight: 600, fontSize: 13, color: pop2, margin: "12px 8px 4px" }}>hotlist.to/maya</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
