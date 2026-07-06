import Link from "next/link";
import { getMockSession } from "@/lib/mock/session";
import {
  getPriorityCourses,
  getReadiness,
  getRecommendedJobs,
  getRoadmapMilestones,
  getSkillGap,
} from "@/lib/data/jobseeker";
import {
  StatCard,
  DonutProgress,
  HatchedBars,
  SkillBar,
  type BarDatum,
} from "../_dash/parts";
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
  const email = session.user.email;

  const [skills, milestones, jobs, courses, r] = await Promise.all([
    getSkillGap(),
    getRoadmapMilestones(email),
    getRecommendedJobs(email),
    getPriorityCourses(),
    getReadiness(email),
  ]);

  const firstName = session.user.name.split(" ")[0];
  const bestJob = [...jobs].sort((a, b) => b.matchPct - a.matchPct)[0];
  const current = milestones.find((m) => m.status === "in_progress") ?? milestones[0];
  const criticalSkills = [...skills]
    .filter((s) => s.category === "core")
    .sort((a, b) => b.required - b.current - (a.required - a.current))
    .slice(0, 3);

  // Distribusi jam belajar minggu ini (presentasi) — beberapa hari terisi,
  // hari aktif disorot, akhir pekan mendatang tampil arsir (kosong).
  const dayLabels = ["S", "S", "R", "K", "J", "S", "M"];
  const factors = [0.62, 0.92, 0.75, 1.23, 1.0, 0, 0];
  const activeDay = 4;
  const weeklyBars: BarDatum[] = dayLabels.map((label, i) => ({
    label,
    value: Math.round(r.hoursThisWeek * factors[i] * 10) / 10,
    active: i === activeDay,
  }));

  // Komposisi milestone untuk donut + legend.
  const done = milestones.filter((m) => m.status === "done").length;
  const inProgress = milestones.filter((m) => m.status === "in_progress").length;
  const pending = milestones.length - done - inProgress;

  const bestCourse = courses[0];

  return (
    <div className="act-rise mx-auto max-w-[1240px] space-y-6 px-5 py-6 md:px-8">
      {/* Header + CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="act-display text-3xl leading-[1.04] md:text-4xl">
            Halo, <span className="act-sky-text">{firstName}.</span>
          </h1>
          <p className="mt-2 text-[15px] text-[var(--act-charcoal)]">
            Rencanakan, prioritaskan, dan capai goal kariermu dengan mudah.
          </p>
        </div>
        <div className="flex flex-none gap-2.5">
          <Link href="/jobs" className="act-pill !px-5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Lihat lowongan
          </Link>
          <Link href="/onboarding" className="act-pill-ghost !border !border-[rgba(15,23,42,0.14)] !px-5">
            Ubah goal
          </Link>
        </div>
      </div>

      {/* Stat row */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Jam minggu ini"
          value={<>{r.hoursThisWeek}<span className="text-2xl">h</span></>}
          delta={`target ${r.hoursTarget}h`}
          featured
        />
        <StatCard
          label="Milestone selesai"
          value={<>{r.weeksDone}<span className="text-2xl text-[var(--act-graphite)]">/{r.weeksTotal}</span></>}
          delta="6 minggu total"
          href="/roadmap"
        />
        <StatCard
          label="Match terbaik"
          value={<>{bestJob.matchPct}<span className="text-2xl">%</span></>}
          delta={`${jobs.length} lowongan`}
          href="/jobs"
        />
        <StatCard
          label="Readiness"
          value={<>{r.score}<span className="text-2xl">%</span></>}
          delta={`+${r.score - r.lastWeek} pts minggu ini`}
        />
      </section>

      {/* Bento row 1: activity bars + next move */}
      <section className="grid grid-cols-12 gap-4">
        <div className="act-card-2 col-span-12 p-6 lg:col-span-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="act-kicker">Aktivitas belajar</span>
              <h3 className="act-heading mt-1 text-xl">Minggu ini</h3>
            </div>
            <span className="act-chip act-chip-blue">{r.hoursThisWeek}h total</span>
          </div>
          <div className="mt-6">
            <HatchedBars data={weeklyBars} />
          </div>
        </div>

        <div className="act-card-2 col-span-12 flex flex-col p-6 lg:col-span-4">
          <span className="act-kicker">Langkah berikutnya</span>
          <h3 className="act-heading mt-2 text-lg leading-snug">{current.title}</h3>
          <p className="mt-1 text-xs text-[var(--act-graphite)]">
            Minggu {current.week} · {r.weeksDone} selesai · {r.weeksTotal - r.weeksDone} tersisa
          </p>
          <div className="mt-auto pt-5">
            <Link href="/roadmap" className="act-pill !w-full justify-center">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              Lanjut roadmap
            </Link>
          </div>
        </div>
      </section>

      {/* Bento row 2: skills list + donut + course tile */}
      <section className="grid grid-cols-12 gap-4">
        <div className="act-card-2 col-span-12 p-6 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <span className="act-kicker">Skill-gap</span>
              <h3 className="act-heading mt-1 text-xl">Skill kamu vs target</h3>
            </div>
            <Link href="/skills" className="act-pill-ghost !text-[var(--act-blue)] !text-xs">
              Detail
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {criticalSkills.map((s) => (
              <SkillBar key={s.name} skill={s} tone="blue" />
            ))}
          </div>
        </div>

        <div className="act-card-2 col-span-12 p-6 lg:col-span-5">
          <span className="act-kicker">Progress roadmap</span>
          <div className="mt-4">
            <DonutProgress
              primaryPct={Math.round((done / Math.max(1, milestones.length)) * 100)}
              primaryLabel="milestone tuntas"
              segments={[
                { label: `Selesai (${done})`, color: "var(--act-sky-deep)" },
                { label: `Berjalan (${inProgress})`, color: "var(--act-sky-bright)" },
                { label: `Menunggu (${pending})`, color: "rgba(15,23,42,0.14)" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Bottom: featured course + best job as dark card */}
      <section className="grid grid-cols-12 gap-4">
        <Link href="/learn" className="act-card-2 act-rowhover group col-span-12 flex items-center gap-4 p-5 lg:col-span-7">
          <span className="act-tile bg-[linear-gradient(140deg,#34d399,#059669)]">{bestCourse.provider.charAt(0)}</span>
          <div className="min-w-0 flex-1">
            <span className="act-kicker">Kursus prioritas</span>
            <p className="mt-0.5 truncate text-sm font-semibold text-[var(--act-ink)]">{bestCourse.title}</p>
            <p className="text-xs text-[var(--act-graphite)]">{bestCourse.provider} · {bestCourse.hours}h</p>
          </div>
          <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none text-[var(--act-graphite)] transition group-hover:translate-x-0.5 group-hover:text-[var(--act-blue)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>

        <div className="act-promo col-span-12 flex items-center gap-4 lg:col-span-5">
          <div className="min-w-0 flex-1">
            <span className="act-kicker !text-white/60">Lowongan paling cocok</span>
            <p className="mt-1 truncate text-sm font-semibold">{bestJob.title}</p>
            <p className="truncate text-xs text-white/60">{bestJob.company} · {bestJob.location}</p>
          </div>
          <div className="act-display flex-none text-4xl text-white">
            {bestJob.matchPct}<span className="text-lg">%</span>
          </div>
        </div>
      </section>
    </div>
  );
}
