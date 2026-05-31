"use client";
import { useEffect, useMemo, useState } from "react";
import { WebShell } from "./web-shell";
import { HomeSwitch } from "./home-switch";
import { Button } from "./button";
import { OccasionChip, Tag } from "./chip";
import { SearchField } from "./input";
import { Modal } from "./modal";
import { Avatar } from "./avatar";
import { Toast } from "./misc";
import { MapReal, type MapPin } from "./map-real";
import {
  SEED, OCCASIONS, FOUNDING, archetypeFor, occasionsOf,
  loadSession, DEMO_SESSION, type Spot, type Vouch, type Session,
} from "./_taste";
import styles from "./home-map.module.css";

/* Home / Your Map — the WEB experience (desktop-first; mobile is its own pass).
   Home IS your map (the feed is a map — lexicon). Designed in the desktop idiom:
   a persistent rail (WebShell) + a two-pane canvas — a scannable LEDGER of your
   taste beside a large, immersive map. They're linked the way only a wide screen
   allows: the occasion lens filters both at once, and clicking a row flies the map
   to that pin and opens who/why. One job: see your taste at a glance, decide, add.
   The screen grows up with you (new → sparse → rich); this is the sparse state the
   onboarding lands on. */

type Entry = { pin: MapPin; occasions: string[]; mine: boolean };

export function HomeMap() {
  const [session, setSession] = useState<Session>(DEMO_SESSION);
  const [lens, setLens] = useState<string>("all");
  const [focusId, setFocusId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Carry forward what you built in onboarding (prototype: sessionStorage).
  useEffect(() => {
    const s = loadSession();
    if (s && s.mine.length) setSession(s);
  }, []);

  const { mine, followed } = session;
  const mineNames = useMemo(() => new Set(mine.map((v) => v.spot.name)), [mine]);

  const entries: Entry[] = useMemo(() => {
    const me: Entry[] = mine.map((v) => ({
      mine: true,
      occasions: Array.from(new Set([...(v.spot.occasions ?? []), ...v.occ])),
      pin: { id: `me:${v.spot.name}`, lat: v.spot.lat, lng: v.spot.lng, name: v.spot.name, line: v.line, occasion: v.occ[0], kind: "mine", by: { name: "You", ini: "RG" } },
    }));
    const theirs: Entry[] = FOUNDING.filter((f) => followed.includes(f.name)).flatMap((f) =>
      f.spots.filter((sp) => !mineNames.has(sp.name)).map((sp) => ({
        mine: false,
        occasions: occasionsOf(sp.name),
        pin: { id: `${f.name}:${sp.name}`, lat: sp.lat, lng: sp.lng, name: sp.name, line: sp.line, kind: "palate", by: { name: f.name, ini: f.ini } },
      })),
    );
    return [...me, ...theirs];
  }, [mine, followed, mineNames]);

  const lensOptions = useMemo(() => {
    const present = new Set(entries.flatMap((e) => e.occasions));
    return OCCASIONS.filter((o) => present.has(o));
  }, [entries]);

  const filtered = lens === "all" ? entries : entries.filter((e) => e.occasions.includes(lens));
  const pins = filtered.map((e) => e.pin);
  const mineRows = filtered.filter((e) => e.mine);
  const theirRows = filtered.filter((e) => !e.mine);

  const archetype = archetypeFor(mine);
  const areas = new Set(mine.map((v) => v.spot.area)).size;

  // The lead — a confident single answer for the chosen moment (yours first).
  const lead = useMemo(() => {
    if (lens === "all") return null;
    const pick = filtered.find((e) => e.mine) ?? filtered[0];
    if (!pick) return null;
    return { id: pick.pin.id, name: pick.pin.name, line: pick.pin.line ?? "", who: pick.mine ? "you vouched" : `${pick.pin.by?.name} vouched` };
  }, [lens, filtered]);

  function commit(v: Vouch) {
    setSession((s) => ({ ...s, mine: [...s.mine, v] }));
    setLens("all");
    setAdding(false);
    setFocusId(`me:${v.spot.name}`);
    setToast(`Your name’s on it. ${v.spot.name} is on your map.`);
  }
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3400);
    return () => window.clearTimeout(t);
  }, [toast]);

  function Row({ e }: { e: Entry }) {
    const on = focusId === e.pin.id;
    return (
      <button type="button" className={`${styles.row} ${on ? styles.rowOn : ""}`} onClick={() => setFocusId(e.pin.id)}>
        <span className={styles.rowDot} data-mine={e.mine} aria-hidden="true">{e.mine ? "" : e.pin.by?.ini}</span>
        <span className={styles.rowBody}>
          <span className={styles.rowPlace}>{e.pin.name}</span>
          <span className={styles.rowLine}>“{e.pin.line}”</span>
          <span className={styles.rowMeta}>
            <span className={styles.rowBy}>{e.mine ? "Your vouch" : `${e.pin.by?.name} vouched`}</span>
            {e.occasions[0] && <span className={styles.rowOcc}>{e.occasions[0]}</span>}
          </span>
        </span>
      </button>
    );
  }

  return (
    <WebShell active="map" onNewVouch={() => setAdding(true)} you={{ ini: "RG", name: "You", line: `${archetype.glyph} ${archetype.name}` }}>
      <HomeSwitch current="Map" />
      <div className={styles.page}>
        <header className={styles.pageHead}>
          <div className={styles.headTop}>
            <div>
              <p className={styles.eyebrow}>Your map · Bengaluru</p>
              <h1 className={styles.h1}>{mine.length ? "Everything you’d put your name on." : "Put your first name down."}</h1>
            </div>
            <p className={styles.taste}>
              <span className={styles.glyph} aria-hidden="true">{archetype.glyph}</span>
              <span className={styles.tasteName}>{archetype.name}</span>
              <span className={styles.tasteMeta}>{mine.length} {mine.length === 1 ? "spot" : "spots"} · {areas} {areas === 1 ? "area" : "areas"} · {followed.length} {followed.length === 1 ? "palate" : "palates"} followed</span>
            </p>
          </div>
          <div className={styles.lens} role="group" aria-label="What’s the occasion?">
            <button type="button" className={lens === "all" ? styles.lensOn : styles.lensChip} onClick={() => { setLens("all"); setFocusId(null); }}>All</button>
            {lensOptions.map((o) => (
              <button key={o} type="button" className={lens === o ? styles.lensOn : styles.lensChip} onClick={() => { setLens(o); setFocusId(null); }}>{o}</button>
            ))}
          </div>
        </header>

        <div className={styles.split}>
          <section className={styles.ledger}>
            {lead && (
              <button type="button" className={styles.lead} onClick={() => setFocusId(lead.id)}>
                <span className={styles.leadFor}>For {lens}, go here</span>
                <span className={styles.leadPick}>{lead.name}</span>
                <span className={styles.leadWho}>{lead.who} — “{lead.line}”</span>
              </button>
            )}

            <div className={styles.group}>
              <span className={styles.label}>Your spots{mineRows.length ? ` · ${mineRows.length}` : ""}</span>
              {mineRows.length ? mineRows.map((e) => <Row key={e.pin.id} e={e} />) : <p className={styles.emptyRow}>Nothing here for this moment yet — vouch one.</p>}
            </div>

            {theirRows.length > 0 && (
              <div className={styles.group}>
                <span className={styles.label}>From people you follow · {theirRows.length}</span>
                {theirRows.map((e) => <Row key={e.pin.id} e={e} />)}
              </div>
            )}

            <div className={styles.guidePrompt}>
              <span className={styles.guideKicker}>Taste, set in type</span>
              <span className={styles.guideTitle}>Group your {mine.length} {mine.length === 1 ? "spot" : "spots"} into a guide.</span>
              <span className={styles.guideSub}>Name it like you’d text it — “where I take my parents” — then share it in one tap.</span>
              <span className={styles.guideSoon}>Building this next →</span>
            </div>
          </section>

          <div className={styles.canvas}>
            <MapReal pins={pins} height="100%" labelMode="hover" focusId={focusId} bleed />
          </div>
        </div>
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} label="Add a vouch">
        <AddSheet taken={mineNames} onCommit={commit} />
      </Modal>

      {toast && <div className={styles.toastWrap}><Toast tone="success">{toast}</Toast></div>}
    </WebShell>
  );
}

