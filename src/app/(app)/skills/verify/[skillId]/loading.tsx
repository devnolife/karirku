/**
 * Loading state saat kuis di-generate AI (gemma3:27b, ~30-50 detik).
 * Next.js menampilkan ini otomatis (Suspense) selama server component
 * page.tsx menunggu generateSkillQuiz().
 */
export default function VerifyLoading() {
  return (
    <div className="act-rise mx-auto max-w-[800px] px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center">
        <span className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-[rgba(0,152,242,0.2)] border-t-[var(--act-blue)]" />
      </div>
      <h1 className="act-heading mt-6 text-2xl text-[var(--act-ink)]">
        Menyiapkan kuis…
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-[var(--act-graphite)]">
        AI sedang menyusun soal yang menguji pemahaman praktismu. Ini butuh
        beberapa puluh detik — soal yang berkualitas memang dibuat khusus, bukan
        template.
      </p>
      <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="act-card-2 h-14 animate-pulse bg-[var(--act-mist)]" />
        ))}
      </div>
    </div>
  );
}
