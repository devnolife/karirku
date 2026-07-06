import { MOCK_GOAL } from "@/lib/mock/data";
import { getGoal, getMockSession } from "@/lib/mock/session";
import { getMarketTrend, getRecommendedJobs } from "@/lib/data/jobseeker";
import { PageHeader, JobRow, MarketChart, EmptyState } from "../_dash/parts";

export default async function JobsPage() {
  const session = await getMockSession();
  const goal = (await getGoal()) ?? MOCK_GOAL;
  const [jobs, trend] = await Promise.all([
    getRecommendedJobs(session.user.email),
    getMarketTrend(goal.targetRole),
  ]);
  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-8 md:px-10">
      <PageHeader
        title={<>Job match <span className="text-[var(--act-magenta)]">& trend.</span></>}
        meta="Rekomendasi berbasis skill & readiness"
        action={<span className="act-chip act-chip-mute">{jobs.length} posisi</span>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="act-card-2 overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
            <span className="act-kicker">Rekomendasi loker</span>
            <span className="act-chip act-chip-mute">{jobs.length} posisi</span>
          </div>
          <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
            {jobs.length === 0 ? (
              <li className="p-4">
                <EmptyState
                  compact
                  glyph="jobs"
                  title="Belum ada lowongan yang cocok"
                  desc="Scanner masih mengumpulkan lowongan untuk target role kamu. Perjelas goal supaya match lebih tajam."
                />
              </li>
            ) : (
              jobs.map((j) => <JobRow key={j.id} job={j} />)
            )}
          </ul>
        </div>
        <div className="act-card-2 act-wash-petal-soft overflow-hidden border-[rgba(242,0,202,0.16)] p-5 lg:col-span-2">
          <span className="act-kicker">Demand trend</span>
          <h3 className="act-heading mt-2 text-2xl">{goal.targetRole.split(" ").slice(0, 2).join(" ")}</h3>
          <p className="mt-1 text-sm text-[var(--act-graphite)]">8 bulan terakhir</p>
          <MarketChart data={trend} />
          <div className="mt-3 flex items-center justify-between border-t border-[rgba(15,23,42,0.07)] pt-3">
            <span className="act-kicker">vs 6 bln lalu</span>
            <TrendDelta trend={trend} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Delta % dihitung dari data trend — bukan angka hardcode. */
function TrendDelta({ trend }: { trend: { label: string; value: number }[] }) {
  const first = trend[0]?.value ?? 0;
  const last = trend[trend.length - 1]?.value ?? 0;
  if (first <= 0) return <span className="act-chip act-chip-mute">n/a</span>;
  const pct = Math.round(((last - first) / first) * 100);
  const cls = pct >= 0 ? "act-chip-green" : "act-chip-magenta";
  return (
    <span className={`act-chip ${cls}`}>
      {pct >= 0 ? "+" : ""}
      {pct}%
    </span>
  );
}
