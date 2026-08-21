/**
 * Query & mutasi analisis CV (skor ATS + review kekuatan).
 *
 * Hasil analisis di-cache di tabel `cv_analyses` dan divalidasi lewat hash file
 * supaya CV yang diganti otomatis dianggap perlu analisis ulang.
 */

import { createHash } from "node:crypto";
import { prisma } from "@devnolife/karirku-core/db";
import { analyzeCv, CvExtractError, type CvAnalysis } from "@devnolife/karirku-core/cv";

export type CvAnalysisState =
  | { status: "no_file" }
  | { status: "not_analyzed"; fileName: string }
  | { status: "stale"; fileName: string; analysis: CvAnalysis }
  | { status: "ready"; fileName: string; analysis: CvAnalysis };

function hashOf(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

/** Baca hasil analisis tersimpan dan tentukan apakah masih sesuai file CV terkini. */
export async function getCvAnalysis(userId: string): Promise<CvAnalysisState> {
  const [file, row] = await Promise.all([
    prisma.resumeFile.findUnique({
      where: { userId },
      select: { fileName: true, data: true },
    }),
    prisma.cvAnalysis.findUnique({ where: { userId } }),
  ]);

  if (!file) return { status: "no_file" };
  if (!row) return { status: "not_analyzed", fileName: file.fileName };

  const analysis = row.result as unknown as CvAnalysis;
  const current = hashOf(Buffer.from(file.data));
  return current === row.fileHash
    ? { status: "ready", fileName: file.fileName, analysis }
    : { status: "stale", fileName: file.fileName, analysis };
}

export type RunCvAnalysisResult =
  | { ok: true; analysis: CvAnalysis }
  | { ok: false; error: string };

/** Jalankan analisis penuh terhadap CV terkini lalu simpan hasilnya. */
export async function runCvAnalysis(
  userId: string,
  ctx: { targetRole?: string | null; profileSkills?: string[] } = {},
): Promise<RunCvAnalysisResult> {
  const file = await prisma.resumeFile.findUnique({
    where: { userId },
    select: { data: true, mimeType: true },
  });
  if (!file) return { ok: false, error: "Belum ada file CV yang diunggah." };

  const data = Buffer.from(file.data);

  let analysis: CvAnalysis;
  try {
    analysis = await analyzeCv({
      data,
      mimeType: file.mimeType,
      targetRole: ctx.targetRole,
      profileSkills: ctx.profileSkills,
    });
  } catch (err) {
    if (err instanceof CvExtractError) return { ok: false, error: err.message };
    return { ok: false, error: "Gagal menganalisis CV. Coba unggah ulang filenya." };
  }

  const payload = {
    fileHash: hashOf(data),
    atsScore: analysis.atsScore,
    cvScore: analysis.review?.score ?? null,
    result: analysis as unknown as object,
  };

  await prisma.cvAnalysis.upsert({
    where: { userId },
    create: { userId, ...payload },
    update: payload,
  });

  return { ok: true, analysis };
}
