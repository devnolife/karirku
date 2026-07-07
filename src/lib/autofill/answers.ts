/**
 * Answer bank — jawaban pertanyaan screening yang pernah di-approve user,
 * dipakai ulang lintas lamaran. Prioritas di atas LLM: jawaban manusia
 * lebih dipercaya daripada generasi baru.
 */

import { prisma } from "@/lib/db";
import type { FieldMapping, FormFieldInfo } from "./types";
import { fieldHaystack } from "./rules";

/**
 * Normalisasi pertanyaan jadi kunci pencarian: lowercase, tanpa tanda baca,
 * spasi tunggal. "Why do you want to work here?" ≈ "why do you want to work here".
 */
export function normalizeQuestionKey(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

/** Kemiripan token sederhana (Jaccard) untuk fuzzy match pertanyaan. */
function tokenSimilarity(a: string, b: string): number {
  const ta = new Set(a.split(" ").filter((w) => w.length > 2));
  const tb = new Set(b.split(" ").filter((w) => w.length > 2));
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  return inter / (ta.size + tb.size - inter);
}

export interface SavedAnswerItem {
  questionKey: string;
  answer: string;
}

/** Ambil semua jawaban tersimpan user (mock mode → kosong). */
export async function getSavedAnswers(userId: string): Promise<SavedAnswerItem[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const rows = await prisma.savedAnswer.findMany({
      where: { userId },
      select: { questionKey: true, answer: true },
      orderBy: { updatedAt: "desc" },
      take: 300,
    });
    return rows;
  } catch {
    return [];
  }
}

const FUZZY_THRESHOLD = 0.75;

/**
 * Cocokkan field (label/placeholder) ke jawaban tersimpan.
 * Exact key match → confidence 0.95; fuzzy (Jaccard ≥ 0.75) → 0.85.
 * Field select/radio dilewati kecuali jawaban persis salah satu opsi.
 */
export function matchSavedAnswers(
  fields: FormFieldInfo[],
  saved: SavedAnswerItem[],
): { mappings: FieldMapping[]; remaining: FormFieldInfo[] } {
  const mappings: FieldMapping[] = [];
  const remaining: FormFieldInfo[] = [];
  if (saved.length === 0) return { mappings, remaining: fields };

  const byKey = new Map(saved.map((s) => [s.questionKey, s.answer]));

  for (const field of fields) {
    const label = field.label || field.placeholder || field.name || "";
    const key = normalizeQuestionKey(label);
    if (key.length < 8) {
      // Label terlalu pendek — bukan pertanyaan screening, biarkan lapis lain.
      remaining.push(field);
      continue;
    }

    let answer = byKey.get(key);
    let confidence = 0.95;
    if (!answer) {
      let best = 0;
      for (const s of saved) {
        const sim = tokenSimilarity(key, s.questionKey);
        if (sim > best) {
          best = sim;
          if (sim >= FUZZY_THRESHOLD) answer = s.answer;
        }
      }
      confidence = 0.85;
    }

    if (!answer) {
      remaining.push(field);
      continue;
    }
    if ((field.type === "select" || field.type === "radio") && field.options?.length) {
      const opt = field.options.find((o) => o.trim().toLowerCase() === answer!.trim().toLowerCase());
      if (!opt) {
        remaining.push(field);
        continue;
      }
      answer = opt;
    }

    mappings.push({ selector: field.selector, value: answer, confidence, source: "saved" });
  }

  return { mappings, remaining };
}

/** Simpan/update jawaban yang di-approve user. */
export async function upsertSavedAnswer(
  userId: string,
  question: string,
  answer: string,
): Promise<void> {
  const questionKey = normalizeQuestionKey(question);
  if (questionKey.length < 8 || !answer.trim()) return;
  await prisma.savedAnswer.upsert({
    where: { userId_questionKey: { userId, questionKey } },
    create: { userId, questionKey, question: question.slice(0, 2000), answer: answer.trim() },
    update: { answer: answer.trim(), question: question.slice(0, 2000), timesUsed: { increment: 1 } },
  });
}

// fieldHaystack re-export agar modul lain tidak perlu import ganda.
export { fieldHaystack };
