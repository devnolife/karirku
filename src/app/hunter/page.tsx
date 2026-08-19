import { hunterDb, gmailStatus } from "@devnolife/karirku-core/hunter";
import { ActionButton } from "./actions-client";

export const dynamic = "force-dynamic";

const STATUS_DOT: Record<string, string> = {
  ok: "bg-[#5FBF6E]",
  expired: "bg-[#E05B4C]",
  unknown: "bg-[#4C5349]",
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
    <div className="space-y-12">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#262B24] pb-5">
        <h1 className="text-3xl font-black uppercase tracking-tight">Overview</h1>
        <div className="flex flex-wrap gap-2">
          <ActionButton action="scan" label="Scan All" />
          <ActionButton
            action="sync-email"
            label="Sync Email"
            className="!bg-transparent !text-[#FF6B1A] hover:!bg-[#1A130C] hover:!text-[#FF8140]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-[#262B24] border-y border-[#262B24] md:grid-cols-4">
        {[
          { label: "Jobs found", value: totalJobs },
          { label: "New / unreviewed", value: newJobs },
          { label: "Applications", value: totalApps },
          { label: "Got replies", value: replied },
        ].map((s) => (
          <div key={s.label} className="px-5 py-6">
            <div className="[font-family:var(--font-hunter-mono)] text-5xl font-semibold tabular-nums text-[#E6E4DC]">
              {s.value}
            </div>
            <div className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#8A9088]">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-4 [font-family:var(--font-hunter-mono)] text-[11px] uppercase tracking-[0.2em] text-[#4C5349]">
          01 / Connected accounts
        </h2>
        <div className="grid gap-px bg-[#262B24] border border-[#262B24] md:grid-cols-2">
          {accounts.map((a) => (
            <div key={String(a.platform)} className="flex items-start gap-3 bg-[#0D0F0C] p-4">
              <span className={`mt-1.5 h-2 w-2 shrink-0 ${STATUS_DOT[String(a.login_status)] || STATUS_DOT.unknown}`} />
              <div className="min-w-0">
                <div className="font-bold capitalize">
                  {String(a.platform)}{" "}
                  {a.can_auto_apply ? (
                    <span className="ml-1 [font-family:var(--font-hunter-mono)] text-[10px] uppercase tracking-wider text-[#5FBF6E]">[auto-apply]</span>
                  ) : (
                    <span className="ml-1 [font-family:var(--font-hunter-mono)] text-[10px] uppercase tracking-wider text-[#4C5349]">[scan-only]</span>
                  )}
                </div>
                <div className="mt-0.5 truncate [font-family:var(--font-hunter-mono)] text-xs text-[#8A9088]">
                  {a.profile_url ? (
                    <a href={String(a.profile_url)} target="_blank" className="underline-offset-2 hover:text-[#FF6B1A] hover:underline">
                      {String(a.username)}
                    </a>
                  ) : (
                    String(a.username)
                  )}
                  {" · "}
                  <span className={String(a.login_status) === "expired" ? "text-[#E05B4C]" : ""}>{String(a.login_status)}</span>
                </div>
                <div className="mt-1 text-xs text-[#4C5349]">{String(a.notes || "")}</div>
              </div>
            </div>
          ))}
          <div className="flex items-start gap-3 bg-[#0D0F0C] p-4">
            <span className={`mt-1.5 h-2 w-2 shrink-0 ${gmail.authorized ? "bg-[#5FBF6E]" : "bg-[#FF6B1A]"}`} />
            <div>
              <div className="font-bold">Gmail API</div>
              <div className="mt-0.5 [font-family:var(--font-hunter-mono)] text-xs text-[#8A9088]">
                {gmail.authorized ? "authorized — email tracking active" : gmail.configured ? "configured, run `pnpm hunter gmail-auth`" : "not configured — see packages/core/hunter/email/gmail.js"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 [font-family:var(--font-hunter-mono)] text-[11px] uppercase tracking-[0.2em] text-[#4C5349]">
          02 / Recent runs
        </h2>
        <div className="border border-[#262B24] [font-family:var(--font-hunter-mono)]">
          {lastRuns.length === 0 && <div className="p-4 text-xs text-[#4C5349]">no runs yet — hit Scan All.</div>}
          {lastRuns.map((r, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-[#1A1D18] px-4 py-2 text-xs last:border-b-0 hover:bg-[#141712]">
              <span className={r.ok === 1 ? "text-[#5FBF6E]" : r.ok === 0 ? "text-[#E05B4C]" : "text-[#FF6B1A]"}>
                {r.ok === 1 ? "OK" : r.ok === 0 ? "ERR" : ".."}
              </span>
              <span className="text-[#E6E4DC]">{r.type}</span>
              <span className="text-[#4C5349]">{r.platform}</span>
              <span className="ml-auto tabular-nums text-[#4C5349]">{r.finished_at || "running"}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
