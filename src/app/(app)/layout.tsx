import Link from "next/link";
import { getMockSession, signOutDemo } from "@/lib/mock/session";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getMockSession();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/80 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <LogoMark />
            <span>
              Karir<span className="text-indigo-600 dark:text-indigo-400">.ai</span>
            </span>
            <span className="ml-2 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
              Demo
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-zinc-200 bg-white p-1 text-sm dark:border-zinc-800 dark:bg-zinc-900 md:flex">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/onboarding">Goal</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right text-xs sm:block">
              <div className="font-medium">{session.user.name}</div>
              <div className="text-zinc-500">{session.user.email}</div>
            </div>
            <Avatar name={session.user.name} />
            <form
              action={async () => {
                "use server";
                await signOutDemo();
                redirect("/");
              }}
            >
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-full px-3 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-zinc-900"
                title="Keluar (demo)"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-4 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    >
      {children}
    </Link>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white shadow-sm">
      {initials}
    </span>
  );
}

function LogoMark() {
  return (
    <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/30">
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
        <path
          d="M4 17V7l4 6 4-10 4 10 4-6v10"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
