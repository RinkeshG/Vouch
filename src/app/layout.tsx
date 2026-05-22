import type { Metadata, Viewport } from "next";
import { fraunces, instrumentSans, jetbrainsMono, caveat } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vouch — Curated lists of your favorite places",
  description:
    "Build and share beautiful, curated lists of the places you love. Your taste, beautifully organized. Now in Bangalore.",
  openGraph: {
    title: "Vouch — Curated lists of your favorite places",
    description:
      "Build and share beautiful lists of the places you love. Now in Bangalore.",
    siteName: "Vouch",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vouch",
    description:
      "Build and share beautiful lists of the places you love. Now in Bangalore.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F2ECDF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} ${caveat.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
