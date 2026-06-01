import type { Metadata } from "next";
import WelcomeClient from "./welcome-client";

export const metadata: Metadata = {
  title: "Welcome to Vouch — A home for taste",
  description:
    "The places we'd actually send a friend to. Build and share curated lists of the spots you love. Now in Bangalore.",
};

export default function WelcomePage() {
  return <WelcomeClient />;
}
