import { Sk } from "../../../(app)/_dash/skeleton";

/* Mirrors admin jobs: PageHead + tabel 6 baris (posisi, sumber, pelamar, status, aksi). */
export default function AdminJobsLoading() {
  return (
    <div className="space-y-8" role="status" aria-label="Memuat daftar lowongan">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Sk className="h-4 w-28" />
          <Sk className="mt-4 h-9 w-64 max-w-full" />
          <Sk className="mt-3 h-4 w-80 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Sk className="h-6 w-16 !rounded-full" />
          <Sk className="h-6 w-16 !rounded-full" />
        </div>
      </div>

      <div className="act-card-2 overflow-hidden">
        <div className="hidden grid-cols-12 gap-3 border-b border-[rgba(15,23,42,0.07)] px-5 py-3 md:grid">
          <Sk className="col-span-5 h-3.5 w-16" />
          <Sk className="col-span-2 h-3.5 w-14" />
          <Sk className="col-span-2 h-3.5 w-14" />
          <Sk className="col-span-2 h-3.5 w-14" />
          <Sk className="col-span-1 ml-auto h-3.5 w-10" />
        </div>
        <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="grid grid-cols-12 items-center gap-3 px-5 py-4">
              <div className="col-span-12 space-y-2 md:col-span-5">
                <Sk className="h-4 w-2/3" />
                <Sk className="h-3 w-1/2" />
              </div>
              <div className="col-span-4 md:col-span-2"><Sk className="h-5 w-16 !rounded-full" /></div>
              <div className="col-span-4 md:col-span-2"><Sk className="h-4 w-16" /></div>
              <div className="col-span-4 md:col-span-2"><Sk className="h-4 w-14" /></div>
              <div className="col-span-12 md:col-span-1"><Sk className="h-3.5 w-14 md:ml-auto" /></div>
            </li>
          ))}
        </ul>
      </div>
      <span className="sr-only">Memuat…</span>
    </div>
  );
}
