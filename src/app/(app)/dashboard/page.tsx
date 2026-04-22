import Link from "next/link";
import { getMockSession, getGoal } from "@/lib/mock/session";
import {
  MOCK_ACTIVITY,
  MOCK_COURSES,
  MOCK_JOBS,
  MOCK_MARKET_TREND,
  MOCK_MILESTONES,
  MOCK_READINESS,
  MOCK_SKILLS,
  type MockSkill,
  type MockMilestone,
  type MockJob,
  type MockCourse,
} from "@/lib/mock/data";

export default async function DashboardPage() {
  const session = await getMockSession();
  const goal = await getGoal();
  const firstName = session.user.name.split(" ")[0];

  if (!goal) return <EmptyGoalState />;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Greeting */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Halo, {firstName} 👋
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Target kamu:{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {goal.targetRole}
            </span>{" "}
            · {goal.targetCity ?? "—"} ·{" "}
            <span className="capitalize">{goal.targetTrack}</span>
          </p>
        </div>
        <Link
          href="/onboarding"
          className="inline-flex h-9 items-center gap-1.5 self-start rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 sm:self-auto"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
            <path
              d="M4 20h4l10-10-4-4L4 16v4z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Ubah goal
        </Link>
      </div>

      {/* Top stat row */}
      <div className="mt-8 grid gap-5 md:grid-cols-4">
        <ReadinessCard />
        <StatCard
          label="Progress path"
          value={`${Math.round((MOCK_READINESS.weeksDone / MOCK_READINESS.weeksTotal) * 100)}%`}
          hint={`Minggu ${MOCK_READINESS.weeksDone}/${MOCK_READINESS.weeksTotal}`}
          tone="violet"
        />
        <StatCard
          label="Jam belajar minggu ini"
          value={`${MOCK_READINESS.hoursThisWeek} / ${MOCK_READINESS.hoursTarget} jam`}
          hint="Konsisten 4 minggu terakhir"
          tone="emerald"
        />
        <StatCard
          label="Skill aktif"
          value={`${MOCK_SKILLS.length}`}
          hint={`${MOCK_SKILLS.filter((s) => s.current >= s.required).length} sudah siap`}
          tone="sky"
        />
      </div>

      {/* Main content grid */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <SkillGapCard skills={MOCK_SKILLS} />
          <RoadmapCard milestones={MOCK_MILESTONES} />
          <JobMatchesCard jobs={MOCK_JOBS} />
        </div>
        <div className="space-y-5">
          <MarketTrendCard />
          <CourseRecsCard courses={MOCK_COURSES} />
          <ActivityCard />
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-zinc-500">
        Mode demo · semua data di halaman ini adalah mock fixtures dari{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-[11px] dark:bg-zinc-900">
          src/lib/mock/data.ts
        </code>
      </p>
    </div>
  );
}

/* ---------------------------- Empty state ---------------------------- */

function EmptyGoalState() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="rounded-3xl border-2 border-dashed border-indigo-300 bg-gradient-to-br from-indigo-50 to-white p-10 text-center dark:border-indigo-900 dark:from-indigo-950/30 dark:to-zinc-950">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
            <path
              d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h2 className="mt-5 text-2xl font-semibold">Belum ada goal karir</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Set target role dulu — AI akan auto-generate roadmap, gap analysis,
          dan rekomendasi course buat kamu.
        </p>
        <Link
          href="/onboarding"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 px-6 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl"
        >
          Set goal sekarang
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------ Cards ------------------------------ */

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 ${className}`}
    >
      {children}
    </section>
  );
}

function CardHeader({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {desc && (
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{desc}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function ReadinessCard() {
  const { score, lastWeek } = MOCK_READINESS;
  const delta = score - lastWeek;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference * (1 - score / 100);
  return (
    <Card className="relative overflow-hidden md:col-span-2 md:row-span-1">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/10 blur-2xl"
      />
      <div className="relative flex items-center gap-6">
        <div className="relative h-28 w-28 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-zinc-200 dark:text-zinc-800"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-semibold">{score}</div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">
              readiness
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Skor kesiapan
          </div>
          <div className="mt-1 text-base font-medium">
            Kamu makin dekat ke target.
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Naik{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              +{delta} poin
            </span>{" "}
            dari minggu lalu. Fokus utama minggu ini:{" "}
            <span className="font-medium">Testing</span>.
          </p>
        </div>
      </div>
    </Card>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: "violet" | "emerald" | "sky" | "rose";
}) {
  const toneClass = {
    violet: "text-violet-600 dark:text-violet-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    sky: "text-sky-600 dark:text-sky-400",
    rose: "text-rose-600 dark:text-rose-400",
  }[tone];
  return (
    <Card>
      <div className={`text-xs font-medium uppercase tracking-wider ${toneClass}`}>
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{hint}</div>
    </Card>
  );
}

function SkillGapCard({ skills }: { skills: MockSkill[] }) {
  const toneBg: Record<MockSkill["tone"], string> = {
    rose: "from-rose-500 to-rose-400",
    amber: "from-amber-500 to-amber-400",
    emerald: "from-emerald-500 to-emerald-400",
    sky: "from-sky-500 to-sky-400",
    violet: "from-violet-500 to-violet-400",
  };
  return (
    <Card>
      <CardHeader
        title="Skill gap analysis"
        desc="Dibandingkan rata-rata requirement dari 412 lowongan Frontend Engineer."
        action={<Badge>AI-updated · 2 jam lalu</Badge>}
      />
      <ul className="space-y-4">
        {skills.map((s) => {
          const pct = Math.round((s.current / 100) * 100);
          const reqPct = Math.round((s.required / 100) * 100);
          const gap = s.current >= s.required;
          return (
            <li key={s.name}>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{s.name}</span>
                  <span className="rounded-full border border-zinc-200 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                    {s.category}
                  </span>
                </div>
                <div className="text-xs">
                  <span className="font-semibold">{s.current}</span>
                  <span className="text-zinc-500"> / {s.required} target</span>
                  {gap ? (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      ✓ siap
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="relative mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                <div
                  className="absolute inset-y-0 left-0 border-r border-dashed border-zinc-400/60"
                  style={{ width: `${reqPct}%` }}
                />
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${toneBg[s.tone]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function RoadmapCard({ milestones }: { milestones: MockMilestone[] }) {
  return (
    <Card>
      <CardHeader
        title="Roadmap mingguan"
        desc="Otomatis disesuaikan dengan gap + jam belajar kamu."
        action={<Badge>6 minggu · adaptive</Badge>}
      />
      <ol className="relative space-y-4 border-l-2 border-dashed border-zinc-200 pl-6 dark:border-zinc-800">
        {milestones.map((m) => {
          const dotClass =
            m.status === "done"
              ? "bg-emerald-500"
              : m.status === "in_progress"
              ? "bg-gradient-to-br from-indigo-500 to-violet-500 ring-4 ring-indigo-500/20"
              : "bg-zinc-300 dark:bg-zinc-700";
          const statusLabel =
            m.status === "done"
              ? "Selesai"
              : m.status === "in_progress"
              ? "Sedang dikerjakan"
              : "Akan datang";
          return (
            <li key={m.week} className="relative">
              <span
                className={`absolute -left-[31px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full ${dotClass}`}
              />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    Minggu {m.week}
                  </span>
                  <h3 className="text-sm font-semibold">{m.title}</h3>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    m.status === "done"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : m.status === "in_progress"
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                  }`}
                >
                  {statusLabel}
                </span>
              </div>
              {m.courses.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {m.courses.map((c) => (
                    <span
                      key={c.title}
                      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                    >
                      <span className="h-1 w-1 rounded-full bg-indigo-500" />
                      {c.title} · {c.provider} · {c.hours}j
                    </span>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function JobMatchesCard({ jobs }: { jobs: MockJob[] }) {
  return (
    <Card>
      <CardHeader
        title="Job match untuk kamu"
        desc="Lowongan dari pasar Indonesia yang paling cocok dengan skill kamu saat ini."
        action={
          <Link
            href="#"
            className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Lihat semua →
          </Link>
        }
      />
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {jobs.map((j) => (
          <li
            key={j.id}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 text-sm font-semibold text-zinc-700 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-300">
                {j.company[0]}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{j.title}</h3>
                  <span className="text-xs text-zinc-500">@ {j.company}</span>
                </div>
                <div className="mt-0.5 text-xs text-zinc-500">
                  {j.location} · {j.salary} · {j.posted}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {j.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
              <MatchPill pct={j.matchPct} />
              <button className="inline-flex h-8 items-center rounded-full border border-zinc-300 px-3 text-xs font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">
                Lihat detail
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function MatchPill({ pct }: { pct: number }) {
  const tone =
    pct >= 80
      ? "from-emerald-500 to-teal-500 text-white"
      : pct >= 70
      ? "from-indigo-500 to-violet-500 text-white"
      : "from-amber-400 to-orange-400 text-white";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2.5 py-1 text-xs font-semibold ${tone}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
      {pct}% match
    </span>
  );
}

function MarketTrendCard() {
  const max = Math.max(...MOCK_MARKET_TREND.map((p) => p.value));
  const width = 260;
  const height = 80;
  const step = width / (MOCK_MARKET_TREND.length - 1);
  const points = MOCK_MARKET_TREND.map((p, i) => {
    const x = i * step;
    const y = height - (p.value / max) * (height - 10) - 4;
    return { x, y, ...p };
  });
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const area = `${path} L ${width} ${height} L 0 ${height} Z`;

  return (
    <Card>
      <CardHeader
        title="Market demand"
        desc="Trend posting lowongan untuk target role kamu (8 bulan)."
      />
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-semibold tracking-tight">+38%</div>
        <div className="text-xs text-emerald-600 dark:text-emerald-400">
          vs 6 bulan lalu
        </div>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height + 18}`}
        className="mt-4 w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#areaGrad)" />
        <path
          d={path}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p) => (
          <circle key={p.label} cx={p.x} cy={p.y} r="2.5" fill="#6366f1" />
        ))}
        {points.map((p, i) =>
          i % 2 === 0 ? (
            <text
              key={p.label + "t"}
              x={p.x}
              y={height + 14}
              fontSize="9"
              textAnchor="middle"
              className="fill-zinc-500"
            >
              {p.label}
            </text>
          ) : null,
        )}
      </svg>
    </Card>
  );
}

function CourseRecsCard({ courses }: { courses: MockCourse[] }) {
  return (
    <Card>
      <CardHeader
        title="Course rekomendasi"
        desc="Dipilih berdasar gap + budget kamu."
      />
      <ul className="space-y-3">
        {courses.slice(0, 3).map((c) => (
          <li
            key={c.id}
            className="group rounded-xl border border-zinc-200 p-3 transition hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-zinc-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                {c.provider}
              </span>
              <span className="text-[11px] text-zinc-500">
                ★ {c.rating} · {c.hours}j
              </span>
            </div>
            <h3 className="mt-1.5 text-sm font-medium leading-snug">{c.title}</h3>
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                {c.level} · {c.priceIdr === 0 ? "Gratis" : `Rp ${c.priceIdr.toLocaleString("id-ID")}`}
              </span>
              <span className="text-indigo-600 opacity-0 transition group-hover:opacity-100 dark:text-indigo-400">
                Lihat →
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ActivityCard() {
  return (
    <Card>
      <CardHeader title="Aktivitas terbaru" />
      <ul className="space-y-3">
        {MOCK_ACTIVITY.map((a, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
            <div className="min-w-0">
              <div className="text-sm leading-snug">{a.text}</div>
              <div className="text-[11px] text-zinc-500">{a.time}</div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {children}
    </span>
  );
}
