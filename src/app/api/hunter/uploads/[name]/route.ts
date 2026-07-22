import { NextRequest } from "next/server";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(_req: NextRequest, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  if (!/^[\w.-]+$/.test(name)) {
    return Response.json({ error: "bad name" }, { status: 400 });
  }
  const ext = path.extname(name).toLowerCase();
  const type = MIME[ext];
  if (!type) return Response.json({ error: "unsupported type" }, { status: 400 });

  try {
    const buf = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": type, "Cache-Control": "private, max-age=3600" },
    });
  } catch {
    return Response.json({ error: "not found" }, { status: 404 });
  }
}
