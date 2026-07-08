import Link from "next/link";
import { ApplyButton } from "@/components/ApplyButton";
import { JobFeedbackButtons } from "@/components/JobFeedbackButtons";
import { MilestoneStatusButton } from "@/components/MilestoneStatusButton";
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
  kicker?: string;
  title: React.ReactNode;
  meta?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {kicker && <span className="act-eyebrow">{kicker}</span>}
        <h1 className={`act-display text-3xl leading-[1.05] md:text-4xl ${kicker ? "mt-3" : ""}`}>{title}</h1>
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
                <span className="font-semibold text-[var(--act-charcoal)]">{c.provider}</span> ·{" "}
                {c.url ? (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-dotted underline-offset-2 hover:text-[var(--act-iris)]"
                  >
                    {c.title}
                  </a>
                ) : (
                  c.title
                )}{" "}
                · {c.hours}h
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="col-span-12 flex items-center gap-2 md:col-span-3 md:justify-end">
        <span className={`act-chip ${statusConfig.chip}`}>{statusConfig.text}</span>
        <MilestoneStatusButton milestoneId={m.id} status={m.status} />
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
          {j.sourceLabel && (
            <span className="ml-1.5 rounded bg-[var(--act-mist)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--act-graphite)] ring-1 ring-[rgba(15,23,42,0.06)]">{j.sourceLabel}</span>
          )}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {j.skills.map((s) => {
            const owned = j.matchedSkills?.some((m) => m.toLowerCase() === s.toLowerCase());
            return (
              <span
                key={s}
                title={owned ? "Kamu punya skill ini" : "Belum ada di profilmu"}
                className={
                  owned
                    ? "rounded-md bg-[rgba(0,200,120,0.10)] px-1.5 py-0.5 text-[10px] font-semibold text-[#0a7a4b]"
                    : "rounded-md bg-[rgba(0,152,242,0.08)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--act-blue)]"
                }
              >
                {owned ? "✓ " : ""}{s}
              </span>
            );
          })}
        </div>
        {j.matchReasons && j.matchReasons.length > 0 && (
          <p className="mt-1 truncate text-[10px] text-[var(--act-graphite)]" title={j.matchReasons.join(" · ")}>
            {j.matchReasons.join(" · ")}
          </p>
        )}
        <div className="mt-1.5">
          <JobFeedbackButtons jobId={j.id} saved={j.saved} />
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

/* ---------------- Empty state ---------------- */
const EMPTY_GLYPHS = {
  jobs: "M4 7h16v12H4zM9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M4 12h16",
  courses: "M3 5l9-2 9 2-9 2-9-2zm0 0v9m9 7c-3-2-6-2.5-9-2.5V14m18-9v9c-3 0-6 .5-9 2.5",
  milestones: "M9 6h11M9 12h11M9 18h11M5 6h.01M5 12h.01M5 18h.01",
  proposals: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h5M10 17h5",
  projects: "M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5",
  candidates: "M9 11a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0M17 11a4 4 0 000-8",
  activity: "M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
} as const;

