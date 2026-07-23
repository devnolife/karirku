import { requireUser } from "@/lib/auth";
import { getUserApplications, statusLabel } from "@/server/queries/applications";
import { PageHeader } from "../_dash/parts";
import { Empty } from "@/components/ui/empty";
import { ApplicationStatusControl } from "./_status-control";
import { GmailOutcomeAssist } from "./_gmail-assist";
import { AutofillActivityPanel } from "./_autofill-activity";
import { getGmailOutcomeAssist } from "@/server/queries/gmail-outcomes";
import { getAutofillActivity } from "@/server/queries/autofill";

export default async function ApplicationsPage() {
  const user = await requireUser();
  const [apps, gmailAssist, autofillActivity] = await Promise.all([
    getUserApplications(user.id),
    getGmailOutcomeAssist(user.id),
    getAutofillActivity(user.id),
  ]);
  const nativeCount = apps.filter((a) => a.mode === "native").length;
  const activeCount = apps.filter((a) => ["screened", "interview"].includes(a.status)).length;
  const outcomeCount = apps.filter((a) => ["offered", "accepted"].includes(a.status)).length;

  return (
    <div className="act-rise app-page space-y-8">
      <PageHeader
        kicker="Lamaran"
        title={<>Jejak <span className="text-[var(--act-blue)]">peluangmu.</span></>}
        meta={`${apps.length} lamaran · ${nativeCount} in-platform`}
        action={<span className="act-chip act-chip-blue">{apps.length} total</span>}
      />

      <GmailOutcomeAssist assist={gmailAssist} />

      <AutofillActivityPanel activity={autofillActivity} />

      {apps.length === 0 ? (
        <Empty
          title="Belum ada lamaran"
          description="Lamar lowongan dari halaman Lowongan untuk mulai melacak progresmu di sini."
          actionLabel="Lihat lowongan"
          actionHref="/jobs"
        />
      ) : (
        <div className="act-bezel">
          <div className="act-bezel-core overflow-hidden">
            <div className="hidden grid-cols-12 gap-3 border-b border-[rgba(15,23,42,0.07)] px-5 py-3 md:grid">
              <span className="act-kicker !text-[11px] col-span-5">Posisi</span>
              <span className="act-kicker !text-[11px] col-span-2">Mode</span>
              <span className="act-kicker !text-[11px] col-span-2">Tanggal</span>
              <span className="act-kicker !text-[11px] col-span-2">Status</span>
              <span className="act-kicker !text-[11px] col-span-1 text-right">Aksi</span>
            </div>
            <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
              {apps.map((a) => (
                <li key={a.id} className="act-rowhover grid grid-cols-12 items-center gap-3 px-5 py-4">
                  <div className="col-span-12 md:col-span-5">
                    <div className="text-sm font-semibold text-[var(--act-ink)]">{a.jobTitle}</div>
                    <div className="text-xs text-[var(--act-graphite)]">
                      <span className="font-semibold text-[var(--act-charcoal)]">{a.company}</span> · {a.location}
                    </div>
                    {a.timeline.length > 0 && (
                      <details className="mt-2 text-[11px] text-[var(--act-graphite)]">
                        <summary className="cursor-pointer font-semibold text-[var(--act-blue)]">
                          Riwayat status ({a.timeline.length})
                        </summary>
                        <ol className="mt-1.5 space-y-1 border-l border-[rgba(15,23,42,0.12)] pl-3">
                          {a.timeline.map((event) => (
                            <li key={event.id}>
                              <span className="font-semibold text-[var(--act-charcoal)]">
                                {statusLabel(event.status)}
                              </span>
                              {" · "}
                              {event.occurredAt}
                              {" · "}
                              {event.source === "email" ? "saran email" : event.source}
                              {event.note ? ` — ${event.note}` : ""}
                            </li>
                          ))}
                        </ol>
                      </details>
                    )}
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <span className="act-chip act-chip-mute">{a.mode === "native" ? "In-platform" : "Eksternal"}</span>
                  </div>
                  <div className="col-span-4 text-xs text-[var(--act-graphite)] md:col-span-2">{a.appliedAt}</div>
                  <div className="col-span-4 md:col-span-2">
                    <ApplicationStatusControl
                      key={`${a.id}-${a.status}`}
                      applicationId={a.id}
                      currentStatus={a.status}
                    />
                  </div>
                  <div className="col-span-12 text-left md:col-span-1 md:text-right">
                    {a.applyUrl ? (
                      <a href={a.applyUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[var(--act-blue)] hover:underline">
                        Buka
                      </a>
                    ) : (
                      <span className="text-xs text-[var(--act-graphite)]">-</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
