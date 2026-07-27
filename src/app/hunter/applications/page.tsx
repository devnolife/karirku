import Link from "next/link";
import { hunterDb } from "@/core/hunter";
import { ActionButton } from "../actions-client";

export const dynamic = "force-dynamic";

const BADGE: Record<string, string> = {
  silent: "bg-slate-800 text-slate-400",
  replied: "bg-sky-500/15 text-sky-400",
  interview: "bg-emerald-500/15 text-emerald-400",
  offer: "bg-amber-400/20 text-amber-400",
  rejected: "bg-red-500/15 text-red-400",
};

export default async function Applications({
  searchParams,
}: {
  searchParams: Promise<{ reply?: string }>;
}) {
  const sp = await searchParams;
  const reply = sp.reply || "";

  const where = reply ? "WHERE a.reply_status = ?" : "";
  const params = reply ? [reply] : [];
  const apps = hunterDb()
    .getDb()
    .prepare(
      `SELECT a.id, a.platform, a.title, a.company, a.url, a.channel, a.applied_at,
              a.salary_offered, a.reply_status, a.last_reply_at, a.last_reply_snippet, j.url AS job_url
       FROM applications a LEFT JOIN jobs j ON j.id = a.job_id ${where}
       ORDER BY a.applied_at DESC LIMIT 300`
    )
    .all(...params) as Record<string, string | number | null>[];

  const counts = hunterDb()
    .getDb()
    .prepare(`SELECT reply_status, COUNT(*) n FROM applications GROUP BY reply_status`)
    .all() as { reply_status: string; n: number }[];
  const total = counts.reduce((s, c) => s + c.n, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold">Applications ({total})</h1>
        <div className="flex gap-2">
          <ActionButton action="import-applied" label="Import JobStreet" className="bg-slate-700 hover:bg-slate-600" />
          <ActionButton action="sync-email" label="Sync Email" className="bg-violet-600 hover:bg-violet-500" />
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <Link
          href="/hunter/applications"
          className={`px-2.5 py-1 rounded-md text-xs font-medium ${!reply ? "bg-amber-400 text-slate-900" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
        >
          all {total}
        </Link>
        {["silent", "replied", "interview", "offer", "rejected"].map((s) => {
          const n = counts.find((c) => c.reply_status === s)?.n || 0;
          return (
            <Link
              key={s}
              href={`/hunter/applications?reply=${s}`}
              className={`px-2.5 py-1 rounded-md text-xs font-medium ${reply === s ? "bg-amber-400 text-slate-900" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
            >
              {s} {n}
            </Link>
          );
        })}
      </div>

      <div className="rounded-xl bg-slate-900 border border-slate-800 divide-y divide-slate-800">
        {apps.length === 0 && <div className="p-6 text-sm text-slate-500">No applications match.</div>}
        {apps.map((a) => (
          <div key={String(a.id)} className="p-4 flex items-start gap-4">
            <div className="min-w-0 flex-1">
              {a.url || a.job_url ? (
                <a href={String(a.url || a.job_url)} target="_blank" className="font-semibold hover:text-amber-400 leading-snug">
                  {String(a.title)}
                </a>
              ) : (
                <span className="font-semibold leading-snug">{String(a.title)}</span>
              )}
              <div className="text-sm text-slate-400 mt-0.5">
                <span className="capitalize">{String(a.platform)}</span>
                {a.company ? ` · ${a.company}` : ""}
                {a.salary_offered ? ` · asked ${a.salary_offered}` : ""}
                {" · "}
                <span className="text-slate-500">{String(a.applied_at).slice(0, 10)} ({String(a.channel)})</span>
              </div>
              {a.last_reply_snippet ? (
                <div className="text-xs text-slate-500 mt-1 italic truncate">“{String(a.last_reply_snippet)}”</div>
              ) : null}
            </div>
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${BADGE[String(a.reply_status)] || BADGE.silent}`}>
              {String(a.reply_status)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
