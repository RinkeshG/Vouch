import { ImageResponse } from "next/og";

/* The guide image card (PRD §7.9, §8) — the 4:5 artifact that travels through
   WhatsApp/IG, and the first thing a stranger sees of Vouch. Directions on offer
   (?style=), each committed to ONE idea rooted in what Vouch actually is — a gift
   between friends, in Bengaluru:
     · map      — REAL Carto tiles, pins at true coordinates. Your taste as territory.
     · mixtape  — a guide IS a mixtape: a cassette a friend recorded for you,
                  handwritten label, the places as Side A's tracklist.
     · matchbox — Bengaluru matchbox-label vernacular: ornamental border, sunburst
                  emblem, matchstick bullets, a striker strip (texture, no words).
     · neon     — the guide as a glowing sign in the Bengaluru night.
   Guide data via query params (no DB); pts=lat,lng pairs power the map. */

export const runtime = "edge";

const TTF = (f: string) => `https://cdn.jsdelivr.net/fontsource/fonts/${f}.ttf`;

type Take = { place: string; note: string };

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const style = p.get("style") || "map";
  const title = (p.get("title") || "A guide").slice(0, 80);
  const by = (p.get("by") || "Someone").slice(0, 40);
  const note = (p.get("note") || "").slice(0, 60);
  const count = p.get("count") || "";
  const handle = "@" + by.toLowerCase().replace(/\s+/g, "");
  const takes: Take[] = p.getAll("n").slice(0, 5).map((s) => {
    const [place, ...rest] = s.split("::");
    return { place: (place || "").slice(0, 44), note: rest.join("::").slice(0, 96) };
  });
  const pts = p.getAll("pt").map((s) => s.split(",").map(Number)).filter((a) => a.length === 2 && a.every((n) => Number.isFinite(n))) as [number, number][];

  const [bric, grot, grotB, mono, monoB, caveat] = await Promise.all([
    fetch(TTF("bricolage-grotesque@latest/latin-800-normal")).then((r) => r.arrayBuffer()),
    fetch(TTF("space-grotesk@latest/latin-500-normal")).then((r) => r.arrayBuffer()),
    fetch(TTF("space-grotesk@latest/latin-700-normal")).then((r) => r.arrayBuffer()),
    fetch(TTF("space-mono@latest/latin-400-normal")).then((r) => r.arrayBuffer()),
    fetch(TTF("space-mono@latest/latin-700-normal")).then((r) => r.arrayBuffer()),
    fetch(TTF("caveat@latest/latin-700-normal")).then((r) => r.arrayBuffer()),
  ]);
  const fonts = [
    { name: "Bric", data: bric, weight: 800 as const },
    { name: "Grot", data: grot, weight: 500 as const },
    { name: "Grot", data: grotB, weight: 700 as const },
    { name: "Mono", data: mono, weight: 400 as const },
    { name: "Mono", data: monoB, weight: 700 as const },
    { name: "Sign", data: caveat, weight: 700 as const },
  ];

  const node = style === "mixtape" ? MixtapeCard({ title, by, note, count, handle, takes })
    : style === "matchbox" ? MatchboxCard({ title, by, note, count, handle, takes })
    : style === "neon" ? NeonCard({ title, by, note, count, handle, takes })
    : MapCard({ title, by, count, handle, takes, pts });

  return new ImageResponse(node, { width: 1080, height: 1350, fonts });
}

/* ───────────────────── A · THE NIGHT MAP (real city, real pins) ─────────────────
   Web-mercator tile math: the SAME Carto dark tiles the product map uses, fitted to
   the guide's true coordinates. The route-on-dark grammar Strava made iconic —
   here it's trust-on-dark. */
const T = 512; // @2x tile size
const merX = (lng: number) => (lng + 180) / 360;
const merY = (lat: number) => { const φ = (lat * Math.PI) / 180; return (1 - Math.asinh(Math.tan(φ)) / Math.PI) / 2; };

