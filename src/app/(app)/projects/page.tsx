import Link from "next/link";
import { MOCK_PROJECTS } from "@/lib/mock/data";

export default function ProjectsPage() {
  const projects = MOCK_PROJECTS;
  return (
    <div className="act-rise mx-auto max-w-[1400px] space-y-8 px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="act-eyebrow">Freelancer · Projects</span>
          <h1 className="act-display mt-3 text-4xl leading-[1.05] md:text-5xl">
            Project <span className="act-sky-text">match.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--act-graphite)]">
            Project freelance yang cocok dengan skill & rate kamu. Data ilustratif (mode demo).
          </p>
        </div>
        <span className="act-chip act-chip-blue">{projects.length} project baru</span>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {projects.map((p) => {
          const matchClass = p.matchPct >= 85 ? "text-[var(--act-magenta)]" : p.matchPct >= 75 ? "text-[var(--act-iris)]" : "text-[var(--act-graphite)]";
          return (
            <div key={p.id} className="act-card-2 act-rail act-rail-blue flex flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="act-heading text-lg text-[var(--act-ink)]">{p.title}</h3>
                  <p className="mt-1 text-sm text-[var(--act-graphite)]">
                    <span className="font-semibold text-[var(--act-charcoal)]">{p.client}</span> · {p.type}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`act-display text-3xl ${matchClass}`}>{p.matchPct}</div>
                  <div className="act-kicker !text-[10px]">match</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.skills.map((s) => (
                  <span key={s} className="rounded-md bg-[rgba(0,152,242,0.08)] px-2 py-0.5 text-[11px] font-semibold text-[var(--act-blue)]">{s}</span>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[rgba(15,23,42,0.07)] pt-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--act-ink)]">{p.budget}</p>
                  <p className="text-xs text-[var(--act-graphite)]">{p.duration} · {p.posted}</p>
                </div>
                <button className="act-pill group !text-sm">
                  Buat proposal
                  <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-2">
        <Link href="/dashboard" className="act-pill-ghost !text-sm">Kembali ke dashboard</Link>
      </div>
    </div>
  );
}
