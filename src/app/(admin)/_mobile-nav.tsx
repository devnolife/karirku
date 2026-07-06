"use client";

/**
 * Drawer navigasi admin untuk mobile — panel geser dari kiri berisi menu
 * yang sama dengan sidebar desktop. Menutup saat: link diklik (perubahan
 * pathname), overlay diklik, atau tombol Esc. Body scroll dikunci saat
 * terbuka; fokus kembali ke tombol ☰ saat ditutup.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminSidebarNav } from "./_nav";
import { signOutAdmin } from "./_actions";

export function AdminMobileNav({
  user,
}: {
  user: { name: string; email: string };
}) {
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Tutup saat navigasi (link di drawer diklik).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Esc untuk menutup + kunci body scroll + kembalikan fokus.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      burgerRef.current?.focus();
    };
  }, [open]);

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <button
        ref={burgerRef}
        type="button"
        aria-label="Buka menu admin"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[var(--act-ink)] transition-colors hover:bg-[rgba(15,15,15,0.06)]"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 motion-reduce:transition-none " +
          (open ? "opacity-100" : "pointer-events-none opacity-0")
        }
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu admin"
        className={
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[var(--act-paper)] px-4 py-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] transition-transform duration-200 motion-reduce:transition-none " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="flex items-center gap-2.5 px-2">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--act-onyx)] text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 19 L12 5 L19 19" />
                <path d="M8 14 H16" />
              </svg>
            </span>
            <span className="act-heading text-[18px]">
              Craft<span className="text-[var(--act-graphite)]">Works</span>
            </span>
            <span className="act-chip act-chip-magenta !text-[10px] !tracking-[0.1em] uppercase">
              admin
            </span>
          </Link>
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-xl text-[var(--act-graphite)] transition-colors hover:bg-[rgba(15,15,15,0.06)]"
          >
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-6 px-2">
          <span className="act-kicker">Panel</span>
        </div>
        <div className="mt-3 flex-1 overflow-y-auto">
          <AdminSidebarNav />
        </div>

        <div className="border-t border-[rgba(15,23,42,0.08)] pt-4">
          <div className="flex items-center gap-2.5 px-2">
            <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[var(--act-onyx)] text-xs font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[var(--act-ink)]">{user.name}</div>
              <div className="truncate text-xs text-[var(--act-graphite)]">{user.email}</div>
            </div>
          </div>
          <form action={signOutAdmin} className="mt-3 px-2">
            <button type="submit" className="act-pill-ghost !w-full justify-center !text-sm">
              Keluar
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
