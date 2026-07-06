import { getAdminJobs, getPlatformStats } from "@/server/queries/admin";
import { PageHead, StatusDot } from "../../_ui";

export default async function AdminJobsPage() {
  const [jobs, stats] = await Promise.all([getAdminJobs(30), getPlatformStats()]);

  return (
    <div className="act-rise space-y-8">
      <PageHead
        kicker="Admin · Jobs"
        title="Kelola lowongan"
        desc="Lowongan hasil scraping & posting. Data real dari database."
        action={
          <div className="flex gap-2">
            <span className="act-chip act-chip-green">{stats.activeJobs} aktif</span>
          </div>
        }
      />

      <div className="act-card-2 overflow-hidden">
        <div className="hidden grid-cols-12 gap-3 border-b border-[rgba(15,23,42,0.07)] px-5 py-3 md:grid">
          <span className="act-kicker !text-[11px] col-span-6">Posisi</span>
          <span className="act-kicker !text-[11px] col-span-2">Sumber</span>
          <span className="act-kicker !text-[11px] col-span-2">Diposting</span>
          <span className="act-kicker !text-[11px] col-span-2">Status</span>
        </div>
        <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
          {jobs.map((j) => (
            <li key={j.id} className="act-rowhover grid grid-cols-12 items-center gap-3 px-5 py-4">
              <div className="col-span-12 md:col-span-6">
                <div className="text-sm font-semibold text-[var(--act-ink)]">{j.title}</div>
                <div className="text-xs text-[var(--act-graphite)]">
                  <span className="font-semibold text-[var(--act-charcoal)]">{j.company}</span> · {j.location}
                </div>
              </div>
              <div className="col-span-4 md:col-span-2">
                <span className="act-chip act-chip-mute">{j.source}</span>
              </div>
              <div className="col-span-4 text-xs text-[var(--act-graphite)] md:col-span-2">{j.postedAt}</div>
              <div className="col-span-4 md:col-span-2">
                <StatusDot tone={j.isActive ? "green" : "mute"} label={j.isActive ? "aktif" : "nonaktif"} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
