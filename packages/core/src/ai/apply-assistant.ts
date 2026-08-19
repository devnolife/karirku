/**
 * Asisten Lamar — ekstraksi lowongan (teks/gambar/link) & penulisan pesan
 * lamaran, semua lewat LLM lokal. Server-only.
 *
 * - Ekstraksi pakai MODELS.fast (volume ringan, cukup cepat).
 * - Penulisan pesan pakai MODELS.llm (quality-sensitive, Bahasa Indonesia).
 */

import { callJson } from "./json.js";
import { MODELS } from "./models.js";
import {
  JobPostingExtractionSchema,
  ApplicationDraftSchema,
  type JobPostingExtraction,
  type ApplicationDraftPlan,
} from "./schemas.js";
import {
  JOB_IMPORT_SYSTEM,
  jobImportUser,
  APPLY_DRAFT_SYSTEM,
  applyDraftUser,
  type ApplyDraftContext,
} from "./prompts.js";
import { ocrImage } from "../ocr.js";

function clip(text: string, max = 7000): string {
  const t = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
  return t.length > max ? t.slice(0, max) + " …" : t;
}

/** Ekstrak lowongan terstruktur dari teks bebas (deskripsi / isi halaman / OCR). */
export async function extractJobFromText(
  text: string,
  sourceLabel = "teks",
): Promise<JobPostingExtraction> {
  const body = clip(text);
  if (body.length < 12) {
    throw new Error("Konten terlalu pendek untuk dianalisis.");
  }
  return callJson({
    system: JOB_IMPORT_SYSTEM,
    user: jobImportUser(sourceLabel, body),
    schema: JobPostingExtractionSchema,
    model: MODELS.fast,
    label: "extractJobFromText",
  });
}

/** OCR gambar poster lowongan lalu ekstrak jadi lowongan terstruktur. */
export async function extractJobFromImage(
  image: Buffer,
): Promise<{ job: JobPostingExtraction; rawText: string }> {
  const rawText = await ocrImage(image);
  if (rawText.replace(/\s+/g, "").length < 20) {
    throw new Error(
      "Teks pada gambar tidak terbaca. Pastikan tulisan jelas atau tempel teksnya.",
    );
  }
  const job = await extractJobFromText(rawText, "hasil OCR gambar poster lowongan");
  return { job, rawText };
}

/** Tulis draft pesan lamaran (email/WhatsApp/surat) yang dipersonalisasi. */
export async function draftApplicationMessage(
  ctx: ApplyDraftContext,
): Promise<ApplicationDraftPlan> {
  return callJson({
    system: APPLY_DRAFT_SYSTEM,
    user: applyDraftUser(ctx),
    schema: ApplicationDraftSchema,
    model: MODELS.llm,
    temperature: 0.5,
    label: "draftApplicationMessage",
  });
}
