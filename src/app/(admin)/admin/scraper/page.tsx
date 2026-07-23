import {
  getAdminJobSources,
  getQueueStats,
  getRecentIngest,
} from "@/server/queries/admin";
import { PageHead, StatusDot } from "../../_ui";
import { toggleJobSourceAction } from "@/server/actions/admin";

export default async function AdminScraperPage() {
  const [queues, ingest, sources] = await Promise.all([
    getQueueStats(),
    getRecentIngest(10),
    getAdminJobSources(),
  ]);

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

      <section className="act-card-2 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
          <div>
            <span className="act-kicker">Job source registry</span>
            <p className="mt-1 text-xs text-[var(--act-graphite)]">
              Career page dan ATS publik yang stabil; tanpa bypass anti-bot.
            </p>
          </div>
          <span className="act-chip act-chip-mute">
            {sources.filter((source) => source.enabled).length}/{sources.length} aktif
          </span>
        </div>
        <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
          {sources.map((source) => (
            <li key={source.id} className="grid grid-cols-12 items-center gap-3 px-5 py-4">
              <div className="col-span-12 min-w-0 md:col-span-5">
                <p className="truncate text-sm font-semibold text-[var(--act-ink)]">
                  {source.name}
                </p>
                <p className="truncate text-xs text-[var(--act-graphite)]">
                  {source.provider} · {source.region ?? "region bebas"} · {source.jobCount} job
                </p>
              </div>
              <div className="col-span-6 text-xs text-[var(--act-graphite)] md:col-span-4">
                {source.lastError ? (
                  <span className="text-[var(--act-magenta)]" title={source.lastError}>
                    Error: {source.lastError.slice(0, 70)}
                  </span>
                ) : source.lastSuccessAt ? (
                  <>Sukses {source.lastSuccessAt}</>
                ) : (
                  <>Belum pernah scan</>
                )}
              </div>
              <div className="col-span-3 md:col-span-1">
                <StatusDot
                  tone={source.enabled ? "green" : "mute"}
                  label={source.enabled ? "aktif" : "nonaktif"}
                />
              </div>
              <form
                action={toggleJobSourceAction.bind(null, source.id)}
                className="col-span-3 text-right md:col-span-2"
              >
                <button type="submit" className="act-pill-ghost !px-3 !py-1.5 !text-xs">
                  {source.enabled ? "Nonaktifkan" : "Aktifkan"}
                </button>
              </form>
            </li>
          ))}
        </ul>
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
              <div className="col-span-3 text-sm text-[var(--act-teal)] md:col-span-2">{q.completed}</div>
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
    green: "text-[var(--act-teal)]",
    magenta: "text-[var(--act-magenta)]",
  }[tone];
  return (
    <div className="act-card-2 p-5">
      <span className="act-kicker">{label}</span>
      <div className={`act-display mt-2 text-3xl ${valueColor}`}>{value.toLocaleString("id-ID")}</div>
    </div>
  );
}
