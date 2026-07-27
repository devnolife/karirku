import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES } from "@/core/content/guides";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) notFound();

  const related = GUIDES.filter(
    (g) => g.slug !== guide.slug && g.category === guide.category,
  ).slice(0, 2);
  const isInterview = guide.category === "Interview";

  return (
    <article className="act-rise mx-auto max-w-[820px] px-6 py-10 md:py-12">
      <Link
        href="/guides"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--act-graphite)] transition-colors hover:text-[var(--act-ink)]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Semua panduan
      </Link>

      <header className="mt-6 border-b border-[rgba(4,39,24,0.08)] pb-8">
        <div className="flex items-center gap-2.5">
          <span className="act-chip act-chip-iris">{guide.category}</span>
          <span className="act-kicker !text-[11px]">{guide.readMins} menit baca</span>
        </div>
        <h1 className="act-display mt-4 text-4xl leading-[1.06] md:text-5xl">{guide.title}</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-[var(--act-charcoal)]">{guide.summary}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {guide.externalUrl && (
            <a
              href={guide.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="act-pill group !text-sm"
            >
              {guide.externalLabel ?? "Buka situs"}
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M7 17L17 7M17 7H8M17 7v9" />
              </svg>
            </a>
          )}
          {isInterview && (
            <Link href="/interview" className="act-pill-ghost !text-sm">
              Mulai latihan interview
            </Link>
          )}
        </div>
      </header>

      <section aria-labelledby="guide-steps" className="mt-10">
        <div className="mb-4 flex items-baseline justify-between"><h2 id="guide-steps" className="act-heading text-2xl text-[var(--act-ink)]">Langkah praktis</h2><span className="studio-section-kicker">{guide.steps.length} langkah</span></div>
      <ol className="space-y-3">
        {guide.steps.map((s, i) => (
          <li key={s.title} className="flex gap-4 rounded-[20px] border border-[rgba(4,39,24,0.08)] bg-white p-5 shadow-[0_12px_24px_-26px_rgba(4,39,24,0.42)]">
            <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#D4E5CD] font-[family-name:var(--font-onest-v)] text-xs font-bold text-[var(--act-onyx)]">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="act-heading text-lg text-[var(--act-ink)]">{s.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--act-charcoal)]">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      </section>

      {/* Tips */}
      {guide.tips && guide.tips.length > 0 && (
        <aside className="mt-8 rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-[#F2FBF6] p-6">
          <span className="act-kicker">Tips cepat</span>
          <ul className="mt-3 space-y-2.5">
            {guide.tips.map((t) => (
              <li key={t} className="flex gap-2.5 text-sm leading-relaxed text-[var(--act-charcoal)]">
                <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 flex-none text-[var(--act-blue)]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </aside>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-10">
          <span className="act-kicker">Panduan terkait</span>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <Link key={r.slug} href={`/guides/${r.slug}`} className="block rounded-[20px] border border-[rgba(4,39,24,0.08)] bg-[#D2DDEA] p-5 transition-colors hover:bg-[#D4E5CD]">
                <h4 className="text-sm font-semibold text-[var(--act-ink)]">{r.title}</h4>
                <p className="mt-1 text-xs text-[var(--act-graphite)]">{r.readMins} menit · {r.category}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
