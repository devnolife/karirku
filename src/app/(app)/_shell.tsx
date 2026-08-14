"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AppSidebarNav, type NavGroup } from "./_sidebar";
import { SidebarPromo } from "./_promo";

/** Peta route → kelas tema warna (didefinisikan di globals.css). */
const THEME_BY_PREFIX: [prefix: string, theme: string][] = [
  ["/company", "theme-company"],
  ["/dashboard", "theme-dashboard"],
  ["/profile", "theme-profile"],
  ["/skills", "theme-skills"],
  ["/roadmap", "theme-roadmap"],
  ["/jobs", "theme-jobs"],
  ["/apply-assistant", "theme-assistant"],
  ["/applications", "theme-applications"],
  ["/learn", "theme-learn"],
  ["/onboarding", "theme-goal"],
  ["/guides", "theme-guides"],
  ["/projects", "theme-projects"],
  ["/proposals", "theme-proposals"],
  ["/interview", "theme-interview"],
];

function themeFor(pathname: string): string {
  const hit = THEME_BY_PREFIX.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return hit?.[1] ?? "theme-default";
}

export function AppShell({
  roleLabel,
  groups,
  user,
  signOut,
  children,
}: {
  roleLabel: string;
  groups: NavGroup[];
  user: { name: string; email: string };
  signOut: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const flatItems = groups.flatMap((g) => g.items);

  return (
    <div
      className={`studio-shell act-sans flex h-screen w-full justify-center text-[var(--act-ink)] ${themeFor(pathname)}`}
    >
      <div className="flex h-full w-full max-w-[1560px]">
        <aside
          className={
            "studio-sidebar hidden flex-none flex-col transition-[width] duration-300 ease-out lg:flex " +
            (collapsed ? "w-[76px] px-3 py-5" : "w-[264px] p-5")
          }
        >
          <Link
            href="/dashboard"
            className={"flex flex-none items-center gap-2.5 " + (collapsed ? "justify-center" : "px-1")}
          >
            <Wordmark />
            {!collapsed && (
              <span className="act-heading text-[18px]">
                Craft<span className="text-[#198F38]">Works</span>
              </span>
            )}
          </Link>

          <div className="no-scrollbar mt-8 flex-1 overflow-y-auto">
            <AppSidebarNav groups={groups} collapsed={collapsed} />
          </div>

          {!collapsed && (
            <div className="mt-4 flex-none">
              <SidebarPromo />
            </div>
          )}
          <div className="mt-5 flex-none border-t border-[rgba(4,39,24,0.08)] pt-4">
            {collapsed ? (
              <div className="flex flex-col items-center gap-2">
                <Avatar name={user.name} />
                <form action={signOut}>
                  <button
                    type="submit"
                    title="Keluar"
                    className="studio-icon-button grid h-9 w-9 place-items-center text-[var(--act-graphite)]"
                  >
                    <Ico.Logout />
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 px-1">
                <Avatar name={user.name} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-[var(--act-ink)]">{user.name}</div>
                  <div className="truncate text-xs text-[var(--act-graphite)]">{user.email}</div>
                </div>
                <form action={signOut}>
                  <button
                    type="submit"
                    title="Keluar"
                    className="studio-icon-button grid h-8 w-8 place-items-center text-[var(--act-graphite)]"
                  >
                    <Ico.Logout />
                  </button>
                </form>
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="studio-topbar sticky top-0 z-30 flex flex-none items-center gap-3 px-4 lg:hidden">
            <Wordmark />
            <span className="act-heading text-[17px]">CraftWorks</span>
            <span className="studio-role-chip ml-auto">{roleLabel}</span>
            <form action={signOut}>
              <button type="submit" className="studio-logout">
                Keluar
              </button>
            </form>
          </header>
          <div className="flex-none border-b border-[rgba(15,43,61,0.08)] bg-[#FBFCFD] px-4 py-2.5 lg:hidden">
            <div className="flex gap-2 overflow-x-auto">
              <MobileTabs items={flatItems} />
            </div>
          </div>

          <header className="studio-topbar hidden flex-none items-center gap-3 px-6 lg:flex">
            <button
              onClick={() => setCollapsed((c) => !c)}
              aria-label="Toggle sidebar"
              className="studio-icon-button grid h-9 w-9 flex-none place-items-center text-[var(--act-graphite)]"
            >
              <PanelIcon collapsed={collapsed} />
            </button>

            <div className="studio-status">
              <span aria-hidden />
              Workspace aktif
            </div>
            <span className="studio-role-chip">{roleLabel}</span>

            <div className="ml-auto flex items-center gap-1.5">
              <button className="studio-icon-button grid h-9 w-9 place-items-center text-[var(--act-graphite)]">
                <Ico.Mail />
                <span className="sr-only">Pesan</span>
              </button>
              <button className="studio-icon-button grid h-9 w-9 place-items-center text-[var(--act-graphite)]">
                <Ico.Bell />
                <span className="sr-only">Notifikasi</span>
              </button>
            </div>
          </header>

          <main className="studio-content no-scrollbar min-w-0 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ bits ------------------------------ */

function MobileTabs({ items }: { items: { href: string; label: string; icon: string }[] }) {
  return (
    <>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="studio-mobile-tab flex flex-none items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d={item.icon} />
          </svg>
          {item.label}
        </Link>
      ))}
    </>
  );
}

function Avatar({ name, sm }: { name: string; sm?: boolean }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className={
        "inline-flex flex-none items-center justify-center rounded-xl bg-[var(--act-onyx)] font-semibold text-white " +
        (sm ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-xs")
      }
    >
      {initials}
    </span>
  );
}

function Wordmark() {
  return (
    <span className="studio-brand-mark">
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 34V14M14 24c6.5-9.5 16.5-9.5 22 0" />
      </svg>
    </span>
  );
}

function PanelIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M9 4v16" />
      {collapsed ? <path d="M13 9l3 3-3 3" /> : <path d="M16 9l-3 3 3 3" />}
    </svg>
  );
}

const Ico = {
  Bell: () => (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 16V11a6 6 0 1 0-12 0v5l-1.5 2h15z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5M5 12h11" />
    </svg>
  ),
};
