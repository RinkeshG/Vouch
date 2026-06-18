"use client";
import { useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { saveGuide, slugExists, type Cat, type Guide, type Place } from "./data";
import { searchCatalog } from "./catalog";
import { CatIcon, Curator, Eyebrow, PlaceCard } from "./kit";

/* PHASE 3 — the builder (reusable for /new and /edit).
   JTBD: "give my recommendation once, beautifully, near-zero effort, proud to
   send." No blank form — a live preview that gets prettier with each place;
   adding autofills the data; the creator only supplies the pick and the VOICE. */

const CATS: Cat[] = ["coffee", "food", "drink", "view", "shop", "stay"];
const input: CSSProperties = { width: "100%", background: "var(--s1)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", padding: "11px 13px", fontFamily: "var(--sans)", fontSize: "0.95rem", color: "var(--ink)", outline: "none" };
const labelCss: CSSProperties = { fontFamily: "var(--mono)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", display: "block", marginBottom: 7 };

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "my-guide";
}
function uniqueSlug(title: string, current?: string) {
  const base = slugify(title);
  if (base === current || !slugExists(base)) return base;
  let i = 2; while (slugExists(`${base}-${i}`)) i++; return `${base}-${i}`;
}

/* Downscale before storing — keeps the data URL small enough for localStorage
   and loads instantly. Production swaps this for a real upload. */
async function resizePhoto(file: File, max = 1000, q = 0.82): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  c.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  return c.toDataURL("image/jpeg", q);
}
const photoBtn: CSSProperties = { fontFamily: "var(--mono)", fontSize: "0.62rem", border: "1px solid var(--line2)", borderRadius: "var(--r-sm)", padding: "7px 11px", background: "none", color: "var(--read)" };

