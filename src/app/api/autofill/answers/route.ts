/**
 * POST /api/autofill/answers — simpan jawaban screening yang di-approve user
 * dari overlay extension. Dipakai ulang di lamaran berikutnya (answer bank).
 * Body: { answers: [{ question, answer }] } — max 30 per request.
 */

import { z } from "zod";
import { upsertSavedAnswer } from "@/lib/autofill/answers";
import { corsJson, corsPreflight, unauthorized, userFromRequest } from "../_lib";

const BodySchema = z.object({
  answers: z
    .array(
      z.object({
        question: z.string().min(8).max(2000),
        answer: z.string().min(1).max(5000),
      }),
    )
    .min(1)
    .max(30),
});

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  const userId = await userFromRequest(req);
  if (!userId) return unauthorized();

  if (!process.env.DATABASE_URL) {
    return corsJson({ ok: true, saved: 0, note: "mock mode — tidak disimpan" });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (err) {
    return corsJson(
      { error: "invalid_body", message: err instanceof Error ? err.message : "Body tidak valid" },
      { status: 400 },
    );
  }

  let saved = 0;
  for (const { question, answer } of body.answers) {
    try {
      await upsertSavedAnswer(userId, question, answer);
      saved += 1;
    } catch (err) {
      console.warn(
        `[autofill] gagal simpan jawaban: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return corsJson({ ok: true, saved });
}
