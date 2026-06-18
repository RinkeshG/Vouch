"use client";
import type { CSSProperties, ReactNode } from "react";
import { CAT_LABEL, type Cat, type Place } from "./data";

/* The v0.1 component kit — the design system as parts. Every screen is built
   from these so the whole product feels like one hand made it. */

export const mono = (size = "0.7rem"): CSSProperties => ({ fontFamily: "var(--mono)", fontSize: size, letterSpacing: "0.04em", color: "var(--mut)" });

/* ---- type ---- */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p style={{ ...mono("0.72rem"), color: "var(--faint)", margin: 0 }}>{children}</p>;
}
export function Title({ children, size = "clamp(2rem,4vw,2.9rem)" }: { children: ReactNode; size?: string }) {
  return <h1 style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: size, lineHeight: 1.02, letterSpacing: "-0.025em", color: "var(--ink)", margin: "12px 0 0" }}>{children}</h1>;
}
export function Lede({ children }: { children: ReactNode }) {
  return <p style={{ fontFamily: "var(--sans)", fontSize: "1.12rem", lineHeight: 1.55, color: "var(--read)", margin: "14px 0 0", maxWidth: "52ch" }}>{children}</p>;
}

/* ---- buttons ---- */
export function Button({ children, onClick, variant = "primary", full, type = "button" }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost"; full?: boolean; type?: "button" | "submit" }) {
  const base: CSSProperties = { fontFamily: "var(--mono)", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.04em", borderRadius: "var(--r-md)", padding: "11px 18px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: full ? "100%" : undefined, transition: "transform .15s var(--eout), background .2s, border-color .2s" };
  const styles = variant === "primary"
    ? { ...base, border: "none", background: "var(--accent)", color: "var(--accent-ink)" }
    : { ...base, border: "1px solid var(--line2)", background: "none", color: "var(--read)" };
  return <button type={type} onClick={onClick} className="v2-btn" style={styles}>{children}</button>;
}

