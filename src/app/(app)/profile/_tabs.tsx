"use client";

import { useState, type ReactNode } from "react";

export type ProfileTabKey = "profil" | "lamaran" | "cv" | "preferensi";

export type ProfileTab = {
  key: ProfileTabKey;
  label: string;
  icon: ReactNode;
  /** Tandai butuh perhatian (titik oranye). */
  attention?: boolean;
  panel: ReactNode;
};

/**
 * Navigasi tab untuk halaman profil.
 *
 * Halaman profil punya banyak bagian panjang; menumpuknya secara vertikal
 * memaksa scroll jauh. Tab membuat setiap bagian bisa dicapai dalam satu klik
 * tanpa kehilangan konteks.
 */
export function ProfileTabs({
  tabs,
  initial = "profil",
}: {
  tabs: ProfileTab[];
  initial?: ProfileTabKey;
}) {
  const [active, setActive] = useState<ProfileTabKey>(initial);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div>
      {/* Wrapper flex: menghindari celah baseline yang muncul kalau anak
          inline-flex ditaruh langsung di container block. */}
      <div className="sticky top-0 z-20 flex">
        <div
          role="tablist"
          aria-label="Bagian profil"
          className="flex max-w-full gap-0.5 overflow-x-auto rounded-full border border-[rgba(15,43,61,0.08)] bg-[rgba(255,255,255,0.9)] p-1 shadow-[0_2px_12px_-6px_rgba(15,43,61,0.25)] backdrop-blur-md"
        >
          {tabs.map((t) => {
            const on = t.key === active;
            return (
              <button
                key={t.key}
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls={`panel-${t.key}`}
                onClick={() => setActive(t.key)}
                className={
                  "inline-flex flex-none items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap transition-colors " +
                  (on
                    ? "bg-[var(--page-accent,var(--act-blue))] text-white shadow-[0_2px_8px_-2px_rgba(15,43,61,0.35)]"
                    : "text-[var(--act-charcoal)] hover:bg-[rgba(15,43,61,0.06)]")
                }
              >
                <span className="h-4 w-4 flex-none" aria-hidden>
                  {t.icon}
                </span>
                {t.label}
                {t.attention && !on && (
                  <span
                    className="h-1.5 w-1.5 flex-none rounded-full bg-[#B45309]"
                    role="img"
                    aria-label="perlu dilengkapi"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={`panel-${current.key}`}
        role="tabpanel"
        // Key memaksa remount agar animasi masuk terasa saat berpindah tab.
        key={current.key}
        className="act-rise mt-5 space-y-6"
      >
        {current.panel}
      </div>
    </div>
  );
}

/* ------------------------------- icons ------------------------------- */

export const TabIcon = {
  User: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 13a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0" />
    </svg>
  ),
  Form: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 11l3 3 8-8M5 12a7 7 0 0011 5.7" />
    </svg>
  ),
  Doc: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
      <path d="M14 3v5h5" />
    </svg>
  ),
  Sliders: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h16M9 4v4M15 10v4M7 16v4" />
    </svg>
  ),
};
