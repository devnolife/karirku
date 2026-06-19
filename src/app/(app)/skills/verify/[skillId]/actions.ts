"use server";

import { requireUser } from "@/lib/auth";
import { scoreQuiz, type QuizQuestion } from "@/lib/ai/quiz";
import { getUserSkill, markSkillVerified, regenerateProfileEmbedding } from "@/server/queries/profile";
import { revalidatePath } from "next/cache";

export type GradeResult = {
  correct: number;
  total: number;
  passed: boolean;
};

/**
 * Cache jawaban benar per (userId+skillId) selama proses quiz berlangsung.
 * In-memory, short-lived — cukup untuk satu sesi attempt. Tidak dikirim ke client.
 */
const answerCache = new Map<string, { correct: number[]; expires: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000;

function cacheKey(userId: string, skillId: string): string {
  return `${userId}:${skillId}`;
}

function cacheCorrect(userId: string, skillId: string, questions: QuizQuestion[]): void {
  answerCache.set(cacheKey(userId, skillId), {
    correct: questions.map((q) => q.correctIndex),
    expires: Date.now() + CACHE_TTL_MS,
  });
}

/** Dipanggil server page setelah generate quiz, untuk simpan kunci jawaban. */
export async function stashAnswers(skillId: string, questions: QuizQuestion[]): Promise<void> {
  const user = await requireUser();
  cacheCorrect(user.id, skillId, questions);
}

/** Nilai jawaban; kalau lulus, set skill verified + regenerasi embedding. */
export async function gradeQuiz(skillId: string, answers: number[]): Promise<GradeResult> {
  const user = await requireUser();

  const entry = answerCache.get(cacheKey(user.id, skillId));
  if (!entry || entry.expires < Date.now()) {
    // Kunci jawaban hilang/kedaluwarsa — anggap gagal (user bisa coba lagi → quiz baru).
    return { correct: 0, total: answers.length, passed: false };
  }

  const { correct, total, passed } = scoreQuiz(entry.correct, answers);

  if (passed) {
    const skill = await getUserSkill(user.id, skillId);
    if (skill) {
      await markSkillVerified(user.id, skillId, "quiz");
      await regenerateProfileEmbedding(user.id);
      revalidatePath("/skills");
      revalidatePath("/profile");
    }
  }
  answerCache.delete(cacheKey(user.id, skillId));

  return { correct, total, passed };
}