export function Builder({ initial }: { initial?: Guide }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [intro, setIntro] = useState(initial?.intro ?? "");
  const [sortLabel] = useState(initial?.sortLabel ?? "the order i'd actually do them in");
  const [bio, setBio] = useState(initial?.curator.bio ?? "");
  const [name] = useState(initial?.curator.name ?? "You");
  const [ini] = useState(initial?.curator.ini ?? "YO");
  const [places, setPlaces] = useState<Place[]>(initial?.places ?? []);
  const [q, setQ] = useState("");
  const [drag, setDrag] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const editingSlug = initial?.slug;
  const reorder = (from: number, to: number) => setPlaces((ps) => { if (from === to) return ps; const n = [...ps]; const [x] = n.splice(from, 1); n.splice(to, 0, x); return n; });

  const taken = places.map((p) => p.name);
  const sugg = useMemo(() => searchCatalog(q, taken), [q, taken]);

  const addPlace = (n: string, area: string, lat: number, lng: number, cat: Cat) => {
    setPlaces((ps) => [...ps, { id: `${Date.now()}-${ps.length}`, name: n, area, lat, lng, cat, note: "", order: "", when: "" }]);
    setQ("");
  };
  const patch = (id: string, k: keyof Place, v: string) => setPlaces((ps) => ps.map((p) => p.id === id ? { ...p, [k]: v } : p));
  const remove = (id: string) => setPlaces((ps) => ps.filter((p) => p.id !== id));
  const move = (id: string, d: -1 | 1) => setPlaces((ps) => { const i = ps.findIndex((p) => p.id === id); const j = i + d; if (j < 0 || j >= ps.length) return ps; const n = [...ps]; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const onPhoto = async (id: string, file?: File) => { if (!file) return; try { patch(id, "img", await resizePhoto(file)); } catch { /* ignore unreadable image */ } };

  const hasTitle = title.trim().length > 0;
  const ready = hasTitle && places.length > 0 && places.every((p) => p.note.trim().length > 0);

  function commit(published: boolean) {
    const slug = editingSlug ?? uniqueSlug(title);
    const guide: Guide = { slug, title: title.trim().replace(/\.$/, ""), intro: intro.trim() || "a few places i love.", sortLabel: sortLabel.trim() || "my picks", curator: { name, ini, bio: bio.trim() || "Bengaluru" }, places, published };
    try { saveGuide(guide); } catch { setErr("couldn't save — your photos may be too large. remove one and try again."); return; }
    router.push(published ? `/v2/g/${slug}?just=1` : "/v2");
  }

  return (
    <main style={{ minHeight: "100dvh" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(13,13,12,.86)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--line)", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/v2" style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "1.05rem", color: "var(--ink)", textDecoration: "none" }}>vouch<span style={{ color: "var(--accent)" }}>.</span></a>
          <span style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--mut)", border: "1px solid var(--line2)", borderRadius: "var(--r-xs)", padding: "3px 8px" }}>{editingSlug ? "editing" : "draft"}</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="v2-hide-sm" style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", color: "var(--mut)", marginRight: 4 }}>{places.length} {places.length === 1 ? "place" : "places"}</span>
          <button type="button" onClick={() => commit(false)} disabled={!hasTitle} style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", padding: "9px 14px", cursor: hasTitle ? "pointer" : "not-allowed", background: "none", color: hasTitle ? "var(--read)" : "var(--faint)" }}>save draft</button>
          <button type="button" onClick={() => commit(true)} disabled={!ready} title={ready ? "" : "add a title, a place, and a line on each"} style={{ fontFamily: "var(--mono)", fontSize: "0.75rem", fontWeight: 500, borderRadius: "var(--r-md)", padding: "10px 18px", cursor: ready ? "pointer" : "not-allowed", background: ready ? "var(--accent)" : "var(--s1)", color: ready ? "var(--accent-ink)" : "var(--faint)", border: ready ? "none" : "1px solid var(--line2)" }}>publish →</button>
        </span>
      </header>

      <div className="v2-split" style={{ maxWidth: 1180, margin: "0 auto" }}>
        <section className="v2-editor" style={{ padding: "34px 30px 80px", borderRight: "1px solid var(--line)" }}>
          <Eyebrow>// {editingSlug ? "editing your guide" : "you're making a guide"}</Eyebrow>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="name it — where i take people in…" style={{ ...input, fontWeight: 600, fontSize: "1.7rem", letterSpacing: "-0.02em", background: "transparent", border: "none", padding: "10px 0 0", borderBottom: "1px solid var(--line)", borderRadius: 0 }} />
          <textarea value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="one line in your voice — who's this for, what's the vibe?" rows={2} style={{ ...input, marginTop: 16, resize: "vertical", lineHeight: 1.5 }} />
          <input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="and you are… (e.g. indiranagar, 6 years)" style={{ ...input, marginTop: 12 }} />

          <div style={{ marginTop: 28 }}>
            <label style={labelCss}>add a place</label>
            <div style={{ position: "relative" }}>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="search a place by name…" style={input} />
              {q.trim() && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 10, background: "var(--s2)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", overflow: "hidden", boxShadow: "var(--shadow)" }}>
                  {sugg.map((e) => (
                    <button key={e.name} type="button" onClick={() => addPlace(e.name, e.area, e.lat, e.lng, e.cat)} className="v2-sugg" style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", background: "none", border: "none", borderBottom: "1px solid var(--line)", cursor: "pointer" }}>
                      <span style={{ color: "var(--accent)", display: "grid", placeItems: "center", width: 22 }}><CatIcon cat={e.cat} size={18} /></span>
                      <span style={{ fontFamily: "var(--sans)", fontSize: "0.92rem", color: "var(--ink)" }}>{e.name}</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", color: "var(--mut)", marginLeft: "auto" }}>{e.area}</span>
                    </button>
                  ))}
                  {sugg.length === 0 && <p style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", color: "var(--faint)", padding: "12px 13px", margin: 0 }}>no match — try Airlines, Toit, Koshy&apos;s, Byg…</p>}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            {places.map((p, i) => (
              <div key={p.id} onDragOver={(e) => e.preventDefault()} onDragEnter={() => { if (drag !== null && drag !== i) { reorder(drag, i); setDrag(i); } }} className={drag === i ? "v2-dragging" : undefined} style={{ background: "var(--s2)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "15px 16px 17px", transition: "opacity .2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span draggable onDragStart={() => setDrag(i)} onDragEnd={() => setDrag(null)} className="v2-grab" title="drag to reorder" style={{ width: 24, height: 26, flex: "none", display: "grid", placeItems: "center", color: "var(--faint)", fontSize: "0.9rem", borderRadius: "var(--r-sm)", border: "1px solid var(--line2)", userSelect: "none" }}>⠿</span>
                  <span style={{ color: "var(--accent)" }}><CatIcon cat={p.cat} size={20} /></span>
                  <span style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "1.05rem", color: "var(--ink)" }}>{p.name}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", color: "var(--mut)" }}>{p.area}</span>
                  <span style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                    <button type="button" onClick={() => move(p.id, -1)} disabled={i === 0} style={iconBtn(i === 0)}>↑</button>
                    <button type="button" onClick={() => move(p.id, 1)} disabled={i === places.length - 1} style={iconBtn(i === places.length - 1)}>↓</button>
                    <button type="button" onClick={() => remove(p.id)} style={iconBtn(false)}>×</button>
                  </span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <label style={labelCss}>why do you love it?</label>
                  <textarea value={p.note} onChange={(e) => patch(p.id, "note", e.target.value)} placeholder="say it like you'd text a friend…" rows={2} style={{ ...input, lineHeight: 1.5 }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                  <div><label style={labelCss}>what should they get?</label><input value={p.order} onChange={(e) => patch(p.id, "order", e.target.value)} placeholder="the one order" style={input} /></div>
                  <div><label style={labelCss}>best time?</label><input value={p.when} onChange={(e) => patch(p.id, "when", e.target.value)} placeholder="when to go" style={input} /></div>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                  {CATS.map((c) => (
                    <button key={c} type="button" onClick={() => patch(p.id, "cat", c)} className="v2-btn" style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.04em", textTransform: "uppercase", padding: "5px 10px", borderRadius: "var(--r-pill)", cursor: "pointer", border: `1px solid ${p.cat === c ? "var(--accent-line)" : "var(--line2)"}`, background: p.cat === c ? "var(--accent-dim)" : "transparent", color: p.cat === c ? "var(--accent)" : "var(--mut)" }}>{c}</button>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                  {p.img ? (
                    <>
                      <img src={p.img} alt="" style={{ width: 42, height: 42, borderRadius: "var(--r-sm)", objectFit: "cover", border: "1px solid var(--line2)" }} />
                      <button type="button" onClick={() => patch(p.id, "img", "")} className="v2-btn" style={photoBtn}>remove photo</button>
                    </>
                  ) : (
                    <label className="v2-btn" style={{ ...photoBtn, cursor: "pointer" }}>
                      + add a photo
                      <input type="file" accept="image/*" hidden onChange={(e) => onPhoto(p.id, e.target.files?.[0])} />
                    </label>
                  )}
                  <span style={{ fontFamily: "var(--mono)", fontSize: "0.56rem", color: "var(--faint)" }}>optional · your own shot</span>
                </div>
              </div>
            ))}
            {places.length === 0 && <p style={{ fontFamily: "var(--mono)", fontSize: "0.78rem", color: "var(--faint)", textAlign: "center", padding: "20px", border: "1px dashed var(--line2)", borderRadius: "var(--r-lg)" }}>search a place above — it&apos;ll appear here, and on your page →</p>}
          </div>
        </section>

        <section className="v2-preview" style={{ padding: "34px 30px 80px", position: "sticky", top: 60, alignSelf: "start", height: "calc(100dvh - 60px)", overflowY: "auto" }}>
          <p style={{ ...labelCss, color: "var(--faint)" }}>// live — what they&apos;ll see</p>
          <div style={{ marginTop: 14 }}>
            <Eyebrow>// a guide by {name.toLowerCase()}</Eyebrow>
            <h1 style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "1.9rem", lineHeight: 1.04, letterSpacing: "-0.025em", color: title ? "var(--ink)" : "var(--faint)", margin: "10px 0 0" }}>{title || "your guide title"}.</h1>
            <p style={{ fontFamily: "var(--sans)", fontSize: "1.02rem", color: intro ? "var(--read)" : "var(--faint)", margin: "12px 0 0", lineHeight: 1.5 }}>{intro || "your one line goes here."}</p>
            <div style={{ marginTop: 18 }}><Curator name={name} ini={ini} bio={bio || "Bengaluru"} size={34} /></div>
          </div>
          <div style={{ marginTop: 24, display: "grid", gap: 18 }}>
            {places.map((p, i) => <PlaceCard key={p.id} place={{ ...p, note: p.note || "…your line about this place" }} rank={i + 1} />)}
            {places.length === 0 && <div style={{ height: 220, border: "1px dashed var(--line2)", borderRadius: "var(--r-xl)", display: "grid", placeItems: "center", fontFamily: "var(--mono)", fontSize: "0.78rem", color: "var(--faint)" }}>your places will line up here</div>}
          </div>
        </section>
      </div>
      {err && (
        <div className="v2-sheet" style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", zIndex: 40, background: "var(--s2)", border: "1px solid var(--accent-line)", borderRadius: "var(--r-md)", padding: "11px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow)" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", color: "var(--read)" }}>{err}</span>
          <button type="button" onClick={() => setErr(null)} className="v2-btn" style={{ background: "none", border: "none", color: "var(--faint)", cursor: "pointer", fontSize: "1rem" }}>×</button>
        </div>
      )}
    </main>
  );
}

function iconBtn(disabled: boolean): CSSProperties {
  return { width: 28, height: 28, borderRadius: "var(--r-sm)", border: "1px solid var(--line2)", background: "none", color: disabled ? "var(--faint)" : "var(--mut)", cursor: disabled ? "not-allowed" : "pointer", fontSize: "0.9rem", lineHeight: 1 };
}
