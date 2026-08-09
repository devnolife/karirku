import Link from "next/link";
import { hunterDb } from "@devnolife/karirku-core/hunter";
import { ApplyButton, JobStatusButton, ActionButton } from "../actions-client";

export const dynamic = "force-dynamic";

export default async function JobsQueue({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const platform = sp.platform || "";
  const status = sp.status || "new";

  const where: string[] = [];
  const params: unknown[] = [];
  if (platform) { where.push("platform = ?"); params.push(platform); }
  if (status) { where.push("status = ?"); params.push(status); }

  const jobs = hunterDb()
    .getDb()
    .prepare(
      `SELECT id, platform, title, company, url, salary_min, salary_max, currency, remote, match_score, status, skip_reason
       FROM jobs ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY match_score DESC, found_at DESC LIMIT 150`
    )
    .all(...params) as Record<string, string | number | null>[];

  const filters = (name: string, value: string, current: string, label: string) => {
    const q = new URLSearchParams({ platform, status });
    q.set(name, value);
    return (
      <Link
        key={name + value}
        href={`/hunter/jobs?${q.toString()}`}
        className={`border px-2.5 py-1 [font-family:var(--font-hunter-mono)] text-[10px] uppercase tracking-[0.1em] transition-colors duration-150 ease-out ${current === value
            ? "border-[#FF6B1A] bg-[#FF6B1A] text-[#0D0F0C]"
            : "border-[#262B24] text-[#8A9088] hover:border-[#4C5349] hover:text-[#E6E4DC]"
          }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#262B24] pb-5">
        <h1 className="text-3xl font-black uppercase tracking-tight">
          Jobs Queue{" "}
          <span className="[font-family:var(--font-hunter-mono)] text-lg font-semibold text-[#4C5349]">
            ×{jobs.length}
          </span>
        </h1>
        <ActionButton action="scan" label="Scan All" />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <div className="flex items-center gap-1.5">
          <span className="[font-family:var(--font-hunter-mono)] text-[10px] uppercase tracking-[0.16em] text-[#4C5349]">plat/</span>
          {filters("platform", "", platform, "all")}
          {["jobstreet", "freelancer", "linkedin", "upwork"].map((p) => filters("platform", p, platform, p))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="[font-family:var(--font-hunter-mono)] text-[10px] uppercase tracking-[0.16em] text-[#4C5349]">stat/</span>
          {["new", "queued", "applied", "skipped"].map((s) => filters("status", s, status, s))}
        </div>
      </div>

      <div className="border border-[#262B24]">
        {jobs.length === 0 && (
          <div className="p-6 [font-family:var(--font-hunter-mono)] text-xs text-[#4C5349]">nothing here.</div>
        )}
        {jobs.map((j) => {
          const score = Number(j.match_score) || 0;
          const scoreColor = score >= 60 ? "text-[#5FBF6E]" : score >= 30 ? "text-[#FF6B1A]" : "text-[#4C5349]";
          const barColor = score >= 60 ? "bg-[#5FBF6E]" : score >= 30 ? "bg-[#FF6B1A]" : "bg-[#4C5349]";
          return (
            <div
              key={String(j.id)}
              className="flex items-start gap-4 border-b border-[#1A1D18] p-4 transition-colors duration-150 ease-out last:border-b-0 hover:bg-[#141712]"
            >
              <div className="w-12 shrink-0 pt-0.5 text-right">
                <div className={`[font-family:var(--font-hunter-mono)] text-lg font-semibold tabular-nums ${scoreColor}`}>
                  {score}
                </div>
                <div className="mt-1 h-px w-full bg-[#262B24]">
                  <div className={`h-px ${barColor}`} style={{ width: `${Math.min(100, score)}%` }} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <a
                  href={String(j.url)}
                  target="_blank"
                  className="font-bold leading-snug underline-offset-2 hover:text-[#FF6B1A] hover:underline"
                >
                  {String(j.title)}
                </a>
                <div className="mt-1 [font-family:var(--font-hunter-mono)] text-xs text-[#8A9088]">
                  {String(j.platform)}
                  {j.company ? ` · ${j.company}` : ""}
                  {j.salary_min ? ` · ${j.currency === "USD" ? "$" : "Rp "}${j.salary_min}${j.salary_max ? "–" + j.salary_max : ""}${j.currency === "USD" ? "" : " jt"}` : ""}
                  {j.remote ? " · remote" : ""}
                </div>
                {j.skip_reason ? (
                  <div className="mt-1 [font-family:var(--font-hunter-mono)] text-[11px] text-[#E05B4C]/80">
                    skip: {String(j.skip_reason)}
                  </div>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-1.5">
                {String(j.status) === "new" && String(j.platform) === "jobstreet" && Number(j.id) ? (
                  <ApplyButton jobId={Number(j.id)} />
                ) : null}
                {String(j.status) !== "skipped" && (
                  <JobStatusButton
                    jobId={Number(j.id)}
                    status="skipped"
                    label="Skip"
                    className="border-[#262B24] text-[#8A9088] hover:border-[#4C5349] hover:text-[#E6E4DC]"
                  />
                )}
                {String(j.status) === "skipped" && (
                  <JobStatusButton
                    jobId={Number(j.id)}
                    status="new"
                    label="Restore"
                    className="border-[#262B24] text-[#8A9088] hover:border-[#4C5349] hover:text-[#E6E4DC]"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
