import { NextRequest } from "next/server";
import { hunterDb } from "@/core/hunter";
import { authorizeHunterApi } from "@/lib/hunter-access";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const access = await authorizeHunterApi();
  if (!access.ok) return access.response;

  const sp = request.nextUrl.searchParams;
  const platform = sp.get("platform");
  const replyStatus = sp.get("replyStatus");

  const where: string[] = [];
  const params: unknown[] = [];
  if (platform) { where.push("a.platform = ?"); params.push(platform); }
  if (replyStatus) { where.push("a.reply_status = ?"); params.push(replyStatus); }

  const sql = `SELECT a.*, j.url AS job_url, j.salary_min, j.salary_max, j.match_score
    FROM applications a LEFT JOIN jobs j ON j.id = a.job_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY a.applied_at DESC LIMIT 500`;
  const applications = hunterDb().getDb().prepare(sql).all(...params);
  return Response.json({ applications });
}
