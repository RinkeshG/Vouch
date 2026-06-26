/* PROTOTYPE — Warm & tactile component sheet. Shows Hotlist as a SYSTEM:
   foundations, buttons, chips, avatar, the builder input, the place card,
   an expanded place detail with its map, and save/share feedback. */

const FONTS =
  "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Caveat:wght@500;600;700&display=swap";

const bg = "#FBF2E4", surf = "#FFFBF3", ink = "#2C2418", muted = "#8A7A63", terra = "#CB613A", line = "#EBDDC8";
const warmMap = "sepia(.42) saturate(1.7) brightness(1.05) contrast(.9) hue-rotate(-6deg)";

function tile(lat: number, lng: number, z: number): string {
  const n = 2 ** z; const x = Math.floor(((lng + 180) / 360) * n);
  const latR = (lat * Math.PI) / 180; const y = Math.floor(((1 - Math.asinh(Math.tan(latR)) / Math.PI) / 2) * n);
  return `https://a.basemaps.cartocdn.com/light_all/${z}/${x}/${y}@2x.png`;
}
function Pin({ s = 18 }: { s?: number }) {
  return <span style={{ display: "block", width: s, height: s, borderRadius: "50% 50% 50% 0", background: terra, transform: "rotate(-45deg)", border: "2.5px solid #fff", boxShadow: "0 4px 10px rgba(0,0,0,.3)" }} />;
}
function Label({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: muted, fontWeight: 600, margin: "0 0 16px" }}>{children}</p>;
}
function Cell({ title, children, span = 1 }: { title: string; children: React.ReactNode; span?: number }) {
  return (
    <section style={{ gridColumn: `span ${span}`, background: surf, border: `1px solid ${line}`, borderRadius: 20, padding: 24 }}>
      <Label>{title}</Label>
      {children}
    </section>
  );
}