/* ---- segmented toggle (map / cards) ---- */
export function Toggle<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { key: T; label: string; icon?: ReactNode }[] }) {
  return (
    <div style={{ display: "inline-flex", background: "var(--s1)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", padding: 3 }}>
      {options.map((o) => {
        const on = value === o.key;
        return (
          <button key={o.key} type="button" onClick={() => onChange(o.key)} className="v2-btn" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: "var(--r-sm)", border: "none", cursor: "pointer", fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.04em", background: on ? "var(--accent)" : "transparent", color: on ? "var(--accent-ink)" : "var(--mut)" }}>
            {o.icon}{o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---- curator ---- */
export function Monogram({ ini, size = 30 }: { ini: string; size?: number }) {
  return <span style={{ width: size, height: size, flex: "none", borderRadius: "50%", display: "grid", placeItems: "center", fontFamily: "var(--sans)", fontWeight: 600, fontSize: size * 0.34, color: "var(--accent-ink)", background: "var(--accent)" }}>{ini}</span>;
}
export function Curator({ name, ini, bio, size = 40 }: { name: string; ini: string; bio?: string; size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 11 }}>
      <Monogram ini={ini} size={size} />
      <span>
        <span style={{ display: "block", fontFamily: "var(--sans)", fontWeight: 600, fontSize: "0.95rem", color: "var(--ink)" }}>{name}</span>
        {bio && <span style={{ display: "block", fontFamily: "var(--sans)", fontSize: "0.82rem", color: "var(--mut)", marginTop: 1 }}>{bio}</span>}
      </span>
    </span>
  );
}

/* ---- the seal: a vouch is a personal stamp of trust (the signature motif) ---- */
export function Seal({ ini, name, size = 120, rotate = -8 }: { ini: string; name: string; size?: number; rotate?: number }) {
  const id = `seal-${ini}-${size}`.replace(/\s/g, "");
  const ring = (name + " · bengaluru · vouched · ").toUpperCase();
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: `rotate(${rotate}deg)`, color: "var(--accent)" }} aria-hidden="true">
      <defs><path id={id} d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" /></defs>
      <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.75" />
      <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="1 3.4" opacity="0.6" />
      <text fontFamily="var(--mono)" fontSize="7.6" letterSpacing="1.6" fill="currentColor" opacity="0.85"><textPath href={`#${id}`} startOffset="0">{ring}</textPath></text>
      <text x="60" y="57" textAnchor="middle" fontFamily="var(--sans)" fontWeight="600" fontSize="25" fill="currentColor">{ini}</text>
      <text x="60" y="74" textAnchor="middle" fontFamily="var(--mono)" fontSize="6.4" letterSpacing="2" fill="currentColor" opacity="0.8">A GUIDE</text>
    </svg>
  );
}

/* ---- category line icon ---- */
export function CatIcon({ cat, size = 38 }: { cat: Cat; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (cat) {
    case "drink": return <svg {...p}><path d="M7 8h8v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8z" /><path d="M15 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" /><path d="M7 8a2.5 2.5 0 0 1 2.5-3 2.5 2.5 0 0 1 5 0A2.5 2.5 0 0 1 15 8" /></svg>;
    case "food": return <svg {...p}><path d="M4 11h16a8 8 0 0 1-16 0z" /><path d="M9 6c0-1 1-1 1-2M12 6c0-1 1-1 1-2M15 6c0-1 1-1 1-2" /></svg>;
    case "view": return <svg {...p}><circle cx="12" cy="12" r="3.5" /><path d="M12 4v2M12 18v2M4 12h2M18 12h2M6 6l1.5 1.5M16.5 16.5L18 18M18 6l-1.5 1.5M7.5 16.5L6 18" /></svg>;
    case "shop": return <svg {...p}><path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>;
    case "stay": return <svg {...p}><path d="M4 19V7l8-3 8 3v12" /><path d="M4 19h16M10 19v-5h4v5" /></svg>;
    default: return <svg {...p}><path d="M5 9h11v4a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9z" /><path d="M16 10h2a2 2 0 0 1 0 4h-2" /><path d="M8 3c0 1-1 1-1 2M11 3c0 1-1 1-1 2" /></svg>;
  }
}

/* ---- the cover: a category-tinted, textured placeholder (color + depth on the
   board, Pinterest-style), or the creator's photo. zooms on hover (Airbnb). ---- */
export function Media({ rank, cat, name, img, featured, children }: { rank?: number; cat: Cat; name?: string; img?: string; featured?: boolean; children?: ReactNode }) {
  const tint = `var(--tint-${cat})`;
  const h = featured ? 178 : 150;
  const placeholderBg = `radial-gradient(240px 160px at 82% 24%, color-mix(in srgb, ${tint} 30%, transparent), transparent 72%), var(--media-grid), linear-gradient(150deg, color-mix(in srgb, ${tint} 11%, #181107), #0f0c07)`;
  return (
    <div className="v2-media" style={{ position: "relative", height: h, overflow: "hidden", borderBottom: "1px solid var(--line)" }}>
      <div className="v2-media-bg" style={{ background: img ? `center/cover no-repeat url("${img}")` : placeholderBg }}>
        {!img && <span aria-hidden style={{ position: "absolute", right: 8, bottom: -28, fontFamily: "var(--sans)", fontWeight: 700, fontSize: featured ? 184 : 162, lineHeight: 1, color: "transparent", WebkitTextStroke: `1.5px ${tint}`, opacity: 0.22 }}>{(name || "·")[0].toUpperCase()}</span>}
      </div>
      {rank != null && <span style={{ position: "absolute", top: 12, left: 12, zIndex: 3, fontFamily: "var(--mono)", fontSize: "0.64rem", color: "var(--accent)", border: "1px solid var(--accent-line)", background: "rgba(13,13,12,.6)", borderRadius: "var(--r-xs)", padding: "2px 7px" }}>{String(rank).padStart(2, "0")}</span>}
      {!img && (
        <span style={{ position: "absolute", left: 12, bottom: 12, zIndex: 3, display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px 5px 8px", borderRadius: "var(--r-pill)", background: `color-mix(in srgb, ${tint} 15%, rgba(13,13,12,.55))`, border: `1px solid color-mix(in srgb, ${tint} 40%, transparent)`, color: tint }}>
          <CatIcon cat={cat} size={14} /><span style={{ fontFamily: "var(--mono)", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{CAT_LABEL[cat]}</span>
        </span>
      )}
      {children}
    </div>
  );
}

export function SaveHeart({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-label={saved ? "saved to my map" : "save to my map"} onClick={(e) => { e.stopPropagation(); onClick(); }} className={`v2-heart${saved ? " on" : ""}`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.4-9.3-8.7C1.2 8 2.7 4.6 6.1 4.6c2 0 3.2 1.2 3.9 2.3.7-1.1 1.9-2.3 3.9-2.3 3.4 0 4.9 3.4 3.4 6.7C19 15.6 12 20 12 20z" /></svg>
    </button>
  );
}

function Pin() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z" /><circle cx="12" cy="10" r="2.4" /></svg>;
}
export function Loc({ place }: { place: Place }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 7, fontFamily: "var(--mono)", fontSize: "0.68rem", color: "var(--mut)" }}>
      <Pin />{place.area} <span style={{ color: "var(--faint)" }}>↗</span>
      {place.by && <span style={{ color: "var(--faint)", marginLeft: 6 }}>· also {place.by}</span>}
    </span>
  );
}
export function Note({ children }: { children: ReactNode }) {
  return <p style={{ fontFamily: "var(--sans)", fontSize: "1.02rem", lineHeight: 1.55, color: "var(--ink)", opacity: 0.9, margin: "16px 0 0" }}>{children}</p>;
}
export function OrderBlock({ place }: { place: Place }) {
  if (!place.order && !place.when) return null;
  const row = (k: string, v?: string) => v ? (
    <div style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: 14, marginTop: 8 }}>
      <span style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--faint)", paddingTop: 2 }}>{k}</span>
      <span style={{ fontFamily: "var(--sans)", fontSize: "0.92rem", color: "var(--ink)", lineHeight: 1.4 }}>{v}</span>
    </div>
  ) : null;
  return <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)" }}>{row("order", place.order)}{row("go", place.when)}</div>;
}

