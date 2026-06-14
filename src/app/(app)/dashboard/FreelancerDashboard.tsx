import Link from "next/link";
import { getMockSession, getGoal } from "@/lib/mock/session";
import {
  MOCK_FREELANCER,
  MOCK_PROJECTS,
  MOCK_PROPOSALS,
} from "@/lib/mock/data";
import { Kpi, PreviewCard } from "../_dash/parts";

export async function FreelancerOverview() {
  const session = await getMockSession();
  const goal = await getGoal();
  const firstName = session.user.name.split(" ")[0];
  const f = MOCK_FREELANCER;
  const won = MOCK_PROPOSALS.filter((p) => p.status === "won").length;
  const topProject = [...MOCK_PROJECTS].sort((a, b) => b.matchPct - a.matchPct)[0];

  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-8 md:px-10">
      {/* Hello + profile */}
      <section className="grid grid-cols-12 items-center gap-6">
        <div className="col-span-12 lg:col-span-8">
          <span className="act-eyebrow">Overview · Freelancer</span>
          <h1 className="act-display mt-3 text-4xl leading-[1.04] md:text-5xl">
            Halo, <span className="act-sky-text">{firstName}.</span>
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-[var(--act-charcoal)]">
            {goal?.targetRole ? `${goal.targetRole} · ` : ""}rate Rp {(f.hourlyRateIdr / 1000).toFixed(0)}k/jam · ⭐ {f.rating} ({f.reviews} ulasan)
          </p>
          <Link href="/projects" className="act-pill-ghost mt-3 -ml-3 !text-[var(--act-blue)]">
            Lihat semua project
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="act-card-2 act-wash-sky-soft border-[rgba(0,152,242,0.18)] p-5">
            <span className="act-kicker">Kesiapan profil</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="act-display text-5xl text-[var(--act-blue)]">{f.readiness}</span>
              <span className="text-xl font-semibold text-[var(--act-graphite)]">%</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[rgba(15,23,42,0.08)] pt-4">
              <MiniStat label="Project selesai" value={`${f.completedProjects}`} />
              <MiniStat label="Response rate" value={`${f.responseRate}%`} />
            </div>
          </div>
        </div>
      </section>

      {/* KPI */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Total earnings" value={`Rp ${(f.earningsIdr / 1_000_000).toFixed(1)} jt`} caption="lifetime" tone="blue" />
        <Kpi label="Proposal won" value={won} caption={`dari ${MOCK_PROPOSALS.length} kirim`} tone="mint" />
        <Kpi label="Match terbaik" value={`${topProject.matchPct}%`} caption={`${MOCK_PROJECTS.length} project baru`} tone="iris" />
        <Kpi label="Rating" value={f.rating} caption={`${f.reviews} ulasan`} tone="magenta" />
      </section>

      {/* Preview cards */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <PreviewCard href="/projects" kicker="Project match" title="Project paling cocok" tone="blue">
          <div className="flex items-center gap-4">
            <div className="act-display text-4xl text-[var(--act-blue)]">{topProject.matchPct}<span className="text-lg">%</span></div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--act-ink)]">{topProject.title}</p>
              <p className="truncate text-xs text-[var(--act-graphite)]">{topProject.client} · {topProject.budget}</p>
            </div>
          </div>
        </PreviewCard>
        <PreviewCard href="/proposals" kicker="Apply" title="Proposal & portofolio" tone="iris">
          <div className="rounded-xl bg-[var(--act-mist)] p-3.5">
            <p className="text-sm text-[var(--act-charcoal)]">
              <span className="font-semibold text-[var(--act-ink)]">{won} won</span> · {MOCK_PROPOSALS.length} proposal terkirim
            </p>
            <p className="mt-1 text-xs text-[var(--act-graphite)]">Generate proposal AI & kelola portofolio.</p>
          </div>
        </PreviewCard>
      </section>
    </div>
  );
}

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-lg font-bold text-[var(--act-ink)]">{value}</div>
      <div className="text-[11px] text-[var(--act-graphite)]">{label}</div>
    </div>
  );
}
