/**
 * LLM mapper — fallback untuk field yang tidak tertangani adapter/heuristik.
 * Memakai client OpenAI-compatible yang sudah ada (Ollama dev / vLLM prod).
 *
 * Kontrak output LLM: JSON { "mappings": [{ selector, value, confidence, essay }] }.
 * Semua output divalidasi zod; selector yang tidak dikenal dibuang; field yang
 * tidak dijawab LLM dibiarkan kosong (tidak menebak).
 */

import type OpenAI from "openai";
import { z } from "zod";
import { ai } from "@/core/ai/client";
import { MODELS } from "@/core/ai/models";
import type { FieldMapping, FormFieldInfo, FormSnapshot, ProfileData } from "./types";

const LlmMappingSchema = z.object({
  mappings: z
    .array(
      z.object({
        selector: z.string(),
        value: z.string(),
        confidence: z.number().min(0).max(1).optional(),
        essay: z.boolean().optional(),
      }),
    )
    .default([]),
});

const SYSTEM_PROMPT = `You map job application form fields to a candidate profile.
Rules:
- Reply ONLY with JSON: {"mappings":[{"selector":string,"value":string,"confidence":number,"essay":boolean}]}
- Use ONLY selectors given in the field list. Never invent selectors.
- Fill a field ONLY if you are reasonably sure. If unsure, omit it entirely.
- For select/radio fields, "value" MUST be exactly one of the given options.
- For open/essay questions (motivation, why us, cover letter), write a short
  professional answer (max 120 words) based on the profile and job context,
  set "essay": true and confidence <= 0.7. Match the language of the question
  (Indonesian or English).
- Never fabricate facts not present in the profile (no fake degrees, employers, numbers).`;

function buildUserPrompt(
  fields: FormFieldInfo[],
  profile: ProfileData,
  snapshot: FormSnapshot,
): string {
  const fieldLines = fields.map((f) =>
    JSON.stringify({
      selector: f.selector,
      label: f.label,
      name: f.name,
      type: f.type,
      required: f.required,
      options: f.options,
      placeholder: f.placeholder,
    }),
  );
  // experience/education JSON dibuang dari prompt bila terlalu besar.
  const flat: Partial<ProfileData> = { ...profile };
  delete flat.experience;
  delete flat.education;
  return [
    `Job page: ${snapshot.url}`,
    snapshot.jobTitle ? `Job title: ${snapshot.jobTitle}` : "",
    snapshot.company ? `Company: ${snapshot.company}` : "",
    "",
    "Candidate profile (JSON):",
    JSON.stringify(flat),
    "",
    "Form fields to map (one JSON per line):",
    ...fieldLines,
  ]
    .filter(Boolean)
    .join("\n");
}

export interface LlmMapperOptions {
  /** Injeksi client untuk testing. Default: client Ollama/vLLM app. */
  client?: OpenAI;
  model?: string;
  timeoutMs?: number;
}

/**
 * Petakan field tersisa via LLM. Gagal/timeout → return [] (caller membiarkan
 * field kosong dengan penanda merah — sesuai error handling di spec).
 */
export async function mapWithLlm(
  fields: FormFieldInfo[],
  profile: ProfileData,
  snapshot: FormSnapshot,
  opts: LlmMapperOptions = {},
): Promise<FieldMapping[]> {
  if (fields.length === 0) return [];
  const client = opts.client ?? ai;
  const model = opts.model ?? MODELS.fast;
  const timeoutMs = opts.timeoutMs ?? 30_000;

  let raw: string;
  try {
    const res = await client.chat.completions.create(
      {
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(fields, profile, snapshot) },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      },
      { timeout: timeoutMs },
    );
    raw = res.choices[0]?.message?.content ?? "";
  } catch (err) {
    console.warn(
      `[autofill] LLM mapper gagal: ${err instanceof Error ? err.message : String(err)}`,
    );
    return [];
  }

  let parsed: z.infer<typeof LlmMappingSchema>;
  try {
    parsed = LlmMappingSchema.parse(JSON.parse(raw));
  } catch {
    console.warn("[autofill] Output LLM bukan JSON valid — field dibiarkan kosong");
    return [];
  }

  const bySelector = new Map(fields.map((f) => [f.selector, f]));
  const out: FieldMapping[] = [];

  for (const m of parsed.mappings) {
    const field = bySelector.get(m.selector);
    if (!field) continue; // selector karangan LLM — buang
    if (!m.value.trim()) continue;

    // select/radio: nilai wajib salah satu opsi
    if ((field.type === "select" || field.type === "radio") && field.options?.length) {
      if (!field.options.includes(m.value)) continue;
    }

    const essay = m.essay === true;
    out.push({
      selector: m.selector,
      value: m.value,
      confidence: Math.min(m.confidence ?? 0.6, essay ? 0.7 : 1),
      source: "llm",
      aiGenerated: essay,
    });
    bySelector.delete(m.selector); // satu mapping per field
  }

  return out;
}
