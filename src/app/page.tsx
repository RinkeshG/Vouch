import type { Metadata } from "next";
import VouchLanding from "./_landing/landing";

export const metadata: Metadata = {
  title: "Vouch — The only review that matters has a name on it",
  description:
    "Vouch is the trusted-friend layer for restaurants — a living ledger of where to eat. Follow the palates you believe in; their personal vouches, not star averages, tell you where to eat tonight. Invite-only, Bengaluru edition.",
  openGraph: {
    title: "Vouch — The only review that matters has a name on it",
    description:
      "The trusted-friend layer for restaurants. No star averages, no strangers — just the places worth your one dinner tonight. Invite-only, Bengaluru edition.",
    siteName: "Vouch",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vouch — A living ledger of where to eat",
    description:
      "Follow the palates you trust. Their vouches, not star averages, tell you where to eat tonight. Invite-only, Bengaluru edition.",
  },
};

export default function LandingPage() {
  return <VouchLanding />;
}
