import { requireUser } from "@/lib/auth";
import { getUserApplications, statusLabel } from "@/server/queries/applications";
import { PageHeader } from "../_dash/parts";
import { Empty } from "@/components/ui/empty";

const STATUS_TONE: Record<string, string> = {
  applied: "act-chip-blue",
  screened: "act-chip-iris",
  interview: "act-chip-iris",
  offered: "act-chip-green",
  accepted: "act-chip-green",
  rejected: "act-chip-mute",
  ghosted: "act-chip-mute",
  withdrawn: "act-chip-mute",
};

export default async function ApplicationsPage() {
  const user = await requireUser();
  const apps = await getUserApplications(user.id);
  const nativeCount = apps.filter((a) => a.mode === "native").length;

  return (
    <div className="act-rise mx-auto max-w-[1100px] space-y-8 px-6 py-8 md:px-10">
      <PageHeader
        kicker="Lamaran"
        title={<>Lamaran <span className="text-[var(--act-blue)]">saya.</span></>}
        meta={`${apps.length} lamaran · ${nativeCount} in-platform`}
        action={<span className="act-chip act-chip-blue">{apps.length} total</span>}
      />

      {apps.length === 0 ? (
        <Empty
          title="Belum ada lamaran"
          description="Lamar lowongan dari halaman Lowongan untuk mulai melacak progresmu di sini."
          actionLabel="Lihat lowongan"
          actionHref="/jobs"
        />
      ) : (
        <div className="act-card-2 overflow-hidden">
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
                </div>
                <div className="col-span-4 md:col-span-2">
                  <span className="act-chip act-chip-mute">{a.mode === "native" ? "In-platform" : "Eksternal"}</span>
                </div>
                <div className="col-span-4 text-xs text-[var(--act-graphite)] md:col-span-2">{a.appliedAt}</div>
                <div className="col-span-4 md:col-span-2">
                  <span className={`act-chip ${STATUS_TONE[a.status] ?? "act-chip-mute"}`}>{statusLabel(a.status)}</span>
                </div>
                <div className="col-span-12 text-left md:col-span-1 md:text-right">
                  {a.applyUrl ? (
                    <a href={a.applyUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[var(--act-blue)] hover:underline">
                      Buka
                    </a>
                  ) : (
                    <span className="text-xs text-[var(--act-graphite)]">—</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
