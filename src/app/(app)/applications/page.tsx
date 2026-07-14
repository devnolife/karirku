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
  const activeCount = apps.filter((a) => ["screened", "interview"].includes(a.status)).length;
  const outcomeCount = apps.filter((a) => ["offered", "accepted"].includes(a.status)).length;

  return (
    <div className="act-rise mx-auto max-w-[1100px] space-y-8 px-6 py-8 md:px-10">
      <PageHeader
        kicker="Lamaran"
        title={<>Jejak <span className="text-[var(--act-blue)]">peluangmu.</span></>}
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
        <>
          <section aria-label="Ringkasan pipeline" className="grid grid-cols-3 overflow-hidden rounded-[22px] border border-[rgba(4,39,24,0.08)] bg-white shadow-[0_14px_28px_-26px_rgba(4,39,24,0.42)]">
            <div className="border-r border-[rgba(4,39,24,0.08)] px-4 py-4 sm:px-5"><span className="studio-section-kicker">Terkirim</span><p className="act-display mt-2 text-3xl text-[var(--act-ink)]">{apps.length}</p></div>
            <div className="border-r border-[rgba(4,39,24,0.08)] bg-[#F2FBF6] px-4 py-4 sm:px-5"><span className="studio-section-kicker">Berjalan</span><p className="act-display mt-2 text-3xl text-[var(--act-blue)]">{activeCount}</p></div>
            <div className="bg-[#D4E5CD] px-4 py-4 sm:px-5"><span className="studio-section-kicker">Hasil positif</span><p className="act-display mt-2 text-3xl text-[var(--act-onyx)]">{outcomeCount}</p></div>
          </section>
          <nav aria-label="Tahap lamaran" className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[rgba(4,39,24,0.08)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--act-charcoal)]">Semua · {apps.length}</span>
            <span className="rounded-full bg-[#F2FBF6] px-3 py-1.5 text-xs font-semibold text-[var(--act-blue)]">Dilamar</span>
            <span className="rounded-full bg-[#D2DDEA] px-3 py-1.5 text-xs font-semibold text-[var(--act-iris)]">Proses</span>
            <span className="rounded-full bg-[#EBE3D2] px-3 py-1.5 text-xs font-semibold text-[#8A5A18]">Keputusan</span>
          </nav>
          <section aria-label="Daftar lamaran" className="overflow-hidden rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-white shadow-[0_16px_32px_-28px_rgba(4,39,24,0.48)]">
          <ul className="divide-y divide-[rgba(4,39,24,0.08)]">
            {apps.map((a) => (
              <li key={a.id} className="grid grid-cols-12 items-center gap-3 px-5 py-5 transition-colors hover:bg-[#F2FBF6] md:px-6">
                <div className="col-span-12 md:col-span-6">
                  <span className="studio-section-kicker">Peluang</span>
                  <div className="mt-1 text-[15px] font-semibold text-[var(--act-ink)]">{a.jobTitle}</div>
                  <div className="mt-1 text-xs text-[var(--act-graphite)]">
                    <span className="font-semibold text-[var(--act-charcoal)]">{a.company}</span> · {a.location}
                  </div>
                </div>
                <div className="col-span-5 md:col-span-2">
                  <span className="act-kicker !text-[10px] md:hidden">Jalur</span>
                  <span className="act-chip act-chip-mute">{a.mode === "native" ? "In-platform" : "Eksternal"}</span>
                </div>
                <div className="col-span-4 text-xs text-[var(--act-graphite)] md:col-span-2"><span className="act-kicker !text-[10px] md:hidden">Terkirim</span><span className="block md:inline">{a.appliedAt}</span></div>
                <div className="col-span-3 md:col-span-1">
                  <span className={`act-chip ${STATUS_TONE[a.status] ?? "act-chip-mute"}`}>{statusLabel(a.status)}</span>
                </div>
                <div className="col-span-12 border-t border-[rgba(4,39,24,0.06)] pt-3 text-left md:col-span-1 md:border-0 md:pt-0 md:text-right">
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
          </section>
        </>
      )}
    </div>
  );
}
