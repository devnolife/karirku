"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GUIDE_CATEGORIES,
  type Guide,
  type GuideCategory,
  type UserRole,
} from "@/lib/mock/data";

const CAT_TONE: Record<GuideCategory, string> = {
  Platform: "act-chip-blue",
  Remote: "act-chip-iris",
  Interview: "act-chip-magenta",
  Resume: "act-chip-green",
  Freelance: "act-chip-amber",
  "Job board": "act-chip-mute",
};

const CAT_RAIL: Record<GuideCategory, string> = {
  Platform: "act-rail-blue",
  Remote: "act-rail-iris",
  Interview: "act-rail-magenta",
  Resume: "act-rail-mint",
  Freelance: "act-rail-blue",
  "Job board": "act-rail-iris",
};

export function GuidesExplorer({
  guides,
  highlightRole,
}: {
  guides: Guide[];
  highlightRole: UserRole;
}) {
  const [cat, setCat] = useState<GuideCategory | "all">("all");
  const filtered = cat === "all" ? guides : guides.filter((g) => g.category === cat);

  return (
    <div className="space-y-6">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={cat === "all"} onClick={() => setCat("all")}>
          Semua
        </FilterChip>
        {GUIDE_CATEGORIES.map((c) => (
          <FilterChip key={c} active={cat === c} onClick={() => setCat(c)}>
            {c}
          </FilterChip>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((g) => {
          const relevant = g.forRoles.includes(highlightRole);
          return (
            <div key={g.slug} className={`act-card-2 act-rail ${CAT_RAIL[g.category]} flex flex-col p-6`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`act-chip ${CAT_TONE[g.category]}`}>{g.category}</span>
                {relevant && (
                  <span className="act-chip act-chip-green !py-0.5 !text-[10px]">Untukmu</span>
                )}
              </div>

              <Link href={`/guides/${g.slug}`} className="group mt-4 block">
                <h3 className="act-heading text-lg leading-snug text-[var(--act-ink)] group-hover:text-[var(--act-blue)]">
                  {g.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--act-graphite)]">
                  {g.summary}
                </p>
              </Link>

              <div className="mt-auto flex items-center justify-between gap-3 border-t border-[rgba(15,23,42,0.07)] pt-4">
                <span className="act-kicker !text-[11px]">{g.readMins} mnt baca</span>
                <div className="flex items-center gap-3">
                  {g.externalUrl && (
                    <a
                      href={g.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--act-graphite)] hover:text-[var(--act-ink)]"
                    >
                      {g.externalLabel ?? "Buka situs"}
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M7 17L17 7M17 7H8M17 7v9" />
                      </svg>
                    </a>
                  )}
                  <Link href={`/guides/${g.slug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--act-blue)] hover:underline">
                    Pelajari
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interview practice CTA */}
      <div className="act-card-2 act-wash-petal-soft flex flex-col items-start gap-4 border-[rgba(242,0,202,0.16)] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="act-kicker">Latihan interview</span>
          <h3 className="act-heading mt-1.5 text-xl text-[var(--act-ink)]">
            Latihan tanya-jawab interview
          </h3>
          <p className="mt-1 text-sm text-[var(--act-graphite)]">
            Pilih bidang, jawab pertanyaan satu per satu, lihat contoh jawaban terbaik.
          </p>
        </div>
        <Link href="/interview" className="act-pill group !text-sm">
          Mulai latihan
          <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors " +
        (active
          ? "bg-[var(--act-onyx)] text-white"
          : "bg-[var(--act-mist)] text-[var(--act-charcoal)] hover:bg-[rgba(15,15,15,0.06)]")
      }
    >
      {children}
    </button>
  );
}
