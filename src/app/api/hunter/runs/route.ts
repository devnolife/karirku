import { hunterDb } from "@/lib/hunter";

export const dynamic = "force-dynamic";

export async function GET() {
  const runs = hunterDb()
    .getDb()
    .prepare(`SELECT id, type, platform, ok, stats_json, started_at, finished_at FROM runs ORDER BY id DESC LIMIT 50`)
    .all();
  return Response.json({ runs });
}