export default function Kit() {
  return (
    <>
      <link rel="stylesheet" href={FONTS} />
      <main style={{ minHeight: "100vh", background: bg, color: ink, fontFamily: "'DM Sans', sans-serif", padding: "0 clamp(18px,4vw,44px)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", paddingBlock: 44 }}>
          <header style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 30 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em" }}><span style={{ width: 12, height: 12, borderRadius: 999, background: terra }} />Hotlist</span>
            <span style={{ fontFamily: "Caveat, cursive", fontSize: 24, color: muted }}>the building blocks ✎</span>
          </header>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>

            {/* foundations */}
            <Cell title="Type — DM Sans + Caveat">
              <p style={{ fontWeight: 700, fontSize: 28, letterSpacing: "-0.03em", margin: 0 }}>Maya&rsquo;s Bangalore</p>
              <p style={{ fontWeight: 500, fontSize: 16, color: "#5F5444", margin: "6px 0 0" }}>the cold brew that ruined all others.</p>
              <p style={{ fontFamily: "Caveat, cursive", fontSize: 26, color: terra, margin: "8px 0 0", transform: "rotate(-2deg)", display: "inline-block" }}>made in 4 minutes ✨</p>
            </Cell>

            <Cell title="Palette">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[["#FBF2E4", "cream"], ["#FFFBF3", "surface"], ["#CB613A", "terracotta"], ["#2C2418", "ink"], ["#8A7A63", "muted"], ["#EBDDC8", "line"]].map(([c, n]) => (
                  <div key={n} style={{ textAlign: "center" }}>
                    <span style={{ display: "block", width: 52, height: 52, borderRadius: 14, background: c, border: `1px solid ${line}` }} />
                    <span style={{ fontSize: 11, color: muted, marginTop: 6, display: "block" }}>{n}</span>
                  </div>
                ))}
              </div>
            </Cell>

            <Cell title="Buttons">
              <div style={{ display: "flex", flexDirection: "column", gap: 11, alignItems: "flex-start" }}>
                <span style={{ background: terra, color: "#fff", fontWeight: 700, fontSize: 15, padding: "12px 22px", borderRadius: 999, boxShadow: "0 12px 22px -12px rgba(203,97,58,.6)" }}>Make your Hotlist →</span>
                <span style={{ background: surf, color: ink, fontWeight: 600, fontSize: 15, padding: "11px 20px", borderRadius: 999, border: `1px solid ${line}` }}>♥ Save</span>
                <span style={{ color: terra, fontWeight: 600, fontSize: 15 }}>open in maps ↗</span>
              </div>
            </Cell>

            {/* chips */}
            <Cell title="Category chips + tags">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {[["☕", "Coffee"], ["🍽", "Food"], ["🍸", "Drinks"], ["🌅", "Views"], ["💘", "Date spots"]].map(([e, l]) => (
                  <span key={l} style={{ fontWeight: 600, fontSize: 13.5, padding: "7px 14px", borderRadius: 999, background: surf, border: `1px solid ${line}`, color: "#6A5E4B" }}>{e} {l}</span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 12.5, color: muted, fontWeight: 600, background: bg, padding: "5px 11px", borderRadius: 8, border: `1px solid ${line}` }}>₹₹</span>
                <span style={{ fontSize: 12.5, color: muted, fontWeight: 600, background: bg, padding: "5px 11px", borderRadius: 8, border: `1px solid ${line}` }}>best for working</span>
                <span style={{ fontSize: 12.5, color: terra, fontWeight: 600, background: "#F7E4D7", padding: "5px 11px", borderRadius: 8 }}>♥ 142 saves</span>
              </div>
            </Cell>

            {/* avatar / curator */}
            <Cell title="Curator">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 48, height: 48, borderRadius: 999, background: terra, color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 19 }}>M</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>Maya R.</p>
                  <p style={{ fontSize: 13, color: muted, margin: "2px 0 0", fontWeight: 500 }}>Indiranagar · 12 lists</p>
                </div>
              </div>
              <div style={{ display: "flex", marginTop: 16, alignItems: "center" }}>
                {["#CB613A", "#9A6A33", "#7C8C5A", "#B4724E"].map((c, i) => (
                  <span key={i} style={{ width: 30, height: 30, borderRadius: 999, background: c, border: "2px solid #FFFBF3", marginLeft: i ? -9 : 0, color: "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>{["A", "K", "S", "R"][i]}</span>
                ))}
                <span style={{ fontSize: 13, color: muted, marginLeft: 10, fontWeight: 500 }}>saved by 38 people</span>
              </div>
            </Cell>

            {/* the builder input */}
            <Cell title="Add a place (the builder)">
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: bg, border: `1.5px solid ${terra}`, borderRadius: 14, padding: "12px 14px" }}>
                <span style={{ color: terra }}>🔍</span>
                <span style={{ fontWeight: 500, color: ink }}>Blue Tokai</span>
                <span style={{ width: 1.5, height: 18, background: terra, marginLeft: -2 }} />
              </div>
              <div style={{ marginTop: 8, background: surf, border: `1px solid ${line}`, borderRadius: 14, overflow: "hidden" }}>
                {[["Blue Tokai Coffee", "Koramangala"], ["Blue Tokai", "Indiranagar"]].map(([n, a], i) => (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", borderTop: i ? `1px solid ${line}` : "none" }}>
                    <span style={{ width: 30, height: 30, borderRadius: 8, background: "#F0E6D6", display: "grid", placeItems: "center" }}>📍</span>
                    <div style={{ flex: 1 }}><p style={{ fontWeight: 600, fontSize: 14.5, margin: 0 }}>{n}</p><p style={{ fontSize: 12.5, color: muted, margin: 0 }}>{a}</p></div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: terra }}>+ add</span>
                  </div>
                ))}
              </div>
            </Cell>

            {/* place card */}
            <Cell title="Place card">
              <article style={{ background: surf, border: `1px solid ${line}`, borderRadius: 18, overflow: "hidden" }}>
                <div style={{ position: "relative", height: 110 }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${tile(12.9352, 77.6245, 15)}")`, backgroundSize: "cover", backgroundPosition: "center", filter: warmMap }} />
                  <span style={{ position: "absolute", top: "44%", left: "50%", transform: "translate(-50%,-50%)" }}><Pin /></span>
                  <span style={{ position: "absolute", left: 10, bottom: 10, fontSize: 11.5, fontWeight: 600, color: ink, background: "rgba(255,251,243,.92)", padding: "4px 10px", borderRadius: 999, border: `1px solid ${line}` }}>☕ Coffee</span>
                </div>
                <div style={{ padding: "12px 14px 14px" }}>
                  <p style={{ fontWeight: 700, fontSize: 17, margin: 0 }}>Blue Tokai <span style={{ fontWeight: 500, fontSize: 12.5, color: muted }}>· Koramangala</span></p>
                  <p style={{ fontSize: 14, color: "#5F5444", margin: "6px 0 0", lineHeight: 1.45 }}>the cold brew that ruined all others for me.</p>
                </div>
              </article>
            </Cell>

            {/* place detail with its map */}
            <Cell title="Place detail" span={2}>
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 22, margin: 0, letterSpacing: "-0.02em" }}>Toit</p>
                  <p style={{ fontSize: 13, color: muted, margin: "3px 0 0", fontWeight: 500 }}>🍸 Drinks · Indiranagar · ₹₹₹</p>
                  <p style={{ fontSize: 15.5, color: "#5F5444", margin: "12px 0 0", lineHeight: 1.5 }}>&ldquo;go on a weekday. thank me later. the toit weiss + a wood-fired pizza is the whole evening.&rdquo;</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", background: terra, padding: "10px 16px", borderRadius: 999 }}>↗ Directions</span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: ink, background: bg, border: `1px solid ${line}`, padding: "10px 16px", borderRadius: 999 }}>♥ Save</span>
                  </div>
                  <p style={{ fontSize: 13, color: muted, marginTop: 14 }}>added by <b style={{ color: ink }}>Maya</b> · also loved by Ankit</p>
                </div>
                <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: `1px solid ${line}`, minHeight: 170 }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${tile(12.9783, 77.6408, 15)}")`, backgroundSize: "cover", backgroundPosition: "center", filter: warmMap }} />
                  <span style={{ position: "absolute", top: "46%", left: "50%", transform: "translate(-50%,-50%)" }}><Pin s={24} /></span>
                </div>
              </div>
            </Cell>

            {/* feedback */}
            <Cell title="Save & share feedback">
              <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: ink, color: bg, padding: "11px 16px", borderRadius: 12, fontWeight: 600, fontSize: 14 }}>
                <span style={{ color: terra }}>♥</span> Saved to your list
              </div>
              <div style={{ marginTop: 14, background: surf, border: `1px solid ${line}`, borderRadius: 14, padding: 14 }}>
                <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 10px" }}>Share Maya&rsquo;s Bangalore</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: bg, border: `1px solid ${line}`, borderRadius: 10, padding: "9px 12px" }}>
                  <span style={{ fontSize: 13.5, color: muted, flex: 1 }}>hotlist.to/maya</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", background: terra, padding: "6px 12px", borderRadius: 8 }}>Copy</span>
                </div>
              </div>
            </Cell>

          </div>
        </div>
      </main>
    </>
  );
}
