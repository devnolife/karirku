import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Plus_Jakarta_Sans,
  Caveat,
  Inter,
  Onest,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import { ChunkErrorReload } from "@/components/ChunkErrorReload";

// v4 "Clean Paper Desk" — the active design system.
// Display/heading -> Bricolage Grotesque. Body/UI -> Plus Jakarta Sans
// (made in Indonesia — fitting for a Jakarta-built product). Caveat signs.
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

// Landing page (ui-pages) — finsyc-style visual system.
// Heading -> Onest. Body -> Inter. Serif italic accents -> Playfair Display.
const inter = Inter({
  variable: "--font-inter-v",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const onest = Onest({
  variable: "--font-onest-v",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair-v",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
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
      className={`${bricolage.variable} ${jakarta.variable} ${caveat.variable} ${inter.variable} ${onest.variable} ${playfair.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        suppressHydrationWarning
      >
        <ChunkErrorReload />
        {children}
      </body>
    </html>
  );
}
