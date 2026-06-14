import { MOCK_JOBS, MOCK_MARKET_TREND, MOCK_GOAL } from "@/lib/mock/data";
import { getGoal } from "@/lib/mock/session";
import { PageHeader, JobRow, MarketChart } from "../_dash/parts";

export default async function JobsPage() {
  const goal = (await getGoal()) ?? MOCK_GOAL;
  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-8 md:px-10">
      <PageHeader
        kicker="Market"
        title={<>Job match <span className="text-[var(--act-magenta)]">& trend.</span></>}
        meta="Rekomendasi berbasis skill & readiness"
        action={<span className="act-chip act-chip-mute">{MOCK_JOBS.length} posisi</span>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="act-card-2 overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
            <span className="act-kicker">Rekomendasi loker</span>
            <span className="act-chip act-chip-mute">{MOCK_JOBS.length} posisi</span>
          </div>
          <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
            {MOCK_JOBS.map((j) => <JobRow key={j.id} job={j} />)}
          </ul>
        </div>
        <div className="act-card-2 act-wash-petal-soft overflow-hidden border-[rgba(242,0,202,0.16)] p-5 lg:col-span-2">
          <span className="act-kicker">Demand trend</span>
          <h3 className="act-heading mt-2 text-2xl">{goal.targetRole.split(" ").slice(0, 2).join(" ")}</h3>
          <p className="mt-1 text-sm text-[var(--act-graphite)]">8 bulan terakhir</p>
          <MarketChart data={MOCK_MARKET_TREND} />
          <div className="mt-3 flex items-center justify-between border-t border-[rgba(15,23,42,0.07)] pt-3">
            <span className="act-kicker">vs 6 bln lalu</span>
            <span className="act-chip act-chip-green">+102%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
