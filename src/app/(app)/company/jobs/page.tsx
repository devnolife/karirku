import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCompanyJobs } from "@/server/queries/company";
import { Empty } from "@/components/ui/empty";

export default async function CompanyJobsPage() {
  const user = await requireUser();
  const jobs = await getCompanyJobs(user.id);
  const active = jobs.filter((j) => j.status === "active").length;

  return (
    <div className="act-rise mx-auto max-w-[1400px] space-y-8 px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="act-eyebrow">Company · Lowongan</span>
          <h1 className="act-display mt-3 text-4xl leading-[1.05] md:text-5xl">
            Lowongan <span className="act-sky-text">saya.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--act-graphite)]">
            Kelola lowongan terpasang & statusnya.
          </p>
        </div>
        <Link href="/company/jobs/new" className="act-pill group !text-sm">
          Posting lowongan
          <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
      </div>

      <div className="flex gap-2">
        <span className="act-chip act-chip-blue">{jobs.length} total</span>
        <span className="act-chip act-chip-green">{active} aktif</span>
      </div>

      {jobs.length === 0 ? (
        <Empty title="Belum ada lowongan" description="Posting lowongan pertamamu untuk mulai menerima kandidat." />
      ) : (
        <div className="act-card-2 overflow-hidden">
          <div className="hidden grid-cols-12 gap-3 border-b border-[rgba(15,23,42,0.07)] px-5 py-3 md:grid">
            <span className="act-kicker !text-[11px] col-span-5">Posisi</span>
            <span className="act-kicker !text-[11px] col-span-2">Tipe</span>
            <span className="act-kicker !text-[11px] col-span-2">Pelamar</span>
            <span className="act-kicker !text-[11px] col-span-2">Status</span>
            <span className="act-kicker !text-[11px] col-span-1 text-right">Aksi</span>
          </div>
          <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
            {jobs.map((j) => (
              <li key={j.id} className="act-rowhover grid grid-cols-12 items-center gap-3 px-5 py-4">
                <div className="col-span-12 md:col-span-5">
                  <div className="text-sm font-semibold text-[var(--act-ink)]">{j.title}</div>
                  <div className="text-xs text-[var(--act-graphite)]">{j.location} · {j.posted}</div>
                </div>
                <div className="col-span-4 md:col-span-2">
                  <span className="act-chip act-chip-mute">{j.type}</span>
                </div>
                <div className="col-span-4 text-sm text-[var(--act-charcoal)] md:col-span-2">
                  {j.applicants > 0 ? `${j.applicants} pelamar` : "—"}
                </div>
                <div className="col-span-4 md:col-span-2">
                  <span className={`act-chip ${j.status === "active" ? "act-chip-green" : "act-chip-amber"}`}>{j.status === "active" ? "aktif" : "draft"}</span>
                </div>
                <div className="col-span-12 text-left md:col-span-1 md:text-right">
                  <button className="text-xs font-semibold text-[var(--act-blue)] hover:underline">Edit</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