export function EmptyState({
  glyph,
  title,
  desc,
  action,
  compact,
}: {
  glyph: keyof typeof EMPTY_GLYPHS;
  title: string;
  desc: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[18px] border border-dashed border-[rgba(15,23,42,0.14)] bg-[var(--act-mist)] text-center ${compact ? "px-6 py-10" : "px-8 py-16"
        }`}
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(0,152,242,0.09)] text-[var(--act-blue)]">
        <svg
          viewBox="0 0 24 24"
          className="h-[22px] w-[22px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d={EMPTY_GLYPHS[glyph]} />
        </svg>
      </span>
      <h3 className="act-heading mt-4 text-lg text-[var(--act-ink)]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[var(--act-graphite)]">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
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

/* =====================================================================
   Donezo-style kit — StatCard (featured), DonutProgress, HatchedBars
   ===================================================================== */

/* ---------------- StatCard ---------------- */
export function StatCard({
  label,
  value,
  delta,
  href,
  featured = false,
}: {
  label: string;
  value: React.ReactNode;
  /** Teks kecil di bawah angka, mis. "Naik dari bulan lalu". */
  delta?: string;
  /** Bila diisi, seluruh kartu menjadi tautan + panah aktif. */
  href?: string;
  /** Kartu highlight gelap (onyx solid, teks putih). */
  featured?: boolean;
}) {
  const base = featured
    ? "bg-[var(--act-onyx)] text-white border-transparent"
    : "act-card-2";
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          className={
            "act-kicker " + (featured ? "!text-white/70" : "")
          }
        >
          {label}
        </span>
        <span
          className={
            "grid h-7 w-7 flex-none place-items-center rounded-full border transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 " +
            (featured
              ? "border-white/25 text-white"
              : "border-[rgba(15,23,42,0.12)] text-[var(--act-graphite)]")
          }
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
        </span>
      </div>
      <div className={"act-display mt-4 text-5xl " + (featured ? "text-white" : "text-[var(--act-ink)]")}>
        {value}
      </div>
      {delta && (
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className={
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold " +
              (featured ? "bg-white/15 text-white" : "bg-[rgba(5,150,105,0.12)] text-[#15803d]")
            }
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M7 14l5-5 5 5" />
            </svg>
          </span>
          <span className={"text-xs " + (featured ? "text-white/70" : "text-[var(--act-graphite)]")}>
            {delta}
          </span>
        </div>
      )}
    </>
  );
  const cls = `group block rounded-[20px] p-5 ${base} ` + (featured ? "" : "act-rowhover");
  return href ? (
    <Link href={href} className={cls}>{inner}</Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/* ---------------- DonutProgress (with legend) ---------------- */
export type DonutSegment = { label: string; color: string };

export function DonutProgress({
  primaryPct,
  primaryLabel,
  segments,
}: {
  primaryPct: number;
  primaryLabel: string;
  segments: DonutSegment[];
}) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (primaryPct / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[150px] w-[150px]">
        <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
          <defs>
            <linearGradient id="donut" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--act-sky-bright)" />
              <stop offset="100%" stopColor="var(--act-sky-deep)" />
            </linearGradient>
          </defs>
          <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(15,23,42,0.07)" strokeWidth="14" />
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke="url(#donut)"
            strokeWidth="14"
            strokeDasharray={`${dash} ${c}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="act-display text-4xl text-[var(--act-ink)]">{primaryPct}%</span>
          <span className="text-xs text-[var(--act-graphite)]">{primaryLabel}</span>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {segments.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 text-xs text-[var(--act-charcoal)]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- GaugeProgress (semicircle) ---------------- */
export function GaugeProgress({
  pct,
  label,
  segments,
}: {
  pct: number;
  label: string;
  segments: DonutSegment[];
}) {
  const R = 84;
  const len = Math.PI * R;
  const dash = (pct / 100) * len;
  const path = "M16,104 A84,84 0 0 1 184,104";
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[220px]">
        <svg viewBox="0 0 200 118" className="w-full">
          <defs>
            <linearGradient id="gauge" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--act-sky-bright)" />
              <stop offset="100%" stopColor="var(--act-sky-deep)" />
            </linearGradient>
          </defs>
          <path d={path} fill="none" stroke="rgba(15,23,42,0.07)" strokeWidth="18" strokeLinecap="round" />
          <path
            d={path}
            fill="none"
            stroke="url(#gauge)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${len}`}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
          <span className="act-display text-4xl text-[var(--act-ink)]">{pct}%</span>
          <span className="text-xs text-[var(--act-graphite)]">{label}</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {segments.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 text-xs text-[var(--act-charcoal)]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- HatchedBars ---------------- */
export type BarDatum = { label: string; value: number; active?: boolean };

export function HatchedBars({
  data,
  max,
  height = 150,
}: {
  data: BarDatum[];
  /** Nilai maksimum untuk skala; default = nilai terbesar. */
  max?: number;
  height?: number;
}) {
  const peak = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-stretch gap-3" style={{ height }}>
      {data.map((d, i) => {
        const h = Math.max(6, (d.value / peak) * 100);
        const filled = d.value > 0;
        return (
          <div key={i} className="flex h-full flex-1 flex-col items-center gap-2">
            <div className="relative flex w-full flex-1 items-end justify-center">
              {d.active && (
                <span
                  className="absolute z-10 rounded-md bg-[var(--act-ink)] px-1.5 py-0.5 text-[10px] font-semibold text-white"
                  style={{ bottom: `calc(${h}% + 4px)` }}
                >
                  {Math.round((d.value / peak) * 100)}%
                </span>
              )}
              <div
                className={
                  "w-full max-w-[38px] rounded-full " +
                  (d.active
                    ? "bg-[linear-gradient(180deg,var(--act-sky-bright),var(--act-sky-deep))]"
                    : filled
                      ? "bg-[rgba(0,152,242,0.25)]"
                      : "act-hatch")
                }
                style={{ height: `${h}%` }}
              />
            </div>
            <span className="text-xs text-[var(--act-graphite)]">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- SecondaryModeCard ---------------- */
/**
 * Kartu ringkas mode karir kedua — muncul di dashboard saat user memilih
 * "Dua-duanya" (targetTrack === "both") di Onboarding. Tidak pernah
 * menggantikan dashboard utama, hanya satu baris ringkasan + tautan.
 */
export function SecondaryModeCard({
  href,
  tone,
  label,
  title,
  subtitle,
  stats,
}: {
  href: string;
  tone: "blue" | "iris";
  label: string;
  title: string;
  subtitle: string;
  stats: { label: string; value: string }[];
}) {
  const chipCls = tone === "blue" ? "act-chip-blue" : "act-chip-iris";
  return (
    <Link
      href={href}
      className="act-card-2 act-rowhover group flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1">
        <span className={`act-chip ${chipCls}`}>{label}</span>
        <p className="mt-2 truncate text-sm font-semibold text-[var(--act-ink)]">{title}</p>
        <p className="truncate text-xs text-[var(--act-graphite)]">{subtitle}</p>
      </div>
      <div className="flex flex-none gap-6">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="act-display text-xl text-[var(--act-ink)]">{s.value}</div>
            <div className="text-[11px] text-[var(--act-graphite)]">{s.label}</div>
          </div>
        ))}
      </div>
      <svg
        viewBox="0 0 24 24"
        className="hidden h-4 w-4 flex-none text-[var(--act-graphite)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--act-blue)] sm:block"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M5 12h14M13 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
