import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  getCompanyStats,
  getCompanyCandidates,
  CANDIDATE_STAGES,
} from "@/server/queries/company";
import { Kpi } from "../_dash/parts";

export async function CompanyOverview() {
  const user = await requireUser();
  const [c, candidates] = await Promise.all([
    getCompanyStats(user.id),
    getCompanyCandidates(user.id),
  ]);
  const topCandidates = candidates.slice(0, 4);

  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-8 md:px-10 lg:py-10">
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch lg:gap-8">
        <div className="flex flex-col justify-center lg:col-span-7 lg:py-5">
          <span className="act-eyebrow text-[var(--act-blue)]">Hiring workspace</span>
          <h1 className="act-display mt-3 text-4xl leading-[1.02] tracking-[-0.045em] text-[var(--act-onyx)] md:text-5xl">
            Hai, <span className="act-script whitespace-nowrap text-[1.08em] text-[var(--act-blue)]">{user.name}</span>.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--act-charcoal)]">
            {c.openJobs} lowongan aktif untuk dikelola, dengan {c.interviews} interview terjadwal.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/company/jobs/new"
              className="group inline-flex items-center gap-2 rounded-full bg-[#042718] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#198F38]"
            >
              Posting lowongan
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </Link>
            <Link
              href="/company/candidates"
              className="inline-flex items-center rounded-full border border-[rgba(4,39,24,0.14)] bg-white px-5 py-3 text-sm font-semibold text-[#042718] transition-colors hover:bg-[#F2FBF6]"
            >
              Lihat kandidat
            </Link>
          </div>
        </div>

        <aside className="rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-[#EBE3D2] p-6 sm:p-7 lg:col-span-5">
          <span className="act-eyebrow text-[#042718]">Candidate health</span>
          <div className="act-display mt-3 text-5xl tracking-[-0.05em] text-[#042718]">
            {c.totalCandidates.toLocaleString("id-ID")}
          </div>
          <p className="mt-1 text-sm font-medium text-[rgba(4,39,24,0.7)]">kandidat dalam proses hiring</p>
          <div className="mt-6 grid grid-cols-2 border-y border-[rgba(4,39,24,0.12)] py-4">
            <div className="border-r border-[rgba(4,39,24,0.12)] pr-4">
              <div className="act-display text-2xl text-[#042718]">{c.interviews}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(4,39,24,0.62)]">Interview</div>
            </div>
            <div className="pl-4">
              <div className="act-display text-2xl text-[#042718]">{c.offers}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(4,39,24,0.62)]">Offer</div>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-[rgba(4,39,24,0.76)]">
            Prioritaskan kandidat yang sudah siap masuk ke tahap percakapan dan keputusan akhir.
          </p>
        </aside>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-6">
        <div className="rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-[#F2FBF6] p-5 sm:p-6 lg:col-span-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="act-eyebrow text-[var(--act-blue)]">Hiring pulse</span>
              <h2 className="act-display mt-2 text-2xl tracking-[-0.035em] text-[#042718]">ATS pipeline</h2>
            </div>
            <Link href="/company/candidates" className="mb-0.5 text-xs font-semibold text-[#198F38] hover:underline">
              Lihat detail
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CANDIDATE_STAGES.map((st, index) => {
              const count = candidates.filter((candidate) => candidate.stage === st.key).length;
              const stageClass = ["bg-white", "bg-[#F7FBF7]", "bg-[#E6F1E7]", "bg-[#D4E5CD]"][index];
              return (
                <div key={st.key} className={`min-h-[116px] rounded-[18px] border border-[rgba(4,39,24,0.08)] p-4 ${stageClass}`}>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[rgba(4,39,24,0.58)]">{st.label}</span>
                  <div className="act-display mt-5 text-3xl tracking-[-0.045em] text-[#042718]">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-white lg:col-span-2">
          <div className="flex items-end justify-between border-b border-[rgba(4,39,24,0.08)] px-5 py-5 sm:px-6">
            <div>
              <span className="act-eyebrow text-[var(--act-blue)]">Shortlist</span>
              <h2 className="act-display mt-2 text-xl tracking-[-0.03em] text-[#042718]">Top kandidat</h2>
            </div>
            <Link href="/company/candidates" className="text-xs font-semibold text-[#198F38] hover:underline">Semua</Link>
          </div>
          {topCandidates.length === 0 ? (
            <p className="px-5 py-8 text-sm text-[var(--act-graphite)] sm:px-6">Belum ada kandidat.</p>
          ) : (
            <ul className="divide-y divide-[rgba(4,39,24,0.08)]">
              {topCandidates.map((candidate) => (
                <li key={candidate.id} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
                  <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#042718] text-xs font-semibold text-white">
                    {candidate.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-[#042718]">{candidate.name}</h3>
                    <p className="truncate text-xs text-[var(--act-graphite)]">{candidate.appliedFor}</p>
                  </div>
                  <span className="whitespace-nowrap rounded-full bg-[#D2DDEA] px-2.5 py-1 text-[11px] font-bold text-[#042718]">
                    Match {candidate.matchPct}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Kpi label="Lowongan aktif" value={c.openJobs} caption="sedang hiring" tone="blue" />
        <Kpi label="Interview" value={c.interviews} caption="terjadwal" tone="magenta" />
        <Kpi label="Offer" value={c.offers} caption="dikirim" tone="mint" />
      </section>
    </div>
  );
}
