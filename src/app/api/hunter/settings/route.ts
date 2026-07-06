import { NextRequest } from "next/server";
import { hunterDb } from "@/lib/hunter";

export const dynamic = "force-dynamic";

const EDITABLE = ["apply_mode", "salary_floor_juta", "match_threshold", "keywords", "avoid_keywords"];

export async function GET() {
  const db = hunterDb().getDb();
  const rows = db.prepare(`SELECT key, value FROM settings`).all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return Response.json({ settings });
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json()) as Record<string, string>;
  const { setSetting } = hunterDb();
  const updated: string[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (!EDITABLE.includes(key)) continue;
    setSetting(key, String(value));
    updated.push(key);
  }
  return Response.json({ ok: true, updated });
}
