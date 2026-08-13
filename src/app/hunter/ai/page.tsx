import Link from "next/link";
import { prisma } from "@devnolife/karirku-core/db";
import { AiEvalButton } from "./actions-client";

export const dynamic = "force-dynamic";

type EvalRow = {
  id: number;
  platform: string;
  title: string;
  company: string | null;
  url: string;
  location: string | null;
  remote: number;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  status: string;
  llmScore: number | null;
  llmTier: string | null;
  llmReportPath: string | null;
  llmEvaluatedAt: string | null;
};

function verdict(score: number): { label: string; color: string; bg: string } {
  if (score >= 4) return { label: "APPLY", color: "text-[#5FBF6E]", bg: "bg-[#5FBF6E]" };
  if (score >= 3) return { label: "REVIEW", color: "text-[#FF6B1A]", bg: "bg-[#FF6B1A]" };
  return { label: "SKIP", color: "text-[#E05B4C]", bg: "bg-[#E05B4C]" };
}

export default async function AiEvalDashboard({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const sp = await searchParams;
  const view = sp.v || "all";
  const [rows, pendingCount] = await Promise.all([
    prisma.hunterJob.findMany({
      where: { llmScore: { not: null } },
      select: {
        id: true, platform: true, title: true, company: true, url: true,
        location: true, remote: true, salaryMin: true, salaryMax: true,
        currency: true, status: true, llmScore: true, llmTier: true,
        llmReportPath: true, llmEvaluatedAt: true,
      },
      orderBy: [{ llmScore: "desc" }, { llmEvaluatedAt: "desc" }],
      take: 200,
    }),
    prisma.hunterJob.count({ where: { status: "new", llmScore: null } }),
  ]);
  const pending = { n: pendingCount };

  const evaluated = rows.length;
  const avg = evaluated ? rows.reduce((s, r) => s + (r.llmScore ?? 0), 0) / evaluated : 0;
  const applyCount = rows.filter((r) => (r.llmScore ?? 0) >= 4).length;
  const reviewCount = rows.filter((r) => (r.llmScore ?? 0) >= 3 && (r.llmScore ?? 0) < 4).length;

  // distribusi skor 1..5 (bucket per 0.5 supaya bar-nya informatif)
  const buckets = Array.from({ length: 9 }, (_, i) => 1 + i * 0.5); // 1, 1.5 … 5
  const dist = buckets.map((b) => ({
    b,
    n: rows.filter((r) => (r.llmScore ?? 0) >= b && (r.llmScore ?? 0) < b + 0.5).length,
  }));
  const maxDist = Math.max(1, ...dist.map((d) => d.n));

  // tier breakdown
  const tiers = ["intern", "entry", "mid", "senior"].map((t) => ({
    t,
    n: rows.filter((r) => (r.llmTier ?? "").toLowerCase() === t).length,
  }));

  const filtered =
    view === "apply"
      ? rows.filter((r) => (r.llmScore ?? 0) >= 4)
      : view === "review"
        ? rows.filter((r) => (r.llmScore ?? 0) >= 3 && (r.llmScore ?? 0) < 4)
        : view === "skip"
          ? rows.filter((r) => (r.llmScore ?? 0) < 3)
          : rows;

  const tab = (value: string, label: string, count: number) => (
    <Link
      key={value}
      href={`/hunter/ai?v=${value}`}
      className={`border px-2.5 py-1 [font-family:var(--font-hunter-mono)] text-[10px] uppercase tracking-[0.1em] transition-colors duration-150 ease-out ${view === value
          ? "border-[#FF6B1A] bg-[#FF6B1A] text-[#0D0F0C]"
          : "border-[#262B24] text-[#8A9088] hover:border-[#4C5349] hover:text-[#E6E4DC]"
        }`}
    >
      {label} ×{count}
    </Link>
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#262B24] pb-5">
        <h1 className="text-3xl font-black uppercase tracking-tight">
          AI Eval{" "}
          <span className="[font-family:var(--font-hunter-mono)] text-lg font-semibold text-[#4C5349]">
            llm-scored
          </span>
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <AiEvalButton limit={10} label="Eval 10 New" />
          <AiEvalButton
            limit={50}
            label="Eval 50 New"
            className="!bg-transparent !text-[#FF6B1A] hover:!bg-[#1A130C] hover:!text-[#FF8140]"
          />
        </div>
      </div>

      {/* stat tiles */}
      <div className="grid grid-cols-2 divide-x divide-[#262B24] border-y border-[#262B24] md:grid-cols-4">
        {[
          { label: "Evaluated", value: String(evaluated) },
          { label: "Avg score / 5", value: avg ? avg.toFixed(1) : "—" },
          { label: "Apply-worthy (≥4)", value: String(applyCount), accent: true },
          { label: "Pending (new, no eval)", value: String(pending.n) },
        ].map((s) => (
          <div key={s.label} className="px-5 py-6">
            <div
              className={`[font-family:var(--font-hunter-mono)] text-5xl font-semibold tabular-nums ${s.accent ? "text-[#5FBF6E]" : "text-[#E6E4DC]"
                }`}
            >
              {s.value}
            </div>
            <div className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#8A9088]">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* distribusi + tier */}
      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-4 [font-family:var(--font-hunter-mono)] text-[11px] uppercase tracking-[0.2em] text-[#4C5349]">
            01 / Score distribution
          </h2>
          <div className="flex h-32 items-end gap-1 border border-[#262B24] p-4">
            {dist.map((d) => {
              const v = verdict(d.b);
              return (
                <div key={d.b} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="[font-family:var(--font-hunter-mono)] text-[10px] tabular-nums text-[#8A9088]">
                    {d.n || ""}
                  </span>
                  <div
                    className={`w-full ${d.n ? v.bg : "bg-[#1A1D18]"}`}
                    style={{ height: `${Math.max(3, (d.n / maxDist) * 72)}px` }}
                  />
                  <span className="[font-family:var(--font-hunter-mono)] text-[9px] tabular-nums text-[#4C5349]">
                    {d.b}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
        <section>
          <h2 className="mb-4 [font-family:var(--font-hunter-mono)] text-[11px] uppercase tracking-[0.2em] text-[#4C5349]">
            02 / Tier breakdown
          </h2>
          <div className="border border-[#262B24] p-4">
            {tiers.map((t) => (
              <div key={t.t} className="flex items-center gap-3 py-1.5">
                <span className="w-16 [font-family:var(--font-hunter-mono)] text-[11px] uppercase tracking-wider text-[#8A9088]">
                  {t.t}
                </span>
                <div className="h-2 flex-1 bg-[#1A1D18]">
                  <div
                    className="h-2 bg-[#FF6B1A]"
                    style={{ width: `${evaluated ? (t.n / evaluated) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-8 text-right [font-family:var(--font-hunter-mono)] text-xs tabular-nums text-[#E6E4DC]">
                  {t.n}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* daftar hasil */}
      <section>
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <span className="mr-2 [font-family:var(--font-hunter-mono)] text-[11px] uppercase tracking-[0.2em] text-[#4C5349]">
            03 / Verdicts
          </span>
          {tab("all", "all", evaluated)}
          {tab("apply", "apply", applyCount)}
          {tab("review", "review", reviewCount)}
          {tab("skip", "skip", evaluated - applyCount - reviewCount)}
        </div>
        <div className="border border-[#262B24]">
          {filtered.length === 0 && (
            <div className="p-6 [font-family:var(--font-hunter-mono)] text-xs text-[#4C5349]">
              belum ada evaluasi — jalankan Eval New di atas.
            </div>
          )}
          {filtered.map((j) => {
            const score = j.llmScore ?? 0;
            const v = verdict(score);
            return (
              <div
                key={j.id}
                className="flex items-start gap-4 border-b border-[#1A1D18] p-4 transition-colors duration-150 ease-out last:border-b-0 hover:bg-[#141712]"
              >
                <div className="w-14 shrink-0 pt-0.5 text-right">
                  <div className={`[font-family:var(--font-hunter-mono)] text-lg font-semibold tabular-nums ${v.color}`}>
                    {score.toFixed(1)}
                  </div>
                  <div className={`[font-family:var(--font-hunter-mono)] text-[9px] font-semibold uppercase tracking-wider ${v.color}`}>
                    {v.label}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href={j.url}
                    target="_blank"
                    className="font-bold leading-snug underline-offset-2 hover:text-[#FF6B1A] hover:underline"
                  >
                    {j.title}
                  </a>
                  <div className="mt-1 [font-family:var(--font-hunter-mono)] text-xs text-[#8A9088]">
                    {j.platform}
                    {j.company ? ` · ${j.company}` : ""}
                    {j.location ? ` · ${j.location}` : ""}
                    {j.salaryMin
                      ? ` · ${j.currency === "USD" ? "$" : "Rp "}${j.salaryMin}${j.salaryMax ? "–" + j.salaryMax : ""}${j.currency === "USD" ? "" : " jt"}`
                      : ""}
                    {j.remote ? " · remote" : ""}
                    {j.llmTier ? ` · tier:${j.llmTier}` : ""}
                  </div>
                  <div className="mt-1 [font-family:var(--font-hunter-mono)] text-[11px] text-[#4C5349]">
                    status:{j.status}
                    {j.llmEvaluatedAt ? ` · eval:${j.llmEvaluatedAt.toISOString().slice(0, 16).replace("T", " ")}` : ""}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {j.llmReportPath ? (
                    <Link
                      href={`/hunter/ai/${j.id}`}
                      className="border border-[#262B24] px-2.5 py-1 [font-family:var(--font-hunter-mono)] text-[10px] uppercase tracking-[0.1em] text-[#8A9088] transition-colors hover:border-[#4C5349] hover:text-[#E6E4DC]"
                    >
                      Report
                    </Link>
                  ) : null}
                  <AiEvalButton
                    jobId={j.id}
                    label="Re-eval"
                    className="!border-[#262B24] !bg-transparent !text-[#8A9088] hover:!border-[#4C5349] hover:!bg-transparent hover:!text-[#E6E4DC]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
