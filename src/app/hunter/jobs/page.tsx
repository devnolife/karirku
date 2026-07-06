import Link from "next/link";
import { hunterDb } from "@/lib/hunter";
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
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
          current === value ? "bg-amber-400 text-slate-900" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold">Jobs Queue ({jobs.length})</h1>
        <ActionButton action="scan" label="Scan All" />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex gap-1.5 items-center">
          <span className="text-xs text-slate-500 mr-1">Platform:</span>
          {filters("platform", "", platform, "all")}
          {["jobstreet", "freelancer", "linkedin", "upwork"].map((p) => filters("platform", p, platform, p))}
        </div>
        <div className="flex gap-1.5 items-center">
          <span className="text-xs text-slate-500 mr-1">Status:</span>
          {["new", "queued", "applied", "skipped"].map((s) => filters("status", s, status, s))}
        </div>
      </div>

      <div className="rounded-xl bg-slate-900 border border-slate-800 divide-y divide-slate-800">
        {jobs.length === 0 && <div className="p-6 text-sm text-slate-500">Nothing here.</div>}
        {jobs.map((j) => (
          <div key={String(j.id)} className="p-4 flex items-start gap-4">
            <div
              className={`shrink-0 w-11 h-11 rounded-lg grid place-items-center font-extrabold text-sm ${
                Number(j.match_score) >= 60
                  ? "bg-emerald-500/15 text-emerald-400"
                  : Number(j.match_score) >= 30
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-slate-800 text-slate-500"
              }`}
            >
              {String(j.match_score)}
            </div>
            <div className="min-w-0 flex-1">
              <a href={String(j.url)} target="_blank" className="font-semibold hover:text-amber-400 leading-snug">
                {String(j.title)}
              </a>
              <div className="text-sm text-slate-400 mt-0.5">
                <span className="capitalize">{String(j.platform)}</span>
                {j.company ? ` · ${j.company}` : ""}
                {j.salary_min ? ` · ${j.currency === "USD" ? "$" : "Rp "}${j.salary_min}${j.salary_max ? "–" + j.salary_max : ""}${j.currency === "USD" ? "" : " jt"}` : ""}
                {j.remote ? " · remote" : ""}
              </div>
              {j.skip_reason ? <div className="text-xs text-red-400/80 mt-1">skip: {String(j.skip_reason)}</div> : null}
            </div>
            <div className="flex gap-1.5 shrink-0">
              {String(j.status) === "new" && String(j.platform) === "jobstreet" && Number(j.id) ? (
                <ApplyButton jobId={Number(j.id)} />
              ) : null}
              {String(j.status) !== "skipped" && (
                <JobStatusButton jobId={Number(j.id)} status="skipped" label="Skip" className="bg-slate-800 hover:bg-slate-700 text-slate-300" />
              )}
              {String(j.status) === "skipped" && (
                <JobStatusButton jobId={Number(j.id)} status="new" label="Restore" className="bg-slate-800 hover:bg-slate-700 text-slate-300" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
