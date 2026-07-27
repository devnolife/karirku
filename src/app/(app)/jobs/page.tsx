import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getActiveGoal } from "@/server/queries/goal";
import { getJobMatches, getRoleMarket } from "@/server/queries/jobs";
import { PageHeader, JobRow, MarketChart } from "../_dash/parts";
import { Empty } from "@/components/ui/empty";
import { JobSearchForm } from "@/components/JobSearchForm";
import type { JobRegion } from "@/core/location";

const REGION_TABS: { key: string; label: string; region?: JobRegion }[] = [
  { key: "all", label: "Semua" },
  { key: "indonesia", label: "Indonesia", region: "indonesia" },
  { key: "remote", label: "Remote", region: "remote" },
];

const TYPE_OPTIONS = ["fulltime", "parttime", "contract", "remote", "hybrid", "onsite"] as const;
const LEVEL_OPTIONS = ["intern", "junior", "mid", "senior", "lead", "manager"] as const;
const SALARY_OPTIONS = [
  { key: "5", label: "≥ Rp 5 jt", value: 5_000_000 },
  { key: "10", label: "≥ Rp 10 jt", value: 10_000_000 },
  { key: "20", label: "≥ Rp 20 jt", value: 20_000_000 },
] as const;

type JobsSearchParams = {
  region?: string;
  q?: string;
  type?: string;
  level?: string;
  gaji?: string;
  n?: string;
};

