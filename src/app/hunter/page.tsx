import { hunterDb, gmailStatus } from "@/lib/hunter";
import { ActionButton } from "./actions-client";

export const dynamic = "force-dynamic";

const STATUS_DOT: Record<string, string> = {
  ok: "bg-emerald-400",
  expired: "bg-red-400",
  unknown: "bg-slate-500",
};

export default function HunterOverview() {
  const db = hunterDb().getDb();
  const accounts = db
    .prepare(`SELECT platform, username, profile_url, can_auto_apply, login_status, last_checked, notes FROM accounts ORDER BY can_auto_apply DESC, platform`)
    .all() as Record<string, string | number | null>[];
  const jobStats = db.prepare(`SELECT platform, status, COUNT(*) n FROM jobs GROUP BY platform, status`).all() as { platform: string; status: string; n: number }[];
  const appStats = db.prepare(`SELECT reply_status, COUNT(*) n FROM applications GROUP BY reply_status`).all() as { reply_status: string; n: number }[];
  const totalJobs = jobStats.reduce((s, r) => s + r.n, 0);
  const newJobs = jobStats.filter((r) => r.status === "new").reduce((s, r) => s + r.n, 0);
  const totalApps = appStats.reduce((s, r) => s + r.n, 0);
  const replied = appStats.filter((r) => r.reply_status !== "silent").reduce((s, r) => s + r.n, 0);
  const gmail = gmailStatus() as { configured?: boolean; authorized?: boolean };
  const lastRuns = db
    .prepare(`SELECT type, platform, ok, finished_at FROM runs ORDER BY id DESC LIMIT 8`)
    .all() as { type: string; platform: string | null; ok: number | null; finished_at: string | null }[];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold">Overview</h1>
        <div className="flex gap-2 flex-wrap">
          <ActionButton action="scan" label="Scan All" />
          <ActionButton action="sync-email" label="Sync Email" className="bg-violet-600 hover:bg-violet-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Jobs found", value: totalJobs },
          { label: "New (unreviewed)", value: newJobs },
          { label: "Applications", value: totalApps },
          { label: "Got replies", value: replied },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <div className="text-3xl font-extrabold text-amber-400">{s.value}</div>
            <div className="text-sm text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Connected accounts</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {accounts.map((a) => (
            <div key={String(a.platform)} className="rounded-xl bg-slate-900 border border-slate-800 p-4 flex items-start gap-3">
              <span className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${STATUS_DOT[String(a.login_status)] || STATUS_DOT.unknown}`} />
              <div className="min-w-0">
                <div className="font-semibold capitalize">
                  {String(a.platform)}{" "}
                  {a.can_auto_apply ? (
                    <span className="text-xs font-medium text-emerald-400 ml-1">auto-apply</span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500 ml-1">scan-only</span>
                  )}
                </div>
                <div className="text-sm text-slate-400 truncate">
                  {a.profile_url ? (
                    <a href={String(a.profile_url)} target="_blank" className="hover:text-amber-400">
                      {String(a.username)}
                    </a>
                  ) : (
                    String(a.username)
                  )}
                  {" · "}
                  <span className={String(a.login_status) === "expired" ? "text-red-400" : ""}>{String(a.login_status)}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">{String(a.notes || "")}</div>
              </div>
            </div>
          ))}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 flex items-start gap-3">
            <span className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${gmail.authorized ? "bg-emerald-400" : "bg-amber-400"}`} />
            <div>
              <div className="font-semibold">Gmail API</div>
              <div className="text-sm text-slate-400">
                {gmail.authorized ? "authorized — email tracking active" : gmail.configured ? "configured, run `node hunter/run.js gmail-auth`" : "not configured — see hunter/email/gmail.js header"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Recent runs</h2>
        <div className="rounded-xl bg-slate-900 border border-slate-800 divide-y divide-slate-800">
          {lastRuns.length === 0 && <div className="p-4 text-sm text-slate-500">No runs yet — hit Scan All.</div>}
          {lastRuns.map((r, i) => (
            <div key={i} className="px-4 py-2.5 flex items-center gap-3 text-sm">
              <span className={r.ok === 1 ? "text-emerald-400" : r.ok === 0 ? "text-red-400" : "text-amber-400"}>
                {r.ok === 1 ? "✓" : r.ok === 0 ? "✗" : "…"}
              </span>
              <span className="font-medium">{r.type}</span>
              <span className="text-slate-500">{r.platform}</span>
              <span className="ml-auto text-slate-500 text-xs">{r.finished_at || "running"}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
