import { prisma } from "@devnolife/karirku-core/db";
import { gmailStatus } from "@devnolife/karirku-core/hunter";
import { getSession } from "@/lib/auth";
import { ActionButton } from "./actions-client";

export const dynamic = "force-dynamic";

const STATUS_DOT: Record<string, string> = {
  ok: "bg-[#5FBF6E]",
  expired: "bg-[#E05B4C]",
  unknown: "bg-[#4C5349]",
};

export default async function HunterOverview() {
  const { user } = await getSession();
  const userId = user.id;

  const [accounts, jobStats, appStats, lastRuns] = await Promise.all([
    prisma.hunterAccount.findMany({
      where: { userId },
      select: {
        platform: true, username: true, profileUrl: true, canAutoApply: true,
        loginStatus: true, lastChecked: true, notes: true,
      },
      orderBy: [{ canAutoApply: "desc" }, { platform: "asc" }],
    }),
    prisma.hunterJob.groupBy({
      by: ["platform", "status"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.hunterApplication.groupBy({
      by: ["replyStatus"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.hunterRun.findMany({
      where: { userId },
      select: { type: true, platform: true, ok: true, finishedAt: true },
      orderBy: { id: "desc" },
      take: 8,
    }),
  ]);

  const totalJobs = jobStats.reduce((s, r) => s + r._count._all, 0);
  const newJobs = jobStats
    .filter((r) => r.status === "new")
    .reduce((s, r) => s + r._count._all, 0);
  const totalApps = appStats.reduce((s, r) => s + r._count._all, 0);
  const replied = appStats
    .filter((r) => r.replyStatus !== "silent")
    .reduce((s, r) => s + r._count._all, 0);
  const gmail = gmailStatus() as { configured?: boolean; authorized?: boolean };

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
              <span className={`mt-1.5 h-2 w-2 shrink-0 ${STATUS_DOT[String(a.loginStatus)] || STATUS_DOT.unknown}`} />
              <div className="min-w-0">
                <div className="font-bold capitalize">
                  {String(a.platform)}{" "}
                  {a.canAutoApply ? (
                    <span className="ml-1 [font-family:var(--font-hunter-mono)] text-[10px] uppercase tracking-wider text-[#5FBF6E]">[auto-apply]</span>
                  ) : (
                    <span className="ml-1 [font-family:var(--font-hunter-mono)] text-[10px] uppercase tracking-wider text-[#4C5349]">[scan-only]</span>
                  )}
                </div>
                <div className="mt-0.5 truncate [font-family:var(--font-hunter-mono)] text-xs text-[#8A9088]">
                  {a.profileUrl ? (
                    <a href={String(a.profileUrl)} target="_blank" className="underline-offset-2 hover:text-[#FF6B1A] hover:underline">
                      {String(a.username)}
                    </a>
                  ) : (
                    String(a.username)
                  )}
                  {" · "}
                  <span className={String(a.loginStatus) === "expired" ? "text-[#E05B4C]" : ""}>{String(a.loginStatus)}</span>
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
                {gmail.authorized ? "authorized — email tracking active" : gmail.configured ? "configured, run `pnpm hunter gmail-auth` in karirku-core" : "not configured — see karirku-core hunter/email/gmail.js"}
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
              <span className={r.ok === true ? "text-[#5FBF6E]" : r.ok === false ? "text-[#E05B4C]" : "text-[#FF6B1A]"}>
                {r.ok === true ? "OK" : r.ok === false ? "ERR" : ".."}
              </span>
              <span className="text-[#E6E4DC]">{r.type}</span>
              <span className="text-[#4C5349]">{r.platform}</span>
              <span className="ml-auto tabular-nums text-[#4C5349]">
                {r.finishedAt ? r.finishedAt.toISOString().slice(0, 16).replace("T", " ") : "running"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
