import type { ReactNode } from "react";
import "./theme.css";

/* The locked foundation shell: Hanken Grotesk, warm-dark, wrapped in .v3. */
const FONT = "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap";

export const metadata = { title: "Vouch" };

export default function V3Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href={FONT} />
      <div className="v3"><div className="v3-grain" aria-hidden="true" />{children}</div>
    </>
  );
}
