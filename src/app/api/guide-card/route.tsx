import { ImageResponse } from "next/og";

/* The guide image card (PRD §7.9, §8) — the 4:5 artifact that travels through
   WhatsApp, and the first thing a stranger sees of Vouch.

   Designed from the JTBD, not a metaphor:
   · the RECIPIENT asked "where should I eat?" — they need the places, WHERE they
     are, and the friend's words about each, in one glance;
   · the SENDER is answering a friend — their name and their words carry the card;
   · the BYSTANDER should recognise the product itself: glowing pins on night-time
     Bengaluru. The card IS the app, composed like a concierge city map: numbered
     pins on the real city, the numbered takes beneath. One system, no costume.

   Data via query params (no DB): title, by, note, count, n=Name::take::Area,
   pt=lat,lng (same order as n). */

export const runtime = "edge";

const TTF = (f: string) => `https://cdn.jsdelivr.net/fontsource/fonts/${f}.ttf`;

const CREAM = "#f4eee3", MUT = "#a99f8f", FAINT = "#7a7160", SAFF = "#f6a82b", FIELD = "#0b0a08", INKONSAFF = "#231503";

type Take = { place: string; note: string; area: string };

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const title = (p.get("title") || "A guide").slice(0, 64);
  const by = (p.get("by") || "Someone").slice(0, 40);
  const note = (p.get("note") || "").slice(0, 60);
  const count = Number(p.get("count")) || 0;
  const handle = "@" + by.toLowerCase().replace(/\s+/g, "");
  const takes: Take[] = p.getAll("n").slice(0, 4).map((s) => {
    const [place, nt, area] = s.split("::");
    return { place: (place || "").slice(0, 40), note: (nt || "").slice(0, 88), area: (area || "").slice(0, 24) };
  });
  // pt=i,lat,lng — the index keys the pin's number to its row in the list below
  // (a place with no coordinates keeps its row, just has no pin). pt=lat,lng also
  // accepted, numbered by position.
  const pts = p.getAll("pt")
    .map((s, k) => { const a = s.split(",").map(Number); return a.length === 3 ? a : a.length === 2 ? [k, a[0], a[1]] : null; })
    .filter((a): a is number[] => !!a && a.every((n) => Number.isFinite(n)))
    .map((a) => ({ i: a[0], lat: a[1], lng: a[2] }));
  const extra = Math.max(0, count - takes.length);

  const [bric, grot, grotB, mono, monoB] = await Promise.all([
    fetch(TTF("bricolage-grotesque@latest/latin-800-normal")).then((r) => r.arrayBuffer()),
    fetch(TTF("space-grotesk@latest/latin-500-normal")).then((r) => r.arrayBuffer()),
    fetch(TTF("space-grotesk@latest/latin-700-normal")).then((r) => r.arrayBuffer()),
    fetch(TTF("space-mono@latest/latin-400-normal")).then((r) => r.arrayBuffer()),
    fetch(TTF("space-mono@latest/latin-700-normal")).then((r) => r.arrayBuffer()),
  ]);

  /* ── map band geometry (web-mercator, the same Carto tiles as the product) ──── */
  const W = 1080;
  const BT = 322, BH = 560;            // the map band: top + height within the card
  const PAD = { x: 130, y: 84 };       // pins keep this inset inside the band
  const T = 512;
  const merX = (lng: number) => (lng + 180) / 360;
  const merY = (lat: number) => { const φ = (lat * Math.PI) / 180; return (1 - Math.asinh(Math.tan(φ)) / Math.PI) / 2; };
  const P = pts.length ? pts : [{ i: -1, lat: 12.9716, lng: 77.5946 }];
  let z = 11;
  for (let cand = 15; cand >= 11; cand--) {
    const n = T * 2 ** cand;
    const xs = P.map((a) => merX(a.lng) * n), ys = P.map((a) => merY(a.lat) * n);
    if (Math.max(...xs) - Math.min(...xs) <= W - 2 * PAD.x && Math.max(...ys) - Math.min(...ys) <= BH - 2 * PAD.y) { z = cand; break; }
  }
  if (pts.length <= 1) z = 13; // a single pin: a neighbourhood, not a doorstep
  const n = T * 2 ** z;
  const xs = P.map((a) => merX(a.lng) * n), ys = P.map((a) => merY(a.lat) * n);
  const gx0 = (Math.min(...xs) + Math.max(...xs)) / 2 - W / 2;        // map-band origin in global px
  const gy0 = (Math.min(...ys) + Math.max(...ys)) / 2 - BH / 2;
  const tiles: { x: number; y: number; l: number; t: number }[] = [];
  for (let tx = Math.floor(gx0 / T); tx <= Math.floor((gx0 + W - 1) / T); tx++)
    for (let ty = Math.floor(gy0 / T); ty <= Math.floor((gy0 + BH - 1) / T); ty++)
      tiles.push({ x: tx, y: ty, l: tx * T - gx0, t: ty * T - gy0 });
  const sub = ["a", "b", "c", "d"];
  const pin = (a: { lat: number; lng: number }) => ({ x: merX(a.lng) * n - gx0, y: merY(a.lat) * n - gy0 });
  // neighbours collide at city zoom (Empire and Naru are 450m apart) — nudge
  // overlapping pins apart just enough that every number stays readable
  const pos = pts.map((a) => ({ i: a.i, ...pin(a) }));
  for (let r = 0; r < 3; r++)
    for (let m = 0; m < pos.length; m++)
      for (let q = m + 1; q < pos.length; q++) {
        const dx = pos[q].x - pos[m].x, dy = pos[q].y - pos[m].y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 56) {
          const push = (56 - d) / 2, ux = dx / d, uy = dy / d;
          pos[m].x -= ux * push; pos[m].y -= uy * push;
          pos[q].x += ux * push; pos[q].y += uy * push;
        }
      }

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: FIELD, fontFamily: "Grot", position: "relative", overflow: "hidden" }}>
        {/* ── the words first: who, then what (survives the WhatsApp thumbnail crop) ── */}
        <div style={{ display: "flex", flexDirection: "column", padding: "58px 64px 0" }}>
          <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: 21, letterSpacing: 3, color: SAFF, textTransform: "uppercase" }}>A guide by {by}</div>
          <div style={{ display: "flex", fontFamily: "Bric", fontSize: title.length <= 24 ? 88 : 68, lineHeight: 1.0, letterSpacing: -2.5, color: CREAM, marginTop: 16 }}>{title}</div>
          <div style={{ display: "flex", fontFamily: "Mono", fontSize: 20, letterSpacing: 1, color: FAINT, marginTop: 16 }}>{count || P.length} places · Bengaluru{note ? ` · ${note}` : ""}</div>
        </div>

        {/* ── the city, real: numbered pins on the same tiles the product uses ── */}
        <div style={{ position: "absolute", left: 0, top: BT, width: W, height: BH, display: "flex", overflow: "hidden" }}>
          {tiles.map((t, i) => (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img key={i} src={`https://${sub[(t.x + t.y) % 4]}.basemaps.cartocdn.com/dark_all/${z}/${t.x}/${t.y}@2x.png`} width={T} height={T} style={{ position: "absolute", left: t.l, top: t.t, width: T, height: T }} />
          ))}
          {/* warmth under the pins, then fade the band's edges into the field */}
          <div style={{ position: "absolute", inset: 0, display: "flex", background: "radial-gradient(70% 65% at 50% 50%, rgba(246,168,43,0.12), rgba(11,10,8,0) 62%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", background: `linear-gradient(180deg, ${FIELD} 0%, rgba(11,10,8,0) 14%, rgba(11,10,8,0) 84%, ${FIELD} 100%)` }} />
          {pos.map((a, k) => (
            <div key={k} style={{ position: "absolute", left: a.x - 23, top: a.y - 23, width: 46, height: 46, borderRadius: 23, background: SAFF, border: "3.5px solid rgba(11,10,8,0.9)", boxShadow: "0 0 30px 9px rgba(246,168,43,0.55)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Mono", fontWeight: 700, fontSize: 24, color: INKONSAFF }}>{a.i + 1}</div>
          ))}
        </div>

        {/* ── the friend's words: the numbered takes (the content of the guide) ── */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: BH + 26, padding: "0 64px" }}>
          {takes.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 22, padding: "21px 0", borderTop: i === 0 ? "none" : "1px solid rgba(244,238,227,0.10)" }}>
              <div style={{ display: "flex", width: 40, height: 40, borderRadius: 20, background: SAFF, alignItems: "center", justifyContent: "center", fontFamily: "Mono", fontWeight: 700, fontSize: 21, color: INKONSAFF, marginTop: 3 }}>{i + 1}</div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ display: "flex", fontFamily: "Grot", fontWeight: 700, fontSize: 36, color: CREAM }}>{t.place}</div>
                  {t.area ? <div style={{ display: "flex", fontFamily: "Mono", fontSize: 18, letterSpacing: 1.5, color: FAINT, textTransform: "uppercase" }}>{t.area}</div> : <div style={{ display: "flex" }} />}
                </div>
                {t.note ? <div style={{ display: "flex", fontFamily: "Grot", fontSize: 26, lineHeight: 1.3, color: MUT, marginTop: 5 }}>“{t.note}”</div> : <div style={{ display: "flex" }} />}
              </div>
            </div>
          ))}
          {extra > 0 && <div style={{ display: "flex", fontFamily: "Mono", fontSize: 19, color: FAINT, paddingTop: 16, borderTop: "1px solid rgba(244,238,227,0.10)" }}>+ {extra} more on the map</div>}
        </div>

        {/* ── the brand, quiet ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", padding: "0 64px 52px" }}>
          <div style={{ display: "flex", fontFamily: "Bric", fontSize: 34, color: CREAM }}><span style={{ display: "flex", color: SAFF, marginRight: 2 }}>V</span>ouch</div>
          <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: 20, color: CREAM }}>{handle}</div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts: [
        { name: "Bric", data: bric, weight: 800 as const },
        { name: "Grot", data: grot, weight: 500 as const },
        { name: "Grot", data: grotB, weight: 700 as const },
        { name: "Mono", data: mono, weight: 400 as const },
        { name: "Mono", data: monoB, weight: 700 as const },
      ],
    },
  );
}
