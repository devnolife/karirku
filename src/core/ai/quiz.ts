/**
 * Generator kuis verifikasi skill via LLM (Ollama, OpenAI-compatible).
 * Output divalidasi Zod; jika AI gagal total, melempar AiJsonError (caller
 * menampilkan fallback yang ramah).
 */
import { z } from "zod";
import { callJson, AiJsonError } from "./json";
import { MODELS } from "./models";
import { SKILL_QUIZ_SYSTEM, skillQuizUser } from "./prompts";

export { AiJsonError };

export const QUIZ_QUESTION_COUNT = 5;
export const QUIZ_PASS_RATIO = 0.7;

const QuestionSchema = z.object({
  question: z.string().min(5),
  options: z.array(z.string().min(1)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().default(""),
});

const QuizSchema = z.object({
  questions: z.array(QuestionSchema).min(1),
});

export type QuizQuestion = z.infer<typeof QuestionSchema>;

/** Pertanyaan tanpa jawaban benar — dikirim ke client (agar tak bocor). */
export type QuizQuestionPublic = {
  question: string;
  options: string[];
};

export type GeneratedQuiz = {
  questions: QuizQuestion[];
};

/** Generate kuis untuk satu skill. Melempar AiJsonError kalau AI gagal. */
export async function generateSkillQuiz(skillName: string): Promise<GeneratedQuiz> {
  const result = await callJson({
    system: SKILL_QUIZ_SYSTEM,
    user: skillQuizUser(skillName, QUIZ_QUESTION_COUNT),
    schema: QuizSchema,
    // Kuis = quality-sensitive → pakai model LLM utama (gemma3:27b), bukan FAST.
    model: MODELS.llm,
    temperature: 0.4,
    label: `skill-quiz:${skillName}`,
  });
  // Batasi ke jumlah yang diminta (model kadang lebih).
  return { questions: result.questions.slice(0, QUIZ_QUESTION_COUNT) };
}

/** Hitung skor: jumlah benar / total. */
export function scoreQuiz(correctIndexes: number[], answers: number[]): {
  correct: number;
  total: number;
  ratio: number;
  passed: boolean;
} {
  const total = correctIndexes.length;
  let correct = 0;
  for (let i = 0; i < total; i++) {
    if (answers[i] === correctIndexes[i]) correct += 1;
  }
  const ratio = total > 0 ? correct / total : 0;
  return { correct, total, ratio, passed: ratio >= QUIZ_PASS_RATIO };
}
