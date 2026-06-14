import { MOCK_ADMIN_JOBS } from "@/lib/mock/data";
import { PageHead, StatusDot } from "../../_ui";

export default function AdminJobsPage() {
  const jobs = MOCK_ADMIN_JOBS;
  const activeCount = jobs.filter((j) => j.status === "active").length;

  return (
    <div className="act-rise space-y-8">
      <PageHead
        kicker="Admin · Jobs"
        title="Kelola lowongan"
        desc="Lowongan hasil scraping & manual. Data ilustratif (mode demo)."
        action={
          <div className="flex gap-2">
            <span className="act-chip act-chip-blue">{jobs.length} total</span>
            <span className="act-chip act-chip-green">{activeCount} aktif</span>
          </div>
        }
      />

      <div className="act-card-2 overflow-hidden">
        <div className="hidden grid-cols-12 gap-3 border-b border-[rgba(15,23,42,0.07)] px-5 py-3 md:grid">
          <span className="act-kicker !text-[11px] col-span-5">Posisi</span>
          <span className="act-kicker !text-[11px] col-span-2">Sumber</span>
          <span className="act-kicker !text-[11px] col-span-2">Pelamar</span>
          <span className="act-kicker !text-[11px] col-span-2">Status</span>
          <span className="act-kicker !text-[11px] col-span-1 text-right">Aksi</span>
        </div>
        <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
          {jobs.map((j) => (
            <li key={j.id} className="act-rowhover grid grid-cols-12 items-center gap-3 px-5 py-4">
              <div className="col-span-12 md:col-span-5">
                <div className="text-sm font-semibold text-[var(--act-ink)]">{j.title}</div>
                <div className="text-xs text-[var(--act-graphite)]">
                  <span className="font-semibold text-[var(--act-charcoal)]">{j.company}</span> · {j.location} · {j.posted}
                </div>
              </div>
              <div className="col-span-4 md:col-span-2">
                <span className="act-chip act-chip-mute">{j.source}</span>
              </div>
              <div className="col-span-4 text-sm text-[var(--act-charcoal)] md:col-span-2">
                {j.applicants > 0 ? `${j.applicants} pelamar` : "—"}
              </div>
              <div className="col-span-4 md:col-span-2">
                <StatusDot
                  tone={j.status === "active" ? "green" : j.status === "draft" ? "amber" : "mute"}
                  label={j.status}
                />
              </div>
              <div className="col-span-12 text-left md:col-span-1 md:text-right">
                <button className="text-xs font-semibold text-[var(--act-blue)] hover:underline">
                  {j.status === "active" ? "Nonaktif" : "Aktifkan"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
