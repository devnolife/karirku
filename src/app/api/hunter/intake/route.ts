import { NextRequest } from "next/server";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { authorizeHunterApi } from "@/lib/hunter-access";

export const dynamic = "force-dynamic";

const ALLOWED_IMAGE = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const EXT_BY_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/**
 * POST /api/hunter/intake
 * Body JSON: { url?: string, text?: string, imageBase64?: string, imageMime?: string,
 *              title?: string, company?: string, noDocs?: boolean }
 * Menjalankan `node ai/intake.mjs ...` detached; job muncul di /hunter/jobs setelah selesai.
 */
export async function POST(request: NextRequest) {
  const access = await authorizeHunterApi();
  if (!access.ok) return access.response;

  const body = await request.json().catch(() => ({}));
  const url = typeof body.url === "string" ? body.url.trim() : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64 : "";
  const imageMime = typeof body.imageMime === "string" ? body.imageMime : "";

  const sources = [url, text, imageBase64].filter(Boolean).length;
  if (sources !== 1) {
    return Response.json(
      { error: "invalid_input", message: "Isi tepat satu: url, text, atau gambar." },
      { status: 400 },
    );
  }
  if (url && !/^https?:\/\//i.test(url)) {
    return Response.json(
      { error: "invalid_url", message: "URL harus diawali http(s)://." },
      { status: 400 },
    );
  }

  const intakeDir = path.resolve(process.cwd(), "data/intake");
  mkdirSync(intakeDir, { recursive: true });
  const stamp = Date.now();

  const args: string[] = ["ai/intake.mjs"];
  if (url) {
    args.push("--url", url);
  } else if (imageBase64) {
    if (!ALLOWED_IMAGE.has(imageMime)) {
      return Response.json(
        { error: "invalid_image", message: "Format gambar harus png/jpg/webp/gif." },
        { status: 400 },
      );
    }
    const buf = Buffer.from(imageBase64, "base64");
    if (!buf.length || buf.length > MAX_IMAGE_BYTES) {
      return Response.json(
        { error: "invalid_image", message: "Gambar kosong atau lebih dari 8 MB." },
        { status: 400 },
      );
    }
    const imgPath = path.join(intakeDir, `${stamp}${EXT_BY_MIME[imageMime]}`);
    writeFileSync(imgPath, buf);
    args.push("--image", imgPath);
  } else {
    const txtPath = path.join(intakeDir, `${stamp}.txt`);
    writeFileSync(txtPath, text, "utf8");
    args.push("--text", txtPath);
  }
  if (typeof body.title === "string" && body.title.trim()) args.push("--title", body.title.trim());
  if (typeof body.company === "string" && body.company.trim()) args.push("--company", body.company.trim());
  if (body.noDocs) args.push("--no-docs");

  try {
    const logPath = path.join(intakeDir, `${stamp}.log`);
    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      detached: true,
      stdio: ["ignore", "ignore", "ignore"],
      env: { ...process.env, AI_INTAKE_LOG: logPath },
    });
    child.unref();
    return Response.json({ ok: true, pid: child.pid }, { status: 202 });
  } catch (error) {
    console.error("[hunter/intake] gagal spawn:", error);
    return Response.json(
      { error: "spawn_failed", message: "Intake tidak dapat dijalankan." },
      { status: 500 },
    );
  }
}