/* The add ritual, in a centered dialog: pick a place → one line (≤120, wraps) →
   the occasions. The vouch lands as a pin + a toast (the payoff; never a silent
   submit). Mirrors the onboarding add pane. */
function AddSheet({ taken, onCommit }: { taken: Set<string>; onCommit: (v: Vouch) => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Spot | null>(null);
  const [line, setLine] = useState("");
  const [occ, setOcc] = useState<string[]>([]);

  const remaining = SEED.filter((s) => !taken.has(s.name));
  const results = q ? remaining.filter((s) => (s.name + s.area + s.cuisine).toLowerCase().includes(q.toLowerCase())) : remaining;
  const toggle = (o: string) => setOcc((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));

  if (!sel) {
    return (
      <div className={styles.sheet}>
        <p className={styles.sheetTitle}>A place you’d send a friend to.</p>
        <SearchField placeholder="Search a place you love…" value={q} onChange={(e) => setQ(e.target.value)} />
        <ul className={styles.sheetResults}>
          {results.slice(0, 6).map((s) => (
            <li key={s.name}>
              <button type="button" className={styles.sheetResult} onClick={() => setSel(s)}>
                <span className={styles.sheetResultName}>{s.name}</span>
                <span className={styles.sheetResultMeta}>{s.cuisine} · {s.area} · {s.price}</span>
              </button>
            </li>
          ))}
          {results.length === 0 && <li className={styles.sheetNone}>Everything on the demo set is already on your map.</li>}
        </ul>
      </div>
    );
  }

  return (
    <div className={styles.sheet}>
      <div className={styles.sheetHead}>
        <span className={styles.sheetPlace}>{sel.name}</span>
        <button type="button" className={styles.change} onClick={() => setSel(null)}>↺ Change place</button>
      </div>
      <span className={styles.sheetTags}><Tag>{sel.cuisine} · {sel.area} · {sel.price}</Tag></span>
      <label className={styles.fieldLabel}>One line — why you’d send them</label>
      <div className={styles.lineWrap}>
        <textarea
          className={styles.lineInput}
          value={line}
          maxLength={120}
          rows={2}
          placeholder="Best bowl in the city. Go at 6 sharp."
          autoFocus
          onChange={(e) => setLine(e.target.value.replace(/\n/g, " "))}
          onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = `${t.scrollHeight}px`; }}
        />
        <span className={styles.lineCount}>{line.length}/120</span>
      </div>
      <label className={styles.fieldLabel}>Best for</label>
      <div className={styles.occ}>{OCCASIONS.map((o) => <OccasionChip key={o} selected={occ.includes(o)} onToggle={() => toggle(o)}>{o}</OccasionChip>)}</div>
      <Button variant="primary" full disabled={!line.trim() || occ.length === 0} onClick={() => onCommit({ spot: sel, line: line.trim(), occ })}>Put it on my map ↵</Button>
    </div>
  );
}
