import type { ReactNode } from "react";
import "./theme.css";

/* v0.1 shell. Space Grotesk comes from the parent (vouch) layout; we add
   JetBrains Mono here, and wrap everything in .v2 so the coffee-derived theme
   applies. Self-contained — no legacy After-Dark styling leaks in. */
const FONTS =
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;1,400&display=swap";

export const metadata = { title: "Vouch — places, vouched for" };

export default function V2Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href={FONTS} />
      <div className="v2">{children}</div>
    </>
  );
}
