import type { AutofillActivity } from "@/server/queries/autofill";

/**
 * Panel transparansi autofill: menampilkan apa yang dibantu isi oleh extension.
 * Read-only. Submit form selalu dilakukan user sendiri.
 */
export function AutofillActivityPanel({ activity }: { activity: AutofillActivity }) {
  const { summary, sessions } = activity;
  if (sessions.length === 0) return null;

  return (
    <section className="act-bezel">
      <div className="act-bezel-core overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(15,23,42,0.07)] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--act-ink)]">Aktivitas autofill</h2>
            <p className="text-xs text-[var(--act-graphite)]">
              Yang dibantu isi oleh extension — submit selalu oleh kamu.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="act-chip act-chip-mute">{summary.sessions} sesi</span>
            <span className="act-chip act-chip-blue">{summary.submitted} dikirim</span>
            <span className="act-chip act-chip-mute">{summary.fieldsFilled} field terisi</span>
            <span className="act-chip act-chip-mute">{summary.portals} portal</span>
          </div>
        </div>

        <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
          {sessions.map((s) => (
            <li key={s.id} className="act-rowhover grid grid-cols-12 items-center gap-3 px-5 py-3">
              <div className="col-span-12 md:col-span-5">
                <div className="text-sm font-medium text-[var(--act-ink)]">{s.host}</div>
                <div className="text-xs text-[var(--act-graphite)]">{s.when}</div>
              </div>
              <div className="col-span-6 md:col-span-3 text-xs text-[var(--act-graphite)]">{s.method}</div>
              <div className="col-span-6 md:col-span-2 text-xs text-[var(--act-graphite)]">
                {s.fieldsFilled}/{s.fieldsTotal} field
              </div>
              <div className="col-span-12 md:col-span-2 md:text-right">
                <span className="act-chip act-chip-mute">{s.status}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
