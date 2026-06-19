import Link from "next/link";
import { getSession, requireUser } from "@/lib/auth";
import { getActiveGoal } from "@/server/queries/goal";
import { getReadiness } from "@/server/queries/readiness";
import { getSkillGap } from "@/server/queries/skills";
import { getRoadmap } from "@/server/queries/roadmap";
import { getJobMatches } from "@/server/queries/jobs";
import { getRecommendedCourses } from "@/server/queries/courses";
import { Kpi, ReadinessCard, PreviewCard, SkillBar } from "../_dash/parts";
import { FreelancerOverview } from "./FreelancerDashboard";
import { CompanyOverview } from "./CompanyDashboard";

export default async function DashboardPage() {
  const session = await getSession();
  const role = session.user.role;

  if (role === "freelancer") return <FreelancerOverview />;
  if (role === "company") return <CompanyOverview />;
  return <JobseekerOverview />;
}

async function JobseekerOverview() {
  const user = await requireUser();
  const [goal, r, gap, roadmap, jobs, courses] = await Promise.all([
    getActiveGoal(user.id),
    getReadiness(user.id),
    getSkillGap(user.id),
    getRoadmap(user.id),
    getJobMatches(user.id, 1),
    getRecommendedCourses(user.id, 1),
  ]);

  const firstName = user.name.split(" ")[0];
  const bestJob = jobs[0] ?? null;
  const current = roadmap.current;
  const criticalSkills = [...gap.skills]
    .filter((s) => s.category === "core")
    .sort((a, b) => b.required - b.current - (a.required - a.current))
    .slice(0, 2);
  const topCourse = courses[0] ?? null;

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
          {goal ? (
            <p className="mt-3 max-w-xl text-[15px] text-[var(--act-charcoal)]">
              Goal: <span className="font-semibold text-[var(--act-ink)]">{goal.targetRole}</span>
              {goal.targetCity ? ` · ${goal.targetCity}` : ""} · {goal.weeklyHours} jam/minggu ·{" "}
              {goal.budgetIdr > 0 ? `Rp ${goal.budgetIdr.toLocaleString("id-ID")}/bln` : "course gratis"}
            </p>
          ) : (
            <p className="mt-3 max-w-xl text-[15px] text-[var(--act-charcoal)]">
              Belum ada goal. Atur target role agar dashboard menyesuaikan.
            </p>
          )}
          <Link href="/onboarding" className="act-pill-ghost mt-3 -ml-3 !text-[var(--act-blue)]">
            {goal ? "Ubah goal" : "Atur goal"}
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
        <Kpi label="Milestone selesai" value={r.weeksDone} unit={`/${r.weeksTotal}`} caption={`${r.weeksTotal} minggu total`} tone="iris" />
        <Kpi label="Match terbaik" value={bestJob?.matchPct ?? 0} unit="%" caption={bestJob ? bestJob.company : "belum ada"} tone="magenta" />
        <Kpi label="Coverage skill" value={gap.coveragePct} unit="%" caption="vs role target" tone="mint" />
      </section>

      {/* Preview cards → detail pages */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <PreviewCard href="/skills" kicker="Skill-gap" title="Skill kamu vs target" tone="blue">
          {criticalSkills.length > 0 ? (
            <div className="space-y-4">
              {criticalSkills.map((s) => <SkillBar key={s.name} skill={s} tone="blue" />)}
            </div>
          ) : (
            <p className="text-sm text-[var(--act-graphite)]">Belum ada skill-gap. Atur goal dulu.</p>
          )}
        </PreviewCard>

        <PreviewCard href="/roadmap" kicker="Roadmap" title="Next move kamu" tone="iris">
          {current ? (
            <div className="rounded-xl bg-[var(--act-mist)] p-3.5">
              <span className="act-chip act-chip-blue">Minggu {current.week} · {current.status === "in_progress" ? "in progress" : current.status}</span>
              <p className="mt-2 text-sm font-semibold text-[var(--act-ink)]">{current.title}</p>
              <p className="mt-1 text-xs text-[var(--act-graphite)]">{r.weeksDone} selesai · {Math.max(0, r.weeksTotal - r.weeksDone)} to go</p>
            </div>
          ) : (
            <p className="text-sm text-[var(--act-graphite)]">Belum ada roadmap.</p>
          )}
        </PreviewCard>

        <PreviewCard href="/jobs" kicker="Job match" title="Lowongan paling cocok" tone="magenta">
          {bestJob ? (
            <div className="flex items-center gap-4">
              <div className="act-display text-4xl text-[var(--act-magenta)]">{bestJob.matchPct}<span className="text-lg">%</span></div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--act-ink)]">{bestJob.title}</p>
                <p className="truncate text-xs text-[var(--act-graphite)]">{bestJob.company} · {bestJob.location}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--act-graphite)]">Belum ada lowongan cocok.</p>
          )}
        </PreviewCard>

        <PreviewCard href="/learn" kicker="Belajar" title="Kursus prioritas" tone="mint">
          {topCourse ? (
            <div className="flex items-center gap-3">
              <span className="act-tile bg-[linear-gradient(140deg,#34d399,#059669)]">{topCourse.provider.charAt(0)}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--act-ink)]">{topCourse.title}</p>
                <p className="text-xs text-[var(--act-graphite)]">{topCourse.provider} · {topCourse.hours}h</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--act-graphite)]">Belum ada rekomendasi kursus.</p>
          )}
        </PreviewCard>
      </section>
    </div>
  );
}
