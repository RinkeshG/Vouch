"use client";
import { useState } from "react";
import { MapReal, type MapPin } from "../../../components/vouch/map-real";
import { Avatar } from "../../../components/vouch/avatar";

/* Vouch guide, rebuilt to the coffee-page's real DNA: voiced prose notes, a
   calm designed placeholder (grid + icon + warm light, not a photo, not a hole),
   an order/when block of specifics, ruthless restraint. Two views — a wall of
   cards, and map + ONE detail card. Guard-free scratch route. */

type Cat = "coffee" | "food" | "beer" | "sun";
type Place = {
  id: string; lat: number; lng: number; name: string; area: string; cat: Cat;
  note: string; order: string; when: string; by: string; ini: string;
};

const PLACES: Place[] = [
  { id: "1", lat: 12.9698, lng: 77.5985, name: "Airlines Hotel", area: "Lavelle Rd", cat: "coffee", note: "where i take everyone who's new to the city. filter coffee under the rain trees, before it wakes up and gets loud.", order: "filter coffee, by the half", when: "7–9am", by: "Priya", ini: "PR" },
  { id: "2", lat: 12.9692, lng: 77.5975, name: "Third Wave", area: "Lavelle Rd", cat: "coffee", note: "for when i actually want to taste the coffee, not talk. black, single-origin, no laptop, no lingering.", order: "the single-origin pour-over", when: "mid-morning", by: "Priya", ini: "PR" },
  { id: "3", lat: 12.9738, lng: 77.6010, name: "Koshy's", area: "St. Marks Rd", cat: "food", note: "my unhurried lunch. nothing here has changed in seventy years and the waiters would like to keep it that way.", order: "mutton cutlet + a cold coffee", when: "a long afternoon", by: "Priya", ini: "PR" },
  { id: "4", lat: 12.9783, lng: 77.6408, name: "Toit", area: "Indiranagar", cat: "beer", note: "the one place i'll sit in traffic for. weekdays only though — go on a saturday and you'll never forgive me.", order: "toit weiss + a wood-fired pizza", when: "a weekday evening", by: "Ankit", ini: "AK" },
  { id: "5", lat: 13.0358, lng: 77.6403, name: "Byg Brewski", area: "Hennur", cat: "sun", note: "go for the sunset off the deck, not the beer. get there before six or you'll be parking in the next pincode.", order: "anything, on the deck", when: "golden hour", by: "Meera", ini: "ME" },
  { id: "6", lat: 12.9419, lng: 77.5731, name: "VV Puram", area: "food street", cat: "food", note: "end the day here. eat with your hands, share everything, and finish on the holige. don't plan it, just walk.", order: "graze the whole street", when: "late evening", by: "Priya", ini: "PR" },
];

const PINS: MapPin[] = PLACES.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, name: p.name, line: p.note, occasion: p.when, kind: "palate", by: { name: p.by, ini: p.ini } }));

function Icon({ cat }: { cat: Cat }) {
  const common = { width: 38, height: 38, viewBox: "0 0 24 24", fill: "none", stroke: "var(--saffron)", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (cat === "beer") return <svg {...common}><path d="M7 8h8v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8z" /><path d="M15 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" /><path d="M7 8a2.5 2.5 0 0 1 2.5-3 2.5 2.5 0 0 1 5 0A2.5 2.5 0 0 1 15 8" /></svg>;
  if (cat === "food") return <svg {...common}><path d="M4 11h16a8 8 0 0 1-16 0z" /><path d="M9 6c0-1 1-1 1-2M12 6c0-1 1-1 1-2M15 6c0-1 1-1 1-2" /></svg>;
  if (cat === "sun") return <svg {...common}><circle cx="12" cy="12" r="3.5" /><path d="M12 4v2M12 18v2M4 12h2M18 12h2M6 6l1.5 1.5M16.5 16.5L18 18M18 6l-1.5 1.5M7.5 16.5L6 18" /></svg>;
  return <svg {...common}><path d="M5 9h11v4a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9z" /><path d="M16 10h2a2 2 0 0 1 0 4h-2" /><path d="M8 3c0 1-1 1-1 2M11 3c0 1-1 1-1 2" /></svg>;
}

const mediaStyle: React.CSSProperties = {
  position: "relative", height: 132, display: "grid", placeItems: "center",
  background: "radial-gradient(130px 90px at 72% 26%, rgba(246,168,43,.16), transparent 72%), repeating-linear-gradient(0deg, rgba(244,238,227,.045) 0 1px, transparent 1px 22px), repeating-linear-gradient(90deg, rgba(244,238,227,.045) 0 1px, transparent 1px 22px), linear-gradient(160deg, #241a10, #14110b)",
  borderBottom: "1px solid var(--line)",
};

function Note({ text }: { text: string }) {
  return <p style={{ fontFamily: "var(--sans)", fontSize: "1.02rem", lineHeight: 1.55, color: "var(--text)", opacity: 0.9, margin: "16px 0 0" }}>{text}</p>;
}
function OrderBlock({ p }: { p: Place }) {
  const row = (k: string, v: string) => (
    <div style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: 14, marginTop: 8 }}>
      <span style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--faint)", paddingTop: 2 }}>{k}</span>
      <span style={{ fontFamily: "var(--sans)", fontSize: "0.92rem", color: "var(--text)", lineHeight: 1.4 }}>{v}</span>
    </div>
  );
  return <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)" }}>{row("order", p.order)}{row("go", p.when)}</div>;
}
function Loc({ p }: { p: Place }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 7, fontFamily: "var(--mono)", fontSize: "0.68rem", color: "var(--muted)" }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z" /><circle cx="12" cy="10" r="2.4" /></svg>
      {p.area} <span style={{ color: "var(--faint)" }}>↗</span>
      {p.by !== "Priya" && <span style={{ color: "var(--faint)", marginLeft: 6 }}>· also {p.by}</span>}
    </span>
  );
}

