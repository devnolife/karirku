import { NextRequest } from "next/server";
import { hunterDb } from "@devnolife/karirku-core/hunter";
import { authorizeHunterApi } from "@/lib/hunter-access";

export const dynamic = "force-dynamic";

const PLATFORMS = new Set(["freelancer", "jobstreet", "linkedin", "upwork"]);
const STATUSES = new Set(["new", "queued", "applied", "skipped", "expired"]);

export async function GET(request: NextRequest) {
  const access = await authorizeHunterApi();
  if (!access.ok) return access.response;

  const sp = request.nextUrl.searchParams;
  const platform = sp.get("platform");
  const status = sp.get("status");
  const minScore = sp.get("minScore");
  const rawLimit = Number(sp.get("limit") ?? 200);
  const limit =
    Number.isInteger(rawLimit) && rawLimit >= 1 && rawLimit <= 500
      ? rawLimit
      : 200;

  if (platform && !PLATFORMS.has(platform)) {
    return Response.json({ error: "platform tidak valid" }, { status: 400 });
  }
  if (status && !STATUSES.has(status)) {
    return Response.json({ error: "status tidak valid" }, { status: 400 });
  }
  const score = minScore === null ? null : Number(minScore);
  if (
    score !== null &&
    (!Number.isInteger(score) || score < 0 || score > 100)
  ) {
    return Response.json({ error: "minScore harus 0-100" }, { status: 400 });
  }

  const where: string[] = [];
  const params: unknown[] = [];
  if (platform) { where.push("platform = ?"); params.push(platform); }
  if (status) { where.push("status = ?"); params.push(status); }
  if (score !== null) {
    where.push("match_score >= ?");
    params.push(score);
  }

  const sql = `SELECT * FROM jobs ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY match_score DESC, found_at DESC LIMIT ?`;
  params.push(limit);
  const jobs = hunterDb().getDb().prepare(sql).all(...params);
  return Response.json({ jobs });
}

export async function PATCH(request: NextRequest) {
  const access = await authorizeHunterApi();
  if (!access.ok) return access.response;

  const body = await request.json();
  const { id, status } = body as { id?: number; status?: string };
  if (
    typeof id !== "number" ||
    !Number.isInteger(id) ||
    id <= 0 ||
    !status ||
    !STATUSES.has(status)
  ) {
    return Response.json(
      { error: `need { id, status in ${[...STATUSES].join("|")} }` },
      { status: 400 },
    );
  }
  hunterDb().getDb().prepare(`UPDATE jobs SET status = ? WHERE id = ?`).run(status, id);
  return Response.json({ ok: true });
}
