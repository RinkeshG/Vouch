import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "../components/pwa-register";

export const metadata: Metadata = {
  title: "Vouch — Curated lists of your favorite places",
  description:
    "Build and share beautiful, curated lists of the places you love. Your taste, beautifully organized. Now in Bangalore.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Vouch" },
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,300;1,9..144,400;1,9..144,500;1,9..144,600;1,9..144,700;1,9..144,800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&family=Caveat:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}<PwaRegister /></body>
    </html>
  );
}
