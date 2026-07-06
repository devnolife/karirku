import { NextRequest } from "next/server";
import { hunterDb } from "@/lib/hunter";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const platform = sp.get("platform");
  const status = sp.get("status");
  const minScore = sp.get("minScore");
  const limit = Math.min(parseInt(sp.get("limit") || "200", 10), 500);

  const where: string[] = [];
  const params: unknown[] = [];
  if (platform) { where.push("platform = ?"); params.push(platform); }
  if (status) { where.push("status = ?"); params.push(status); }
  if (minScore) { where.push("match_score >= ?"); params.push(parseInt(minScore, 10)); }

  const sql = `SELECT * FROM jobs ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY match_score DESC, found_at DESC LIMIT ?`;
  params.push(limit);
  const jobs = hunterDb().getDb().prepare(sql).all(...params);
  return Response.json({ jobs });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, status } = body as { id?: number; status?: string };
  const allowed = ["new", "queued", "applied", "skipped", "expired"];
  if (!id || !status || !allowed.includes(status)) {
    return Response.json({ error: "need { id, status in " + allowed.join("|") + " }" }, { status: 400 });
  }
  hunterDb().getDb().prepare(`UPDATE jobs SET status = ? WHERE id = ?`).run(status, id);
  return Response.json({ ok: true });
}
