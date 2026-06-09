"use client";
import { Modal } from "./modal";
import { listGuides, upsertGuide, uid, slugify, type Guide, type GuideItem } from "./_guides";
import styles from "./guide-picker.module.css";

/* Add a place to a guide right where you are — pick an existing one or start a new
   one, no detour to the builder. */
export function GuidePicker({ open, onClose, item, onAdded }: { open: boolean; onClose: () => void; item: GuideItem; onAdded: (title: string) => void }) {
  const guides = listGuides();
  function addTo(g: Guide) {
    if (!g.items.some((i) => i.name === item.name)) upsertGuide({ ...g, items: [...g.items, item], updatedAt: Date.now() });
    onAdded(g.title);
    onClose();
  }
  function startNew() {
    const now = Date.now();
    const g: Guide = { id: uid(), slug: slugify(`${item.name}-${uid()}`), title: "Untitled guide", items: [item], borrows: 0, createdAt: now, updatedAt: now };
    upsertGuide(g);
    onAdded(g.title);
    onClose();
  }
  return (
    <Modal open={open} onClose={onClose} label="Add to a guide">
      <div className={styles.sheet}>
        <p className={styles.title}>Add <b>{item.name}</b> to…</p>
        {guides.length > 0 && (
          <ul className={styles.list}>
            {guides.map((g) => {
              const has = g.items.some((i) => i.name === item.name);
              return (
                <li key={g.id}>
                  <button type="button" className={styles.guide} onClick={() => addTo(g)} disabled={has}>
                    <span className={styles.gMain}>
                      <span className={styles.gTitle}>{g.title}</span>
                      <span className={styles.gMeta}>{g.items.length} {g.items.length === 1 ? "place" : "places"}</span>
                    </span>
                    <span className={styles.gAdd}>{has ? "Added ✓" : "Add"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <button type="button" className={styles.newBtn} onClick={startNew}>＋ Start a new guide</button>
      </div>
    </Modal>
  );
}
