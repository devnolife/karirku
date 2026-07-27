/**
 * Helper untuk memanggil LLM dengan output JSON terstruktur.
 *
 * Strategi:
 * 1. Pakai chat.completions.create + response_format json_object (didukung Ollama
 *    untuk model llama3.x via OpenAI-compatible endpoint).
 * 2. Strip markdown fence jika model masih bandel.
 * 3. Validate via Zod.
 * 4. Retry hingga `maxRetries` dengan reminder error.
 */
import type { z } from "zod";
import { ai } from "./client";
import { MODELS } from "./models";

export interface JsonCallOptions<T> {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  model?: string;
  temperature?: number;
  maxRetries?: number;
  /** Tag untuk logging. */
  label?: string;
}

export class AiJsonError extends Error {
  constructor(
    message: string,
    public readonly raw: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AiJsonError";
  }
}

function stripFence(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) return fence[1].trim();
  // Sometimes model emits prose then JSON — grab first {...} block.
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1);
  return trimmed;
}

export async function callJson<T>(opts: JsonCallOptions<T>): Promise<T> {
  const {
    system,
    user,
    schema,
    model = MODELS.llm,
    temperature = 0.2,
    maxRetries = 2,
    label = "callJson",
  } = opts;

  let lastErr: unknown;
  let lastRaw = "";
  let nudge: string | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const messages = [
      { role: "system" as const, content: system },
      { role: "user" as const, content: user },
    ];
    if (nudge) {
      messages.push({
        role: "user" as const,
        content: `Output sebelumnya tidak valid: ${nudge}. Balas ulang HANYA dengan JSON valid sesuai schema.`,
      });
    }

    try {
      const res = await ai.chat.completions.create({
        model,
        messages,
        temperature,
        response_format: { type: "json_object" },
      });
      const raw = res.choices[0]?.message?.content ?? "";
      lastRaw = raw;
      const cleaned = stripFence(raw);
      const parsed = JSON.parse(cleaned);
      return schema.parse(parsed);
    } catch (err) {
      lastErr = err;
      nudge = err instanceof Error ? err.message.slice(0, 200) : "parse error";
      console.warn(
        `[${label}] attempt ${attempt + 1}/${maxRetries + 1} failed: ${nudge}`,
      );
    }
  }

  throw new AiJsonError(
    `LLM JSON call '${label}' failed after ${maxRetries + 1} attempts`,
    lastRaw,
    lastErr,
  );
}
