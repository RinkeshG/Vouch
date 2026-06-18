"use client";
import type { CSSProperties, ReactNode } from "react";
import { CAT_LABEL, type Cat, type Place } from "../v2/data";

/* Vouch foundation kit — Hanken / warm-dark / golden-amber. Every screen is
   built from these so the product feels like one hand made it. */

/* ---- type ---- */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, color: "var(--accent)", margin: 0 }}>{children}</p>;
}
export function Title({ children, size = "clamp(1.9rem,4vw,2.6rem)" }: { children: ReactNode; size?: string }) {
  return <h1 style={{ fontWeight: 600, fontSize: size, lineHeight: 1.04, letterSpacing: "-0.02em", color: "var(--ink)", margin: "12px 0 0", maxWidth: "18ch" }}>{children}</h1>;
}
export function Lede({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: "1.05rem", lineHeight: 1.55, color: "var(--muted)", margin: "12px 0 0", maxWidth: "48ch" }}>{children}</p>;
}

/* ---- buttons ---- */
export function Button({ children, onClick, variant = "primary", full, type = "button" }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost"; full?: boolean; type?: "button" | "submit" }) {
  const base: CSSProperties = { fontFamily: "inherit", fontSize: "0.92rem", fontWeight: 600, borderRadius: "var(--r-md)", padding: "11px 18px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: full ? "100%" : undefined };
  const styles = variant === "primary"
    ? { ...base, border: "none", background: "linear-gradient(140deg, var(--accent-2), var(--accent))", color: "var(--accent-ink)", boxShadow: "0 12px 26px -14px rgba(230,162,62,.8)" }
    : { ...base, border: "1px solid var(--line-2)", background: "none", color: "var(--ink)" };
  return <button type={type} onClick={onClick} className="v3-btn" style={styles}>{children}</button>;
}

/* ---- chips & toggle ---- */
export function Chip({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.66rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", borderRadius: "var(--r-pill)", padding: "5px 12px", color: accent ? "var(--accent)" : "var(--muted)", background: accent ? "var(--accent-dim)" : "transparent", border: `1px solid ${accent ? "var(--accent-line)" : "var(--line-2)"}` }}>{children}</span>;
}
export function Toggle<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { key: T; label: string; icon?: ReactNode }[] }) {
  return (
    <div style={{ display: "inline-flex", background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", padding: 3 }}>
      {options.map((o) => {
        const on = value === o.key;
        return <button key={o.key} type="button" onClick={() => onChange(o.key)} className="v3-btn" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 17px", borderRadius: "var(--r-sm)", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "0.78rem", fontWeight: 500, background: on ? "var(--accent)" : "transparent", color: on ? "var(--accent-ink)" : "var(--muted)" }}>{o.icon}{o.label}</button>;
      })}
    </div>
  );
}

/* ---- people ---- */
export function Monogram({ ini, size = 40 }: { ini: string; size?: number }) {
  return <span style={{ width: size, height: size, flex: "none", borderRadius: "50%", display: "grid", placeItems: "center", fontWeight: 600, fontSize: size * 0.34, color: "var(--accent-ink)", background: "linear-gradient(140deg, var(--accent-2), var(--accent))" }}>{ini}</span>;
}
export function Curator({ name, ini, bio, size = 42 }: { name: string; ini: string; bio?: string; size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 11 }}>
      <Monogram ini={ini} size={size} />
      <span>
        <span style={{ display: "block", fontWeight: 600, fontSize: "0.95rem", color: "var(--ink)" }}>{name}</span>
        {bio && <span style={{ display: "block", fontSize: "0.83rem", color: "var(--muted)", marginTop: 1 }}>{bio}</span>}
      </span>
    </span>
  );
}