export default function GuidePage() {
  const [view, setView] = useState<"cards" | "map">("cards");
  const [sel, setSel] = useState<string>("1");
  const selected = PLACES.find((p) => p.id === sel)!;

  const seg = (k: "cards" | "map", label: string) => (
    <button type="button" onClick={() => setView(k)} style={{ flex: 1, padding: "9px 22px", borderRadius: "var(--r-sm)", border: "none", cursor: "pointer", fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.06em", textTransform: "uppercase", background: view === k ? "var(--saffron)" : "transparent", color: view === k ? "var(--accent-ink)" : "var(--muted)" }}>{label}</button>
  );

  return (
    <main style={{ background: "var(--bg)", minHeight: "100dvh" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "52px 28px 18px" }}>
        <p style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--faint)", margin: 0 }}>// a guide by priya</p>
        <h1 style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: "clamp(2rem,4vw,2.9rem)", lineHeight: 1.0, letterSpacing: "-0.035em", color: "var(--text)", margin: "12px 0 0" }}>where i actually take people in bengaluru.</h1>
        <p style={{ fontFamily: "var(--sans)", fontSize: "1.1rem", color: "var(--muted)", margin: "14px 0 0" }}>six places, the way i'd hand them to a friend.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", justifyContent: "space-between", marginTop: 26 }}>
          <div style={{ display: "inline-flex", background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", padding: 3 }}>{seg("cards", "Cards")}{seg("map", "Map")}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials="PR" size={26} />
            <span style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", color: "var(--muted)" }}><b style={{ color: "var(--saffron)", fontWeight: 400 }}>6</b> places · the order i'd actually do them in</span>
          </div>
        </div>
      </div>

      {view === "cards" ? (
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "10px 28px 80px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
            {PLACES.map((p, i) => (
              <article key={p.id} style={{ background: "linear-gradient(165deg, var(--surface), #100e0a)", border: "1px solid var(--line)", borderRadius: "var(--r-xl)", overflow: "hidden", boxShadow: "0 24px 54px -38px rgba(0,0,0,.9)" }}>
                <div style={mediaStyle}>
                  <span style={{ position: "absolute", top: 12, left: 12, fontFamily: "var(--mono)", fontSize: "0.66rem", color: "var(--saffron)", border: "1px solid var(--saffron-line)", borderRadius: "var(--r-xs)", padding: "2px 7px" }}>{String(i + 1).padStart(2, "0")}</span>
                  <Icon cat={p.cat} />
                </div>
                <div style={{ padding: "16px 18px 20px" }}>
                  <h3 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: "1.42rem", letterSpacing: "-0.02em", color: "var(--text)", margin: 0, lineHeight: 1.05 }}>{p.name}</h3>
                  <Loc p={p} />
                  <Note text={p.note} />
                  <OrderBlock p={p} />
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "10px 28px 60px", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 22, alignItems: "start" }}>
          <div style={{ height: "70dvh", borderRadius: "var(--r-xl)", overflow: "hidden", border: "1px solid var(--line-2)" }}>
            <MapReal pins={PINS} height="100%" labelMode="hover" focusId={sel} onSelect={setSel} tag="priya's bengaluru" />
          </div>
          <article style={{ background: "linear-gradient(165deg, var(--surface), #100e0a)", border: "1px solid var(--line-2)", borderRadius: "var(--r-xl)", padding: "24px 24px 26px", boxShadow: "0 24px 54px -38px rgba(0,0,0,.9)" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", color: "var(--saffron)" }}>{String(PLACES.findIndex((p) => p.id === sel) + 1).padStart(2, "0")}</span>
            <h2 style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: "1.9rem", letterSpacing: "-0.03em", color: "var(--text)", margin: "8px 0 0", lineHeight: 1.02 }}>{selected.name}</h2>
            <Loc p={selected} />
            <Note text={selected.note} />
            <OrderBlock p={selected} />
            <p style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", color: "var(--faint)", marginTop: 18 }}>tap any pin →</p>
          </article>
        </div>
      )}
    </main>
  );
}
