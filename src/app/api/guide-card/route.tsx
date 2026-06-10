import { ImageResponse } from "next/og";

/* The guide image card (PRD §7.9, §8) — the 4:5 artifact that travels through
   WhatsApp/IG, and the first thing a stranger sees of Vouch. Three directions, each
   committed to ONE idea (?style=):
     · map     — Strava-for-taste: REAL Carto tiles of Bengaluru, pins at their true
                 coordinates, saffron glow. Geography is the hero.
     · receipt — Receiptify-grade anatomy on thermal paper, ending in a handwritten
                 signature. "A name on it", literally.
     · poster  — Wrapped-confidence: a flat saffron field + enormous ink type.
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

  const node = style === "receipt" ? ReceiptCard({ title, by, note, count, handle, takes })
    : style === "poster" ? PosterCard({ title, by, note, count, handle, takes })
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

/* ─────────────── B · THE SIGNED RECEIPT (anatomy + an actual name) ─────────────
   Receiptify's lesson: commit to the object completely — mono rigor, item rows,
   a TOTAL line — then land OUR thesis: the guide is signed, by hand. */
function ReceiptCard({ title, by, note, count, handle, takes }: { title: string; by: string; note: string; count: string; handle: string; takes: Take[] }) {
  const INK = "#221b10", FAINT = "#7d7257";
  const dash = { display: "flex", height: 2, background: "repeating-linear-gradient(90deg, rgba(34,27,16,0.55) 0 14px, transparent 14px 24px)", margin: "26px 0" } as const;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0e0c09", position: "relative", fontFamily: "Mono" }}>
      {/* the field carries a faint saffron breath so it's never a void */}
      <div style={{ position: "absolute", inset: 0, display: "flex", background: "radial-gradient(70% 50% at 50% 46%, rgba(246,168,43,0.07), rgba(14,12,9,0) 70%)" }} />
      <div style={{ display: "flex", flexDirection: "column", width: 850, background: "#f5eedd", color: INK, padding: "58px 62px 50px", borderRadius: 4, transform: "rotate(-1deg)", boxShadow: "0 60px 120px -30px rgba(0,0,0,0.85), 0 18px 40px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", fontFamily: "Bric", fontSize: 58, letterSpacing: 2 }}>VOUCH</div>
          <div style={{ display: "flex", fontSize: 17, letterSpacing: 3, color: FAINT, marginTop: 8, textTransform: "uppercase" }}>Bengaluru · a guide, not a listing</div>
        </div>
        <div style={dash} />
        <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: title.length <= 32 ? 42 : 34, lineHeight: 1.15, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</div>
        {note ? <div style={{ display: "flex", fontSize: 21, color: FAINT, marginTop: 10 }}>{note}</div> : <div style={{ display: "flex" }} />}
        <div style={dash} />
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {takes.map((t, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", fontWeight: 700, fontSize: 30, textTransform: "uppercase", letterSpacing: 0.5 }}>{String(i + 1).padStart(2, "0")}  {t.place}</div>
                {/* a drawn check — glyphs outside the typeface are how tofu happens */}
                <div style={{ display: "flex", width: 22, height: 12, borderLeft: `5px solid ${INK}`, borderBottom: `5px solid ${INK}`, transform: "rotate(-45deg)", marginTop: -6 }} />
              </div>
              {t.note ? <div style={{ display: "flex", fontSize: 21, color: FAINT, marginTop: 6, paddingLeft: 56 }}>{t.note}</div> : <div style={{ display: "flex" }} />}
            </div>
          ))}
        </div>
        <div style={dash} />
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 28 }}>
          <div style={{ display: "flex", letterSpacing: 1 }}>TOTAL</div>
          <div style={{ display: "flex" }}>{count || takes.length} PLACES, NO STARS</div>
        </div>
        <div style={dash} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 4 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 18, color: FAINT }}>signed,</div>
            <div style={{ display: "flex", fontFamily: "Sign", fontSize: 96, color: "#1c150c", marginTop: -6, transform: "rotate(-3deg)" }}>{by}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", paddingBottom: 14 }}>
            <div style={{ display: "flex", fontWeight: 700, fontSize: 21 }}>{handle}</div>
            <div style={{ display: "flex", fontSize: 16, color: FAINT, marginTop: 6 }}>the only review with a name on it</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── C · THE SAFFRON POSTER (one color, huge type) ─────────────────
   Wrapped's lesson: a flat, confident field + two type scales. Unmissable in a
   WhatsApp thread, and the colour IS the brand. */
function PosterCard({ title, by, note, count, handle, takes }: { title: string; by: string; note: string; count: string; handle: string; takes: Take[] }) {
  const INK = "#211504";
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#f6a82b", color: INK, padding: "64px 68px", fontFamily: "Grot", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", width: 74, height: 74, borderRadius: 18, background: INK, alignItems: "center", justifyContent: "center", fontFamily: "Bric", fontSize: 44, color: "#f6a82b" }}>V</div>
        <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: 20, letterSpacing: 5, color: "rgba(33,21,4,0.66)" }}>BENGALURU</div>
      </div>
      <div style={{ display: "flex", fontFamily: "Bric", fontSize: title.length <= 26 ? 126 : 96, lineHeight: 0.95, letterSpacing: -5, marginTop: 70 }}>{title}</div>
      {note ? <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: 22, letterSpacing: 1, color: "rgba(33,21,4,0.62)", marginTop: 26, textTransform: "lowercase" }}>{note}</div> : <div style={{ display: "flex" }} />}
      <div style={{ display: "flex", height: 4, background: INK, marginTop: 52 }} />
      <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
        {takes.slice(0, 4).map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 26, padding: "26px 0", borderBottom: "2px solid rgba(33,21,4,0.25)" }}>
            <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: 26, color: "rgba(33,21,4,0.55)" }}>{String(i + 1).padStart(2, "0")}</div>
            <div style={{ display: "flex", fontFamily: "Bric", fontSize: 52, letterSpacing: -1 }}>{t.place}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: 21, letterSpacing: 2, textTransform: "uppercase" }}>A guide by {by}</div>
          <div style={{ display: "flex", fontFamily: "Mono", fontSize: 19, color: "rgba(33,21,4,0.62)", marginTop: 8 }}>{count || takes.length} places · every one with a name on it</div>
        </div>
        <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: 22 }}>{handle}</div>
      </div>
    </div>
  );
}
