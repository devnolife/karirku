import Link from "next/link";
import { getMockSession, getGoal } from "@/lib/mock/session";
import {
  MOCK_SKILLS,
  MOCK_MILESTONES,
  MOCK_JOBS,
  MOCK_COURSES,
  MOCK_READINESS,
} from "@/lib/mock/data";
import { Kpi, ReadinessCard, PreviewCard, SkillBar } from "../_dash/parts";
import { FreelancerOverview } from "./FreelancerDashboard";
import { CompanyOverview } from "./CompanyDashboard";

export default async function DashboardPage() {
  const session = await getMockSession();
  const role = session.user.role;

  if (role === "freelancer") return <FreelancerOverview />;
  if (role === "company") return <CompanyOverview />;
  return <JobseekerOverview />;
}

async function JobseekerOverview() {
  const session = await getMockSession();
  const goal = (await getGoal()) ?? {
    targetRole: "Frontend Engineer",
    targetTrack: "fulltime" as const,
    targetCity: "Jakarta / Remote",
    weeklyHours: 10,
    budgetIdr: 200_000,
  };

  const firstName = session.user.name.split(" ")[0];
  const r = MOCK_READINESS;
  const bestJob = [...MOCK_JOBS].sort((a, b) => b.matchPct - a.matchPct)[0];
  const current = MOCK_MILESTONES.find((m) => m.status === "in_progress") ?? MOCK_MILESTONES[0];
  const criticalSkills = [...MOCK_SKILLS]
    .filter((s) => s.category === "core")
    .sort((a, b) => b.required - b.current - (a.required - a.current))
    .slice(0, 2);

  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-8 md:px-10">
      {/* Hello + readiness */}
      <section className="grid grid-cols-12 items-center gap-6">
        <div className="col-span-12 lg:col-span-8">
          <span className="act-eyebrow">
            Today · {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
          </span>
          <h1 className="act-display mt-3 text-4xl leading-[1.04] md:text-5xl">
            Halo, <span className="act-sky-text">{firstName}.</span>
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-[var(--act-charcoal)]">
            Goal: <span className="font-semibold text-[var(--act-ink)]">{goal.targetRole}</span>
            {goal.targetCity ? ` · ${goal.targetCity}` : ""} · {goal.weeklyHours} jam/minggu ·{" "}
            {goal.budgetIdr > 0 ? `Rp ${goal.budgetIdr.toLocaleString("id-ID")}/bln` : "course gratis"}
          </p>
          <Link href="/onboarding" className="act-pill-ghost mt-3 -ml-3 !text-[var(--act-blue)]">
            Ubah goal
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <ReadinessCard score={r.score} last={r.lastWeek} />
        </div>
      </section>

      {/* KPI */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Jam minggu ini" value={r.hoursThisWeek} unit="h" caption={`target ${r.hoursTarget}h`} tone="blue" />
        <Kpi label="Milestone selesai" value={r.weeksDone} unit={`/${r.weeksTotal}`} caption="6 minggu total" tone="iris" />
        <Kpi label="Match terbaik" value={bestJob.matchPct} unit="%" caption={`${MOCK_JOBS.length} lowongan`} tone="magenta" />
        <Kpi label="Naik minggu ini" value={r.score - r.lastWeek} unit="pts" caption="readiness" tone="mint" accent />
      </section>

      {/* Preview cards → detail pages */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <PreviewCard href="/skills" kicker="Skill-gap" title="Skill kamu vs target" tone="blue">
          <div className="space-y-4">
            {criticalSkills.map((s) => <SkillBar key={s.name} skill={s} tone="blue" />)}
          </div>
        </PreviewCard>

        <PreviewCard href="/roadmap" kicker="Roadmap 6 minggu" title="Next move kamu" tone="iris">
          <div className="rounded-xl bg-[var(--act-mist)] p-3.5">
            <span className="act-chip act-chip-blue">Minggu {current.week} · in progress</span>
            <p className="mt-2 text-sm font-semibold text-[var(--act-ink)]">{current.title}</p>
            <p className="mt-1 text-xs text-[var(--act-graphite)]">{r.weeksDone} selesai · {r.weeksTotal - r.weeksDone} to go</p>
          </div>
        </PreviewCard>

        <PreviewCard href="/jobs" kicker="Job match" title="Lowongan paling cocok" tone="magenta">
          <div className="flex items-center gap-4">
            <div className="act-display text-4xl text-[var(--act-magenta)]">{bestJob.matchPct}<span className="text-lg">%</span></div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--act-ink)]">{bestJob.title}</p>
              <p className="truncate text-xs text-[var(--act-graphite)]">{bestJob.company} · {bestJob.location}</p>
            </div>
          </div>
        </PreviewCard>

        <PreviewCard href="/learn" kicker="Belajar" title="Kursus prioritas" tone="mint">
          <div className="flex items-center gap-3">
            <span className="act-tile bg-[linear-gradient(140deg,#34d399,#059669)]">{MOCK_COURSES[0].provider.charAt(0)}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--act-ink)]">{MOCK_COURSES[0].title}</p>
              <p className="text-xs text-[var(--act-graphite)]">{MOCK_COURSES[0].provider} · {MOCK_COURSES[0].hours}h</p>
            </div>
          </div>
        </PreviewCard>
      </section>
    </div>
  );
}
