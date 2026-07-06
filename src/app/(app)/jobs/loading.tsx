import { Sk, SkListCard, SkPage, SkPageHeader } from "../_dash/skeleton";

/* Mirrors jobs page: header + 3/2 split (job list | trend chart). */
export default function JobsLoading() {
  return (
    <SkPage>
      <SkPageHeader />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <SkListCard rows={4} className="lg:col-span-3" />
        <div className="act-card-2 p-5 lg:col-span-2">
          <Sk className="h-3 w-28" />
          <Sk className="mt-3 h-7 w-40" />
          <Sk className="mt-2 h-3.5 w-28" />
          <Sk className="mt-5 h-28 w-full !rounded-xl" />
          <div className="mt-4 flex items-center justify-between border-t border-[rgba(15,23,42,0.07)] pt-3">
            <Sk className="h-3 w-24" />
            <Sk className="h-5 w-16 !rounded-full" />
          </div>
        </div>
      </div>
    </SkPage>
  );
}
