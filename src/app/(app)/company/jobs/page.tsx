import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCompanyJobs } from "@/server/queries/company";
import { Empty } from "@/components/ui/empty";

export default async function CompanyJobsPage() {
  const user = await requireUser();
  const jobs = await getCompanyJobs(user.id);
  const active = jobs.filter((job) => job.status === "active").length;
  const applicants = jobs.reduce((total, job) => total + job.applicants, 0);

  return (
    <div className="act-rise mx-auto max-w-[1280px] space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      <section className="overflow-hidden rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-brand-50">
        <div className="grid gap-8 px-6 py-7 sm:px-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:px-10 md:py-9">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">Hiring workspace / Portfolio</span>
            <h1 className="act-display mt-3 text-4xl text-brand-950 md:text-5xl">Lowongan yang sedang Anda bangun.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#476655]">
              Pantau setiap peran, arus kandidat, dan kesehatan pipeline dari satu portfolio hiring.
            </p>
          </div>
          <Link href="/company/jobs/new" className="act-pill shrink-0 !bg-brand-950 !px-5 !py-3 !text-sm">
            Posting lowongan
            <span aria-hidden>+</span>
          </Link>
        </div>
        <div className="grid border-t border-[rgba(4,39,24,0.08)] sm:grid-cols-3">
          <Metric label="Posting aktif" value={active} note="sedang menerima kandidat" />
          <Metric label="Total lowongan" value={jobs.length} note="di portfolio hiring" />
          <Metric label="Kandidat masuk" value={applicants} note="di semua lowongan" />
        </div>
      </section>

      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">Portfolio roles</span>
          <h2 className="act-heading mt-2 text-2xl text-brand-950">Semua lowongan</h2>
        </div>
        <span className="rounded-full border border-blue-600/20 bg-blue-600/10 px-3 py-1.5 text-xs font-semibold text-blue-700">{jobs.length} peran</span>
      </div>

      {jobs.length === 0 ? (
        <Empty title="Belum ada lowongan" description="Posting lowongan pertamamu untuk mulai menerima kandidat." />
      ) : (
        <div className="overflow-hidden rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-white shadow-[0_18px_45px_-36px_rgba(4,39,24,0.5)]">
          <div className="hidden grid-cols-[minmax(0,1.6fr)_0.8fr_0.9fr_0.7fr_auto] gap-5 border-b border-[rgba(4,39,24,0.08)] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6E8D7B] md:grid">
            <span>Peran</span>
            <span>Format</span>
            <span>Kesehatan kandidat</span>
            <span>Status</span>
            <span className="text-right">Aksi</span>
          </div>
          <ul className="divide-y divide-[rgba(4,39,24,0.08)]">
            {jobs.map((job) => {
              const health = job.applicants === 0 ? "Menunggu kandidat" : job.applicants === 1 ? "1 kandidat baru" : `${job.applicants} kandidat masuk`;
              return (
                <li key={job.id} className="grid gap-4 px-5 py-5 transition-colors hover:bg-brand-50 md:grid-cols-[minmax(0,1.6fr)_0.8fr_0.9fr_0.7fr_auto] md:items-center md:gap-5 md:px-6">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-brand-950">{job.title}</p>
                    <p className="mt-1 text-xs text-[#6E8D7B]">{job.location} <span aria-hidden>·</span> {job.posted}</p>
                  </div>
                  <div><span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-[#315644]">{job.type}</span></div>
                  <div>
                    <p className="text-sm font-semibold text-brand-950">{health}</p>
                    <div className="mt-2 h-1.5 max-w-[150px] overflow-hidden rounded-full bg-[var(--act-wash-sky)]">
                      <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.min(100, job.applicants * 20)}%` }} />
                    </div>
                  </div>
                  <div>
                    <span className={job.status === "active" ? "inline-flex rounded-full bg-brand-600/10 px-2.5 py-1 text-xs font-bold text-brand-700" : "inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700"}>
                      {job.status === "active" ? "Aktif" : "Draft"}
                    </span>
                  </div>
                  <div className="text-left md:text-right"><button className="text-xs font-bold text-brand-600 transition-colors hover:text-brand-950 hover:underline">Edit</button></div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="border-t border-[rgba(4,39,24,0.08)] px-6 py-5 first:border-t-0 sm:border-l sm:border-t-0 sm:px-8 sm:first:border-l-0">
      <p className="text-xs font-semibold text-[#6E8D7B]">{label}</p>
      <p className="act-display mt-1 text-3xl text-brand-950">{value}</p>
      <p className="mt-1 text-xs text-[#476655]">{note}</p>
    </div>
  );
}
