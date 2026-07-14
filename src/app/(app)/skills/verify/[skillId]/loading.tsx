/**
 * Loading state saat kuis di-generate AI (gemma3:27b, ~30-50 detik).
 * Next.js menampilkan ini otomatis (Suspense) selama server component
 * page.tsx menunggu generateSkillQuiz().
 */
export default function VerifyLoading() {
  return (
    <div className="act-rise mx-auto max-w-[800px] px-6 py-16 text-center">
      <div className="rounded-[24px] border border-[rgba(4,39,24,0.1)] bg-[var(--act-sky-50)] p-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_10px_22px_-16px_rgba(4,39,24,0.5)]">
        <span className="inline-block h-7 w-7 animate-spin rounded-full border-[3px] border-[rgba(25,143,56,0.2)] border-t-[var(--act-blue)]" />
      </div>
      <span className="act-eyebrow mt-6 block">Menyiapkan assessment</span>
      <h1 className="act-heading mt-2 text-2xl text-[var(--act-ink)]">
        Menyiapkan kuis…
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-[var(--act-graphite)]">
        AI sedang menyusun soal yang menguji pemahaman praktismu. Ini butuh
        beberapa puluh detik — soal yang berkualitas memang dibuat khusus, bukan
        template.
      </p>
      <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl border border-[rgba(4,39,24,0.07)] bg-white/80" />
        ))}
      </div>
      </div>
    </div>
  );
}
