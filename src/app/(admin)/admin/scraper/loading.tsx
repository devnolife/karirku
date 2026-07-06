import { Sk } from "../../../(app)/_dash/skeleton";

/* Mirrors admin scraper: PageHead + 4 kartu stat antrean + tabel 6 baris run. */
export default function AdminScraperLoading() {
  return (
    <div className="space-y-8" role="status" aria-label="Memuat status scraper">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Sk className="h-4 w-28" />
          <Sk className="mt-4 h-9 w-64 max-w-full" />
          <Sk className="mt-3 h-4 w-80 max-w-full" />
        </div>
        <Sk className="h-6 w-24 !rounded-full" />
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="act-card-2 p-5">
            <Sk className="h-3 w-20" />
            <Sk className="mt-3 h-8 w-14" />
            <Sk className="mt-2 h-3 w-24" />
          </div>
        ))}
      </section>

      <div className="act-card-2 overflow-hidden">
        <div className="hidden grid-cols-12 gap-3 border-b border-[rgba(15,23,42,0.07)] px-5 py-3 md:grid">
          <Sk className="col-span-3 h-3.5 w-16" />
          <Sk className="col-span-2 h-3.5 w-12" />
          <Sk className="col-span-2 h-3.5 w-12" />
          <Sk className="col-span-2 h-3.5 w-14" />
          <Sk className="col-span-3 h-3.5 w-16" />
        </div>
        <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="grid grid-cols-12 items-center gap-3 px-5 py-4">
              <div className="col-span-12 md:col-span-3"><Sk className="h-4 w-2/3" /></div>
              <div className="col-span-4 md:col-span-2"><Sk className="h-5 w-16 !rounded-full" /></div>
              <div className="col-span-4 md:col-span-2"><Sk className="h-4 w-12" /></div>
              <div className="col-span-4 md:col-span-2"><Sk className="h-4 w-14" /></div>
              <div className="col-span-12 md:col-span-3"><Sk className="h-4 w-24" /></div>
            </li>
          ))}
        </ul>
      </div>
      <span className="sr-only">Memuat…</span>
    </div>
  );
}
