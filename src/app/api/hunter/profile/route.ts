import { NextRequest } from "next/server";
import { hunterDb } from "@/lib/hunter";

export const dynamic = "force-dynamic";

export async function GET() {
  const raw = hunterDb().getSetting("profile", "{}");
  let profile: unknown;
  try {
    profile = JSON.parse(raw);
  } catch {
    profile = {};
  }
  return Response.json({ profile });
}

export async function PATCH(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json({ error: "profile must be a JSON object" }, { status: 400 });
  }
  hunterDb().setSetting("profile", JSON.stringify(body));
  return Response.json({ ok: true });
}