function MapCard({ title, by, count, handle, takes, pts }: { title: string; by: string; count: string; handle: string; takes: Take[]; pts: [number, number][] }) {
  const W = 1080, H = 1350;
  // pins must live in this window (the lower part belongs to the words)
  const win = { x0: 130, x1: 950, y0: 200, y1: 740 };
  const P = pts.length ? pts : ([[12.9716, 77.5946]] as [number, number][]);
  // largest zoom (most street detail) at which the pins still fit the window
  let z = 11;
  for (let cand = 14; cand >= 11; cand--) {
    const n = T * 2 ** cand;
    const xs = P.map((a) => merX(a[1]) * n), ys = P.map((a) => merY(a[0]) * n);
    if (Math.max(...xs) - Math.min(...xs) <= win.x1 - win.x0 && Math.max(...ys) - Math.min(...ys) <= win.y1 - win.y0) { z = cand; break; }
  }
  if (!pts.length) z = 12; // no pins → a calm city view
  const n = T * 2 ** z;
  const xs = P.map((a) => merX(a[1]) * n), ys = P.map((a) => merY(a[0]) * n);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const gx0 = cx - W / 2, gy0 = cy - (win.y0 + win.y1) / 2; // bbox centre sits mid-window
  const txa = Math.floor(gx0 / T), txb = Math.floor((gx0 + W - 1) / T);
  const tya = Math.floor(gy0 / T), tyb = Math.floor((gy0 + H - 1) / T);
  const tiles: { x: number; y: number; l: number; t: number }[] = [];
  for (let tx = txa; tx <= txb; tx++) for (let ty = tya; ty <= tyb; ty++) tiles.push({ x: tx, y: ty, l: tx * T - gx0, t: ty * T - gy0 });
  const sub = ["a", "b", "c", "d"];
  const pin = (a: [number, number]) => ({ x: merX(a[1]) * n - gx0, y: merY(a[0]) * n - gy0 });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#0b0a08", position: "relative", overflow: "hidden", fontFamily: "Grot" }}>
      {tiles.map((t, i) => (
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        <img key={i} src={`https://${sub[(t.x + t.y) % 4]}.basemaps.cartocdn.com/dark_all/${z}/${t.x}/${t.y}@2x.png`} width={T} height={T} style={{ position: "absolute", left: t.l, top: t.t, width: T, height: T, opacity: 0.94 }} />
      ))}
      {/* warm the night + keep the corners quiet */}
      <div style={{ position: "absolute", inset: 0, display: "flex", background: "radial-gradient(85% 60% at 50% 34%, rgba(246,168,43,0.10), rgba(11,10,8,0) 60%)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(180deg, rgba(11,10,8,0.78) 0%, rgba(11,10,8,0.12) 14%, rgba(11,10,8,0) 26%)" }} />
      {/* pins at their true coordinates */}
      {pts.map((a, i) => {
        const { x, y } = pin(a);
        const r = i === 0 ? 30 : 22;
        return (
          <div key={`p${i}`} style={{ position: "absolute", left: x - r / 2, top: y - r / 2, width: r, height: r, borderRadius: r, background: "#f6a82b", border: "3px solid rgba(11,10,8,0.85)", boxShadow: `0 0 ${i === 0 ? 44 : 28}px ${i === 0 ? 14 : 8}px rgba(246,168,43,0.65)`, display: "flex" }} />
        );
      })}
      {/* name the pins — real names on real places is the whole point */}
      {pts.slice(0, 3).map((a, i) => {
        const t = takes[i]; if (!t) return <div key={`l${i}`} style={{ display: "flex" }} />;
        const { x, y } = pin(a);
        const flip = x > 660;
        const side = flip ? { right: W - x + 26 } : { left: x + 26 };
        return (
          <div key={`l${i}`} style={{ position: "absolute", ...side, top: y - 21, display: "flex", alignItems: "center", background: "rgba(11,10,8,0.82)", border: "1px solid rgba(246,168,43,0.35)", borderRadius: 24, padding: "7px 16px", fontFamily: "Grot", fontWeight: 700, fontSize: 25, color: "#f4eee3" }}>{t.place}</div>
        );
      })}
      {/* header */}
      <div style={{ position: "absolute", left: 56, top: 50, display: "flex", fontFamily: "Bric", fontSize: 40, color: "#f4eee3" }}><span style={{ display: "flex", color: "#f6a82b", marginRight: 3 }}>V</span>ouch</div>
      <div style={{ position: "absolute", right: 56, top: 60, display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: 19, letterSpacing: 4, color: "rgba(244,238,227,0.75)" }}>BENGALURU</div>
      {/* the words, over a deep scrim */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 600, display: "flex", background: "linear-gradient(180deg, rgba(11,10,8,0) 0%, rgba(11,10,8,0.62) 30%, rgba(11,10,8,0.97) 72%, #0b0a08 100%)" }} />
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 54, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: 20, letterSpacing: 3, color: "#f6a82b", textTransform: "uppercase" }}>A guide by {by}</div>
        <div style={{ display: "flex", fontFamily: "Bric", fontSize: title.length <= 26 ? 96 : 74, lineHeight: 0.98, letterSpacing: -3, color: "#f4eee3", marginTop: 18 }}>{title}</div>
        <div style={{ display: "flex", height: 1, background: "rgba(244,238,227,0.18)", marginTop: 32 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22 }}>
          <div style={{ display: "flex", fontFamily: "Mono", fontSize: 20, color: "#a99f8f", letterSpacing: 1 }}>{count || P.length} places · pinned where they stand</div>
          <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: 20, color: "#f4eee3" }}>{handle}</div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── B · THE MIXTAPE (a guide is something a friend records you) ───
   The emotional truth of M3: "where should I eat?" answered like a mixtape — a
   cassette with a handwritten label, the places as Side A's tracklist. */
