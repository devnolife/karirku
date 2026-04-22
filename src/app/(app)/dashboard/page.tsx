import Link from "next/link";
import { getMockSession, getGoal } from "@/lib/mock/session";
import {
  MOCK_SKILLS,
  MOCK_MILESTONES,
  MOCK_JOBS,
  MOCK_COURSES,
  MOCK_READINESS,
  MOCK_MARKET_TREND,
  MOCK_ACTIVITY,
} from "@/lib/mock/data";

export default async function DashboardPage() {
  const session = await getMockSession();
  const goal = (await getGoal()) ?? {
    targetRole: "Frontend Engineer",
    targetTrack: "fulltime" as const,
    targetCity: "Jakarta / Remote",
    weeklyHours: 10,
    budgetIdr: 200_000,
  };

  const firstName = session.user.name.split(" ")[0];
  const readiness = MOCK_READINESS;
  const coreSkills = MOCK_SKILLS.filter((s) => s.category === "core");
  const otherSkills = MOCK_SKILLS.filter((s) => s.category !== "core");
  const bestMatch = Math.max(...MOCK_JOBS.map((j) => j.matchPct));

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10 space-y-12">
      {/* ========== HELLO ========== */}
      <section className="grid grid-cols-12 gap-6 ed-hairline-b pb-10">
        <div className="col-span-12 md:col-span-8">
          <span className="ed-label">
            00 / Today · {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
          </span>
          <h1 className="mt-5 text-5xl font-medium leading-[0.92] tracking-[-0.025em] md:text-7xl">
            Halo, <span className="ed-serif text-pop">{firstName}.</span>
            <br />
            Goal kamu <span className="ed-highlight">{goal.targetRole}</span>.
          </h1>
          <p className="mt-6 max-w-xl text-ink-soft text-lg">
            {goal.targetCity ? `${goal.targetCity} · ` : ""}
            {goal.weeklyHours} jam/minggu ·{" "}
            {goal.budgetIdr > 0
              ? `budget Rp ${goal.budgetIdr.toLocaleString("id-ID")}/bln`
              : "course gratis"}
          </p>
          <Link
            href="/onboarding"
            className="mt-4 inline-flex ed-label hover:text-ink"
          >
            → ubah goal
          </Link>
        </div>

        <div className="col-span-12 md:col-span-4 flex md:justify-end">
          <ReadinessCard
            score={readiness.score}
            last={readiness.lastWeek}
          />
        </div>
      </section>

      {/* ========== KPI ROW ========== */}
      <section className="grid grid-cols-12 gap-0 border-y border-[var(--rule)] divide-x divide-[var(--rule)]">
        <Kpi
          className="col-span-6 md:col-span-3"
          label="Jam minggu ini"
          value={readiness.hoursThisWeek}
          unit="h"
          caption={`target ${readiness.hoursTarget}h`}
        />
        <Kpi
          className="col-span-6 md:col-span-3"
          label="Milestone selesai"
          value={readiness.weeksDone}
          unit={`/${readiness.weeksTotal}`}
          caption="6 minggu total"
        />
        <Kpi
          className="col-span-6 md:col-span-3"
          label="Match terbaik"
          value={bestMatch}
          unit="%"
          caption={`dari ${MOCK_JOBS.length} lowongan`}
        />
        <Kpi
          className="col-span-6 md:col-span-3"
          label="Naik minggu ini"
          value={readiness.score - readiness.lastWeek}
          unit="pts"
          caption="career readiness"
          accent
        />
      </section>

      {/* ========== SKILL GAP ========== */}
      <section className="grid grid-cols-12 gap-6">
        <SectionHeader
          num="01"
          kicker="Skill-gap analyzer"
          title={<>Skill kamu <span className="ed-serif">vs target.</span></>}
          meta="AI-powered · updated 2d ago"
        />
        <div className="col-span-12 md:col-span-8 md:col-start-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[var(--rule)] rounded-xl bg-surface overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[var(--rule)]">
            <div className="p-6">
              <span className="ed-label">Core — wajib</span>
              <div className="mt-4 space-y-4">
                {coreSkills.map((s) => <SkillBar key={s.name} skill={s} />)}
              </div>
            </div>
            <div className="p-6">
              <span className="ed-label">Nice-to-have + Soft</span>
              <div className="mt-4 space-y-4">
                {otherSkills.map((s) => <SkillBar key={s.name} skill={s} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== ROADMAP ========== */}
      <section className="grid grid-cols-12 gap-6">
        <SectionHeader
          num="02"
          kicker="Roadmap 6 minggu"
          title={<>Next moves <span className="ed-serif">kamu.</span></>}
          meta={`${readiness.weeksDone} selesai · ${readiness.weeksTotal - readiness.weeksDone} to go`}
        />
        <div className="col-span-12 md:col-span-8 md:col-start-5">
          <ol className="border border-[var(--rule)] rounded-xl bg-surface divide-y divide-[var(--rule)] overflow-hidden">
            {MOCK_MILESTONES.map((m) => <MilestoneRow key={m.week} milestone={m} />)}
          </ol>
        </div>
      </section>

      {/* ========== JOBS + MARKET ========== */}
      <section className="grid grid-cols-12 gap-6">
        <SectionHeader
          num="03"
          kicker="Market"
          title={<>Job match <span className="ed-serif">& trend.</span></>}
        />
        <div className="col-span-12 md:col-span-8 md:col-start-5 grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 border border-[var(--rule)] rounded-xl bg-surface overflow-hidden">
            <div className="ed-hairline-b flex items-center justify-between px-5 py-3">
              <span className="ed-label">Rekomendasi loker</span>
              <span className="ed-label">{MOCK_JOBS.length} posisi</span>
            </div>
            <ul className="divide-y divide-[var(--rule)]">
              {MOCK_JOBS.map((j) => <JobRow key={j.id} job={j} />)}
            </ul>
          </div>
          <div className="lg:col-span-2 border border-[var(--rule)] rounded-xl bg-surface p-5">
            <span className="ed-label">Demand trend</span>
            <h3 className="mt-2 text-2xl font-medium tracking-tight">
              {goal.targetRole.split(" ").slice(0, 2).join(" ")}
            </h3>
            <p className="mt-1 ed-serif text-ink-muted">
              8 bulan terakhir
            </p>
            <MarketChart data={MOCK_MARKET_TREND} />
            <div className="mt-3 ed-hairline-t pt-3 flex items-center justify-between">
              <span className="ed-label">vs 6 bln lalu</span>
              <span className="ed-mono text-sm font-medium text-pop ed-num">+102%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== COURSES + ACTIVITY ========== */}
      <section className="grid grid-cols-12 gap-6">
        <SectionHeader
          num="04"
          kicker="Action"
          title={<>Belajar <span className="ed-serif">ini dulu.</span></>}
        />
        <div className="col-span-12 md:col-span-8 md:col-start-5 grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 border border-[var(--rule)] rounded-xl bg-surface overflow-hidden">
            <div className="ed-hairline-b px-5 py-3">
              <span className="ed-label">Kursus prioritas</span>
            </div>
            <ul className="divide-y divide-[var(--rule)]">
              {MOCK_COURSES.map((c, i) => <CourseRow key={c.id} course={c} idx={i} />)}
            </ul>
          </div>
          <div className="lg:col-span-2 border border-[var(--rule)] rounded-xl bg-surface overflow-hidden">
            <div className="ed-hairline-b px-5 py-3">
              <span className="ed-label">Activity log</span>
            </div>
            <ol className="divide-y divide-[var(--rule)]">
              {MOCK_ACTIVITY.map((a, i) => (
                <li key={i} className="px-5 py-4">
                  <span className="ed-label">{a.time}</span>
                  <p className="mt-1 text-sm leading-snug">{a.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <div className="ed-hairline-t pt-6">
        <span className="ed-label">End of feed · demo data</span>
      </div>
    </div>
  );
}

/* =================================================
   Components
   ================================================= */

function SectionHeader({
  num,
  kicker,
  title,
  meta,
}: {
  num: string;
  kicker: string;
  title: React.ReactNode;
  meta?: string;
}) {
  return (
    <div className="col-span-12 md:col-span-4">
      <span className="ed-label">
        {num} / {kicker}
      </span>
      <h2 className="mt-4 text-3xl font-medium leading-[1] tracking-[-0.02em] md:text-4xl">
        {title}
      </h2>
      {meta && <p className="mt-3 ed-label">{meta}</p>}
    </div>
  );
}

function Kpi({
  className = "",
  label,
  value,
  unit,
  caption,
  accent,
}: {
  className?: string;
  label: string;
  value: number;
  unit: string;
  caption: string;
  accent?: boolean;
}) {
  return (
    <div className={`p-6 ${className}`}>
      <span className="ed-label">{label}</span>
      <div className="mt-3 flex items-baseline gap-1">
        <span className={`text-5xl font-medium tracking-tight ed-num ${accent ? "text-pop" : ""}`}>
          {value}
        </span>
        <span className="ed-serif text-2xl text-ink-muted">{unit}</span>
      </div>
      <p className="mt-2 text-xs text-ink-muted">{caption}</p>
    </div>
  );
}

function ReadinessCard({ score, last }: { score: number; last: number }) {
  const r = 58;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <div className="border border-[var(--rule)] rounded-xl bg-surface p-5 w-full max-w-xs">
      <span className="ed-label">Career readiness</span>
      <div className="mt-3 flex items-center gap-5">
        <div className="relative h-[140px] w-[140px] flex-none">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
            <circle cx="70" cy="70" r={r} fill="none" stroke="var(--rule)" strokeWidth="1" />
            <circle cx="70" cy="70" r={r} fill="none" stroke="var(--paper-2)" strokeWidth="8" />
            <circle
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke="var(--pop)"
              strokeWidth="8"
              strokeDasharray={`${dash} ${c}`}
              strokeLinecap="butt"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-medium tracking-tight ed-num">
              {score}
            </span>
            <span className="ed-serif text-sm text-pop -mt-1">percent</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-ink-muted">Naik dari</p>
          <p className="ed-num text-xl font-medium tracking-tight">{last}%</p>
          <p className="ed-label mt-1">minggu lalu</p>
          <p className="mt-3 text-xs text-pop ed-mono font-medium">
            +{score - last} pts wk
          </p>
        </div>
      </div>
    </div>
  );
}

function SkillBar({ skill }: { skill: typeof MOCK_SKILLS[number] }) {
  const pct = Math.min(100, (skill.current / skill.required) * 100);
  const gap = Math.max(0, skill.required - skill.current);
  const critical = gap > 25;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{skill.name}</span>
        <span className="ed-mono text-xs ed-num text-ink-muted">
          {skill.current}<span className="opacity-50">/</span>{skill.required}
        </span>
      </div>
      <div className="mt-2 h-[3px] w-full bg-ink/10 relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0"
          style={{ width: `${pct}%`, backgroundColor: critical ? "var(--blush)" : "var(--ink)" }}
        />
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-pop"
          style={{ left: `${Math.min(100, skill.required)}%` }}
          aria-hidden
        />
      </div>
      {gap > 0 && (
        <p className="mt-1 ed-label !text-[10px]">
          {critical ? "high priority · " : ""}gap {gap}
        </p>
      )}
    </div>
  );
}

function MilestoneRow({ milestone: m }: { milestone: typeof MOCK_MILESTONES[number] }) {
  const statusConfig = {
    done: { text: "Done", color: "text-ok", dot: "bg-ok" },
    in_progress: { text: "In progress", color: "text-pop", dot: "bg-pop" },
    upcoming: { text: "Upcoming", color: "text-ink-muted", dot: "bg-ink-muted" },
  }[m.status];
  return (
    <li className="grid grid-cols-12 gap-4 px-5 py-5 transition-colors hover:bg-paper-2">
      <div className="col-span-2 md:col-span-1">
        <span className="ed-mono text-sm font-medium ed-num text-ink-muted">
          W{m.week}
        </span>
      </div>
      <div className="col-span-10 md:col-span-8">
        <h3 className="text-base font-medium">{m.title}</h3>
        {m.courses.length > 0 && (
          <ul className="mt-1.5 space-y-0.5">
            {m.courses.map((c) => (
              <li key={c.title} className="text-xs text-ink-muted">
                <span className="ed-mono font-medium text-ink-soft">{c.provider}</span> · {c.title} · {c.hours}h
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="col-span-12 md:col-span-3 flex items-center md:justify-end gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
        <span className={`ed-label ${statusConfig.color}`}>{statusConfig.text}</span>
      </div>
    </li>
  );
}

function JobRow({ job: j }: { job: typeof MOCK_JOBS[number] }) {
  const matchClass = j.matchPct >= 80 ? "text-pop" : j.matchPct >= 70 ? "text-ink" : "text-ink-muted";
  return (
    <li className="grid grid-cols-12 gap-3 px-5 py-4 items-center transition-colors hover:bg-paper-2 cursor-pointer">
      <div className="col-span-2">
        <div className={`text-3xl font-medium tracking-tight ed-num ${matchClass}`}>
          {j.matchPct}
        </div>
        <div className="ed-label !text-[10px]">match</div>
      </div>
      <div className="col-span-8 min-w-0">
        <h4 className="font-medium truncate">{j.title}</h4>
        <p className="text-xs text-ink-muted">
          <span className="text-ink-soft font-medium">{j.company}</span> · {j.location}
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {j.skills.map((s) => (
            <span key={s} className="ed-mono text-[10px] uppercase tracking-wider text-ink-muted">
              #{s}
            </span>
          ))}
        </div>
      </div>
      <div className="col-span-2 text-right">
        <p className="ed-mono text-xs font-medium">{j.salary}</p>
        <p className="ed-label !text-[10px]">{j.posted}</p>
      </div>
    </li>
  );
}

function MarketChart({ data }: { data: typeof MOCK_MARKET_TREND }) {
  const w = 280;
  const h = 110;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const points = data.map((d, i) => {
    const x = i * step;
    const y = h - ((d.value - min) / range) * (h - 12) - 6;
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;

  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-28 w-full" aria-label="Market trend">
        <line x1="0" y1={h - 1} x2={w} y2={h - 1} stroke="var(--rule)" strokeWidth="1" />
        <path d={area} fill="var(--pop)" opacity="0.08" />
        <path d={path} fill="none" stroke="var(--pop)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === points.length - 1 ? 4 : 2} fill="var(--pop)" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between ed-label !text-[10px]">
        {data.map((d) => <span key={d.label}>{d.label}</span>)}
      </div>
    </div>
  );
}

function CourseRow({ course: c, idx }: { course: typeof MOCK_COURSES[number]; idx: number }) {
  return (
    <li className="grid grid-cols-12 gap-3 px-5 py-4 items-center transition-colors hover:bg-paper-2">
      <div className="col-span-1">
        <span className="ed-mono text-xs font-medium ed-num text-ink-muted">
          0{idx + 1}
        </span>
      </div>
      <div className="col-span-8">
        <h4 className="text-sm font-medium leading-snug">{c.title}</h4>
        <p className="ed-label mt-1">
          {c.provider} · {c.level} · {c.hours}h · ★ {c.rating}
        </p>
      </div>
      <div className="col-span-3 text-right">
        <p className="ed-mono text-sm font-medium">
          {c.priceIdr === 0 ? (
            <span className="text-ok">Gratis</span>
          ) : (
            <>Rp {(c.priceIdr / 1000).toFixed(0)}k</>
          )}
        </p>
      </div>
    </li>
  );
}
