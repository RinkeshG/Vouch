import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vouch — Trusted places from the people you trust",
  description:
    "The only restaurant guide that matters is your friends'. Vouch is where your circle shares the places they actually love. Now in Bangalore.",
  openGraph: {
    title: "Vouch — Trusted places from the people you trust",
    description:
      "The only restaurant guide that matters is your friends'. Now in Bangalore.",
    siteName: "Vouch",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vouch",
    description:
      "The only restaurant guide that matters is your friends'. Now in Bangalore.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F6F5F2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=gambarino@400&f[]=general-sans@200,300,400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
