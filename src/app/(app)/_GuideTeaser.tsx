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
    <section className="grid grid-cols-12 gap-8">
      <div className="col-span-12 md:col-span-4">
        <div className="flex items-center gap-2.5">
          <span className="act-numbadge act-num-mint">★</span>
          <span className="act-kicker">Panduan</span>
        </div>
        <h2 className="act-display mt-4 text-3xl leading-[1.05] md:text-4xl">
          Belajar <span className="text-[#059669]">langkahnya.</span>
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
            <Link key={it.href} href={it.href} className="act-card-2 act-rowhover block p-5">
              <h4 className="text-sm font-semibold text-[var(--act-ink)]">{it.title}</h4>
              <p className="mt-1 text-xs leading-relaxed text-[var(--act-graphite)]">{it.desc}</p>
            </Link>
          ))}
          {showInterview && (
            <Link
              href="/interview"
              className="act-card-2 act-wash-petal-soft act-rowhover flex items-center justify-between border-[rgba(242,0,202,0.16)] p-5 sm:col-span-2"
            >
              <div>
                <h4 className="text-sm font-semibold text-[var(--act-ink)]">Latihan interview</h4>
                <p className="mt-1 text-xs text-[var(--act-graphite)]">Simulasi tanya-jawab + contoh jawaban terbaik.</p>
              </div>
              <svg viewBox="0 0 24 24" className="h-5 w-5 flex-none text-[var(--act-magenta)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
