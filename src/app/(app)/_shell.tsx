"use client";

import Link from "next/link";
import { useState } from "react";
import { AppSidebarNav, type NavGroup } from "./_sidebar";
import { SidebarPromo } from "./_promo";

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
  const flatItems = groups.flatMap((g) => g.items);

  return (
    <div className="app-canvas act-sans flex h-dvh w-full text-[var(--act-ink)]">
      {/* ---------------- One unified frame: sidebar + topbar + content (full-bleed, edge-to-edge) ---------------- */}
      <div className="flex h-full w-full">
        {/* Desktop sidebar (part of the same frame, no own shadow) */}
        <aside
          className={
            "hidden flex-none flex-col border-r border-[rgba(15,23,42,0.08)] bg-[var(--act-paper)] py-5 transition-[width] duration-300 ease-out lg:flex " +
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

          <div className="no-scrollbar mt-6 flex-1 overflow-y-auto">
            <AppSidebarNav groups={groups} collapsed={collapsed} />
          </div>

          {/* promo + user + sign out */}
          {!collapsed && (
            <div className="mt-4">
              <SidebarPromo />
            </div>
          )}
          <div className="mt-4 border-t border-[rgba(15,23,42,0.08)] pt-4">
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
                    className="grid h-8 w-8 place-items-center rounded-xl text-[var(--act-graphite)] transition hover:bg-[rgba(15,15,15,0.05)]"
                  >
                    <Ico.Logout />
                  </button>
                </form>
              </div>
            )}
          </div>
        </aside>

        {/* ---------------- Content column (light canvas zone within the frame) ---------------- */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--act-mist)]">
          {/* Mobile top bar */}
          <header className="act-glass sticky top-0 z-30 flex flex-none items-center gap-3 px-5 py-3 lg:hidden">
            <Wordmark />
            <span className="act-heading text-[17px]">CraftWorks</span>
            <span className="act-chip act-chip-blue ml-auto !text-[10px]">{roleLabel}</span>
            <form action={signOut}>
              <button type="submit" className="act-pill-ghost !text-xs">
                Keluar
              </button>
            </form>
          </header>
          {/* Mobile search + tabs */}
          <div className="flex-none border-b border-[rgba(15,23,42,0.08)] bg-[var(--act-paper)] px-4 py-2.5 lg:hidden">
            <SearchPill className="w-full" />
            <div className="mt-2 flex gap-1 overflow-x-auto">
              <MobileTabs items={flatItems} />
            </div>
          </div>

          {/* Desktop topbar — docked in-frame, not a separate floating card */}
          <header className="hidden flex-none items-center gap-3 border-b border-[rgba(15,23,42,0.07)] bg-[var(--act-paper)] px-6 py-3.5 lg:flex">
            <button
              onClick={() => setCollapsed((c) => !c)}
              aria-label="Toggle sidebar"
              className="grid h-8 w-8 flex-none place-items-center rounded-lg text-[var(--act-graphite)] transition hover:bg-[rgba(15,15,15,0.05)]"
            >
              <PanelIcon collapsed={collapsed} />
            </button>

            <SearchPill className="w-[320px]" showHint />

            <div className="ml-auto flex items-center gap-1.5">
              <button className="grid h-9 w-9 place-items-center rounded-full text-[var(--act-graphite)] transition hover:bg-[rgba(15,15,15,0.05)]">
                <Ico.Mail />
                <span className="sr-only">Pesan</span>
              </button>
              <button className="grid h-9 w-9 place-items-center rounded-full text-[var(--act-graphite)] transition hover:bg-[rgba(15,15,15,0.05)]">
                <Ico.Bell />
                <span className="sr-only">Notifikasi</span>
              </button>
              <div className="ml-1 flex items-center gap-2.5 border-l border-[rgba(15,23,42,0.08)] pl-3">
                <Avatar name={user.name} />
                <div className="hidden min-w-0 leading-tight sm:block">
                  <div className="truncate text-[13px] font-semibold text-[var(--act-ink)]">{user.name}</div>
                  <div className="truncate text-[11px] text-[var(--act-graphite)]">{user.email}</div>
                </div>
              </div>
            </div>
          </header>

          <main className="no-scrollbar min-w-0 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ bits ------------------------------ */

function SearchPill({ className = "", showHint }: { className?: string; showHint?: boolean }) {
  return (
    <Link
      href="/jobs"
      className={
        "flex items-center gap-2 rounded-full bg-[var(--act-mist)] px-3.5 py-2 text-[12.5px] text-[var(--act-graphite)] transition-colors hover:bg-[rgba(15,23,42,0.08)] " +
        className
      }
    >
      <Ico.Search />
      <span className="flex-1">Cari lowongan, perusahaan, skill…</span>
      {showHint && (
        <span className="act-chip act-chip-mute !px-1.5 !py-0.5 !text-[10px] font-semibold">/jobs</span>
      )}
    </Link>
  );
}

function MobileTabs({ items }: { items: { href: string; label: string; icon: string }[] }) {
  return (
    <>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex flex-none items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium text-[var(--act-charcoal)] hover:bg-[rgba(15,15,15,0.05)]"
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
