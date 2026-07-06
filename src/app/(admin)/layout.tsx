import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, signOut as authSignOut } from "@/lib/auth";
import { AdminSidebarNav } from "./_nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Guard kedua (selain middleware): non-admin tidak boleh di sini.
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="app-canvas act-sans min-h-screen text-[var(--act-ink)]">
      <div className="mx-auto flex max-w-[1500px]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[252px] flex-none flex-col border-r border-[rgba(15,23,42,0.08)] bg-[var(--act-paper)] px-4 py-5 md:flex">
          <Link href="/admin" className="flex items-center gap-2.5 px-2">
            <Wordmark />
            <span className="act-heading text-[18px]">
              Craft<span className="text-[var(--act-graphite)]">Works</span>
            </span>
            <span className="act-chip act-chip-magenta ml-0.5 !text-[10px] !tracking-[0.1em] uppercase">
              admin
            </span>
          </Link>

          <div className="mt-7 px-2">
            <span className="act-kicker">Panel</span>
          </div>
          <div className="mt-3 flex-1">
            <AdminSidebarNav />
          </div>

          <div className="border-t border-[rgba(15,23,42,0.08)] pt-4">
            <div className="flex items-center gap-2.5 px-2">
              <Avatar name={session.user.name} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-[var(--act-ink)]">
                  {session.user.name}
                </div>
                <div className="truncate text-xs text-[var(--act-graphite)]">
                  {session.user.email}
                </div>
              </div>
            </div>
            <form
              action={async () => {
                "use server";
                await authSignOut({ redirectTo: "/login" });
              }}
              className="mt-3 px-2"
            >
              <button type="submit" className="act-pill-ghost !w-full justify-center !text-sm">
                Keluar
              </button>
            </form>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Mobile topbar */}
          <header className="act-glass sticky top-0 z-30 flex items-center gap-3 px-5 py-3 md:hidden">
            <Wordmark />
            <span className="act-heading text-[17px]">CraftWorks</span>
            <span className="act-chip act-chip-magenta !text-[10px] uppercase">admin</span>
            <form
              action={async () => {
                "use server";
                await authSignOut({ redirectTo: "/login" });
              }}
              className="ml-auto"
            >
              <button type="submit" className="act-pill-ghost !text-xs">Keluar</button>
            </form>
          </header>
          <main className="px-6 py-8 md:px-10">{children}</main>
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
