import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Bricolage_Grotesque, Plus_Jakarta_Sans, Caveat } from "next/font/google";
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

// Used by /v4 (default) — "Clean Paper Desk" aesthetic.
// Display/heading -> Bricolage Grotesque. Body/UI -> Plus Jakarta Sans
// (made in Indonesia — fitting for a Jakarta-built product).
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

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
  title: "CraftWorks — Career Studio & Talent Marketplace",
  description:
    "Craft your career, and it works. Bangun profil karirmu di studio, lalu ketemu lowongan & talent yang cocok lewat AI matching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${bricolage.variable} ${jakarta.variable} ${caveat.variable} h-full antialiased`}
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
