import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getActiveGoal } from "@/server/queries/goal";
import { getJobMatches, getRoleMarket } from "@/server/queries/jobs";
import { PageHeader, JobRow, MarketChart } from "../_dash/parts";
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
        title={<>Job match <span className="text-[var(--act-magenta)]">& trend.</span></>}
        meta="Lowongan Indonesia diutamakan, lalu remote & global"
        action={<span className="act-chip act-chip-mute">{market.openPositions} posisi</span>}
      />

      {/* Region filter */}
      <div className="flex flex-wrap gap-2">
        {REGION_TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/jobs" : `/jobs?region=${t.key}`}
            className={
              t.key === activeTab.key
                ? "rounded-full bg-[var(--act-onyx)] px-4 py-2 text-sm font-semibold text-white"
                : "rounded-full border border-[rgba(15,23,42,0.12)] bg-[var(--act-mist)] px-4 py-2 text-sm font-medium text-[var(--act-charcoal)] transition-all hover:border-[var(--act-blue)]"
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="act-card-2 overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
            <span className="act-kicker">Rekomendasi loker · {activeTab.label}</span>
            <span className="act-chip act-chip-mute">{jobs.length} posisi</span>
          </div>
          {jobs.length === 0 ? (
            <div className="p-5">
              <Empty title="Belum ada lowongan cocok" description="Coba filter lain atau tambahkan skill di profilmu untuk meningkatkan kecocokan." />
            </div>
          ) : (
            <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
              {jobs.map((j) => <JobRow key={j.id} job={j} />)}
            </ul>
          )}
        </div>
        <div className="act-card-2 act-wash-petal-soft overflow-hidden border-[rgba(242,0,202,0.16)] p-5 lg:col-span-2">
          <span className="act-kicker">Demand by level</span>
          <h3 className="act-heading mt-2 text-2xl">{roleLabel}</h3>
          <p className="mt-1 text-sm text-[var(--act-graphite)]">Sebaran {market.openPositions} posisi</p>
          <MarketChart data={market.trend} />
          <div className="mt-3 flex items-center justify-between border-t border-[rgba(15,23,42,0.07)] pt-3">
            <span className="act-kicker">Posisi aktif</span>
            <span className="act-chip act-chip-green">{market.openPositions}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
