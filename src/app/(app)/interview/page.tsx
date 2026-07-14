import Link from "next/link";
import { InterviewSimulator } from "./InterviewSimulator";

export default function InterviewPage() {
  return (
    <div className="act-rise mx-auto max-w-[960px] px-6 py-10 md:py-12">
      <Link
        href="/guides"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--act-graphite)] transition-colors hover:text-[var(--act-ink)]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Panduan
      </Link>

      <section className="mt-6 grid gap-5 lg:grid-cols-12">
        <header className="lg:col-span-7 lg:py-5">
          <span className="studio-section-kicker">Ruang latihan</span>
          <h1 className="act-display mt-3 text-4xl leading-[1.02] md:text-5xl">
            Latih jawabanmu <span className="text-[var(--act-blue)]">dulu.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--act-charcoal)]">
            Pilih bidang, jawab pertanyaan satu per satu, lalu bandingkan dengan contoh jawaban terbaik. Mode demo, jawaban tidak disimpan.
          </p>
        </header>
        <aside className="rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-[#F2FBF6] p-5 lg:col-span-5">
          <span className="studio-section-kicker">Cara pakai</span>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--act-charcoal)]">
            <li><span className="font-semibold text-[var(--act-ink)]">01.</span> Pilih area yang ingin kamu latih.</li>
            <li><span className="font-semibold text-[var(--act-ink)]">02.</span> Jawab dengan struktur STAR.</li>
            <li><span className="font-semibold text-[var(--act-ink)]">03.</span> Bandingkan, lalu ulangi dengan tenang.</li>
          </ol>
        </aside>
      </section>

      <div className="mt-8 rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-white p-4 shadow-[0_16px_32px_-28px_rgba(4,39,24,0.45)] sm:p-6">
        <InterviewSimulator />
      </div>
    </div>
  );
}