function MixtapeCard({ title, by, note, count, handle, takes }: { title: string; by: string; note: string; count: string; handle: string; takes: Take[] }) {
  const CREAM = "#f1e7d3", INK = "#1c160d";
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", background: "#0d0b08", fontFamily: "Mono", position: "relative", padding: "56px 70px" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", background: "radial-gradient(75% 50% at 50% 30%, rgba(246,168,43,0.08), rgba(13,11,8,0) 65%)" }} />
      {/* header */}
      <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", fontFamily: "Bric", fontSize: 38, color: "#f4eee3" }}><span style={{ display: "flex", color: "#f6a82b", marginRight: 3 }}>V</span>ouch</div>
        <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: 18, letterSpacing: 4, color: "#8a7c62" }}>BENGALURU</div>
      </div>

      {/* the cassette */}
      <div style={{ display: "flex", flexDirection: "column", width: 940, height: 560, marginTop: 44, background: "linear-gradient(165deg, #211b12, #171209)", borderRadius: 26, border: "1px solid rgba(246,168,43,0.25)", boxShadow: "0 50px 90px -30px rgba(0,0,0,0.9), inset 0 1px 0 rgba(244,238,227,0.08)", position: "relative", padding: 30 }}>
        {/* corner screws */}
        {[{ l: 18, t: 16 }, { l: 894, t: 16 }, { l: 18, t: 516 }, { l: 894, t: 516 }].map((s, i) => (
          <div key={i} style={{ position: "absolute", left: s.l, top: s.t, width: 14, height: 14, borderRadius: 7, background: "#0d0b08", border: "1.5px solid rgba(244,238,227,0.25)", display: "flex" }} />
        ))}
        {/* label */}
        <div style={{ display: "flex", flexDirection: "column", background: CREAM, borderRadius: 10, padding: "20px 30px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 12, display: "flex", background: "#f6a82b" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 12, height: 5, display: "flex", background: "#1c160d" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
            <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: 16, letterSpacing: 3, color: "#8a7355" }}>SIDE A</div>
            <div style={{ display: "flex", fontFamily: "Mono", fontSize: 16, letterSpacing: 2, color: "#8a7355" }}>{count || takes.length} PLACES</div>
          </div>
          {/* the handwritten line — a person wrote this for you */}
          <div style={{ display: "flex", fontFamily: "Sign", fontSize: title.length <= 26 ? 78 : 62, color: INK, marginTop: 4, transform: "rotate(-1.2deg)" }}>{title}</div>
          <div style={{ display: "flex", height: 2, background: "rgba(28,22,13,0.25)", marginTop: 2 }} />
          <div style={{ display: "flex", fontFamily: "Sign", fontSize: 34, color: "#6b5638", marginTop: 8, transform: "rotate(-0.8deg)" }}>recorded for you by {by}</div>
        </div>
        {/* window + spools */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "26px 110px 0", background: "#0c0a07", border: "1px solid rgba(244,238,227,0.14)", borderRadius: 16, padding: "18px 34px", position: "relative" }}>
          <div style={{ display: "flex", width: 92, height: 92, borderRadius: 46, border: "9px solid #efe5d0", background: "#0c0a07", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", width: 30, height: 30, borderRadius: 15, border: "4px dashed rgba(244,238,227,0.7)" }} />
          </div>
          {/* tape spanning the spools — more on the left: the night's just begun */}
          <div style={{ position: "absolute", left: 130, right: 150, top: 86, height: 7, display: "flex", background: "rgba(70,52,26,0.9)", borderRadius: 4 }} />
          <div style={{ display: "flex", width: 92, height: 92, borderRadius: 46, border: "9px solid #efe5d0", background: "#0c0a07", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", width: 30, height: 30, borderRadius: 15, border: "4px dashed rgba(244,238,227,0.7)" }} />
          </div>
        </div>
      </div>

      {/* the tracklist */}
      <div style={{ display: "flex", flexDirection: "column", width: 940, marginTop: 46, gap: 0 }}>
        {takes.slice(0, 4).map((t, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", padding: "18px 6px", borderTop: i === 0 ? "1px solid rgba(244,238,227,0)" : "1px solid rgba(244,238,227,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
                <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: 22, color: "#f6a82b" }}>A{i + 1}</div>
                <div style={{ display: "flex", fontFamily: "Grot", fontWeight: 700, fontSize: 36, color: "#f4eee3" }}>{t.place}</div>
              </div>
            </div>
            {t.note ? <div style={{ display: "flex", fontFamily: "Grot", fontSize: 25, color: "#a99f8f", marginTop: 6, paddingLeft: 56 }}>{t.note}</div> : <div style={{ display: "flex" }} />}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
        <div style={{ display: "flex", fontFamily: "Mono", fontSize: 18, color: "#8a7c62", letterSpacing: 1 }}>play it hungry</div>
        <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: 20, color: "#f4eee3" }}>{handle}</div>
      </div>
    </div>
  );
}

/* ──────────── C · THE MATCHBOX (Bengaluru vernacular print, ownable) ────────────
   Indian matchbox-label art: ornamental border, a sunburst emblem, factory line
   ("BENGALURU GUIDE WORKS"), matchstick bullets, and a striker strip along the
   bottom — texture only, words stay literal (PRD §10). */
function MatchboxCard({ title, by, note, count, handle, takes }: { title: string; by: string; note: string; count: string; handle: string; takes: Take[] }) {
  const CREAM = "#efe3c6", INK = "#231a0d", VERM = "#c14a1f", SAFF = "#e0930f";
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: CREAM, position: "relative", fontFamily: "Mono", padding: 34 }}>
      {/* double ornamental border */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, border: `10px solid ${VERM}`, position: "relative", padding: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, border: `3px solid ${INK}`, position: "relative", alignItems: "center", padding: "40px 56px 0", overflow: "hidden" }}>
          {/* corner diamonds */}
          {[{ l: -10, t: -10 }, { r: -10, t: -10 }, { l: -10, b: -10 }, { r: -10, b: -10 }].map((c, i) => (
            <div key={i} style={{ position: "absolute", ...(c.l != null ? { left: c.l } : { right: (c as { r: number }).r }), ...(c.t != null ? { top: c.t } : { bottom: (c as { b: number }).b }), width: 20, height: 20, background: VERM, transform: "rotate(45deg)", display: "flex" }} />
          ))}
          {/* factory line */}
          <div style={{ display: "flex", fontWeight: 700, fontSize: 19, letterSpacing: 6, color: VERM, textTransform: "uppercase" }}>Estd · Bengaluru Guide Works</div>
          {/* sunburst + emblem */}
          <div style={{ display: "flex", width: 340, height: 340, marginTop: 30, position: "relative", alignItems: "center", justifyContent: "center" }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ position: "absolute", left: 166, top: 0, width: 8, height: 340, background: `linear-gradient(180deg, ${SAFF}55, ${SAFF}11)`, transform: `rotate(${i * 15}deg)`, display: "flex" }} />
            ))}
            <div style={{ display: "flex", width: 218, height: 218, borderRadius: 110, background: SAFF, border: `7px solid ${INK}`, alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 10px ${CREAM}, 0 0 0 13px ${INK}` }}>
              <div style={{ display: "flex", fontFamily: "Bric", fontSize: 130, color: INK, marginTop: -10 }}>V</div>
            </div>
          </div>
          {/* the guide title — the label's "brand" */}
          <div style={{ display: "flex", fontFamily: "Bric", fontSize: title.length <= 26 ? 84 : 64, lineHeight: 0.98, letterSpacing: -2, color: INK, marginTop: 34, textAlign: "center", justifyContent: "center" }}>{title}</div>
          {note ? <div style={{ display: "flex", fontSize: 20, letterSpacing: 2, color: "#7a6038", marginTop: 14, textTransform: "uppercase" }}>{note}</div> : <div style={{ display: "flex" }} />}
          <div style={{ display: "flex", fontWeight: 700, fontSize: 19, letterSpacing: 4, color: VERM, marginTop: 18, textTransform: "uppercase" }}>Avg. contents · {count || takes.length} places · no stars</div>
          {/* contents with matchstick bullets */}
          <div style={{ display: "flex", flexDirection: "column", alignSelf: "stretch", marginTop: 30, gap: 18 }}>
            {takes.slice(0, 4).map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", width: 16, height: 16, borderRadius: 9, background: VERM, border: `2px solid ${INK}` }} />
                  <div style={{ display: "flex", width: 44, height: 6, background: "#c9b893", border: `1.5px solid ${INK}`, marginLeft: -2 }} />
                </div>
                <div style={{ display: "flex", fontFamily: "Grot", fontWeight: 700, fontSize: 37, color: INK }}>{t.place}</div>
              </div>
            ))}
          </div>
          {/* signature row */}
          <div style={{ display: "flex", alignSelf: "stretch", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", paddingBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <div style={{ display: "flex", fontSize: 18, color: "#7a6038" }}>by</div>
              <div style={{ display: "flex", fontFamily: "Sign", fontSize: 56, color: INK, transform: "rotate(-2deg)" }}>{by}</div>
            </div>
            <div style={{ display: "flex", fontWeight: 700, fontSize: 20, color: INK }}>{handle}</div>
          </div>
          {/* striker strip — texture only */}
          <div style={{ display: "flex", alignSelf: "stretch", height: 34, margin: "0 -56px", background: `repeating-linear-gradient(105deg, #2a2118 0 7px, #3a2e1f 7px 14px)`, borderTop: `3px solid ${INK}` }} />
        </div>
      </div>
    </div>
  );
}

/* ───────────── D · THE NEON NIGHT (Empire at 1 a.m., as a sign) ─────────────────
   The guide as a glowing signboard in the Bengaluru night — tube-lit title, the
   places lit beneath. The night the guide is FOR. */
function NeonCard({ title, by, note, count, handle, takes }: { title: string; by: string; note: string; count: string; handle: string; takes: Take[] }) {
  const TUBE = "#fff3dd";
  const glowSaff = "0 0 10px rgba(246,168,43,0.9), 0 0 34px rgba(246,168,43,0.65), 0 0 80px rgba(246,168,43,0.4)";
  const glowWarm = "0 0 8px rgba(255,236,200,0.8), 0 0 30px rgba(255,210,140,0.5), 0 0 70px rgba(246,168,43,0.3)";
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #060509 0%, #0b0810 55%, #120c0a 100%)", fontFamily: "Grot", position: "relative", padding: "70px 76px", overflow: "hidden" }}>
      {/* wall glow */}
      <div style={{ position: "absolute", inset: 0, display: "flex", background: "radial-gradient(80% 45% at 50% 38%, rgba(246,168,43,0.13), rgba(6,5,9,0) 70%)" }} />
      {/* mounting wire */}
      <div style={{ position: "absolute", left: 540, top: 0, width: 2, height: 64, background: "rgba(244,238,227,0.18)", display: "flex" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", fontFamily: "Bric", fontSize: 40, color: "#f6a82b", textShadow: glowSaff }}><span style={{ display: "flex", marginRight: 3 }}>V</span>ouch</div>
        <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: 19, letterSpacing: 5, color: "rgba(244,238,227,0.55)" }}>BENGALURU · TONIGHT</div>
      </div>
      {/* the sign */}
      <div style={{ display: "flex", flexDirection: "column", marginTop: 92 }}>
        <div style={{ display: "flex", fontFamily: "Bric", fontSize: title.length <= 26 ? 116 : 88, lineHeight: 1.0, letterSpacing: -3, color: TUBE, textShadow: glowWarm }}>{title}</div>
        {note ? <div style={{ display: "flex", fontFamily: "Mono", fontSize: 23, letterSpacing: 2, color: "rgba(246,168,43,0.95)", textShadow: glowSaff, marginTop: 26, textTransform: "lowercase" }}>· {note} ·</div> : <div style={{ display: "flex" }} />}
      </div>
      {/* the lit list */}
      <div style={{ display: "flex", flexDirection: "column", marginTop: 78, gap: 36 }}>
        {takes.slice(0, 4).map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <div style={{ display: "flex", width: 13, height: 13, borderRadius: 7, background: "#f6a82b", boxShadow: glowSaff }} />
            <div style={{ display: "flex", fontFamily: "Grot", fontWeight: 700, fontSize: 47, color: TUBE, textShadow: "0 0 18px rgba(255,236,200,0.45)" }}>{t.place}</div>
            <div style={{ display: "flex", fontFamily: "Mono", fontSize: 21, color: "rgba(169,159,143,0.85)", marginLeft: "auto" }}>{t.note ? t.note.slice(0, 26) + (t.note.length > 26 ? "…" : "") : ""}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto" }}>
        <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: 21, letterSpacing: 2, color: "rgba(244,238,227,0.85)", textTransform: "uppercase" }}>A guide by {by}</div>
        <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: 21, color: "#f6a82b", textShadow: glowSaff }}>{handle}</div>
      </div>
    </div>
  );
}
