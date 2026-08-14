"use client";

import { useState, useTransition } from "react";
import type { CvAnalysis, AtsCheck, AtsSeverity } from "@devnolife/karirku-core/cv";
import { analyzeCvAction } from "./actions";

/* ------------------------------ helpers ------------------------------ */

function scoreTone(score: number): { label: string; color: string; track: string } {
  if (score >= 85) return { label: "Sangat kuat", color: "#1B5E20", track: "#A5D6A7" };
  if (score >= 70) return { label: "Kuat", color: "#2FA084", track: "#6FCF97" };
  if (score >= 55) return { label: "Cukup", color: "#B45309", track: "#EBC88D" };
  return { label: "Perlu perbaikan", color: "#B3261E", track: "#F0B4B0" };
}

const SEVERITY_STYLE: Record<AtsSeverity, { label: string; className: string }> = {
  critical: { label: "Kritis", className: "bg-[#FDECEA] text-[#B3261E]" },
  warning: { label: "Perlu dibenahi", className: "bg-[#FCF0DD] text-[#B45309]" },
  info: { label: "Opsional", className: "bg-[#EDF1F4] text-[#4A5B66]" },
};

const PRIORITY_STYLE: Record<string, string> = {
  tinggi: "bg-[#FDECEA] text-[#B3261E]",
  sedang: "bg-[#FCF0DD] text-[#B45309]",
  rendah: "bg-[#EDF1F4] text-[#4A5B66]",
};

/* ------------------------------ score ring ------------------------------ */

function ScoreRing({
  score,
  caption,
  size = 116,
}: {
  score: number;
  caption: string;
  size?: number;
}) {
  const tone = scoreTone(score);
  const r = size / 2 - 9;
  const circumference = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * circumference;

  return (
    <div className="flex flex-none flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone.track} strokeWidth="9" opacity={0.45} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={tone.color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="act-display text-3xl" style={{ color: tone.color }}>
            {score}
          </span>
          <span className="text-[10px] font-semibold text-[var(--act-graphite)]">/100</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-[var(--act-ink)]">{caption}</span>
      <span className="text-[11px]" style={{ color: tone.color }}>
        {tone.label}
      </span>
    </div>
  );
}

/* ------------------------------ dimension bar ------------------------------ */

function DimensionBar({ label, value }: { label: string; value: number }) {
  const tone = scoreTone(value);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold text-[var(--act-ink)]">{label}</span>
        <span className="text-xs font-medium text-[var(--act-graphite)]">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[rgba(15,43,61,0.09)]">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: tone.color }} />
      </div>
    </div>
  );
}

/* ------------------------------ ATS checklist ------------------------------ */

