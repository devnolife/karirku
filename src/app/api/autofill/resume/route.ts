/**
 * GET /api/autofill/resume — data resume terbaru user untuk extension.
 *
 * Catatan: penyimpanan file PDF (MinIO) belum terintegrasi di kode app.
 * Endpoint ini mengembalikan konten resume terstruktur (Json dari tabel
 * resumes). Extension menyuntikkan file HANYA bila `fileUrl` tersedia;
 * selain itu menampilkan tombol unduh manual (sesuai error handling spec).
 */

import { prisma } from "@/lib/db";
import { corsJson, corsPreflight, unauthorized, userFromRequest } from "../_lib";

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET(req: Request) {
  const userId = userFromRequest(req);
  if (!userId) return unauthorized();

  if (!process.env.DATABASE_URL) {
    // Mock mode — tidak ada file; extension menampilkan opsi manual.
    return corsJson({ available: false, fileUrl: null, content: null });
  }

  try {
    const resume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, content: true, createdAt: true },
    });
    if (!resume) {
      return corsJson({ available: false, fileUrl: null, content: null });
    }
    return corsJson({
      available: true,
      // fileUrl diisi saat integrasi MinIO/pdf-gen tersedia.
      fileUrl: null,
      content: resume.content,
      createdAt: resume.createdAt.toISOString(),
    });
  } catch (err) {
    console.warn(
      `[autofill] gagal mengambil resume: ${err instanceof Error ? err.message : String(err)}`,
    );
    return corsJson({ available: false, fileUrl: null, content: null });
  }
}
