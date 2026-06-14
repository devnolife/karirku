import Link from "next/link";
import { getMockSession } from "@/lib/mock/session";
import {
  MOCK_COMPANY,
  MOCK_CANDIDATES,
  CANDIDATE_STAGES,
  type CandidateStage,
} from "@/lib/mock/data";
import { Kpi } from "../_dash/parts";

export async function CompanyOverview() {
  const session = await getMockSession();
  const c = MOCK_COMPANY;
  const byStage = (s: CandidateStage) => MOCK_CANDIDATES.filter((k) => k.stage === s);
  const topCandidates = [...MOCK_CANDIDATES].sort((a, b) => b.matchPct - a.matchPct).slice(0, 4);

  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-8 md:px-10">
      {/* Hello + profile */}
      <section className="grid grid-cols-12 items-center gap-6">
        <div className="col-span-12 lg:col-span-8">
          <span className="act-eyebrow">Overview · Company</span>
          <h1 className="act-display mt-3 text-4xl leading-[1.04] md:text-5xl">
            Hai, <span className="act-sky-text">{session.user.name}.</span>
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-[var(--act-charcoal)]">
            {c.openJobs} lowongan aktif · {c.totalCandidates} kandidat · {c.interviews} interview terjadwal.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/company/jobs" className="act-pill group !text-sm">
              Posting lowongan
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </Link>
            <Link href="/company/candidates" className="act-pill-ghost !text-sm">Lihat kandidat</Link>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="act-card-2 act-wash-petal-soft border-[rgba(242,0,202,0.16)] p-5">
            <span className="act-kicker">Profil dilihat (30 hari)</span>
            <div className="act-display mt-2 text-5xl text-[var(--act-magenta)]">{c.profileViews.toLocaleString("id-ID")}</div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[rgba(15,23,42,0.08)] pt-4">
              <MiniStat label="Hires" value={`${c.hires}`} />
              <MiniStat label="Interview" value={`${c.interviews}`} />
            </div>
          </div>
        </div>
      </section>

      {/* KPI */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Lowongan aktif" value={c.openJobs} caption="sedang hiring" tone="blue" />
        <Kpi label="Total kandidat" value={c.totalCandidates} caption="semua lowongan" tone="iris" />
        <Kpi label="Interview" value={c.interviews} caption="terjadwal" tone="magenta" />
        <Kpi label="Hires" value={c.hires} caption="bulan ini" tone="mint" />
      </section>

      {/* Pipeline + top candidates */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="act-kicker">ATS pipeline</span>
            <Link href="/company/candidates" className="text-xs font-semibold text-[var(--act-blue)] hover:underline">Detail</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CANDIDATE_STAGES.map((st) => {
              const items = byStage(st.key);
              return (
                <div key={st.key} className="act-card-2 p-4">
                  <span className="act-kicker !text-[11px]">{st.label}</span>
                  <div className="act-display mt-1 text-2xl text-[var(--act-ink)]">{items.length}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="act-card-2 overflow-hidden lg:col-span-2">
          <div className="border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
            <span className="act-kicker">Top kandidat (AI)</span>
          </div>
          <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
            {topCandidates.map((k) => (
              <li key={k.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[var(--act-onyx)] text-xs font-semibold text-white">
                  {k.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-semibold text-[var(--act-ink)]">{k.name}</h4>
                  <p className="truncate text-xs text-[var(--act-graphite)]">{k.appliedFor}</p>
                </div>
                <span className="text-sm font-bold text-[var(--act-magenta)]">{k.matchPct}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-lg font-bold text-[var(--act-ink)]">{value}</div>
      <div className="text-[11px] text-[var(--act-graphite)]">{label}</div>
    </div>
  );
}
