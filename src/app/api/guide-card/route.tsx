import { ImageResponse } from "next/og";

/* The guide image card (PRD §7.9, §8) — the 4:5 artifact that travels through
   WhatsApp as a JPEG, where a link gets ignored. Rendered server-side with the real
   type families; guide data arrives via query params so it needs no DB. Title in
   Bricolage, up to 3 featured takes, the mono ticket texture, the author's handle. */

export const runtime = "edge";

const TTF = (f: string) => `https://cdn.jsdelivr.net/fontsource/fonts/${f}.ttf`;
const C = { bg: "#100f0d", ink: "#f4eee3", muted: "#a99f8f", faint: "#6f6657", saffron: "#f6a82b", line: "rgba(244,238,227,0.12)" };

export async function GET(req: Request) {
  const u = new URL(req.url);
  const p = u.searchParams;
  const title = (p.get("title") || "A guide").slice(0, 80);
  const by = (p.get("by") || "Someone").slice(0, 40);
  const note = (p.get("note") || "").slice(0, 60);
  const count = p.get("count") || "";
  const takes = p.getAll("n").slice(0, 3).map((s) => {
    const [place, ...rest] = s.split("::");
    return { place: (place || "").slice(0, 48), note: rest.join("::").slice(0, 110) };
  });
  const ini = by === "You" ? "RG" : by.replace(/[^A-Za-z ]/g, "").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "·";

  const [bric, grotesk, mono] = await Promise.all([
    fetch(TTF("bricolage-grotesque@latest/latin-800-normal")).then((r) => r.arrayBuffer()),
    fetch(TTF("space-grotesk@latest/latin-500-normal")).then((r) => r.arrayBuffer()),
    fetch(TTF("space-mono@latest/latin-400-normal")).then((r) => r.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: C.bg, padding: "76px 72px", fontFamily: "Grotesk", color: C.ink, position: "relative" }}>
        {/* ticket perforation — visual texture only (words stay literal) */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 36, width: 2, background: `repeating-linear-gradient(${C.line} 0 10px, transparent 10px 22px)`, display: "flex" }} />
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", fontFamily: "Bric", fontSize: 40, letterSpacing: -1 }}>
            <span style={{ color: C.saffron, marginRight: 4 }}>V</span>ouch
          </div>
          <div style={{ display: "flex", fontFamily: "Mono", fontSize: 19, letterSpacing: 3, color: C.faint, textTransform: "uppercase" }}>A guide · Bengaluru</div>
        </div>

        {/* curator */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 64 }}>
          <div style={{ width: 60, height: 60, borderRadius: 30, background: "#241a0c", border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Bric", fontSize: 24, color: C.ink }}>{ini}</div>
          <div style={{ display: "flex", fontFamily: "Mono", fontSize: 21, letterSpacing: 2, color: C.saffron, textTransform: "uppercase", marginLeft: 18 }}>A guide by {by}</div>
        </div>

        {/* title */}
        <div style={{ display: "flex", fontFamily: "Bric", fontSize: title.length > 38 ? 78 : 96, lineHeight: 1.0, letterSpacing: -3, marginTop: 30, maxWidth: 880 }}>{title}</div>
        <div style={{ display: "flex", fontFamily: "Mono", fontSize: 21, letterSpacing: 1.5, color: C.faint, textTransform: "uppercase", marginTop: 22 }}>{count ? `${count} places` : ""}{note ? `  ·  ${note}` : ""}</div>

        {/* takes */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 54, gap: 30 }}>
          {takes.map((t, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", borderTop: `1px solid ${C.line}`, paddingTop: 24 }}>
              <div style={{ display: "flex", fontFamily: "Grotesk", fontSize: 40, color: C.ink }}>{t.place}</div>
              {t.note ? <div style={{ display: "flex", fontFamily: "Grotesk", fontSize: 31, color: C.muted, marginTop: 8, lineHeight: 1.35, maxWidth: 900 }}>{t.note}</div> : <div style={{ display: "flex" }} />}
            </div>
          ))}
        </div>

        {/* footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", borderTop: `1px solid ${C.line}`, paddingTop: 26 }}>
          <div style={{ display: "flex", fontFamily: "Mono", fontSize: 22, color: C.ink, letterSpacing: 1 }}>@{by.toLowerCase().replace(/\s+/g, "")}</div>
          <div style={{ display: "flex", fontFamily: "Mono", fontSize: 18, color: C.faint, letterSpacing: 1 }}>the only review with a name on it</div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts: [
        { name: "Bric", data: bric, weight: 800 as const },
        { name: "Grotesk", data: grotesk, weight: 500 as const },
        { name: "Mono", data: mono, weight: 400 as const },
      ],
    },
  );
}
