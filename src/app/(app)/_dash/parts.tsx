import Link from "next/link";
import { ApplyButton } from "@/components/ApplyButton";
import type {
  SkillView,
  MilestoneView,
  JobView,
  CourseView,
} from "@/lib/view-models";

/* ---------------- Page header ---------------- */
export function PageHeader({
  kicker,
  title,
  meta,
  action,
}: {
  kicker: string;
  title: React.ReactNode;
  meta?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="act-eyebrow">{kicker}</span>
        <h1 className="act-display mt-3 text-3xl leading-[1.05] md:text-4xl">{title}</h1>
        {meta && <p className="mt-2 text-sm text-[var(--act-graphite)]">{meta}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------- KPI ---------------- */
export function Kpi({
  label,
  value,
  unit,
  caption,
  tone,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  caption: string;
  tone: "blue" | "iris" | "mint" | "magenta";
  accent?: boolean;
}) {
  const valueColor = {
    blue: "text-[var(--act-blue)]",
    iris: "text-[var(--act-iris)]",
    mint: "text-[#059669]",
    magenta: "text-[var(--act-magenta)]",
  }[tone];
  const railClass = {
    blue: "act-rail-blue",
    iris: "act-rail-iris",
    mint: "act-rail-mint",
    magenta: "act-rail-magenta",
  }[tone];
  return (
    <div className={`act-card-2 act-rail ${railClass} p-5`}>
      <span className="act-kicker">{label}</span>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`act-display text-4xl ${valueColor}`}>
          {accent ? "+" : ""}
          {value}
        </span>
        {unit && <span className="text-lg font-semibold text-[var(--act-graphite)]">{unit}</span>}
      </div>
      <p className="mt-1 text-xs text-[var(--act-graphite)]">{caption}</p>
    </div>
  );
}

/* ---------------- Readiness ring ---------------- */
export function ReadinessCard({ score, last }: { score: number; last: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <div className="act-card-2 act-wash-sky-soft w-full border-[rgba(0,152,242,0.18)] p-5">
      <span className="act-kicker">Career readiness</span>
      <div className="mt-3 flex items-center gap-5">
        <div className="relative h-[128px] w-[128px] flex-none">
          <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
            <defs>
              <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--act-sky-bright)" />
                <stop offset="100%" stopColor="var(--act-sky-deep)" />
              </linearGradient>
            </defs>
            <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(15,23,42,0.08)" strokeWidth="10" />
            <circle cx="64" cy="64" r={r} fill="none" stroke="url(#ring)" strokeWidth="10" strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="act-display text-4xl text-[var(--act-ink)]">{score}</span>
            <span className="text-xs font-semibold text-[var(--act-blue)]">percent</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[var(--act-graphite)]">Naik dari</p>
          <p className="act-display text-xl text-[var(--act-ink)]">{last}%</p>
          <p className="mt-1 text-xs text-[var(--act-graphite)]">minggu lalu</p>
          <span className="act-chip act-chip-green mt-3">+{score - last} pts wk</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Skill bar ---------------- */
export function SkillBar({ skill, tone = "blue" }: { skill: SkillView; tone?: "blue" | "iris" }) {
  const pct = Math.min(100, (skill.current / skill.required) * 100);
  const gap = Math.max(0, skill.required - skill.current);
  const critical = gap > 25;
  const fill = critical
    ? "linear-gradient(90deg, #ff5cd6, var(--act-magenta))"
    : tone === "iris"
      ? "linear-gradient(90deg, #8b78ff, var(--act-iris))"
      : "linear-gradient(90deg, var(--act-sky-bright), var(--act-sky-deep))";
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-[var(--act-ink)]">{skill.name}</span>
        <span className="text-xs font-medium text-[var(--act-graphite)]">
          {skill.current}
          <span className="opacity-50">/</span>
          {skill.required}
        </span>
      </div>
      <div className="act-track mt-2">
        <i style={{ width: `${pct}%`, background: fill }} />
        <span className="absolute top-[-2px] bottom-[-2px] w-[2px] rounded bg-[var(--act-onyx)] opacity-40" style={{ left: `${Math.min(100, skill.required)}%` }} aria-hidden />
      </div>
      {gap > 0 && (
        <p className="mt-1.5 text-[11px] font-medium text-[var(--act-graphite)]">
          {critical ? <span className="text-[var(--act-magenta)]">high priority · </span> : ""}gap {gap}
        </p>
      )}
    </div>
  );
}

/* ---------------- Milestone row ---------------- */
export function MilestoneRow({ milestone: m }: { milestone: MilestoneView }) {
  const statusConfig = {
    done: { text: "Done", chip: "act-chip-green", badge: "bg-[linear-gradient(140deg,#34d399,#059669)] text-white" },
    in_progress: { text: "In progress", chip: "act-chip-blue", badge: "bg-[linear-gradient(140deg,#38bdf8,var(--act-blue))] text-white" },
    upcoming: { text: "Upcoming", chip: "act-chip-mute", badge: "bg-[var(--act-mist)] text-[var(--act-graphite)] border border-[rgba(15,23,42,0.1)]" },
  }[m.status];
  return (
    <li className="act-rowhover grid grid-cols-12 gap-4 px-5 py-5">
      <div className="col-span-2 md:col-span-1">
        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${statusConfig.badge}`}>W{m.week}</span>
      </div>
      <div className="col-span-10 md:col-span-8">
        <h3 className="text-base font-semibold text-[var(--act-ink)]">{m.title}</h3>
        {m.courses.length > 0 && (
          <ul className="mt-1.5 space-y-0.5">
            {m.courses.map((c) => (
              <li key={c.title} className="text-xs text-[var(--act-graphite)]">
                <span className="font-semibold text-[var(--act-charcoal)]">{c.provider}</span> · {c.title} · {c.hours}h
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="col-span-12 flex items-center gap-2 md:col-span-3 md:justify-end">
        <span className={`act-chip ${statusConfig.chip}`}>{statusConfig.text}</span>
      </div>
    </li>
  );
}

/* ---------------- Job row ---------------- */
export function JobRow({ job: j }: { job: JobView }) {
  const matchClass = j.matchPct >= 80 ? "text-[var(--act-magenta)]" : j.matchPct >= 70 ? "text-[var(--act-iris)]" : "text-[var(--act-graphite)]";
  return (
    <li className="act-rowhover grid grid-cols-12 items-center gap-3 px-5 py-4">
      <div className="col-span-2">
        <div className={`act-display text-3xl ${matchClass}`}>{j.matchPct}</div>
        <div className="act-kicker !text-[10px]">match</div>
      </div>
      <div className="col-span-8 min-w-0">
        <h4 className="truncate font-semibold text-[var(--act-ink)]">
          <Link href={`/jobs/${j.id}`} className="hover:text-[var(--act-magenta)] hover:underline">{j.title}</Link>
        </h4>
        <p className="text-xs text-[var(--act-graphite)]">
          <span className="font-semibold text-[var(--act-charcoal)]">{j.company}</span> · {j.location}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {j.skills.map((s) => (
            <span key={s} className="rounded-md bg-[rgba(0,152,242,0.08)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--act-blue)]">{s}</span>
          ))}
        </div>
      </div>
      <div className="col-span-2 text-right">
        <p className="text-xs font-semibold text-[var(--act-ink)]">{j.salary}</p>
        <p className="act-kicker !text-[10px]">{j.posted}</p>
        <div className="mt-1.5">
          <ApplyButton jobId={j.id} alreadyApplied={!!j.applied} isExternal={!!j.applyUrl} />
        </div>
      </div>
    </li>
  );
}

/* ---------------- Market chart ---------------- */
export function MarketChart({ data }: { data: { label: string; value: number }[] }) {
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
        <defs>
          <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--act-magenta)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--act-magenta)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="chartLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff5cd6" />
            <stop offset="100%" stopColor="var(--act-magenta)" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#chartArea)" />
        <path d={path} fill="none" stroke="url(#chartLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === points.length - 1 ? 4.5 : 0} fill="var(--act-magenta)" stroke="#fff" strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] font-medium text-[var(--act-graphite)]">
        {data.map((d) => <span key={d.label}>{d.label}</span>)}
      </div>
    </div>
  );
}

/* ---------------- Course row ---------------- */
export function CourseRow({ course: c, idx }: { course: CourseView; idx: number }) {
  const tiles = [
    "bg-[linear-gradient(140deg,#38bdf8,var(--act-blue))]",
    "bg-[linear-gradient(140deg,#8b78ff,var(--act-iris))]",
    "bg-[linear-gradient(140deg,#ff5cd6,var(--act-magenta))]",
    "bg-[linear-gradient(140deg,#34d399,#059669)]",
    "bg-[linear-gradient(140deg,#fbbf24,#d97706)]",
  ];
  return (
    <li className="act-rowhover grid grid-cols-12 items-center gap-3 px-5 py-4">
      <div className="col-span-2 sm:col-span-1">
        <span className={`act-tile ${tiles[idx % tiles.length]}`}>{c.provider.charAt(0)}</span>
      </div>
      <div className="col-span-7 sm:col-span-8">
        <h4 className="text-sm font-semibold leading-snug text-[var(--act-ink)]">{c.title}</h4>
        <p className="mt-1 text-xs text-[var(--act-graphite)]">
          {c.provider} · {c.level} · {c.hours}h · <span className="text-[#d97706]">★</span> {c.rating}
        </p>
      </div>
      <div className="col-span-3 text-right">
        {c.priceIdr === 0 ? (
          <span className="act-chip act-chip-green">Gratis</span>
        ) : (
          <span className="text-sm font-semibold text-[var(--act-ink)]">Rp {(c.priceIdr / 1000).toFixed(0)}k</span>
        )}
      </div>
    </li>
  );
}

/* ---------------- Overview preview card ---------------- */
export function PreviewCard({
  href,
  kicker,
  title,
  children,
  tone = "blue",
}: {
  href: string;
  kicker: string;
  title: string;
  children: React.ReactNode;
  tone?: "blue" | "iris" | "magenta" | "mint";
}) {
  const rail = {
    blue: "act-rail-blue",
    iris: "act-rail-iris",
    magenta: "act-rail-magenta",
    mint: "act-rail-mint",
  }[tone];
  return (
    <Link href={href} className={`act-card-2 act-rail ${rail} act-rowhover group block p-5`}>
      <div className="flex items-center justify-between">
        <span className="act-kicker">{kicker}</span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--act-graphite)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--act-blue)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </div>
      <h3 className="act-heading mt-1.5 text-lg text-[var(--act-ink)]">{title}</h3>
      <div className="mt-3">{children}</div>
    </Link>
  );
}
