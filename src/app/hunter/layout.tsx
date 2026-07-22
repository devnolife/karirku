import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Hunter — Job Hunt Automation",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/hunter", label: "Overview" },
  { href: "/hunter/jobs", label: "Jobs Queue" },
  { href: "/hunter/applications", label: "Applications" },
  { href: "/hunter/profile", label: "Data Diri" },
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
          <span className="font-extrabold text-amber-400 tracking-tight">🎯 Hunter</span>
          <nav className="flex gap-1 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="px-3 py-1.5 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