/* ---- category icon (currentColor) ---- */
export function CatIcon({ cat, size = 16 }: { cat: Cat; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (cat) {
    case "drink": return <svg {...p}><path d="M7 8h8v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8z" /><path d="M15 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" /><path d="M7 8a2.5 2.5 0 0 1 2.5-3 2.5 2.5 0 0 1 5 0A2.5 2.5 0 0 1 15 8" /></svg>;
    case "food": return <svg {...p}><path d="M4 11h16a8 8 0 0 1-16 0z" /><path d="M9 6c0-1 1-1 1-2M12 6c0-1 1-1 1-2M15 6c0-1 1-1 1-2" /></svg>;
    case "view": return <svg {...p}><circle cx="12" cy="12" r="3.5" /><path d="M12 4v2M12 18v2M4 12h2M18 12h2M6 6l1.5 1.5M16.5 16.5L18 18M18 6l-1.5 1.5M7.5 16.5L6 18" /></svg>;
    case "shop": return <svg {...p}><path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>;
    case "stay": return <svg {...p}><path d="M4 19V7l8-3 8 3v12" /><path d="M4 19h16M10 19v-5h4v5" /></svg>;
    default: return <svg {...p}><path d="M5 9h11v4a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9z" /><path d="M16 10h2a2 2 0 0 1 0 4h-2" /><path d="M8 3c0 1-1 1-1 2M11 3c0 1-1 1-1 2" /></svg>;
  }
}

/* ---- the cover: a REAL crop of the map where this place is (different for
   every place, unmistakably a product — not a placeholder), or the maker's
   photo. The map is Vouch's native visual. ---- */
const TILE_Z = 14;
function mapTile(lat: number, lng: number, z = TILE_Z) {
  const n = 2 ** z;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latR = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.asinh(Math.tan(latR)) / Math.PI) / 2) * n);
  return `https://a.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}@2x.png`;
}
export function Media({ rank, cat, lat, lng, img, children, h = 150 }: { rank?: number; cat: Cat; lat?: number; lng?: number; img?: string; children?: ReactNode; h?: number }) {
  const tint = `var(--t-${cat})`;
  const isMap = !img && lat != null && lng != null;
  const bg = img ? `center/cover no-repeat url("${img}")` : isMap ? `center/cover no-repeat url("${mapTile(lat!, lng!)}")` : `linear-gradient(150deg, color-mix(in srgb, ${tint} 12%, #1a130b), #100c07)`;
  return (
    <div style={{ position: "relative", height: h, overflow: "hidden", borderBottom: "1px solid var(--line)" }}>
      <div className="v3-media-bg" style={{ background: bg }} />
      {/* warm the cool map tiles into the theme */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(36,23,10,.30)", mixBlendMode: "multiply" }} />
      {/* scrim for depth + legibility of the chips */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(16,12,7,.12) 0%, transparent 38%, rgba(16,12,7,.82) 100%)" }} />
      {/* the place, pinned */}
      {isMap && <span aria-hidden style={{ position: "absolute", top: "44%", left: "50%", transform: "translate(-50%,-50%)", width: 16, height: 16, borderRadius: "50%", background: "var(--accent)", border: "2px solid #1a1206", boxShadow: "0 0 0 6px rgba(230,162,62,.22), 0 5px 14px rgba(0,0,0,.6)" }} />}
      {rank != null && <span style={{ position: "absolute", top: 12, left: 12, zIndex: 3, fontSize: "0.66rem", fontWeight: 600, color: "var(--ink)", background: "rgba(16,12,7,.62)", backdropFilter: "blur(3px)", border: "1px solid var(--line-2)", borderRadius: "var(--r-xs)", padding: "2px 8px" }}>{String(rank).padStart(2, "0")}</span>}
      <span style={{ position: "absolute", left: 12, bottom: 12, zIndex: 3, display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px 5px 9px", borderRadius: "var(--r-pill)", background: `color-mix(in srgb, ${tint} 16%, rgba(16,12,7,.6))`, backdropFilter: "blur(3px)", border: `1px solid color-mix(in srgb, ${tint} 42%, transparent)`, color: tint, fontSize: "0.56rem", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase" }}><CatIcon cat={cat} size={13} />{CAT_LABEL[cat]}</span>
      {children}
    </div>
  );
}
export function SaveHeart({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-label={saved ? "saved" : "save"} onClick={(e) => { e.stopPropagation(); onClick(); }} className={`v3-btn${saved ? " v3-pop" : ""}`} style={{ position: "absolute", top: 11, right: 11, zIndex: 3, width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", border: "none", cursor: "pointer", background: "rgba(20,17,11,.55)", backdropFilter: "blur(4px)", color: saved ? "var(--accent)" : "var(--ink)" }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.4-9.3-8.7C1.2 8 2.7 4.6 6.1 4.6c2 0 3.2 1.2 3.9 2.3.7-1.1 1.9-2.3 3.9-2.3 3.4 0 4.9 3.4 3.4 6.7C19 15.6 12 20 12 20z" /></svg>
    </button>
  );
}
function Pin() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z" /><circle cx="12" cy="10" r="2.4" /></svg>; }
export function Loc({ place }: { place: Place }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: "0.72rem", color: "var(--faint)" }}><Pin />{place.area} <span style={{ opacity: .7 }}>↗</span>{place.by && <span style={{ marginLeft: 6 }}>· also {place.by}</span>}</span>;
}

/* ---- the place card (cover-led) ---- */
export function PlaceCard({ place, rank, saved, onSave, onOpen }: { place: Place; rank: number; saved?: boolean; onSave?: () => void; onOpen?: () => void }) {
  const delay = Math.min((rank - 1) * 55, 280);
  return (
    <article className="v3-card v3-anim" style={{ background: "linear-gradient(165deg, var(--card-top), var(--card-bot))", border: "1px solid var(--line-2)", borderRadius: "var(--r-xl)", overflow: "hidden", boxShadow: "var(--shadow)", animation: `v3-rise .5s var(--eout) ${delay}ms both` }}>
      <div onClick={onOpen} style={{ cursor: onOpen ? "pointer" : "default" }}>
        <Media rank={rank} cat={place.cat} lat={place.lat} lng={place.lng} img={place.img}>{onSave && <SaveHeart saved={!!saved} onClick={onSave} />}</Media>
      </div>
      <div style={{ padding: "15px 16px 16px" }}>
        <h3 style={{ fontWeight: 600, fontSize: "1.3rem", letterSpacing: "-0.01em", color: "var(--ink)", margin: 0, lineHeight: 1.1 }}>{place.name}</h3>
        <Loc place={place} />
        <p className="v3-clamp" style={{ fontStyle: "italic", fontSize: "0.96rem", lineHeight: 1.5, color: "var(--ink)", opacity: 0.85, margin: "10px 0 0", minHeight: "2.9em" }}>{place.note ? `"${place.note}"` : ""}</p>
        {place.order && <p style={{ display: "flex", gap: 8, marginTop: 11, paddingTop: 11, borderTop: "1px solid var(--line)", fontSize: "0.74rem", color: "var(--ink)", alignItems: "baseline" }}><span style={{ color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.62rem" }}>order</span>{place.order}</p>}
      </div>
    </article>
  );
}

/* ---- text-only detail (map view) ---- */
export function PlaceDetail({ place, rank, footer }: { place: Place; rank: number; footer?: ReactNode }) {
  return (
    <article style={{ background: "linear-gradient(165deg, var(--card-top), var(--card-bot))", border: "1px solid var(--line-2)", borderRadius: "var(--r-xl)", padding: "22px 20px 20px", boxShadow: "var(--shadow)" }}>
      <Eyebrow>{String(rank).padStart(2, "0")} · {place.when || "a stop"}</Eyebrow>
      <h2 style={{ fontWeight: 600, fontSize: "1.7rem", letterSpacing: "-0.015em", color: "var(--ink)", margin: "7px 0 0", lineHeight: 1.06 }}>{place.name}</h2>
      <Loc place={place} />
      <p style={{ fontStyle: "italic", fontSize: "1rem", lineHeight: 1.5, color: "var(--ink)", opacity: 0.88, margin: "13px 0 0" }}>{place.note ? `"${place.note}"` : ""}</p>
      {(place.order || place.when) && (
        <div style={{ marginTop: 14, paddingTop: 13, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 8 }}>
          {place.order && <div style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 12 }}><span style={{ fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--faint)", paddingTop: 2 }}>order</span><span style={{ fontSize: "0.9rem", color: "var(--ink)" }}>{place.order}</span></div>}
          {place.when && <div style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 12 }}><span style={{ fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--faint)", paddingTop: 2 }}>go</span><span style={{ fontSize: "0.9rem", color: "var(--ink)" }}>{place.when}</span></div>}
        </div>
      )}
      {footer}
    </article>
  );
}
