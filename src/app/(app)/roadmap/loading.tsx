import { Sk, SkPage, SkPageHeader } from "../_dash/skeleton";

/* Mirrors roadmap page: header + milestone rows (W-badge | title+courses | chip). */
export default function RoadmapLoading() {
  return (
    <SkPage>
      <SkPageHeader />
      <ol className="act-card-2 divide-y divide-[rgba(15,23,42,0.07)] overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="grid grid-cols-12 gap-4 px-5 py-5">
            <div className="col-span-2 md:col-span-1">
              <Sk className="h-8 w-8 !rounded-lg" />
            </div>
            <div className="col-span-10 space-y-2 md:col-span-8">
              <Sk className="h-4 w-2/3" />
              <Sk className="h-3 w-1/2" />
            </div>
            <div className="col-span-12 flex items-center md:col-span-3 md:justify-end">
              <Sk className="h-5 w-20 !rounded-full" />
            </div>
          </li>
        ))}
      </ol>
    </SkPage>
  );
}
