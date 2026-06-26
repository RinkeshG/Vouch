import type { Metadata, Viewport } from "next";
import { DM_Sans, Caveat, DM_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider, themeBootScript } from "./_theme";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-hand",
  display: "swap",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hotlist — your favourite places, one beautiful link",
  description:
    "Make your own guide to the places you love — your spots, your takes — and share it with one link. Like a personal city guide, but yours.",
  openGraph: {
    title: "Hotlist — your favourite places, one beautiful link",
    description:
      "Make a little guide to the places you love and share it anywhere. Your spots, your takes, one link.",
    siteName: "Hotlist",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hotlist",
    description:
      "Make your own guide to the places you love — and share it with one link.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FBF2E4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${caveat.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
