import { Fraunces, Instrument_Sans, JetBrains_Mono, Caveat } from "next/font/google";

export const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--v-font-serif",
  axes: ["opsz"],
});

export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--v-font-sans",
  weight: ["400", "500", "600", "700"],
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--v-font-mono",
  weight: ["400", "500", "600"],
});

export const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--v-font-hand",
  weight: ["500", "600", "700"],
});
