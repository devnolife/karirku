"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { importCvToProfileAction } from "./actions";
import type { CvField, CvImportResult, FieldConflict } from "@/server/queries/cv-import";

type Success = Extract<CvImportResult, { ok: true }>;

/* ------------------------------- icons ------------------------------- */

const Ico = {
  Doc: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
  Spark: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
    </svg>
  ),
  Split: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 3v6a3 3 0 003 3h6M18 3v6a3 3 0 01-3 3H9M12 12v9" />
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 11A8 8 0 105.6 6.6M20 4v5h-5" />
    </svg>
  ),
  Arrow: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  ),
};

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 animate-spin" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------ skeleton ------------------------------ */

function ReadingSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Sedang membaca CV">
      <div className="rounded-2xl border border-[rgba(15,43,61,0.08)] bg-white p-4">
        <div className="h-3 w-40 animate-pulse rounded bg-[rgba(15,43,61,0.09)]" />
        <div className="mt-3.5 grid gap-3.5 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-2 w-16 animate-pulse rounded bg-[rgba(15,43,61,0.07)]" />
              <div className="h-3 w-full animate-pulse rounded bg-[rgba(15,43,61,0.07)]" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[64, 82, 56, 92, 70].map((w, i) => (
          <div key={i} className="h-6 animate-pulse rounded-lg bg-[rgba(15,43,61,0.07)]" style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ value cell ------------------------------ */

/** Nilai panjang (mis. ringkasan) bisa dibentangkan agar tidak terpotong. */
function FieldValue({ value }: { value: string }) {
  const [open, setOpen] = useState(false);
  const long = value.length > 90;

  if (!long) {
    return <p className="text-[13px] leading-snug text-[var(--act-charcoal)]">{value}</p>;
  }
  return (
    <div>
      <p className={`text-[13px] leading-snug text-[var(--act-charcoal)] ${open ? "" : "line-clamp-2"}`}>
        {value}
      </p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-0.5 text-[11px] font-semibold text-[var(--page-accent,var(--act-blue))] hover:underline"
      >
        {open ? "Ringkas" : "Selengkapnya"}
      </button>
    </div>
  );
}

/* ------------------------------ main card ------------------------------ */

/**
 * Tombol + hasil impor data profil dari CV.
 *
 * Alur: isi field kosong otomatis → tampilkan konflik → user pilih mana yang
 * ingin ditimpa. Tidak ada data user yang hilang tanpa persetujuan.
 */
export function CvImportCard({
  hasFile,
  autoRun = false,
}: {
  hasFile: boolean;
  /** True tepat setelah user mengunggah CV — impor langsung dijalankan. */
  autoRun?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<Success | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<Set<CvField>>(new Set());
  const started = useRef(false);

  function run(overwrite: CvField[] = []) {
    setError(null);
    startTransition(async () => {
      const res = await importCvToProfileAction(overwrite);
      if (res.ok) {
        setResult(res);
        setPicked(new Set());
      } else {
        setError(res.error);
      }
    });
  }

  // Jalan sekali saat halaman dibuka setelah unggah CV baru.
  useEffect(() => {
    if (autoRun && hasFile && !started.current) {
      started.current = true;
      run();
    }
  }, [autoRun, hasFile]);

  function toggle(field: CvField) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  }

  if (!hasFile) return null;

  const nothingChanged =
    result && result.applied.length === 0 && result.addedSkills.length === 0;
  const firstRun = pending && !result;

  return (
    <section className="act-card-2 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[rgba(15,43,61,0.07)] p-6">
        <div className="flex min-w-0 gap-3.5">
          <span className="page-accent-chip grid h-11 w-11 flex-none place-items-center rounded-2xl">
            <span className="h-5 w-5">
              <Ico.Doc />
            </span>
          </span>
          <div className="min-w-0">
            <h2 className="act-heading text-[17px] text-[var(--act-ink)]">Isi profil dari CV</h2>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-[var(--act-graphite)]">
              Field yang masih kosong diisi otomatis dari CV. Data yang sudah kamu isi sendiri
              tidak akan ditimpa tanpa persetujuan.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => run()}
          disabled={pending}
          className="act-pill inline-flex flex-none items-center gap-2 !text-sm disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? (
            <>
              <Spinner />
              Membaca CV…
            </>
          ) : result ? (
            <>
              <span className="h-3.5 w-3.5">
                <Ico.Refresh />
              </span>
              Baca ulang
            </>
          ) : (
            "Isi otomatis dari CV"
          )}
        </button>
      </div>

      <div className="space-y-4 p-6">
        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {error}
          </p>
        )}

        {firstRun && <ReadingSkeleton />}

        {result && (
          <>
            {result.partial && result.note && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium leading-relaxed text-amber-900">
                {result.note}. Headline, ringkasan, dan skill perlu diisi manual atau coba lagi nanti.
              </p>
            )}

            {nothingChanged && result.conflicts.length === 0 && (
              <div className="flex items-center gap-3 rounded-xl bg-[#EDF1F4] px-4 py-3.5">
                <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-white text-[#1B5E20]">
                  <span className="h-3.5 w-3.5">
                    <Ico.Check />
                  </span>
                </span>
                <p className="text-sm text-[var(--act-charcoal)]">
                  Profil kamu sudah lengkap — tidak ada yang perlu diisi dari CV.
                </p>
              </div>
            )}

            {/* Field yang terisi otomatis */}
            {result.applied.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-[rgba(27,94,32,0.2)]">
                <div className="flex items-center gap-2.5 bg-[#E8F5E9] px-4 py-2.5">
                  <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-[#1B5E20] text-white">
                    <span className="h-3 w-3">
                      <Ico.Check />
                    </span>
                  </span>
                  <h3 className="text-[13px] font-bold text-[#1B5E20]">
                    {result.applied.length} field terisi dari CV
                  </h3>
                </div>
                <dl className="grid gap-x-8 gap-y-4 bg-white p-4 sm:grid-cols-2">
                  {result.applied.map((a) => (
                    <div key={a.field} className="min-w-0">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--act-graphite)]">
                        {a.label}
                      </dt>
                      <dd className="mt-1">
                        <FieldValue value={a.value} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Skill baru */}
            {result.addedSkills.length > 0 && (
              <div className="rounded-2xl border border-[rgba(15,43,61,0.08)] bg-white p-4">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 flex-none text-[var(--page-accent,var(--act-blue))]">
                    <Ico.Spark />
                  </span>
                  <h3 className="text-[13px] font-bold text-[var(--act-ink)]">
                    {result.addedSkills.length} skill baru ditambahkan
                  </h3>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {result.addedSkills.map((s) => (
                    <span
                      key={s}
                      className="page-accent-chip rounded-lg px-2.5 py-1 text-[11.5px] font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                {result.keptSkills.length > 0 && (
                  <p className="mt-2.5 text-[11px] text-[var(--act-graphite)]">
                    {result.keptSkills.length} skill lain di CV sudah ada di profilmu.
                  </p>
                )}
              </div>
            )}

            {/* Konflik — butuh keputusan user */}
            {result.conflicts.length > 0 && (
              <ConflictList
                conflicts={result.conflicts}
                picked={picked}
                onToggle={toggle}
                pending={pending}
                onApply={() => run([...picked])}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}

/* ------------------------------ conflicts ------------------------------ */

function ConflictList({
  conflicts,
  picked,
  onToggle,
  pending,
  onApply,
}: {
  conflicts: FieldConflict[];
  picked: Set<CvField>;
  onToggle: (f: CvField) => void;
  pending: boolean;
  onApply: () => void;
}) {
  const allPicked = picked.size === conflicts.length;

  function toggleAll() {
    for (const c of conflicts) {
      const has = picked.has(c.field);
      // Saat semua sudah dipilih → lepas semua; selain itu → pilih yang belum.
      if (allPicked ? has : !has) onToggle(c.field);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-200">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-50 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-[#B45309] text-white">
            <span className="h-3.5 w-3.5">
              <Ico.Split />
            </span>
          </span>
          <div>
            <h3 className="text-[13px] font-bold text-[#8A5A00]">
              {conflicts.length} field berbeda dengan CV
            </h3>
            <p className="text-[11px] text-[#A06B18]">Centang yang ingin diganti versi CV.</p>
          </div>
        </div>
        {conflicts.length > 1 && (
          <button
            type="button"
            onClick={toggleAll}
            className="text-[11px] font-bold text-[#8A5A00] underline underline-offset-2"
          >
            {allPicked ? "Batal semua" : "Pilih semua"}
          </button>
        )}
      </div>

      <div className="bg-white p-4">
        <ul className="space-y-2">
          {conflicts.map((c) => {
            const on = picked.has(c.field);
            return (
              <li key={c.field}>
                <label
                  className={
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors " +
                    (on
                      ? "border-[var(--page-accent,var(--act-blue))] bg-[var(--page-tint,#EAF3FC)]"
                      : "border-[rgba(15,43,61,0.1)] bg-white hover:border-[rgba(15,43,61,0.22)]")
                  }
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => onToggle(c.field)}
                    className="mt-0.5 h-4 w-4 flex-none accent-[var(--page-accent,var(--act-blue))]"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--act-graphite)]">
                      {c.label}
                    </span>
                    <div className="mt-2 grid items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr]">
                      <div className="min-w-0 rounded-lg border border-[rgba(15,43,61,0.08)] bg-[#F6F8FA] px-3 py-2">
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--act-graphite)]">
                          Sekarang
                        </span>
                        <p className="mt-0.5 break-words text-[13px] leading-snug text-[var(--act-charcoal)]">
                          {c.current}
                        </p>
                      </div>
                      <span className="hidden h-4 w-4 self-center text-[var(--act-stone)] sm:block" aria-hidden>
                        <Ico.Arrow />
                      </span>
                      <div className="min-w-0 rounded-lg border border-[rgba(13,71,161,0.16)] bg-[var(--page-tint,#EAF3FC)] px-3 py-2">
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--page-accent,var(--act-blue))]">
                          Dari CV
                        </span>
                        <p className="mt-0.5 break-words text-[13px] leading-snug text-[var(--act-charcoal)]">
                          {c.fromCv}
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={onApply}
          disabled={pending || picked.size === 0}
          className="act-pill mt-3 inline-flex items-center gap-2 !text-sm disabled:cursor-not-allowed disabled:opacity-45"
        >
          {pending && <Spinner />}
          {pending
            ? "Menerapkan…"
            : picked.size === 0
              ? "Pilih field dulu"
              : `Terapkan ${picked.size} perubahan`}
        </button>
      </div>
    </div>
  );
}
