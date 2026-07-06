import { Sk, SkPage, SkPageHeader } from "../_dash/skeleton";

/* Mirrors learn page: header + 3/2 split (course rows | activity log). */
export default function LearnLoading() {
  return (
    <SkPage>
      <SkPageHeader action={false} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="act-card-2 overflow-hidden lg:col-span-3">
          <div className="border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
            <Sk className="h-3.5 w-32" />
          </div>
          <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="grid grid-cols-12 items-center gap-3 px-5 py-4">
                <div className="col-span-2 sm:col-span-1">
                  <Sk className="h-[34px] w-[34px] !rounded-[10px]" />
                </div>
                <div className="col-span-7 space-y-2 sm:col-span-8">
                  <Sk className="h-4 w-3/4" />
                  <Sk className="h-3 w-1/2" />
                </div>
                <div className="col-span-3">
                  <Sk className="ml-auto h-5 w-16 !rounded-full" />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="act-card-2 overflow-hidden lg:col-span-2">
          <div className="border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
            <Sk className="h-3.5 w-24" />
          </div>
          <ol className="divide-y divide-[rgba(15,23,42,0.07)]">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="space-y-2 px-5 py-4">
                <Sk className="h-3 w-16" />
                <Sk className="h-4 w-5/6" />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </SkPage>
  );
}
