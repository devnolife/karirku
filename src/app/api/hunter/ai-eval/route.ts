import { spawn } from "node:child_process";
import path from "node:path";
import { NextRequest } from "next/server";
import { authorizeHunterApi } from "@/lib/hunter-access";

export const dynamic = "force-dynamic";

/**
 * POST /api/hunter/ai-eval  { jobId?: number, limit?: number }
 * Spawns `node ai/eval-job.mjs` detached — either one job or --all-new.
 * Progress lands in jobs.llm_* columns; reports in data/ai-reports/.
 */
export async function POST(request: NextRequest) {
  const access = await authorizeHunterApi();
  if (!access.ok) return access.response;

  const body = await request.json().catch(() => ({}));
  const jobId = Number.isInteger(body.jobId) && body.jobId > 0 ? body.jobId : null;
  const limit = Number.isInteger(body.limit) && body.limit > 0 && body.limit <= 100 ? body.limit : 10;

  const args = jobId
    ? ["ai/eval-job.mjs", String(jobId)]
    : ["ai/eval-job.mjs", "--all-new", "--limit", String(limit)];

  try {
    const child = spawn(process.execPath, args, {
      cwd: path.resolve(process.cwd()),
      detached: true,
      stdio: "ignore",
    });
    child.unref();
    return Response.json({ ok: true, pid: child.pid, args }, { status: 202 });
  } catch (error) {
    console.error("[hunter/ai-eval] spawn gagal:", error);
    return Response.json(
      { error: "spawn_failed", message: "Evaluator tidak dapat dijalankan." },
      { status: 500 },
    );
  }
}