/* ---- the place card: cover-led, a 2-line voice hook (full note lives in the
   detail), one tight meta line. Tap the cover to fly into the map. ---- */
export function PlaceCard({ place, rank, featured, saved, onSave, onOpen, footer }: { place: Place; rank: number; featured?: boolean; saved?: boolean; onSave?: () => void; onOpen?: () => void; footer?: ReactNode }) {
  const delay = Math.min((rank - 1) * 55, 280);
  return (
    <article className="v2-card v2-anim" style={{ background: "linear-gradient(165deg, var(--s2), #100e0a)", border: "1px solid var(--line)", borderRadius: "var(--r-xl)", overflow: "hidden", boxShadow: "0 24px 54px -38px rgba(0,0,0,.9)", animation: `v2-develop .5s var(--eout) ${delay}ms both` }}>
      <div onClick={onOpen} style={{ cursor: onOpen ? "pointer" : "default" }}>
        <Media rank={rank} cat={place.cat} name={place.name} img={place.img} featured={featured}>
          {onSave && <SaveHeart saved={!!saved} onClick={onSave} />}
        </Media>
      </div>
      <div style={{ padding: "14px 16px 15px" }}>
        <h3 style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "1.28rem", letterSpacing: "-0.015em", color: "var(--ink)", margin: 0, lineHeight: 1.1 }}>{place.name}</h3>
        <Loc place={place} />
        <p className="v2-clamp" style={{ fontFamily: "var(--sans)", fontSize: "0.95rem", lineHeight: 1.5, color: "var(--read)", margin: "9px 0 0", minHeight: "2.85em" }}>{place.note}</p>
        {place.order && <p style={{ display: "flex", gap: 8, marginTop: 11, paddingTop: 11, borderTop: "1px solid var(--line)", fontFamily: "var(--mono)", fontSize: "0.62rem", letterSpacing: "0.04em", color: "var(--mut)", alignItems: "baseline" }}><span style={{ color: "var(--faint)", textTransform: "uppercase" }}>order</span> {place.order}</p>}
        {footer}
      </div>
    </article>
  );
}

/* ---- a centered state (not-found, empty, error) ---- */
export function StatePanel({ icon, title, body, actions }: { icon?: ReactNode; title: string; body?: string; actions?: ReactNode }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "14vh 28px", textAlign: "center" }}>
      {icon && <div style={{ display: "inline-grid", placeItems: "center", width: 64, height: 64, borderRadius: "50%", background: "var(--accent-dim)", border: "1px solid var(--accent-line)", color: "var(--accent)", marginBottom: 18 }}>{icon}</div>}
      <h1 style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "1.7rem", letterSpacing: "-0.02em", color: "var(--ink)", margin: 0 }}>{title}</h1>
      {body && <p style={{ fontFamily: "var(--sans)", fontSize: "1.05rem", color: "var(--mut)", margin: "10px auto 0", maxWidth: "38ch", lineHeight: 1.5 }}>{body}</p>}
      {actions && <div style={{ marginTop: 22, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}
export function LinkButton({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "ghost" }) {
  const base: CSSProperties = { fontFamily: "var(--mono)", fontSize: "0.75rem", fontWeight: 500, borderRadius: "var(--r-md)", padding: "12px 20px", textDecoration: "none", display: "inline-block" };
  return <a href={href} className="v2-btn" style={variant === "primary" ? { ...base, background: "var(--accent)", color: "var(--accent-ink)" } : { ...base, border: "1px solid var(--line2)", color: "var(--read)" }}>{children}</a>;
}
export function LostIcon() {
  return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" /><path d="M19 19l3 3M20.5 17.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" /></svg>;
}

/* ---- text-only detail (map view side panel) ---- */
export function PlaceDetail({ place, rank, footer }: { place: Place; rank: number; footer?: ReactNode }) {
  return (
    <article style={{ background: "linear-gradient(165deg, var(--s2), #100e0a)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "24px 24px 26px", boxShadow: "var(--shadow)" }}>
      <span style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", color: "var(--accent)" }}>{String(rank).padStart(2, "0")}</span>
      <h2 style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "1.85rem", letterSpacing: "-0.02em", color: "var(--ink)", margin: "8px 0 0", lineHeight: 1.04 }}>{place.name}</h2>
      <Loc place={place} />
      <Note>{place.note}</Note>
      <OrderBlock place={place} />
      {footer}
    </article>
  );
}
