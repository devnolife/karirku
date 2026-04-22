import Link from "next/link";
import { getMockSession, signOutDemo } from "@/lib/mock/session";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getMockSession();

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="sticky top-0 z-30 bg-paper/85 backdrop-blur ed-hairline-b">
        <div className="mx-auto grid max-w-[1400px] grid-cols-12 items-center gap-4 px-6 py-3.5">
          <Link href="/dashboard" className="col-span-4 inline-flex items-center gap-2">
            <Monogram />
            <span className="text-[17px] font-semibold tracking-tight">
              Karir<span className="text-pop">.ai</span>
            </span>
            <span className="ed-label ml-2 hidden sm:inline">demo</span>
          </Link>

          <nav className="col-span-4 hidden md:flex items-center justify-center gap-7 text-sm">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/onboarding">Goal</NavLink>
          </nav>

          <div className="col-span-8 md:col-span-4 flex items-center justify-end gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium leading-tight">{session.user.name}</div>
              <div className="ed-label">{session.user.email}</div>
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
                className="inline-flex items-center rounded-full border border-ink px-3.5 py-1.5 text-sm font-medium text-ink hover:bg-ink hover:text-paper transition-colors"
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
      className="font-medium text-ink-soft transition-colors hover:text-ink"
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
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink bg-pop text-xs font-semibold text-pop-ink">
      {initials}
    </span>
  );
}

function Monogram() {
  return (
    <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-ink bg-surface text-ink">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 19 L12 5 L19 19" />
        <path d="M8 14 H16" />
      </svg>
    </span>
  );
}
