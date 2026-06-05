import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Fraunces, JetBrains_Mono, Bricolage_Grotesque, Plus_Jakarta_Sans, Caveat } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

// Used by /v2 — editorial risograph zine aesthetic
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

// Used by /v3 — black chrome / studio aesthetic
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

// Used by /v4 — "Clean Paper Desk" aesthetic.
// Display/heading -> Bricolage Grotesque (above). Body/UI -> Plus Jakarta Sans
// (made in Indonesia — fitting for a Jakarta-built product).
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Karir.ai — AI Career Copilot",
  description:
    "Pelatih karir AI yang nemenin kamu dari nol sampai dapat kerja atau project pertama.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${fraunces.variable} ${jetbrainsMono.variable} ${bricolage.variable} ${jakarta.variable} ${caveat.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-paper text-ink"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
