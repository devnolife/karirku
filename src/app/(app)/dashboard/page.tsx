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
  GaugeProgress,
  HatchedBars,
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

const JOB_TILES = [
  "bg-[linear-gradient(140deg,#38bdf8,#0098f2)]",
  "bg-[linear-gradient(140deg,#8b78ff,#6d56fc)]",
  "bg-[linear-gradient(140deg,#34d399,#059669)]",
  "bg-[linear-gradient(140deg,#ff77dd,#f200ca)]",
  "bg-[linear-gradient(140deg,#fbbf24,#f59e0b)]",
];

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
  const rankedJobs = [...jobs].sort((a, b) => b.matchPct - a.matchPct);
  const bestJob = rankedJobs[0];
  const current = milestones.find((m) => m.status === "in_progress") ?? milestones[0];

  // Skill list (gaya "Team Collaboration"): skill + status chip.
  const skillList = [...skills]
    .sort((a, b) => b.required - b.current - (a.required - a.current))
    .slice(0, 4);

  // Aktivitas belajar mingguan — beberapa hari terisi, akhir pekan arsir.
  const dayLabels = ["S", "S", "R", "K", "J", "S", "M"];
  const factors = [0.62, 0.92, 0.75, 1.23, 1.0, 0, 0];
  const activeDay = 4;
  const weeklyBars: BarDatum[] = dayLabels.map((label, i) => ({
    label,
    value: Math.round(r.hoursThisWeek * factors[i] * 10) / 10,
    active: i === activeDay,
  }));

  // Komposisi milestone untuk gauge.
  const done = milestones.filter((m) => m.status === "done").length;
  const inProgress = milestones.filter((m) => m.status === "in_progress").length;
  const pending = milestones.length - done - inProgress;
  const donePct = Math.round((done / Math.max(1, milestones.length)) * 100);

  return (
    <div className="act-rise mx-auto max-w-[1280px] space-y-6 px-5 py-6 md:px-8">
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

      {/* Bento — 3 kolom (kiri 5 / tengah 3 / kanan 4) */}
      <section className="grid grid-cols-12 gap-4">
        {/* ---- Kolom kiri ---- */}
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-5">
          {/* Aktivitas belajar (bar chart) */}
          <div className="act-card-2 p-6">
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

          {/* Skill list (gaya Team Collaboration) */}
          <div className="act-card-2 p-6">
            <div className="flex items-center justify-between">
              <h3 className="act-heading text-lg">Skill dalam proses</h3>
              <Link href="/skills" className="act-pill-ghost !text-[var(--act-blue)] !text-xs">
                Detail
              </Link>
            </div>
            <ul className="mt-4 space-y-3.5">
              {skillList.map((s) => {
                const gap = Math.max(0, s.required - s.current);
                const chip =
                  gap > 25
                    ? { cls: "act-chip-magenta", label: "Prioritas" }
                    : gap > 0
                      ? { cls: "act-chip-blue", label: "Berproses" }
                      : { cls: "act-chip-green", label: "Tuntas" };
                return (
                  <li key={s.name} className="flex items-center gap-3">
                    <span className="act-tile bg-[linear-gradient(140deg,#38bdf8,#0098f2)]">
                      {s.name.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--act-ink)]">{s.name}</p>
                      <p className="truncate text-xs text-[var(--act-graphite)]">
                        {s.current}/{s.required} · {s.category}
                      </p>
                    </div>
                    <span className={`act-chip ${chip.cls} !text-[11px]`}>{chip.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* ---- Kolom tengah ---- */}
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-3">
          {/* Reminder / langkah berikutnya */}
          <div className="act-card-2 flex flex-col p-6">
            <span className="act-kicker">Langkah berikutnya</span>
            <h3 className="act-heading mt-2 text-lg leading-snug">{current.title}</h3>
            <p className="mt-1 text-xs text-[var(--act-graphite)]">
              Minggu {current.week} · {r.weeksDone} selesai · {r.weeksTotal - r.weeksDone} tersisa
            </p>
            <Link href="/roadmap" className="act-pill mt-5 !w-full justify-center">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              Lanjut roadmap
            </Link>
          </div>

          {/* Gauge progress roadmap */}
          <div className="act-card-2 flex-1 p-6">
            <span className="act-kicker">Progress roadmap</span>
            <div className="mt-5">
              <GaugeProgress
                pct={donePct}
                label="milestone tuntas"
                segments={[
                  { label: `Selesai (${done})`, color: "var(--act-sky-deep)" },
                  { label: `Berjalan (${inProgress})`, color: "var(--act-sky-bright)" },
                  { label: `Menunggu (${pending})`, color: "rgba(15,23,42,0.14)" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* ---- Kolom kanan ---- */}
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-4">
          {/* Lowongan cocok (list tinggi, gaya Project) */}
          <div className="act-card-2 flex-1 p-6">
            <div className="flex items-center justify-between">
              <h3 className="act-heading text-lg">Lowongan cocok</h3>
              <Link href="/jobs" className="act-chip act-chip-mute !text-[11px]">
                {jobs.length} posisi
              </Link>
            </div>
            <ul className="mt-4 space-y-4">
              {rankedJobs.slice(0, 5).map((j, i) => (
                <li key={j.id} className="flex items-center gap-3">
                  <span className={`act-tile ${JOB_TILES[i % JOB_TILES.length]}`}>{j.company.charAt(0)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--act-ink)]">{j.title}</p>
                    <p className="truncate text-xs text-[var(--act-graphite)]">
                      {j.company} · {j.location}
                    </p>
                  </div>
                  <span className="act-display flex-none text-lg text-[var(--act-blue)]">
                    {j.matchPct}<span className="text-[11px]">%</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Kartu gelap (gaya Time Tracker) */}
          <div className="act-promo">
            <div className="flex items-center justify-between">
              <span className="act-kicker !text-white/60">Lowongan teratas</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold">
                {bestJob.matchPct}% match
              </span>
            </div>
            <p className="mt-3 truncate text-lg font-semibold">{bestJob.title}</p>
            <p className="truncate text-xs text-white/60">{bestJob.company} · {bestJob.location}</p>
            <Link
              href="/jobs"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[var(--act-ink)] transition hover:bg-white/90"
            >
              Lihat detail
            </Link>
          </div>
        </div>
      </section>

      {/* Kursus prioritas */}
      <Link href="/learn" className="act-card-2 act-rowhover group flex items-center gap-4 p-5">
        <span className="act-tile bg-[linear-gradient(140deg,#34d399,#059669)]">{courses[0].provider.charAt(0)}</span>
        <div className="min-w-0 flex-1">
          <span className="act-kicker">Kursus prioritas</span>
          <p className="mt-0.5 truncate text-sm font-semibold text-[var(--act-ink)]">{courses[0].title}</p>
          <p className="text-xs text-[var(--act-graphite)]">{courses[0].provider} · {courses[0].hours}h</p>
        </div>
        <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none text-[var(--act-graphite)] transition group-hover:translate-x-0.5 group-hover:text-[var(--act-blue)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
