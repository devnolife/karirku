import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hunterDb } from "@devnolife/karirku-core/hunter";
import { AiEvalButton } from "../actions-client";

export const dynamic = "force-dynamic";

export default async function AiReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobId = Number(id);
  if (!Number.isInteger(jobId) || jobId <= 0) notFound();

  const job = hunterDb()
    .getDb()
    .prepare(
      `SELECT id, title, company, url, llm_score, llm_tier, llm_report_path, llm_evaluated_at
       FROM jobs WHERE id = ?`,
    )
    .get(jobId) as
    | {
      id: number;
      title: string;
      company: string | null;
      url: string;
      llm_score: number | null;
      llm_tier: string | null;
      llm_report_path: string | null;
      llm_evaluated_at: string | null;
    }
    | undefined;
  if (!job || !job.llm_report_path) notFound();

  // Path disimpan relatif dari root project; tolak path yang keluar dari data/ai-reports.
  const reportsDir = path.resolve(process.cwd(), "data", "ai-reports");
  const resolved = path.resolve(process.cwd(), job.llm_report_path);
  if (!resolved.startsWith(reportsDir)) notFound();

  let md: string;
  try {
    md = await readFile(resolved, "utf8");
  } catch {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#262B24] pb-5">
        <div>
          <Link
            href="/hunter/ai"
            className="[font-family:var(--font-hunter-mono)] text-[11px] uppercase tracking-[0.2em] text-[#4C5349] hover:text-[#E6E4DC]"
          >
            ← AI Eval
          </Link>
          <h1 className="mt-1 text-2xl font-black uppercase tracking-tight">
            {job.title}
            {job.company ? (
              <span className="ml-2 text-lg font-semibold normal-case text-[#8A9088]">— {job.company}</span>
            ) : null}
          </h1>
          <div className="mt-1 [font-family:var(--font-hunter-mono)] text-xs text-[#8A9088]">
            score {job.llm_score?.toFixed(1) ?? "—"}/5
            {job.llm_tier ? ` · tier:${job.llm_tier}` : ""}
            {job.llm_evaluated_at ? ` · ${job.llm_evaluated_at.slice(0, 16).replace("T", " ")}` : ""}
            {" · "}
            <a href={job.url} target="_blank" className="text-[#FF6B1A] underline-offset-2 hover:underline">
              lowongan ↗
            </a>
          </div>
        </div>
        <AiEvalButton jobId={job.id} label="Re-eval" />
      </div>

      <pre className="overflow-x-auto whitespace-pre-wrap border border-[#262B24] bg-[#0B0D0A] p-6 [font-family:var(--font-hunter-mono)] text-[13px] leading-relaxed text-[#C9C7BE]">
        {md}
      </pre>
    </div>
  );
}
