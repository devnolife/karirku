import { Sk } from "../_dash/skeleton";

/* Mirrors guides page: wide container, editorial header + card grid. */
export default function GuidesLoading() {
  return (
    <div
      className="app-page space-y-8"
      role="status"
      aria-label="Memuat panduan"
    >
      <div className="max-w-2xl">
        <Sk className="h-4 w-32" />
        <Sk className="mt-4 h-11 w-[420px] max-w-full" />
        <Sk className="mt-4 h-4 w-full max-w-[520px]" />
        <Sk className="mt-2 h-4 w-3/4 max-w-[400px]" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Sk key={i} className="h-8 w-24 !rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="act-card-2 p-5">
            <div className="flex items-center gap-2.5">
              <Sk className="h-5 w-20 !rounded-full" />
              <Sk className="h-3 w-16" />
            </div>
            <Sk className="mt-4 h-5 w-5/6" />
            <Sk className="mt-3 h-3.5 w-full" />
            <Sk className="mt-1.5 h-3.5 w-2/3" />
          </div>
        ))}
      </div>
      <span className="sr-only">Memuat…</span>
    </div>
  );
}
