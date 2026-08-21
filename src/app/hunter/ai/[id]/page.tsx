import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@devnolife/karirku-core/db";
import { getSession } from "@/lib/auth";
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

  const { user } = await getSession();

  // findFirst + filter userId, bukan findUnique by id: id-nya integer
  // berurutan, jadi tanpa filter siapa pun bisa membaca laporan job orang lain
  // hanya dengan menebak angka di URL.
  const job = await prisma.hunterJob.findFirst({
    where: { id: jobId, userId: user.id },
    select: {
      id: true, title: true, company: true, url: true,
      llmScore: true, llmTier: true, llmReportPath: true, llmEvaluatedAt: true,
    },
  });
  if (!job || !job.llmReportPath) notFound();

  // Path disimpan relatif dari root project; tolak path yang keluar dari data/ai-reports.
  const reportsDir = path.resolve(process.cwd(), "data", "ai-reports");
  const resolved = path.resolve(process.cwd(), job.llmReportPath);
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
            score {job.llmScore?.toFixed(1) ?? "—"}/5
            {job.llmTier ? ` · tier:${job.llmTier}` : ""}
            {job.llmEvaluatedAt ? ` · ${job.llmEvaluatedAt.toISOString().slice(0, 16).replace("T", " ")}` : ""}
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
