import { Sk } from "../../../(app)/_dash/skeleton";

/* Mirrors admin users: PageHead + tabel 8 baris (avatar, nama, chip, status). */
export default function AdminUsersLoading() {
  return (
    <div className="space-y-8" role="status" aria-label="Memuat daftar pengguna">
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
          <Sk className="col-span-3 h-3.5 w-16" />
          <Sk className="col-span-2 h-3.5 w-12" />
          <Sk className="col-span-2 h-3.5 w-12" />
          <Sk className="col-span-2 h-3.5 w-14" />
          <Sk className="col-span-2 h-3.5 w-20" />
          <Sk className="col-span-1 ml-auto h-3.5 w-10" />
        </div>
        <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="grid grid-cols-12 items-center gap-3 px-5 py-4">
              <div className="col-span-12 flex items-center gap-3 md:col-span-3">
                <Sk className="h-9 w-9 flex-none !rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Sk className="h-4 w-3/4" />
                  <Sk className="h-3 w-1/2" />
                </div>
              </div>
              <div className="col-span-6 md:col-span-2"><Sk className="h-5 w-20 !rounded-full" /></div>
              <div className="col-span-6 md:col-span-2"><Sk className="h-4 w-12" /></div>
              <div className="col-span-6 md:col-span-2"><Sk className="h-4 w-16" /></div>
              <div className="col-span-6 md:col-span-2"><Sk className="h-3 w-20" /></div>
              <div className="col-span-6 md:col-span-1"><Sk className="ml-auto h-3.5 w-12" /></div>
            </li>
          ))}
        </ul>
      </div>
      <span className="sr-only">Memuat…</span>
    </div>
  );
}
