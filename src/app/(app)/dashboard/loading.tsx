import { Sk, SkKpi, SkPage } from "../_dash/skeleton";

/* Mirrors the dashboard overview: greeting + readiness ring,
   4 KPI tiles, then the 2x2 preview-card grid. */
export default function DashboardLoading() {
  return (
    <SkPage>
      {/* Hello + readiness */}
      <section className="grid grid-cols-12 items-center gap-6">
        <div className="col-span-12 lg:col-span-8">
          <Sk className="h-4 w-44" />
          <Sk className="mt-4 h-11 w-[280px] max-w-full md:h-12 md:w-[360px]" />
          <Sk className="mt-4 h-4 w-72 max-w-full" />
          <Sk className="mt-4 h-9 w-28 !rounded-full" />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="act-bezel">
            <div className="act-bezel-core p-5">
              <Sk className="h-3 w-32" />
              <div className="mt-3 flex items-center gap-5">
                <Sk className="h-[128px] w-[128px] flex-none !rounded-full" />
                <div className="flex-1 space-y-2">
                  <Sk className="h-3 w-16" />
                  <Sk className="h-6 w-14" />
                  <Sk className="h-3 w-20" />
                  <Sk className="h-5 w-24 !rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SkKpi />
        <SkKpi />
        <SkKpi />
        <SkKpi />
      </section>

      {/* Preview cards */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="act-bezel">
            <div className="act-bezel-core p-5">
              <div className="flex items-center justify-between">
                <Sk className="h-3 w-20" />
                <Sk className="h-7 w-7 !rounded-full" />
              </div>
              <Sk className="mt-3 h-5 w-48 max-w-full" />
              <Sk className="mt-4 h-16 w-full !rounded-xl" />
            </div>
          </div>
        ))}
      </section>
    </SkPage>
  );
}
