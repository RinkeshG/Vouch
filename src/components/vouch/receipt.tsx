import { Avatar, FaceStack } from "./avatar";
import styles from "./receipt.module.css";

/* THE RECEIPT — why a place reached you. The one component that keeps Vouch from
   going generic (Constitution §3). Present on every surfaced place. Derived from
   the trust graph; never anonymous. Two densities: full (the box) and inline. */

export type TrailLine =
  | { kind: "vouched"; who: string; ini: string; note?: string; time?: string }
  | { kind: "saved"; faces: string[]; extra?: number; names: string; time?: string }
  | { kind: "guide"; who: string; ini: string; guide: string };

export function Receipt({
  lines,
  label = "Why you’re seeing this",
}: {
  lines: TrailLine[];
  label?: string;
}) {
  return (
    <div className={styles.receipt}>
      <span className={styles.label}>{label}</span>
      {lines.map((l, i) => (
        <div className={styles.row} key={i}>
          {l.kind === "saved" ? (
            <FaceStack faces={l.faces} extra={l.extra} size={26} />
          ) : (
            <Avatar initials={l.ini} size={30} />
          )}
          <span className={styles.text}>
            {l.kind === "vouched" && (
              <>
                <b>{l.who}</b> vouched it
                {l.note && <span className={styles.note}>“{l.note}”</span>}
              </>
            )}
            {l.kind === "saved" && (
              <><b>{l.names}</b> you follow saved it</>
            )}
            {l.kind === "guide" && (
              <><b>{l.who}</b> added it to <span className={styles.guide}>{l.guide}</span></>
            )}
          </span>
          {"time" in l && l.time && <span className={styles.time}>{l.time}</span>}
        </div>
      ))}
    </div>
  );
}

/* Inline one-liner for tight surfaces (home cards, share). "Reached you through X." */
export function ReceiptInline({ faces, children }: { faces: string[]; children: React.ReactNode }) {
  return (
    <span className={styles.inline}>
      <FaceStack faces={faces} size={20} />
      <span>{children}</span>
    </span>
  );
}
