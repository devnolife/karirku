/* Skeleton primitives — layout-matched loading placeholders.
   Server-safe (pure CSS shimmer via .act-skel), composed per page
   in each route's loading.tsx so the skeleton mirrors the real layout. */

export function Sk({ className = "" }: { className?: string }) {
  return <span className={`act-skel block ${className}`} aria-hidden />;
}

/* Mirrors <PageHeader /> — kicker, display title, meta, action chip */
export function SkPageHeader({ action = true }: { action?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Sk className="h-4 w-24" />
        <Sk className="mt-4 h-10 w-[300px] max-w-full md:w-[420px]" />
        <Sk className="mt-3 h-4 w-56" />
      </div>
      {action && <Sk className="h-7 w-24 !rounded-full" />}
    </div>
  );
}

/* Mirrors a list card: kicker bar on top + divided rows (JobRow-like) */
export function SkListCard({
  rows = 4,
  className = "",
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`act-card-2 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
        <Sk className="h-3.5 w-32" />
        <Sk className="h-5 w-16 !rounded-full" />
      </div>
      <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="grid grid-cols-12 items-center gap-3 px-5 py-4">
            <div className="col-span-2">
              <Sk className="h-8 w-12" />
            </div>
            <div className="col-span-8 space-y-2">
              <Sk className="h-4 w-3/4" />
              <Sk className="h-3 w-1/2" />
              <div className="flex gap-1.5">
                <Sk className="h-4 w-14 !rounded-md" />
                <Sk className="h-4 w-12 !rounded-md" />
                <Sk className="h-4 w-16 !rounded-md" />
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <Sk className="ml-auto h-3.5 w-full max-w-[72px]" />
              <Sk className="ml-auto h-3 w-10" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Mirrors <Kpi /> — double-bezel: kicker + big numeral + caption */
export function SkKpi() {
  return (
    <div className="act-bezel">
      <div className="act-bezel-core p-4">
        <Sk className="h-3 w-20" />
        <Sk className="mt-3 h-9 w-16" />
        <Sk className="mt-2 h-3 w-24" />
      </div>
    </div>
  );
}

/* Mirrors a content panel: kicker + heading + body blocks */
export function SkPanel({
  className = "",
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div className={`act-card-2 p-6 ${className}`}>
      <Sk className="h-3.5 w-28" />
      <Sk className="mt-3 h-6 w-44" />
      <div className="mt-5 space-y-4">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i}>
            <div className="flex items-baseline justify-between">
              <Sk className="h-4 w-32" />
              <Sk className="h-3 w-10" />
            </div>
            <Sk className="mt-2 h-[7px] w-full !rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* Shared page container matching the (app) pages */
export function SkPage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="app-page space-y-8"
      role="status"
      aria-label="Memuat halaman"
    >
      {children}
      <span className="sr-only">Memuat…</span>
    </div>
  );
}
