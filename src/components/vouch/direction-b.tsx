"use client";
import { WebShell } from "./web-shell";
import { ConceptSwitch } from "./concept-switch";
import { Avatar } from "./avatar";
import { archetypeFor, findSpot, DEMO_SESSION } from "./_taste";
import styles from "./direction-b.module.css";

/* v1 roundtable — DIRECTION B: "The Ledger". Signed testimony as the editorial
   hero — a place, a face, one quoted line — typeset like a private club's
   reservation book. The map is demoted; named taste is the room you walk into.
   Honesty: every line carries a name + occasion; no scores, no feed chrome.
   Prototype: overview. */

type Entry = { place: string; line: string; by: string; ini: string; occ: string; you?: boolean };

const ENTRIES: Entry[] = [
  { place: "Karavalli", line: "Take your parents. They’ll talk about it for months.", by: "Aditi", ini: "AS", occ: "parents" },
  { place: "Soka", line: "Negroni first, then stay for the plates.", by: "Meera", ini: "MK", occ: "date" },
  { place: "Empire", line: "Chicken ghee roast at 1am. Undefeated.", by: "You", ini: "RG", occ: "late night", you: true },
  { place: "CTR · Shri Sagar", line: "Benne dosa. Don’t even debate it.", by: "Meera", ini: "MK", occ: "coffee" },
  { place: "Toit", line: "Tintin Toit + the patio. Get there early.", by: "You", ini: "RG", occ: "group dinner", you: true },
];

export function TheLedger() {
  const arch = archetypeFor(DEMO_SESSION.mine);

  return (
    <WebShell active="map" you={{ ini: "RG", name: "You", line: `${arch.glyph} ${arch.name}` }}>
      <ConceptSwitch current="The Ledger" />
      <div className={styles.stage}>
        <div className={styles.book}>
          <p className={styles.dateline}>Saturday · three people you trust added spots this week</p>

          <button type="button" className={styles.seat}>
            <span className={styles.seatPlus} aria-hidden="true">＋</span>
            <span className={styles.seatText}>Put a name down — your next line</span>
          </button>

          <ol className={styles.entries}>
            {ENTRIES.map((e, i) => {
              const spot = findSpot(e.place);
              return (
                <li key={e.place} className={styles.entry}>
                  <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                  <div className={styles.body}>
                    <h2 className={styles.place}>{e.place}</h2>
                    <p className={styles.line}>“{e.line}”</p>
                    <div className={styles.sign}>
                      <Avatar initials={e.ini} size={22} />
                      <span className={styles.signText}>
                        <b>{e.you ? "You" : e.by}</b> {e.you ? "put your name on it" : "vouched"} · for {e.occ}{spot ? ` · ${spot.area}` : ""}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </WebShell>
  );
}
