/* PROTOTYPE — Direction C: "Premium minimal". Inter, tight.
   White, near-black, one quiet accent, lots of air. Restraint = craft. */

const FONTS = "https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;600&display=swap";

const ENTRIES = [
  { name: "Blue Tokai", area: "Koramangala", take: "the cold brew that ruined all others for me." },
  { name: "Third Wave", area: "Indiranagar", take: "for when you want to taste it, not talk." },
  { name: "Airlines Hotel", area: "Lavelle Rd", take: "filter coffee under the trees. get there by 8." },
];

export default function Minimal() {
  const bg = "#FCFCFB", ink = "#151513", muted = "#6E6E68", line = "#EAEAE6", accent = "#2C5DF0";
  return (
    <>
      <link rel="stylesheet" href={FONTS} />
      <main style={{ minHeight: "100vh", background: bg, color: ink, fontFamily: "Inter, sans-serif", letterSpacing: "-0.011em", padding: "0 clamp(22px,6vw,80px)" }}>
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 80 }}>
          <span style={{ fontWeight: 600, fontSize: 18, letterSpacing: "-0.02em" }}>Hotlist</span>
          <span style={{ display: "flex", gap: 30, alignItems: "center", fontSize: 14.5, color: muted }}>
            <span>Examples</span><span>Pricing</span>
            <span style={{ color: ink, fontWeight: 500, border: `1px solid ${line}`, padding: "9px 16px", borderRadius: 8 }}>Make yours</span>
          </span>
        </nav>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 0.82fr", gap: "clamp(40px,8vw,120px)", alignItems: "center", minHeight: "calc(100vh - 80px)", paddingBottom: 60 }}>
          <div style={{ maxWidth: 560 }}>
            <p style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, color: muted, margin: "0 0 28px" }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: accent }} /> for the friend everyone asks
            </p>
            <h1 style={{ fontWeight: 550, fontSize: "clamp(2.5rem,4.6vw,3.9rem)", lineHeight: 1.08, letterSpacing: "-0.032em", margin: 0 }}>
              Make your own guide to the places you love.
            </h1>
            <p style={{ fontSize: "clamp(1.05rem,1.3vw,1.18rem)", lineHeight: 1.6, color: muted, maxWidth: "42ch", margin: "24px 0 0" }}>
              Collect your favourite spots, add a line on each, and publish one quietly beautiful page at your own link. Made to share.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 36 }}>
              <span style={{ background: ink, color: bg, padding: "13px 22px", borderRadius: 9, fontWeight: 500, fontSize: 15.5 }}>Make your Hotlist</span>
              <span style={{ fontSize: 15, color: ink, fontWeight: 500 }}>See an example →</span>
            </div>
          </div>

          {/* the output — a quiet, exact card */}
          <div style={{ background: "#fff", border: `1px solid ${line}`, borderRadius: 16, padding: "26px 26px 22px", boxShadow: "0 18px 50px -34px rgba(0,0,0,.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 18, letterSpacing: "-0.02em" }}>Maya&rsquo;s Bangalore</span>
              <span style={{ fontSize: 12.5, color: muted }}>coffee</span>
            </div>
            <p style={{ fontSize: 13, color: muted, margin: "0 0 18px" }}>23 places</p>
            {ENTRIES.map((e, i) => (
              <div key={e.name} style={{ paddingBlock: 15, borderTop: `1px solid ${line}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 550, fontSize: 16 }}>{e.name}</span>
                  <span style={{ fontSize: 12, color: muted }}>{e.area}</span>
                </div>
                <p style={{ fontSize: 14.5, color: "#48473F", margin: "5px 0 0", lineHeight: 1.45 }}>{e.take}</p>
              </div>
            ))}
            <p style={{ fontSize: 13, color: accent, marginTop: 18, fontWeight: 500 }}>hotlist.to/maya</p>
          </div>
        </div>
      </main>
    </>
  );
}
