import type { Metadata } from "next";
import WelcomeClient from "./welcome-client";
import "./after-dark.css";

export const metadata: Metadata = {
  title: "Welcome to Vouch — Eat like your most-trusted friend",
  description:
    "The only review that matters has a name on it. Follow the palates you trust — their vouches, not star ratings, tell you where to eat tonight. Bengaluru, invite-only.",
};

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap";

export default function WelcomePage() {
  return (
    <>
      <link rel="stylesheet" href={FONTS_HREF} />
      <div className="vouch vouchRoot">
        <WelcomeClient />
      </div>
    </>
  );
}
