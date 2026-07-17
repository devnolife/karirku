import Link from "next/link";

export type TeaserLink = { href: string; title: string; desc: string };

export function GuideTeaser({
  items,
  showInterview = true,
}: {
  items: TeaserLink[];
  showInterview?: boolean;
}) {
  return (
    <section className="grid grid-cols-12 gap-8 border-t border-[rgba(4,39,24,0.08)] pt-8">
      <div className="col-span-12 md:col-span-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-sm text-amber-700">★</span>
          <span className="studio-section-kicker">Panduan</span>
        </div>
        <h2 className="act-display mt-4 text-3xl leading-[1.05] md:text-4xl">
          Belajar <span className="text-[var(--act-blue)]">langkahnya.</span>
        </h2>
        <p className="mt-3 text-sm text-[var(--act-graphite)]">
          Arahan praktis biar nggak bingung mulai dari mana.
        </p>
        <Link href="/guides" className="act-pill-ghost mt-3 -ml-3 !text-[var(--act-blue)]">
          Semua panduan
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <div className="col-span-12 md:col-span-8 md:col-start-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="block rounded-[20px] border border-[rgba(4,39,24,0.08)] bg-white p-5 shadow-[0_12px_24px_-26px_rgba(4,39,24,0.42)] transition-colors hover:bg-brand-50">
              <h4 className="text-sm font-semibold text-[var(--act-ink)]">{it.title}</h4>
              <p className="mt-1 text-xs leading-relaxed text-[var(--act-graphite)]">{it.desc}</p>
            </Link>
          ))}
          {showInterview && (
            <Link
              href="/interview"
              className="flex items-center justify-between rounded-[20px] border border-[rgba(4,39,24,0.08)] bg-[var(--act-wash-blue)] p-5 transition-colors hover:bg-[var(--act-wash-sky)] sm:col-span-2"
            >
              <div>
                <h4 className="text-sm font-semibold text-[var(--act-ink)]">Latihan interview</h4>
                <p className="mt-1 text-xs text-[var(--act-graphite)]">Simulasi tanya-jawab + contoh jawaban terbaik.</p>
              </div>
              <svg viewBox="0 0 24 24" className="h-5 w-5 flex-none text-[var(--act-iris)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
