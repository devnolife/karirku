/**
 * AI extractors — ekstraksi terstruktur dari teks panjang (job, course, CV).
 *
 * Semua call lewat callJson supaya output divalidasi Zod & retry on invalid.
 */
import { callJson } from "./json";
import {
  CourseExtractionSchema,
  SkillExtractionSchema,
  type CourseExtraction,
  type SkillExtraction,
} from "./schemas";
import {
  COURSE_EXTRACT_SYSTEM,
  SKILL_EXTRACT_SYSTEM,
} from "./prompts";
import { MODELS } from "./models";

function clip(text: string, max = 4000): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max) + " …" : t;
}

export interface JobExtractInput {
  title: string;
  company?: string | null;
  description?: string | null;
  requirements?: string[];
}

export async function extractJobSkills(
  input: JobExtractInput,
): Promise<SkillExtraction> {
  const body = [
    `Title: ${input.title}`,
    input.company ? `Company: ${input.company}` : "",
    input.description ? `Description: ${clip(input.description)}` : "",
    input.requirements?.length
      ? `Requirements:\n- ${input.requirements.map((r) => clip(r, 400)).join("\n- ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return callJson({
    system: SKILL_EXTRACT_SYSTEM,
    user: body,
    schema: SkillExtractionSchema,
    model: MODELS.fast,
    label: "extractJobSkills",
  });
}

export interface CourseExtractInput {
  title: string;
  provider?: string | null;
  description?: string | null;
}

export async function extractCourseSkills(
  input: CourseExtractInput,
): Promise<CourseExtraction> {
  const body = [
    `Course: ${input.title}`,
    input.provider ? `Provider: ${input.provider}` : "",
    input.description ? `Deskripsi: ${clip(input.description)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return callJson({
    system: COURSE_EXTRACT_SYSTEM,
    user: body,
    schema: CourseExtractionSchema,
    model: MODELS.fast,
    label: "extractCourseSkills",
  });
}

export async function extractCv(text: string): Promise<SkillExtraction> {
  return callJson({
    system: SKILL_EXTRACT_SYSTEM,
    user: clip(text, 6000),
    schema: SkillExtractionSchema,
    model: MODELS.llm,
    label: "extractCv",
  });
}
