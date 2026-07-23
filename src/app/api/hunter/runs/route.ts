import { hunterDb } from "@/lib/hunter";
import { authorizeHunterApi } from "@/lib/hunter-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await authorizeHunterApi();
  if (!access.ok) return access.response;

  const runs = hunterDb()
    .getDb()
    .prepare(`SELECT id, type, platform, ok, stats_json, started_at, finished_at FROM runs ORDER BY id DESC LIMIT 50`)
    .all();
  return Response.json({ runs });
}
