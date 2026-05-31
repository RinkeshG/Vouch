import type { ReactNode } from "react";
import "../../components/vouch/vouch.css";

/* DS 2.0 living showcase. Self-contained: loads the After-Dark fonts and wraps
   everything in `.vouch` so the token layer applies without touching the legacy
   globals.css / existing routes. */
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap";

export default function SystemLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href={FONTS_HREF} />
      <div className="vouch">{children}</div>
    </>
  );
}
