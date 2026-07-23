import { NextRequest } from "next/server";
import { hunterDb } from "@/lib/hunter";
import { authorizeHunterApi } from "@/lib/hunter-access";

export const dynamic = "force-dynamic";

const EDITABLE = ["apply_mode", "salary_floor_juta", "match_threshold", "keywords", "avoid_keywords"];

function normalizeSetting(key: string, raw: unknown): string | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const value = String(raw).trim();

  if (key === "apply_mode") {
    return value === "manual" || value === "auto" ? value : null;
  }
  if (key === "salary_floor_juta" || key === "match_threshold") {
    const number = Number(value);
    const max = key === "match_threshold" ? 100 : 1_000;
    return Number.isInteger(number) && number >= 0 && number <= max
      ? String(number)
      : null;
  }
  if (key === "keywords" || key === "avoid_keywords") {
    try {
      const parsed = JSON.parse(value);
      if (
        !Array.isArray(parsed) ||
        parsed.length > 100 ||
        parsed.some(
          (item) =>
            typeof item !== "string" ||
            item.trim().length === 0 ||
            item.length > 100,
        )
      ) {
        return null;
      }
      return JSON.stringify(parsed.map((item) => item.trim()));
    } catch {
      return null;
    }
  }
  return null;
}

export async function GET() {
  const access = await authorizeHunterApi();
  if (!access.ok) return access.response;

  const db = hunterDb().getDb();
  const rows = db.prepare(`SELECT key, value FROM settings`).all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return Response.json({ settings });
}

export async function PATCH(request: NextRequest) {
  const access = await authorizeHunterApi();
  if (!access.ok) return access.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body JSON tidak valid." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Body harus object." }, { status: 400 });
  }

  const entries = Object.entries(body);
  const normalized: Array<[string, string]> = [];
  for (const [key, raw] of entries) {
    if (!EDITABLE.includes(key)) continue;
    const value = normalizeSetting(key, raw);
    if (value === null) {
      return Response.json(
        { error: `Nilai setting '${key}' tidak valid.` },
        { status: 400 },
      );
    }
    normalized.push([key, value]);
  }

  const { setSetting } = hunterDb();
  const updated: string[] = [];
  for (const [key, value] of normalized) {
    setSetting(key, value);
    updated.push(key);
  }
  return Response.json({ ok: true, updated });
}
