import type { ReactNode } from "react";
import "../../components/vouch/vouch.css";
import { MapProvider } from "../../components/vouch/_map-context";

/* The product (After-Dark). Self-contained: loads the type families and wraps in
   `.vouch` so tokens apply without touching the legacy globals/routes. Product
   surfaces live here with clean URLs (/start, /home, /g/:slug, …). `MapProvider`
   wraps the whole product so every surface reads your map through one seam. */
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap";

export default function VouchLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href={FONTS_HREF} />
      <div className="vouch vouchRoot"><MapProvider>{children}</MapProvider></div>
    </>
  );
}
