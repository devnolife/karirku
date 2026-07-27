"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GUIDE_CATEGORIES,
  type Guide,
  type GuideCategory,
} from "@devnolife/karirku-core/content/guides";
import type { UserRole } from "@devnolife/karirku-core/roles";

const CAT_TONE: Record<GuideCategory, string> = {
  Platform: "act-chip-blue",
  Remote: "act-chip-iris",
  Interview: "act-chip-amber",
  Resume: "act-chip-green",
  Freelance: "act-chip-amber",
  "Job board": "act-chip-mute",
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
  const featured = filtered[0];
  const guideRows = filtered.slice(1);

  return (
    <div className="space-y-6">
      <nav aria-label="Filter panduan" className="flex flex-wrap items-center gap-2 rounded-[22px] border border-[rgba(4,39,24,0.08)] bg-[#F2FBF6] p-2">
        <span className="px-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--act-graphite)]">Topik</span>
        <FilterChip active={cat === "all"} onClick={() => setCat("all")}>
          Semua
        </FilterChip>
        {GUIDE_CATEGORIES.map((c) => (
          <FilterChip key={c} active={cat === c} onClick={() => setCat(c)}>
            {c}
          </FilterChip>
        ))}
      </nav>

      {featured && (
        <article className="grid overflow-hidden rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-[#D4E5CD] shadow-[0_18px_36px_-30px_rgba(4,39,24,0.48)] md:grid-cols-12">
          <div className="flex flex-col justify-between p-6 md:col-span-8 md:p-8">
            <div>
              <div className="flex items-center gap-2">
                <span className={`act-chip ${CAT_TONE[featured.category]}`}>{featured.category}</span>
                {featured.forRoles.includes(highlightRole) && <span className="act-chip act-chip-green !py-0.5 !text-[10px]">Pilihanmu</span>}
              </div>
              <span className="studio-section-kicker mt-6 block">Pilihan editor</span>
              <Link href={`/guides/${featured.slug}`} className="group mt-2 block">
                <h2 className="act-display text-3xl leading-tight text-[var(--act-ink)] transition-colors group-hover:text-[var(--act-blue)] md:text-4xl">{featured.title}</h2>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--act-charcoal)]">{featured.summary}</p>
              </Link>
            </div>
            <div className="mt-7 flex items-center gap-4">
              <span className="text-xs font-semibold text-[var(--act-graphite)]">{featured.readMins} menit baca</span>
              <Link href={`/guides/${featured.slug}`} className="studio-primary-link">Mulai membaca <span aria-hidden>→</span></Link>
            </div>
          </div>
          <div className="hidden border-l border-[rgba(4,39,24,0.1)] bg-[#042718] p-7 text-white md:col-span-4 md:block">
            <span className="studio-dark-kicker">Catatan studio</span>
            <p className="act-heading mt-4 text-2xl leading-snug">Baca seperlunya, lalu langsung praktikkan satu langkah.</p>
            <p className="mt-4 text-sm leading-relaxed text-white/65">Panduan ringkas yang dirancang untuk mengubah persiapan menjadi progres nyata.</p>
          </div>
        </article>
      )}

      <section aria-label="Daftar panduan" className="overflow-hidden rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-white shadow-[0_16px_32px_-28px_rgba(4,39,24,0.44)]">
        <div className="border-b border-[rgba(4,39,24,0.08)] px-5 py-4 md:px-6"><span className="studio-section-kicker">Jelajahi panduan</span></div>
        <div className="divide-y divide-[rgba(4,39,24,0.08)]">
        {guideRows.map((g) => {
          const relevant = g.forRoles.includes(highlightRole);
          return (
            <article key={g.slug} className="grid gap-4 px-5 py-5 transition-colors hover:bg-[#F2FBF6] md:grid-cols-12 md:items-center md:px-6">
              <div className="md:col-span-2"><span className={`act-chip ${CAT_TONE[g.category]}`}>{g.category}</span></div>
              <div className="md:col-span-6">
                <Link href={`/guides/${g.slug}`} className="group block">
                  <h3 className="act-heading text-lg leading-snug text-[var(--act-ink)] group-hover:text-[var(--act-blue)]">
                  {g.title}
                  </h3>
                </Link>
                <p className="mt-1 text-sm leading-relaxed text-[var(--act-graphite)]">
                  {g.summary}
                </p>
              </div>
              <div className="flex items-center gap-3 md:col-span-2 md:justify-end">
                <span className="text-xs font-semibold text-[var(--act-graphite)]">{g.readMins} menit</span>
                {relevant && <span className="act-chip act-chip-green !py-0.5 !text-[10px]">Untukmu</span>}
              </div>
              <div className="flex items-center gap-3 md:col-span-2 md:justify-end">
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
                    Baca
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </Link>
              </div>
            </article>
          );
        })}
        </div>
      </section>

      {/* Interview practice CTA */}
      <section className="flex flex-col items-start gap-4 rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-[#D2DDEA] p-6 sm:flex-row sm:items-center sm:justify-between">
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
      </section>
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
          : "text-[var(--act-charcoal)] hover:bg-white")
      }
    >
      {children}
    </button>
  );
}
