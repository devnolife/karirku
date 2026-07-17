import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getActiveGoal } from "@/server/queries/goal";
import { getJobMatches, getRoleMarket } from "@/server/queries/jobs";
import { ApplyButton } from "@/components/ApplyButton";
import type { JobView } from "@/lib/view-models";
import { PageHeader } from "../_dash/parts";
import { Empty } from "@/components/ui/empty";
import type { JobRegion } from "@/lib/location";

const REGION_TABS: { key: string; label: string; region?: JobRegion }[] = [
  { key: "all", label: "Semua" },
  { key: "indonesia", label: "Indonesia", region: "indonesia" },
  { key: "remote", label: "Remote", region: "remote" },
];

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const user = await requireUser();
  const { region: regionParam } = await searchParams;
  const activeTab = REGION_TABS.find((t) => t.key === regionParam) ?? REGION_TABS[0];

  const goal = await getActiveGoal(user.id);
  const [jobs, market] = await Promise.all([
    getJobMatches(user.id, 20, activeTab.region),
    getRoleMarket(goal?.targetRole ?? null),
  ]);
  const roleLabel = goal?.targetRole?.split(" ").slice(0, 2).join(" ") ?? "Semua role";

  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-8 md:px-10">
      <PageHeader
        kicker="Market"
        title={<>Peluang yang <span className="text-[var(--act-blue)]">tepat untukmu.</span></>}
        meta="Lowongan Indonesia diutamakan, lalu remote & global"
        action={<span className="act-chip act-chip-mute">{market.openPositions} posisi</span>}
      />

      <nav aria-label="Filter wilayah" className="flex flex-wrap items-center gap-2 rounded-[22px] border border-[rgba(4,39,24,0.08)] bg-brand-50 p-2">
        <span className="px-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--act-graphite)]">Wilayah</span>
        {REGION_TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/jobs" : `/jobs?region=${t.key}`}
            aria-current={t.key === activeTab.key ? "page" : undefined}
            className={
              t.key === activeTab.key
                ? "rounded-full bg-[var(--act-onyx)] px-4 py-2 text-sm font-semibold text-white shadow-[0_3px_10px_-6px_rgba(4,39,24,0.8)]"
                : "rounded-full px-4 py-2 text-sm font-medium text-[var(--act-charcoal)] transition-colors hover:bg-white hover:text-[var(--act-ink)]"
            }
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section aria-labelledby="job-list-heading" className="overflow-hidden rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-white shadow-[0_16px_32px_-28px_rgba(4,39,24,0.5)] lg:col-span-3">
          <div className="flex items-center justify-between border-b border-[rgba(4,39,24,0.08)] px-5 py-4 md:px-6">
            <div>
              <span className="studio-section-kicker">Rekomendasi terkurasi</span>
              <h2 id="job-list-heading" className="act-heading mt-1 text-lg text-[var(--act-ink)]">Lowongan di {activeTab.label}</h2>
            </div>
            <span className="act-chip act-chip-mute">{jobs.length} posisi</span>
          </div>
          {jobs.length === 0 ? (
            <div className="p-5">
              <Empty title="Belum ada lowongan cocok" description="Coba filter lain atau tambahkan skill di profilmu untuk meningkatkan kecocokan." />
            </div>
          ) : (
            <ul className="divide-y divide-[rgba(4,39,24,0.08)]">
              {jobs.map((j) => <StudioJobRow key={j.id} job={j} />)}
            </ul>
          )}
        </section>
        <aside aria-label="Ringkasan pasar" className="rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-[var(--act-wash-blue)] p-5 shadow-[0_16px_32px_-28px_rgba(4,39,24,0.38)] lg:col-span-2">
          <span className="studio-section-kicker !text-blue-700">Denyut pasar</span>
          <h3 className="act-heading mt-2 text-2xl">{roleLabel}</h3>
          <p className="mt-1 text-sm leading-relaxed text-[var(--act-graphite)]">Pantau arah demand untuk role targetmu.</p>
          <MarketPulse data={market.trend} />
          <div className="mt-5 flex items-center justify-between border-t border-[rgba(4,39,24,0.1)] pt-4">
            <span className="text-sm font-medium text-[var(--act-charcoal)]">Posisi aktif</span>
            <span className="act-display text-3xl text-[var(--act-onyx)]">{market.openPositions}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StudioJobRow({ job }: { job: JobView }) {
  const matchTone = job.matchPct >= 70 ? "text-[var(--act-green)]" : job.matchPct >= 40 ? "text-amber-600" : "text-rose-600";

  return (
    <li className="group grid grid-cols-12 items-center gap-3 px-5 py-5 transition-colors hover:bg-brand-50 md:px-6">
      <div className="col-span-3 sm:col-span-2">
        <div className={`act-display text-3xl ${matchTone}`}>{job.matchPct}<span className="text-base">%</span></div>
        <div className="act-kicker !text-[10px]">Kecocokan</div>
      </div>
      <div className="col-span-9 min-w-0 sm:col-span-7">
        <h3 className="truncate text-[15px] font-semibold text-[var(--act-ink)]">
          <Link href={`/jobs/${job.id}`} className="transition-colors group-hover:text-[var(--act-blue)]">{job.title}</Link>
        </h3>
        <p className="mt-1 text-xs text-[var(--act-graphite)]"><span className="font-semibold text-[var(--act-charcoal)]">{job.company}</span> · {job.location}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {job.skills.map((skill) => <span key={skill} className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-[var(--act-blue)]">{skill}</span>)}
        </div>
      </div>
      <div className="col-span-12 flex items-center justify-between border-t border-[rgba(4,39,24,0.06)] pt-3 sm:col-span-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
        <div>
          <p className="text-xs font-semibold text-[var(--act-ink)]">{job.salary}</p>
          <p className="mt-0.5 text-[11px] text-[var(--act-graphite)]">{job.posted}</p>
        </div>
        <div className="sm:mt-2"><ApplyButton jobId={job.id} alreadyApplied={!!job.applied} isExternal={!!job.applyUrl} /></div>
      </div>
    </li>
  );
}

function MarketPulse({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="mt-7" aria-label="Tren pasar per level">
      <div className="flex h-28 items-end gap-2">
        {data.map((item) => (
          <div key={item.label} className="flex h-full flex-1 items-end rounded-t-lg bg-white/45">
            <div className="w-full rounded-t-lg bg-[var(--act-info)] transition-[height]" style={{ height: `${Math.max(10, (item.value / max) * 100)}%` }} title={`${item.label}: ${item.value}`} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-semibold text-[var(--act-graphite)]">
        {data.map((item) => <span key={item.label}>{item.label}</span>)}
      </div>
    </div>
  );
}
