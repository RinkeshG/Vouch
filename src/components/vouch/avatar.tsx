import styles from "./avatar.module.css";

/* Monogram avatar — a person. Rounded-square seal, mono initials. People + type is
   the whole imagery system (foundations.md §8b): no photos.
   The tone derives from the initials so different people read as different people —
   a trust product can't give every name the same face. The hash lands "RG" (you) on
   saffron: your mark wears the brand; other palates get the warm family. */
function tone(initials: string): number {
  return ((initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0) * 3) % 5;
}
export function Avatar({ initials, size = 30 }: { initials: string; size?: number }) {
  return (
    <span className={`${styles.avatar} ${styles[`t${tone(initials)}`]}`} style={{ width: size, height: size, fontSize: size * 0.42 }} aria-hidden="true">
      {initials}
    </span>
  );
}

/* Overlapping face stack — "3 you follow saved it". Reads as people instantly. */
export function FaceStack({
  faces,
  extra,
  size = 26,
}: {
  faces: string[];
  extra?: number;
  size?: number;
}) {
  return (
    <span className={styles.stack} aria-hidden="true" style={{ ["--fz" as string]: `${size}px` }}>
      {faces.map((f, i) => (
        <i key={i} style={{ width: size, height: size, fontSize: size * 0.4 }}>{f}</i>
      ))}
      {extra ? <i className={styles.more} style={{ width: size, height: size, fontSize: size * 0.36 }}>+{extra}</i> : null}
    </span>
  );
}
