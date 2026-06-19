import { getQueueStats, getRecentIngest } from "@/server/queries/admin";
import { PageHead, StatusDot } from "../../_ui";

export default async function AdminScraperPage() {
  const [queues, ingest] = await Promise.all([getQueueStats(), getRecentIngest(10)]);

  const total = queues.reduce(
    (a, q) => ({
      waiting: a.waiting + q.waiting,
      active: a.active + q.active,
      completed: a.completed + q.completed,
      failed: a.failed + q.failed,
    }),
    { waiting: 0, active: 0, completed: 0, failed: 0 },
  );

  return (
    <div className="act-rise space-y-8">
      <PageHead
        kicker="Admin · Scraper"
        title="Monitoring pipeline"
        desc="Status antrian scraping & enrichment (BullMQ, real-time)."
        action={<span className="act-chip act-chip-blue">{total.active} aktif</span>}
      />

      {/* Queue stats — agregat semua antrian */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Q label="Menunggu" value={total.waiting} tone="amber" />
        <Q label="Berjalan" value={total.active} tone="blue" />
        <Q label="Selesai" value={total.completed} tone="green" />
        <Q label="Gagal" value={total.failed} tone="magenta" />
      </section>

      {/* Per-queue breakdown */}
      <div className="act-card-2 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
          <span className="act-kicker">Antrian (BullMQ)</span>
          <span className="act-chip act-chip-mute">{queues.length} queue</span>
        </div>
        <div className="hidden grid-cols-12 gap-3 border-b border-[rgba(15,23,42,0.07)] px-5 py-3 md:grid">
          <span className="act-kicker !text-[11px] col-span-4">Queue</span>
          <span className="act-kicker !text-[11px] col-span-2">Menunggu</span>
          <span className="act-kicker !text-[11px] col-span-2">Berjalan</span>
          <span className="act-kicker !text-[11px] col-span-2">Selesai</span>
          <span className="act-kicker !text-[11px] col-span-2">Gagal</span>
        </div>
        <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
          {queues.map((q) => (
            <li key={q.name} className="act-rowhover grid grid-cols-12 items-center gap-3 px-5 py-4">
              <div className="col-span-12 text-sm font-semibold text-[var(--act-ink)] md:col-span-4">{q.name}</div>
              <div className="col-span-3 text-sm text-[#b45309] md:col-span-2">{q.waiting}</div>
              <div className="col-span-3 text-sm text-[var(--act-blue)] md:col-span-2">{q.active}</div>
              <div className="col-span-3 text-sm text-[#059669] md:col-span-2">{q.completed}</div>
              <div className="col-span-3 text-sm text-[var(--act-magenta)] md:col-span-2">{q.failed}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Ingest per sumber */}
      <div className="act-card-2 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
          <span className="act-kicker">Ter-index per sumber</span>
          <span className="act-chip act-chip-mute">{ingest.length} sumber</span>
        </div>
        <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
          {ingest.map((r) => (
            <li key={r.source} className="act-rowhover grid grid-cols-12 items-center gap-3 px-5 py-4">
              <div className="col-span-6 text-sm font-semibold text-[var(--act-ink)] md:col-span-6">{r.source}</div>
              <div className="col-span-3 text-sm text-[var(--act-charcoal)] md:col-span-3">{r.items.toLocaleString("id-ID")} item</div>
              <div className="col-span-3 md:col-span-3">
                <StatusDot tone="green" label={r.lastAt} />
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
