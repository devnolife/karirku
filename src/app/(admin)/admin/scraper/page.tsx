import { MOCK_SCRAPER_RUNS, MOCK_QUEUE_STATS } from "@/lib/mock/data";
import { PageHead, StatusDot } from "../../_ui";

export default function AdminScraperPage() {
  const runs = MOCK_SCRAPER_RUNS;
  const q = MOCK_QUEUE_STATS;

  return (
    <div className="act-rise space-y-8">
      <PageHead
        kicker="Admin · Scraper"
        title="Monitoring pipeline"
        desc="Status scraping & enrichment job/course. Data ilustratif (mode demo)."
        action={<span className="act-chip act-chip-blue">{q.active} aktif</span>}
      />

      {/* Queue stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Q label="Menunggu" value={q.waiting} tone="amber" />
        <Q label="Berjalan" value={q.active} tone="blue" />
        <Q label="Selesai" value={q.completed} tone="green" />
        <Q label="Gagal" value={q.failed} tone="magenta" />
      </section>

      {/* Runs table */}
      <div className="act-card-2 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
          <span className="act-kicker">Run terbaru</span>
          <span className="act-chip act-chip-mute">{runs.length} entri</span>
        </div>
        <div className="hidden grid-cols-12 gap-3 border-b border-[rgba(15,23,42,0.07)] px-5 py-3 md:grid">
          <span className="act-kicker !text-[11px] col-span-3">Sumber</span>
          <span className="act-kicker !text-[11px] col-span-2">Tipe</span>
          <span className="act-kicker !text-[11px] col-span-2">Item</span>
          <span className="act-kicker !text-[11px] col-span-2">Durasi</span>
          <span className="act-kicker !text-[11px] col-span-3">Status</span>
        </div>
        <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
          {runs.map((r) => (
            <li key={r.id} className="act-rowhover grid grid-cols-12 items-center gap-3 px-5 py-4">
              <div className="col-span-12 text-sm font-semibold text-[var(--act-ink)] md:col-span-3">{r.source}</div>
              <div className="col-span-4 md:col-span-2">
                <span className="act-chip act-chip-mute">{r.type}</span>
              </div>
              <div className="col-span-4 text-sm text-[var(--act-charcoal)] md:col-span-2">
                {r.items.toLocaleString("id-ID")}
              </div>
              <div className="col-span-4 text-sm text-[var(--act-graphite)] md:col-span-2">{r.duration}</div>
              <div className="col-span-12 flex items-center gap-2 md:col-span-3">
                <StatusDot
                  tone={r.status === "success" ? "green" : r.status === "running" ? "blue" : "magenta"}
                  label={r.status}
                />
                <span className="text-xs text-[var(--act-graphite)]">{r.finishedAt}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Q({ label, value, tone }: { label: string; value: number; tone: "amber" | "blue" | "green" | "magenta" }) {
  const valueColor = {
    amber: "text-[#b45309]",
    blue: "text-[var(--act-blue)]",
    green: "text-[#059669]",
    magenta: "text-[var(--act-magenta)]",
  }[tone];
  return (
    <div className="act-card-2 p-5">
      <span className="act-kicker">{label}</span>
      <div className={`act-display mt-2 text-3xl ${valueColor}`}>{value.toLocaleString("id-ID")}</div>
    </div>
  );
}
