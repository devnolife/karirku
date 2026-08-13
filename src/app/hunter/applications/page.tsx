import Link from "next/link";
import { prisma } from "@devnolife/karirku-core/db";
import { ActionButton } from "../actions-client";

export const dynamic = "force-dynamic";

const BADGE: Record<string, string> = {
  silent: "text-[#4C5349]",
  replied: "text-[#6FA8DC]",
  interview: "text-[#5FBF6E]",
  offer: "text-[#FF6B1A]",
  rejected: "text-[#E05B4C]",
};

export default async function Applications({
  searchParams,
}: {
  searchParams: Promise<{ reply?: string }>;
}) {
  const sp = await searchParams;
  const reply = sp.reply || "";

  const [apps, counts] = await Promise.all([
    prisma.hunterApplication.findMany({
      where: reply ? { replyStatus: reply } : {},
      select: {
        id: true, platform: true, title: true, company: true, url: true,
        channel: true, appliedAt: true, salaryOffered: true, replyStatus: true,
        lastReplyAt: true, lastReplySnippet: true,
        job: { select: { url: true } },
      },
      orderBy: { appliedAt: "desc" },
      take: 300,
    }),
    prisma.hunterApplication.groupBy({ by: ["replyStatus"], _count: { _all: true } }),
  ]);
  const total = counts.reduce((s, c) => s + c._count._all, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#262B24] pb-5">
        <h1 className="text-3xl font-black uppercase tracking-tight">
          Applications{" "}
          <span className="[font-family:var(--font-hunter-mono)] text-lg font-semibold text-[#4C5349]">×{total}</span>
        </h1>
        <div className="flex gap-2">
          <ActionButton
            action="import-applied"
            label="Import JobStreet"
            className="!bg-transparent !text-[#8A9088] !border-[#262B24] hover:!text-[#E6E4DC] hover:!border-[#4C5349]"
          />
          <ActionButton
            action="sync-email"
            label="Sync Email"
            className="!bg-transparent !text-[#FF6B1A] hover:!bg-[#1A130C] hover:!text-[#FF8140]"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Link
          href="/hunter/applications"
          className={`border px-2.5 py-1 [font-family:var(--font-hunter-mono)] text-[10px] uppercase tracking-[0.1em] transition-colors duration-150 ease-out ${!reply ? "border-[#FF6B1A] bg-[#FF6B1A] text-[#0D0F0C]" : "border-[#262B24] text-[#8A9088] hover:border-[#4C5349] hover:text-[#E6E4DC]"}`}
        >
          all {total}
        </Link>
        {["silent", "replied", "interview", "offer", "rejected"].map((s) => {
          const n = counts.find((c) => c.replyStatus === s)?._count._all || 0;
          return (
            <Link
              key={s}
              href={`/hunter/applications?reply=${s}`}
              className={`border px-2.5 py-1 [font-family:var(--font-hunter-mono)] text-[10px] uppercase tracking-[0.1em] transition-colors duration-150 ease-out ${reply === s ? "border-[#FF6B1A] bg-[#FF6B1A] text-[#0D0F0C]" : "border-[#262B24] text-[#8A9088] hover:border-[#4C5349] hover:text-[#E6E4DC]"}`}
            >
              {s} {n}
            </Link>
          );
        })}
      </div>

      <div className="border border-[#262B24]">
        {apps.length === 0 && (
          <div className="p-6 [font-family:var(--font-hunter-mono)] text-xs text-[#4C5349]">no applications match.</div>
        )}
        {apps.map((a) => (
          <div
            key={String(a.id)}
            className="flex items-start gap-4 border-b border-[#1A1D18] p-4 transition-colors duration-150 ease-out last:border-b-0 hover:bg-[#141712]"
          >
            <div className="min-w-0 flex-1">
              {a.url || a.job?.url ? (
                <a
                  href={String(a.url || a.job?.url)}
                  target="_blank"
                  className="font-bold leading-snug underline-offset-2 hover:text-[#FF6B1A] hover:underline"
                >
                  {String(a.title)}
                </a>
              ) : (
                <span className="font-bold leading-snug">{String(a.title)}</span>
              )}
              <div className="mt-1 [font-family:var(--font-hunter-mono)] text-xs text-[#8A9088]">
                {String(a.platform)}
                {a.company ? ` · ${a.company}` : ""}
                {a.salaryOffered ? ` · asked ${a.salaryOffered}` : ""}
                {" · "}
                <span className="text-[#4C5349]">
                  {String(a.appliedAt).slice(0, 10)} ({String(a.channel)})
                </span>
              </div>
              {a.lastReplySnippet ? (
                <div className="mt-1 truncate text-xs italic text-[#4C5349]">“{String(a.lastReplySnippet)}”</div>
              ) : null}
            </div>
            <span
              className={`shrink-0 [font-family:var(--font-hunter-mono)] text-[11px] font-semibold uppercase tracking-wider ${BADGE[String(a.replyStatus)] || BADGE.silent}`}
            >
              [{String(a.replyStatus)}]
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
