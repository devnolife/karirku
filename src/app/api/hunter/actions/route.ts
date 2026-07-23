import { NextRequest } from "next/server";
import {
  actionToArgs,
  releaseHunter,
  reserveHunter,
  spawnHunter,
} from "@/lib/hunter";
import { authorizeHunterApi } from "@/lib/hunter-access";

export const dynamic = "force-dynamic";

/**
 * POST /api/hunter/actions  { action: "scan"|"apply"|"sync-email"|"import-applied"|"full", ... }
 * Spawns `node hunter/run.js <args>` detached; progress lands in the runs table.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action : "";
  const access = await authorizeHunterApi({
    requireAutoApply: action === "apply",
  });
  if (!access.ok) return access.response;

  const args = actionToArgs(action, body);
  if (!args) {
    return Response.json(
      { error: "invalid_action", message: "Action atau parameter tidak valid." },
      { status: 400 },
    );
  }
  const reservation = reserveHunter(action);
  if (!reservation.ok) {
    const busy = reservation.lock;
    return Response.json(
      {
        error: "hunter_busy",
        message: `Hunter sedang menjalankan ${busy?.command ?? "command lain"}.`,
        lock: busy,
      },
      { status: 409 },
    );
  }
  try {
    const { pid } = spawnHunter(args, reservation.lock.ownerId);
    return Response.json({ ok: true, pid, args }, { status: 202 });
  } catch (error) {
    releaseHunter(reservation.lock.ownerId);
    console.error("[hunter] gagal menjalankan command:", error);
    return Response.json(
      { error: "spawn_failed", message: "Hunter tidak dapat dijalankan." },
      { status: 500 },
    );
  }
}
