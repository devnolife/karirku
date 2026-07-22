import { NextRequest } from "next/server";
import path from "path";
import fs from "fs/promises";
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

const IMG_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};
const MAX_IMG_BYTES = 5 * 1024 * 1024;

/** Manually add a job (link / description / screenshot) into the queue. */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const title = String(form.get("title") || "").trim();
  if (!title) return Response.json({ error: "title is required" }, { status: 400 });

  let imagePath: string | null = null;
  const image = form.get("image");
  if (image instanceof File && image.size > 0) {
    const ext = IMG_EXT[image.type];
    if (!ext) return Response.json({ error: "image must be jpg/png/webp" }, { status: 400 });
    if (image.size > MAX_IMG_BYTES) return Response.json({ error: "image too large (max 5 MB)" }, { status: 400 });
    const name = `manual-${Date.now()}${ext}`;
    const dir = path.join(process.cwd(), "data", "uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), Buffer.from(await image.arrayBuffer()));
    imagePath = name;
  }

  const num = (k: string) => {
    const v = String(form.get(k) || "").trim();
    return v ? parseInt(v, 10) || null : null;
  };
  const str = (k: string) => String(form.get(k) || "").trim() || null;

  const externalId = `manual-${Date.now()}`;
  const result = hunterDb()
    .getDb()
    .prepare(
      `INSERT INTO jobs (platform, external_id, title, company, url, location, remote,
         salary_min, salary_max, currency, description, match_score, status, image_path)
       VALUES ('manual', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'new', ?)`
    )
    .run(
      externalId,
      title,
      str("company"),
      str("url") || "",
      str("location"),
      form.get("remote") === "on" || form.get("remote") === "1" ? 1 : 0,
      num("salary_min"),
      num("salary_max"),
      str("currency") || "IDR",
      str("description"),
      imagePath
    ) as { lastInsertRowid: number | bigint };

  return Response.json({ ok: true, id: Number(result.lastInsertRowid), image_path: imagePath });
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
