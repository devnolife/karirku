import Link from "next/link";
import { redirect } from "next/navigation";
import { getMockSession } from "@/lib/mock/session";
import { AdminSidebarNav } from "./_nav";
import { AdminMobileNav } from "./_mobile-nav";
import { signOutAdmin } from "./_actions";
import { SidebarPromo } from "../(app)/_promo";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getMockSession();

  // Guard kedua (selain middleware): non-admin tidak boleh di sini.
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="app-canvas act-sans flex h-screen w-full justify-center overflow-hidden text-[var(--act-ink)] md:p-4">
      {/* One unified frame: sidebar + content (matches (app) shell) */}
      <div className="flex h-full w-full max-w-[1560px] overflow-hidden md:rounded-[28px] md:border md:border-[rgba(15,23,42,0.07)] md:shadow-[0_28px_70px_-32px_rgba(15,40,60,0.38)]">
        {/* Desktop sidebar */}
        <aside className="hidden w-[252px] flex-none flex-col border-r border-[rgba(15,23,42,0.08)] bg-[var(--act-paper)] py-5 px-4 md:flex">
          <Link href="/admin" className="flex items-center gap-2.5 px-2">
            <Wordmark />
            <span className="act-heading text-[18px]">
              Craft<span className="text-[var(--act-graphite)]">Works</span>
            </span>
            <span className="act-chip act-chip-magenta ml-0.5 !text-[10px] !tracking-[0.1em] uppercase">
              admin
            </span>
          </Link>

          <div className="no-scrollbar mt-6 flex-1 overflow-y-auto">
            <AdminSidebarNav />
          </div>

          <div className="mt-4">
            <SidebarPromo />
          </div>
          <div className="mt-4 flex items-center gap-2.5 border-t border-[rgba(15,23,42,0.08)] pt-4 px-1">
            <Avatar name={session.user.name} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[var(--act-ink)]">
                {session.user.name}
              </div>
              <div className="truncate text-xs text-[var(--act-graphite)]">
                {session.user.email}
              </div>
            </div>
            <form action={signOutAdmin}>
              <button
                type="submit"
                title="Keluar"
                className="grid h-8 w-8 place-items-center rounded-xl text-[var(--act-graphite)] transition hover:bg-[rgba(15,15,15,0.05)]"
              >
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
                  <path d="M10 17l-5-5 5-5M5 12h11" />
                </svg>
              </button>
            </form>
          </div>
        </aside>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--act-mist)]">
          {/* Mobile topbar */}
          <header className="act-glass sticky top-0 z-30 flex flex-none items-center gap-3 px-5 py-3 md:hidden">
            <AdminMobileNav user={{ name: session.user.name, email: session.user.email }} />
            <Wordmark />
            <span className="act-heading text-[17px]">CraftWorks</span>
            <span className="act-chip act-chip-magenta !text-[10px] uppercase">admin</span>
          </header>
          <main className="no-scrollbar min-w-0 flex-1 overflow-y-auto px-6 py-8 md:px-8">{children}</main>
        </div>
      </div>
    </div>
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
    <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[var(--act-onyx)] text-xs font-semibold text-white">
      {initials}
    </span>
  );
}

function Wordmark() {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--act-onyx)] text-white shadow-[var(--act-soft-shadow)]">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 19 L12 5 L19 19" />
        <path d="M8 14 H16" />
      </svg>
    </span>
  );
}
