/* PROTOTYPE — Direction A: "Editorial zine". DM Serif Display + Inter.
   Warm paper, sharp didone display, magazine rules. First fold only. */

const FONTS =
  "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap";

const ENTRIES = [
  { n: "01", name: "Blue Tokai", area: "Koramangala", take: "the cold brew that ruined all others for me." },
  { n: "02", name: "Third Wave", area: "Indiranagar", take: "for when you want to taste it, not talk." },
  { n: "03", name: "Airlines Hotel", area: "Lavelle Rd", take: "filter coffee under the trees. get there by 8." },
];

export default function Editorial() {
  const paper = "#FAF6EC", ink = "#211E18", muted = "#6B6356", red = "#B23A2E", line = "#E2DACA";
  return (
    <>
      <link rel="stylesheet" href={FONTS} />
      <main style={{ minHeight: "100vh", background: paper, color: ink, fontFamily: "Inter, sans-serif", padding: "0 clamp(20px,5vw,72px)" }}>
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 78, borderBottom: `1px solid ${line}` }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, letterSpacing: "-0.01em" }}>Hotlist</span>
          <span style={{ display: "flex", gap: 28, alignItems: "center", fontSize: 14, color: muted }}>
            <span>Examples</span>
            <span style={{ background: ink, color: paper, padding: "10px 18px", borderRadius: 2, fontWeight: 500 }}>Make yours</span>
          </span>
        </nav>

        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "clamp(32px,6vw,88px)", alignItems: "center", paddingBlock: "clamp(40px,7vw,86px)", minHeight: "calc(100vh - 78px)" }}>
          <div>
            <p style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: red, fontWeight: 600, margin: "0 0 26px" }}>The recommendations issue · No. 01</p>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontSize: "clamp(3rem,5.6vw,5.1rem)", lineHeight: 1.02, letterSpacing: "-0.015em", margin: 0 }}>
              Make your own guide to the places you <span style={{ fontStyle: "italic", color: red }}>love.</span>
            </h1>
            <p style={{ fontSize: "clamp(1.05rem,1.4vw,1.2rem)", lineHeight: 1.55, color: muted, maxWidth: "44ch", margin: "26px 0 0" }}>
              Your favourite spots, your takes — collected into one beautiful page at your own link.
              A personal city guide, written by the only critic who matters: you.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 36 }}>
              <span style={{ background: red, color: paper, padding: "15px 26px", borderRadius: 2, fontWeight: 600, fontSize: 16 }}>Start your Hotlist →</span>
              <span style={{ fontSize: 15, color: ink, borderBottom: `1px solid ${ink}`, paddingBottom: 2 }}>see a real one</span>
            </div>
            <p style={{ fontSize: 13, color: muted, marginTop: 22 }}>Free · live in two minutes · share it anywhere.</p>
          </div>

          {/* the output — a magazine clipping */}
          <div style={{ background: "#FFFDF7", border: `1px solid ${line}`, padding: "30px 30px 26px", boxShadow: "0 30px 60px -40px rgba(33,30,24,.45)", transform: "rotate(0.6deg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `2px solid ${ink}`, paddingBottom: 12 }}>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24 }}>Maya&rsquo;s Bangalore</span>
              <span style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: muted }}>a coffee list</span>
            </div>
            {ENTRIES.map((e, i) => (
              <div key={e.n} style={{ display: "flex", gap: 16, paddingBlock: 16, borderBottom: i < ENTRIES.length - 1 ? `1px solid ${line}` : "none" }}>
                <span style={{ fontFamily: "'DM Serif Display', serif", color: red, fontSize: 18, fontStyle: "italic", width: 26 }}>{e.n}</span>
                <div>
                  <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 21, lineHeight: 1.1, margin: 0 }}>{e.name}</p>
                  <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: muted, margin: "4px 0 0" }}>{e.area}</p>
                  <p style={{ fontStyle: "italic", fontSize: 15, color: ink, margin: "8px 0 0", lineHeight: 1.45 }}>&ldquo;{e.take}&rdquo;</p>
                </div>
              </div>
            ))}
            <p style={{ fontSize: 12, color: muted, marginTop: 14, textAlign: "right" }}>hotlist.to/maya</p>
          </div>
        </div>
      </main>
    </>
  );
}