/** Bangun URL /jobs dengan param yang diubah (hapus kalau value kosong). */
function jobsUrl(current: JobsSearchParams, patch: Partial<JobsSearchParams>): string {
  const merged: Record<string, string | undefined> = { ...current, ...patch };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `/jobs?${qs}` : "/jobs";
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<JobsSearchParams>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const activeTab = REGION_TABS.find((t) => t.key === sp.region) ?? REGION_TABS[0];
  const q = sp.q?.trim() ?? "";
  const type = TYPE_OPTIONS.includes(sp.type as (typeof TYPE_OPTIONS)[number]) ? sp.type : undefined;
  const level = LEVEL_OPTIONS.includes(sp.level as (typeof LEVEL_OPTIONS)[number]) ? sp.level : undefined;
  const salary = SALARY_OPTIONS.find((s) => s.key === sp.gaji);
  const limit = Math.min(100, Math.max(20, Number(sp.n) || 20));

  const goal = await getActiveGoal(user.id);
  const [jobs, market] = await Promise.all([
    getJobMatches(user.id, limit, {
      surface: "jobs",
      region: activeTab.region,
      q: q || undefined,
      type,
      level,
      minSalary: salary?.value,
    }),
    getRoleMarket(goal?.targetRole ?? null),
  ]);
  const roleLabel = market.roleName;
  const hasFilter = Boolean(q || type || level || salary);
  const formatMarketSalary = (value: number | null) =>
    value === null
      ? "belum cukup data"
      : new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
          notation: "compact",
        }).format(value);

  return (
    <div className="act-rise app-page space-y-8">
      <PageHeader
        kicker="Market"
        title={<>Job match <span className="text-[var(--act-magenta)]">& trend.</span></>}
        meta="Lowongan Indonesia diutamakan, lalu remote & global"
        action={
          <span className={`act-chip ${market.ready ? "act-chip-green" : "act-chip-amber"}`}>
            {market.ready ? `${market.openPositions} posisi` : "data pasar terbatas"}
          </span>
        }
      />

      {/* Search */}
      <JobSearchForm initialQuery={q} />

      {/* Region + filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {REGION_TABS.map((t) => (
          <Link
            key={t.key}
            href={jobsUrl(sp, { region: t.key === "all" ? undefined : t.key })}
            className={
              t.key === activeTab.key
                ? "rounded-full bg-[var(--act-onyx)] px-4 py-2 text-sm font-semibold text-white"
                : "rounded-full border border-[rgba(15,23,42,0.12)] bg-[var(--act-mist)] px-4 py-2 text-sm font-medium text-[var(--act-charcoal)] transition-all hover:border-[var(--act-blue)]"
            }
          >
            {t.label}
          </Link>
        ))}

        <span className="mx-1 h-6 w-px bg-[rgba(15,23,42,0.1)]" aria-hidden />

        {SALARY_OPTIONS.map((s) => (
          <Link
            key={s.key}
            href={jobsUrl(sp, { gaji: salary?.key === s.key ? undefined : s.key })}
            className={
              salary?.key === s.key
                ? "rounded-full bg-[var(--act-iris)] px-3.5 py-1.5 text-xs font-semibold text-white"
                : "rounded-full border border-[rgba(15,23,42,0.12)] bg-[var(--act-mist)] px-3.5 py-1.5 text-xs font-medium text-[var(--act-charcoal)] transition-all hover:border-[var(--act-iris)]"
            }
          >
            {s.label}
          </Link>
        ))}

        {LEVEL_OPTIONS.map((l) => (
          <Link
            key={l}
            href={jobsUrl(sp, { level: level === l ? undefined : l })}
            className={
              level === l
                ? "rounded-full bg-[var(--act-blue)] px-3.5 py-1.5 text-xs font-semibold text-white"
                : "rounded-full border border-[rgba(15,23,42,0.12)] bg-[var(--act-mist)] px-3.5 py-1.5 text-xs font-medium text-[var(--act-charcoal)] transition-all hover:border-[var(--act-blue)]"
            }
          >
            {l}
          </Link>
        ))}

        {hasFilter && (
          <Link
            href={jobsUrl({ region: sp.region }, {})}
            className="ml-1 text-xs font-semibold text-[var(--act-magenta)] underline underline-offset-2"
          >
            Reset filter
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="act-bezel lg:col-span-3">
          <div className="act-bezel-core overflow-hidden">
            <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
              <span className="act-kicker">
                {q ? `Hasil “${q}” · ${activeTab.label}` : `Rekomendasi loker · ${activeTab.label}`}
              </span>
              <span className="act-chip act-chip-mute">{jobs.length} posisi</span>
            </div>
            {jobs.length === 0 ? (
              <div className="p-5">
                <Empty
                  title={q ? `Tidak ada hasil untuk “${q}”` : "Belum ada lowongan cocok"}
                  description={
                    q
                      ? "Coba kata kunci lain atau longgarkan filter."
                      : "Coba filter lain atau tambahkan skill di profilmu untuk meningkatkan kecocokan."
                  }
                />
              </div>
            ) : (
              <>
                <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
                  {jobs.map((j) => <JobRow key={j.id} job={j} />)}
                </ul>
                {jobs.length >= limit && limit < 100 && (
                  <div className="border-t border-[rgba(15,23,42,0.07)] p-4 text-center">
                    <Link
                      href={jobsUrl(sp, { n: String(limit + 20) })}
                      className="act-pill inline-block !text-sm"
                    >
                      Muat lebih banyak
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="act-bezel lg:col-span-2">
          <div
            className="act-bezel-core overflow-hidden p-5"
            style={{ "--core-bg": "radial-gradient(120% 130% at 50% 0%, #fbf3e4, var(--act-wash-petal) 86%)" } as React.CSSProperties}
          >
            <span className="act-kicker">Market intelligence</span>
            <h3 className="act-heading mt-2 text-2xl">{roleLabel}</h3>
            <p className="mt-1 text-sm text-[var(--act-graphite)]">
              {market.snapshotDate
                ? `Snapshot ${market.snapshotDate} · ≥${market.sourceCount} sumber`
                : "Belum ada snapshot pasar"}
            </p>
            {market.trend.length > 0 ? (
              <MarketChart data={market.trend} />
            ) : (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                {market.message}
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[rgba(15,23,42,0.07)] pt-4">
              <div>
                <span className="act-kicker !text-[10px]">Posisi aktif</span>
                <p className="mt-1 font-semibold text-[var(--act-ink)]">{market.openPositions}</p>
              </div>
              <div>
                <span className="act-kicker !text-[10px]">Median gaji</span>
                <p className="mt-1 text-sm font-semibold text-[var(--act-ink)]">
                  {formatMarketSalary(market.salaryP50)}
                </p>
                <p className="text-[10px] text-[var(--act-graphite)]">
                  {market.salarySampleSize} sampel
                </p>
              </div>
            </div>
            {market.topSkills.length > 0 && (
              <div className="mt-4">
                <span className="act-kicker !text-[10px]">Skill paling diminta</span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {market.topSkills.map((skill) => (
                    <span key={skill.name} className="act-chip act-chip-mute">
                      {skill.name} · {skill.count}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {market.message && (
              <p className="mt-4 text-xs text-[var(--act-graphite)]">{market.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
