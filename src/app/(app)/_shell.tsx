"use client";

import Link from "next/link";
import { useState } from "react";
import { AppSidebarNav, type SideItem } from "./_sidebar";

const PANEL =
  "rounded-[22px] bg-[var(--act-paper)] border border-[rgba(15,23,42,0.07)] shadow-[0_18px_40px_-24px_rgba(15,40,60,0.28)]";

export function AppShell({
  roleLabel,
  items,
  user,
  signOut,
  children,
}: {
  roleLabel: string;
  items: SideItem[];
  user: { name: string; email: string };
  signOut: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-canvas act-sans flex h-screen w-full overflow-hidden text-[var(--act-ink)] lg:gap-3 lg:p-3">
      {/* ---------------- Desktop sidebar (floating, collapsible) ---------------- */}
      <aside
        className={
          "hidden flex-none flex-col py-5 transition-[width] duration-300 ease-out lg:flex " +
          PANEL +
          " " +
          (collapsed ? "w-[76px] px-2.5" : "w-[248px] px-4")
        }
      >
        {/* brand */}
        <Link
          href="/dashboard"
          className={"flex items-center gap-2.5 " + (collapsed ? "justify-center px-0" : "px-2")}
        >
          <Wordmark />
          {!collapsed && (
            <span className="act-heading text-[18px]">
              Craft<span className="text-[var(--act-graphite)]">Works</span>
            </span>
          )}
        </Link>

        {!collapsed && (
          <div className="mt-7 px-2">
            <span className="act-kicker">{roleLabel}</span>
          </div>
        )}

        <div className="no-scrollbar mt-3 flex-1 overflow-y-auto">
          <AppSidebarNav items={items} collapsed={collapsed} />
        </div>

        {/* user + sign out */}
        <div className="border-t border-[rgba(15,23,42,0.08)] pt-4">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Avatar name={user.name} />
              <form action={signOut}>
                <button
                  type="submit"
                  title="Keluar"
                  className="grid h-9 w-9 place-items-center rounded-xl text-[var(--act-graphite)] transition hover:bg-[rgba(15,15,15,0.05)]"
                >
                  <Ico.Logout />
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5 px-2">
                <Avatar name={user.name} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--act-ink)]">{user.name}</div>
                  <div className="truncate text-xs text-[var(--act-graphite)]">{user.email}</div>
                </div>
              </div>
              <form action={signOut} className="mt-3 px-2">
                <button type="submit" className="act-pill-ghost !w-full justify-center !text-sm">
                  Keluar
                </button>
              </form>
            </>
          )}
        </div>
      </aside>

      {/* ---------------- Content scroll column (header scrolls with it) ---------------- */}
      <div className="no-scrollbar min-w-0 flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <header className="act-glass sticky top-0 z-30 flex items-center gap-3 px-5 py-3 lg:hidden">
          <Wordmark />
          <span className="act-heading text-[17px]">CraftWorks</span>
          <span className="act-chip act-chip-blue ml-auto !text-[10px]">{roleLabel}</span>
          <form action={signOut}>
            <button type="submit" className="act-pill-ghost !text-xs">
              Keluar
            </button>
          </form>
        </header>
        <div className="border-b border-[rgba(15,23,42,0.08)] lg:hidden">
          <div className="flex gap-1 overflow-x-auto px-4 py-2">
            <AppSidebarNav items={items} />
          </div>
        </div>

        {/* Desktop floating header — slim, scrolls away */}
        <div className="flex flex-col gap-3">
          <header
            className={
              "hidden flex-none items-center gap-3 px-4 py-2.5 backdrop-blur-sm lg:flex " +
              "rounded-[18px] border border-[rgba(15,23,42,0.06)] bg-[rgba(255,255,255,0.85)] " +
              "shadow-[0_10px_28px_-22px_rgba(15,40,60,0.3)]"
            }
          >
            <button
              onClick={() => setCollapsed((c) => !c)}
              aria-label="Toggle sidebar"
              className="grid h-8 w-8 flex-none place-items-center rounded-lg text-[var(--act-graphite)] transition hover:bg-[rgba(15,15,15,0.05)]"
            >
              <PanelIcon collapsed={collapsed} />
            </button>

            <div className="hidden items-center gap-2 rounded-full bg-[var(--act-mist)] px-3.5 py-1.5 text-[12.5px] text-[var(--act-graphite)] md:flex md:w-[260px]">
              <Ico.Search /> Cari…
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              <button className="grid h-8 w-8 place-items-center rounded-full text-[var(--act-graphite)] transition hover:bg-[rgba(15,15,15,0.05)]">
                <Ico.Bell />
                <span className="sr-only">Notifikasi</span>
              </button>
              <div className="ml-1 flex items-center gap-2 rounded-full bg-[var(--act-mist)] py-1 pl-1 pr-3">
                <Avatar name={user.name} sm />
                <span className="hidden text-[13px] font-semibold sm:block">{user.name.split(" ")[0]}</span>
              </div>
            </div>
          </header>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ bits ------------------------------ */

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
    <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-[var(--act-onyx)] text-white shadow-[var(--act-soft-shadow)]">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 19 L12 5 L19 19" />
        <path d="M8 14 H16" />
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
  Search: () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 16V11a6 6 0 1 0-12 0v5l-1.5 2h15z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5M5 12h11" />
    </svg>
  ),
};
