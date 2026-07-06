import { Sk } from "../../(app)/_dash/skeleton";

/* Mirrors admin overview: PageHead + 6 stat tiles + 2 chart panels + pipeline rows. */
export default function AdminLoading() {
  return (
    <div className="space-y-10" role="status" aria-label="Memuat panel admin">
      <div>
        <Sk className="h-4 w-32" />
        <Sk className="mt-4 h-9 w-72 max-w-full" />
        <Sk className="mt-3 h-4 w-96 max-w-full" />
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="act-card-2 p-5">
            <Sk className="h-3 w-24" />
            <Sk className="mt-3 h-8 w-20" />
            <Sk className="mt-2 h-3 w-28" />
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="act-card-2 p-6">
            <Sk className="h-3.5 w-32" />
            <Sk className="mt-3 h-6 w-40" />
            <Sk className="mt-6 h-[140px] w-full !rounded-xl" />
          </div>
        ))}
      </section>

      <section className="act-card-2 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
          <Sk className="h-3.5 w-44" />
          <Sk className="h-5 w-14 !rounded-full" />
        </div>
        <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <Sk className="h-4 w-1/2" />
              <Sk className="h-5 w-16 !rounded-full" />
            </li>
          ))}
        </ul>
      </section>
      <span className="sr-only">Memuat…</span>
    </div>
  );
}
