import { Sk, SkKpi, SkPage, SkPageHeader, SkPanel } from "./_dash/skeleton";

/* Generic (app) fallback — header + KPI band + two panels.
   Route-specific skeletons (dashboard, jobs, …) override this. */
export default function AppLoading() {
  return (
    <SkPage>
      <SkPageHeader />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SkKpi />
        <SkKpi />
        <SkKpi />
        <SkKpi />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkPanel lines={3} />
        <div className="act-card-2 p-6">
          <Sk className="h-3.5 w-28" />
          <Sk className="mt-3 h-6 w-44" />
          <Sk className="mt-5 h-28 w-full !rounded-xl" />
          <Sk className="mt-4 h-4 w-2/3" />
        </div>
      </div>
    </SkPage>
  );
}
