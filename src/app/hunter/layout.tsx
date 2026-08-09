import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { IBM_Plex_Mono, Archivo } from "next/font/google";
import { getSession } from "@/lib/auth";

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-hunter-mono",
});
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-hunter-sans",
});

export const metadata: Metadata = {
  title: "Hunter — Job Hunt Automation",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/hunter", label: "Overview" },
  { href: "/hunter/jobs", label: "Jobs Queue" },
  { href: "/hunter/intake", label: "Intake" },
  { href: "/hunter/applications", label: "Applications" },
  { href: "/hunter/settings", label: "Settings" },
];

export default async function HunterLayout({ children }: { children: React.ReactNode }) {
  // Hunter is a single-operator internal tool (raw SQLite, no per-user
  // scoping — see docs/PRD-hunter.md §3). Restrict to admin so other real
  // users in this now-multi-tenant app can't reach someone else's personal
  // job-hunt data. Multi-tenant premium access is sub-project #2 (see
  // docs/superpowers/specs/2026-07-06-hunter-premium-foundation-design.md).
  const session = await getSession();
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div
      className={`${mono.variable} ${archivo.variable} min-h-screen bg-[#0D0F0C] text-[#E6E4DC] [font-family:var(--font-hunter-sans)] selection:bg-[#FF6B1A] selection:text-[#0D0F0C]`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent 0 31px, rgba(230,228,220,0.02) 31px 32px)",
      }}
    >
      <header className="sticky top-0 z-10 border-b border-[#262B24] bg-[#0D0F0C]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-baseline gap-8 px-4 py-3">
          <Link
            href="/hunter"
            className="[font-family:var(--font-hunter-mono)] text-sm font-semibold tracking-tight"
          >
            <span className="text-[#FF6B1A]">HUNTER</span>
            <span className="text-[#4C5349]">_OPS//</span>
          </Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] font-medium uppercase tracking-[0.14em]">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="py-1 text-[#8A9088] transition-colors duration-150 ease-out hover:text-[#E6E4DC]"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <span className="ml-auto hidden [font-family:var(--font-hunter-mono)] text-[10px] uppercase tracking-widest text-[#4C5349] sm:block">
            single-operator / admin
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}
