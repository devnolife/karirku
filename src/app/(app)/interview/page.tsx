import Link from "next/link";
import { InterviewSimulator } from "./InterviewSimulator";

export default function InterviewPage() {
  return (
    <div className="act-rise mx-auto max-w-[860px] px-6 py-12">
      <Link
        href="/guides"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--act-graphite)] transition-colors hover:text-[var(--act-ink)]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Panduan
      </Link>

      <header className="mt-6">
        <span className="act-eyebrow">Latihan interview</span>
        <h1 className="act-display mt-3 text-4xl leading-[1.05] md:text-5xl">
          Latih jawabanmu <span className="act-sky-text">dulu.</span>
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--act-charcoal)]">
          Pilih bidang, jawab pertanyaan satu per satu, lalu bandingkan dengan
          contoh jawaban terbaik. Mode demo — jawaban tidak disimpan.
        </p>
      </header>

      <div className="mt-8">
        <InterviewSimulator />
      </div>
    </div>
  );
}
