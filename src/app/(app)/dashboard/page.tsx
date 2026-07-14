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
    <div className="studio-dashboard act-rise mx-auto max-w-[1200px] space-y-9 px-6 py-8 md:px-10">
      <section className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12 lg:gap-7">
        <div className="flex flex-col justify-center lg:col-span-7">
          <span className="studio-eyebrow">
            Career studio · {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
          </span>
          <h1 className="act-display mt-4 text-[2.6rem] leading-[0.98] md:text-6xl">
            Halo, <span className="studio-name">{firstName}.</span>
          </h1>
          {goal ? (
            <p className="studio-target-meta mt-4 max-w-2xl">
              Target <span>{goal.targetRole}</span>
              {goal.targetCity ? ` · ${goal.targetCity}` : ""} · {goal.weeklyHours} jam/minggu ·{" "}
              {goal.budgetIdr > 0 ? `Rp ${goal.budgetIdr.toLocaleString("id-ID")}/bln` : "kursus gratis"}
            </p>
          ) : (
            <p className="studio-target-meta mt-4 max-w-xl">
              Atur target role agar studio kariermu bisa menyusun langkah yang lebih relevan.
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link href="/roadmap" className="studio-primary-link">
              Lanjutkan roadmap
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/onboarding" className="studio-text-link">Ubah target</Link>
          </div>
        </div>
        <div className="lg:col-span-5">
          <ReadinessCard score={r.score} last={r.lastWeek} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <div>
            <span className="studio-section-kicker">Ritme karier</span>
            <h2 className="act-heading mt-1 text-2xl text-[var(--act-ink)]">Fokus minggu ini</h2>
          </div>
          <Link href="/roadmap" className="studio-text-link hidden sm:inline-flex">Lihat roadmap</Link>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Link href="/roadmap" className="studio-next-move group lg:col-span-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <span className="studio-dark-kicker">Langkah berikutnya</span>
                {current ? (
                  <>
                    <h3 className="act-heading mt-3 text-2xl leading-tight text-white md:text-3xl">{current.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/68">
                      Minggu {current.week} · {current.status === "in_progress" ? "Sedang dikerjakan" : current.status === "done" ? "Selesai" : "Berikutnya"}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="act-heading mt-3 text-2xl text-white">Roadmap belum tersedia</h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-white/68">Atur targetmu untuk mendapatkan langkah karier yang bisa dikerjakan minggu ini.</p>
                  </>
                )}
              </div>
              <span className="studio-arrow-button" aria-hidden>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </span>
            </div>
            {current && (
              <div className="mt-8 flex items-center justify-between border-t border-white/15 pt-4 text-xs font-medium text-white/70">
                <span>{r.weeksDone} milestone selesai</span>
                <span>{Math.max(0, r.weeksTotal - r.weeksDone)} langkah tersisa</span>
              </div>
            )}
          </Link>

          <Link href="/jobs" className="studio-match-card group lg:col-span-4">
            <div className="flex items-start justify-between gap-4">
              <span className="studio-section-kicker">Match terbaik</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--act-iris)] transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </div>
            {bestJob ? (
              <>
                <div className="mt-5 flex items-end gap-2">
                  <span className="act-display text-5xl text-[var(--act-onyx)]">{bestJob.matchPct}</span>
                  <span className="mb-1 text-sm font-semibold text-[var(--act-iris)]">% cocok</span>
                </div>
                <h3 className="act-heading mt-4 text-lg text-[var(--act-ink)]">{bestJob.title}</h3>
                <p className="mt-1 text-sm text-[var(--act-graphite)]">{bestJob.company} · {bestJob.location}</p>
              </>
            ) : (
              <>
                <h3 className="act-heading mt-5 text-lg text-[var(--act-ink)]">Belum ada match</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--act-graphite)]">Lengkapi target dan skill untuk menemukan lowongan yang tepat.</p>
              </>
            )}
            <span className="studio-card-footer">Lihat lowongan</span>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi label="Jam minggu ini" value={r.hoursThisWeek} unit="h" caption={`target ${r.hoursTarget}h`} tone="blue" />
        <Kpi label="Milestone selesai" value={r.weeksDone} unit={`/${r.weeksTotal}`} caption={`${r.weeksTotal} minggu total`} tone="iris" />
        <Kpi label="Coverage skill" value={gap.coveragePct} unit="%" caption="vs role target" tone="mint" />
      </section>

      <section>
        <div className="mb-4">
          <span className="studio-section-kicker">Langkah yang terukur</span>
          <h2 className="act-heading mt-1 text-2xl text-[var(--act-ink)]">Perkembanganmu</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <PreviewCard href="/skills" kicker="Skill gaps" title="Skill yang perlu dikuatkan" tone="blue">
          {criticalSkills.length > 0 ? (
            <div className="space-y-4">
              {criticalSkills.map((s) => <SkillBar key={s.name} skill={s} tone="blue" />)}
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-[var(--act-graphite)]">Belum ada gap skill prioritas. Atur target role untuk melihat kebutuhan skill.</p>
          )}
          </PreviewCard>

          <PreviewCard href="/learn" kicker="Belajar" title="Kursus prioritas" tone="mint">
          {topCourse ? (
            <div className="flex items-center gap-3">
              <span className="studio-course-mark">{topCourse.provider.charAt(0)}</span>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--act-ink)]">{topCourse.title}</p>
                <p className="mt-1 text-xs text-[var(--act-graphite)]">{topCourse.provider} · {topCourse.hours}h · {topCourse.level}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-[var(--act-graphite)]">Belum ada rekomendasi kursus. Lengkapi targetmu untuk mendapatkan prioritas belajar.</p>
          )}
          </PreviewCard>
        </div>
      </section>
    </div>
  );
}