function AtsChecklist({ checks }: { checks: AtsCheck[] }) {
  const [showPassed, setShowPassed] = useState(false);
  const failed = checks.filter((c) => !c.passed);
  const passed = checks.filter((c) => c.passed);

  // Kritis dulu, lalu warning, lalu info.
  const order: Record<AtsSeverity, number> = { critical: 0, warning: 1, info: 2 };
  const sortedFailed = [...failed].sort((a, b) => order[a.severity] - order[b.severity]);

  return (
    <div className="space-y-2.5">
      {sortedFailed.length === 0 ? (
        <p className="rounded-xl bg-[#E8F5E9] px-4 py-3 text-sm font-medium text-[#1B5E20]">
          Semua pemeriksaan ATS lolos. CV kamu aman dibaca mesin.
        </p>
      ) : (
        sortedFailed.map((c) => {
          const s = SEVERITY_STYLE[c.severity];
          return (
            <div key={c.id} className="rounded-xl border border-[rgba(15,43,61,0.09)] bg-white p-3.5">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex-none text-[var(--act-graphite)]" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 8v5M12 16.5v.5M12 3l9 16H3z" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--act-ink)]">{c.label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.className}`}>{s.label}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--act-graphite)]">{c.detail}</p>
                </div>
              </div>
            </div>
          );
        })
      )}

      {passed.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowPassed((v) => !v)}
            className="text-xs font-semibold text-[var(--page-accent,var(--act-blue))] underline underline-offset-2"
          >
            {showPassed ? "Sembunyikan" : `Lihat ${passed.length} pemeriksaan yang lolos`}
          </button>
          {showPassed && (
            <ul className="mt-2 space-y-1.5">
              {passed.map((c) => (
                <li key={c.id} className="flex items-start gap-2 text-xs text-[var(--act-graphite)]">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-3.5 w-3.5 flex-none text-[#1B5E20]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    <span className="font-semibold text-[var(--act-ink)]">{c.label}</span> — {c.detail}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ main card ------------------------------ */

export function CvReportCard({
  state,
  analysis,
  fileName,
}: {
  state: "no_file" | "not_analyzed" | "stale" | "ready";
  analysis: CvAnalysis | null;
  fileName?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run() {
    setError(null);
    startTransition(async () => {
      const res = await analyzeCvAction();
      if (!res.ok) setError(res.error ?? "Analisis gagal.");
    });
  }

  const runButton = (
    <button
      type="button"
      onClick={run}
      disabled={pending}
      className="act-pill inline-flex flex-none items-center gap-2 !text-sm disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending && (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 animate-spin" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {pending ? "Menganalisis…" : analysis ? "Analisis ulang" : "Analisis CV sekarang"}
    </button>
  );

  const headerIcon = (
    <span className="page-accent-chip grid h-11 w-11 flex-none place-items-center rounded-2xl">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 12h4l3 8 4-16 3 8h4" />
      </svg>
    </span>
  );

  if (state === "no_file") {
    return (
      <section className="act-card-2 flex gap-3.5 p-6">
        {headerIcon}
        <div>
          <h2 className="act-heading text-[17px] text-[var(--act-ink)]">Kekuatan CV &amp; cek ATS</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--act-graphite)]">
            Unggah CV di atas untuk mengukur skor ATS dan mendapat masukan konkret perbaikannya.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="act-card-2 overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[rgba(15,43,61,0.07)] p-6">
        <div className="flex min-w-0 gap-3.5">
          {headerIcon}
          <div className="min-w-0">
            <h2 className="act-heading text-[17px] text-[var(--act-ink)]">Kekuatan CV &amp; cek ATS</h2>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-[var(--act-graphite)]">
              {state === "not_analyzed"
                ? `${fileName} siap dianalisis. Kami cek keterbacaan oleh mesin ATS sekaligus menilai kualitas isinya.`
                : state === "stale"
                  ? "CV sudah diganti sejak analisis terakhir. Jalankan ulang untuk hasil terbaru."
                  : `Berdasarkan ${fileName}.`}
            </p>
          </div>
        </div>
        {runButton}
      </div>

      <div className="space-y-5 p-6">
        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {error}
          </p>
        )}

        {state === "stale" && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
            Hasil di bawah masih dari CV versi sebelumnya.
          </p>
        )}

        {analysis && (
          <>
            {/* Skor */}
            <div className="flex flex-wrap items-center gap-8 rounded-2xl border border-[rgba(15,43,61,0.08)] p-5 page-wash-bg">
              <ScoreRing score={analysis.atsScore} caption="Skor ATS" />
              {analysis.review && <ScoreRing score={analysis.review.score} caption="Kekuatan isi" />}
              <div className="min-w-[220px] flex-1 space-y-3">
                {analysis.review ? (
                  <>
                    <p className="text-sm leading-relaxed text-[var(--act-charcoal)]">{analysis.review.verdict}</p>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <DimensionBar label="Dampak" value={analysis.review.dimensions.impact} />
                      <DimensionBar label="Kejelasan" value={analysis.review.dimensions.clarity} />
                      <DimensionBar label="Relevansi" value={analysis.review.dimensions.relevance} />
                      <DimensionBar label="Kredibilitas" value={analysis.review.dimensions.credibility} />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[var(--act-graphite)]">
                    {analysis.reviewError ?? "Review AI belum tersedia."} Skor ATS di samping tetap valid karena dihitung tanpa AI.
                  </p>
                )}
              </div>
            </div>

            {/* Detail ATS */}
            <div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-[var(--act-ink)]">Pemeriksaan ATS</h3>
                <span className="text-xs text-[var(--act-graphite)]">
                  {analysis.ats.passedCount}/{analysis.ats.totalCount} lolos · {analysis.ats.stats.words} kata
                  {analysis.ats.stats.pages ? ` · ${analysis.ats.stats.pages} halaman` : ""}
                </span>
              </div>
              <div className="mt-3">
                <AtsChecklist checks={analysis.ats.checks} />
              </div>
            </div>

            {/* Kekuatan & kelemahan */}
            {analysis.review && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[rgba(15,43,61,0.08)] bg-white p-4">
                  <h3 className="text-sm font-semibold text-[#1B5E20]">Kekuatan</h3>
                  <ul className="mt-2.5 space-y-2">
                    {analysis.review.strengths.length > 0 ? (
                      analysis.review.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-[var(--act-charcoal)]">
                          <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-[#1B5E20]" aria-hidden />
                          {s}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-[var(--act-graphite)]">Belum ada kekuatan menonjol yang terdeteksi.</li>
                    )}
                  </ul>
                </div>
                <div className="rounded-2xl border border-[rgba(15,43,61,0.08)] bg-white p-4">
                  <h3 className="text-sm font-semibold text-[#B45309]">Kelemahan</h3>
                  <ul className="mt-2.5 space-y-2">
                    {analysis.review.weaknesses.length > 0 ? (
                      analysis.review.weaknesses.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-[var(--act-charcoal)]">
                          <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-[#B45309]" aria-hidden />
                          {s}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-[var(--act-graphite)]">Tidak ada catatan kelemahan.</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Langkah perbaikan */}
            {analysis.review && analysis.review.fixes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--act-ink)]">Langkah perbaikan</h3>
                <ol className="mt-3 space-y-2">
                  {analysis.review.fixes.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-[rgba(15,43,61,0.08)] bg-white p-3.5"
                    >
                      <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-[var(--act-onyx)] text-[11px] font-bold text-white">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${PRIORITY_STYLE[f.priority] ?? PRIORITY_STYLE.rendah}`}
                        >
                          {f.priority}
                        </span>
                        <p className="mt-1.5 text-xs leading-relaxed text-[var(--act-charcoal)]">{f.action}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Kata kunci */}
            {analysis.review && analysis.review.keywords.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--act-ink)]">Kata kunci yang terbaca ATS</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {analysis.review.keywords.map((k) => (
                    <span key={k} className="page-accent-chip rounded-md px-2 py-0.5 text-[11px] font-semibold">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[11px] text-[var(--act-graphite)]">
              Dianalisis {new Date(analysis.analyzedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
