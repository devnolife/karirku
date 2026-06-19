/**
 * Zod schemas untuk semua structured-output dari LLM.
 *
 * Konvensi:
 * - Schema kecil & toleran (skill name jadi string apa adanya, normalisasi
 *   dilakukan downstream via skill taxonomy alias matching).
 * - Field opsional pakai default supaya parser tidak gagal kalau model lupa.
 */
import { z } from "zod";

// ---------- Skill extraction ----------

export const SkillExtractionSchema = z.object({
  skills: z.array(z.string().min(1)).default([]),
  level: z
    .enum(["junior", "mid", "senior", "lead"])
    .optional()
    .nullable(),
  category: z.string().optional().nullable(),
});

export type SkillExtraction = z.infer<typeof SkillExtractionSchema>;

export const CourseExtractionSchema = z.object({
  skillsTaught: z.array(z.string().min(1)).default([]),
  prerequisites: z.array(z.string().min(1)).default([]),
  level: z
    .enum(["beginner", "intermediate", "advanced"])
    .optional()
    .nullable(),
  estimatedHours: z.number().nonnegative().optional().nullable(),
  language: z.string().optional().nullable(),
});

export type CourseExtraction = z.infer<typeof CourseExtractionSchema>;

// ---------- Gap analysis ----------

export const GapItemSchema = z.object({
  skill: z.string().min(1),
  priority: z.enum(["critical", "important", "nice-to-have"]),
  reason: z.string().min(1),
});

export const GapAnalysisSchema = z.object({
  haveSkills: z.array(z.string()).default([]),
  missingSkills: z.array(GapItemSchema).default([]),
  coveragePct: z.number().min(0).max(100),
  summary: z.string().default(""),
});

export type GapAnalysis = z.infer<typeof GapAnalysisSchema>;
export type GapItem = z.infer<typeof GapItemSchema>;

// ---------- Learning Path ----------

export const PathMilestoneSchema = z.object({
  weekNumber: z.number().int().positive(),
  title: z.string().min(1),
  skills: z.array(z.string()).default([]),
  recommendedCourseTitles: z.array(z.string()).default([]),
  projectBrief: z.string().optional().nullable(),
});

export const PathPhaseSchema = z.object({
  name: z.string().min(1),
  weeks: z.string().min(1),
  focus: z.string().min(1),
});

export const LearningPathSchema = z.object({
  phases: z.array(PathPhaseSchema).min(1),
  milestones: z.array(PathMilestoneSchema).min(1),
  totalWeeks: z.number().int().positive(),
  rationale: z.string().default(""),
});

export type LearningPathPlan = z.infer<typeof LearningPathSchema>;
export type PathMilestonePlan = z.infer<typeof PathMilestoneSchema>;
export type PathPhasePlan = z.infer<typeof PathPhaseSchema>;
