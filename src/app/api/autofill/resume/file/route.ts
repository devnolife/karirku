/**
 * GET /api/autofill/resume/file — file CV user (binary) untuk diinjeksikan
 * extension ke field upload form lamaran. Auth: bearer extension token.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CORS_HEADERS, corsJson, corsPreflight, unauthorized, userFromRequest } from "../../_lib";

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET(req: Request) {
  const userId = userFromRequest(req);
  if (!userId) return unauthorized();

  if (!process.env.DATABASE_URL) {
    return corsJson({ error: "not_found", message: "Mock mode — tidak ada file CV" }, { status: 404 });
  }

  const file = await prisma.resumeFile.findUnique({ where: { userId } });
  if (!file) {
    return corsJson(
      { error: "not_found", message: "Belum ada file CV — upload di halaman profil karirku" },
      { status: 404 },
    );
  }

  return new NextResponse(Buffer.from(file.data), {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"`,
      "X-File-Name": encodeURIComponent(file.fileName),
      "Access-Control-Expose-Headers": "X-File-Name, Content-Disposition",
      "Cache-Control": "private, no-store",
    },
  });
}
