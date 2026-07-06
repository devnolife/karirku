import { NextRequest } from "next/server";
import { actionToArgs, spawnHunter } from "@/lib/hunter";

export const dynamic = "force-dynamic";

/**
 * POST /api/hunter/actions  { action: "scan"|"apply"|"sync-email"|"import-applied"|"full", ... }
 * Spawns `node hunter/run.js <args>` detached; progress lands in the runs table.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action : "";
  const args = actionToArgs(action, body);
  if (!args) return Response.json({ error: "unknown action: " + action }, { status: 400 });
  const { pid } = spawnHunter(args);
  return Response.json({ ok: true, pid, args });
}
