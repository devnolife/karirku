/**
 * Learning Path Generator.
 *
 * Workflow:
 * 1. Pilih kandidat course: untuk setiap missing skill (critical+important),
 *    cari course yang mengajarkan skill itu (skillsTaught contains skillId).
 * 2. Kirim ke LLM: goal + skill user + gap (ranked) + course list +
 *    weeklyHours/budget. LLM susun roadmap JSON.
 * 3. Validate Zod (LearningPathSchema).
 * 4. Persist ke LearningPath + PathMilestone (transaction).
 *
 * Fallback deterministik: kalau LLM gagal 3x, generate path simple
 * (1 course per critical skill, 1 milestone per minggu).
 */
import { prisma } from "@/lib/db";
import { callJson, AiJsonError } from "./json";
import {
  LearningPathSchema,
  type LearningPathPlan,
  type GapAnalysis,
} from "./schemas";
import { LEARNING_PATH_SYSTEM } from "./prompts";
import { MODELS } from "./models";
import { findOrCreateSkill } from "@/lib/skills/taxonomy";
import type { CareerGoal, Course, LearningPath } from "@prisma/client";

interface CourseLite {
  id: string;
  title: string;
  provider: string | null;
  language: string;
  durationHours: number | null;
  priceIdr: number;
  isPrakerja: boolean;
  level: Course["level"];
  skillIds: string[];
}

async function pickCandidateCourses(
  gap: GapAnalysis,
  budgetIdr: number | null | undefined,
): Promise<CourseLite[]> {
  const wantedSkillNames = [
    ...gap.missingSkills
      .filter((m) => m.priority !== "nice-to-have")
      .map((m) => m.skill),
    ...gap.missingSkills
      .filter((m) => m.priority === "nice-to-have")
      .slice(0, 3)
      .map((m) => m.skill),
  ];

  if (wantedSkillNames.length === 0) return [];

  const skills = await Promise.all(
    wantedSkillNames.map((n) => findOrCreateSkill(n)),
  );
  const skillIds = skills.map((s) => s.id);

  const courses = await prisma.course.findMany({
    where: {
      skillsTaught: { hasSome: skillIds },
      ...(budgetIdr && budgetIdr > 0
        ? { OR: [{ priceIdr: { lte: budgetIdr } }, { isPrakerja: true }] }
        : {}),
    },
    orderBy: [{ isPrakerja: "desc" }, { rating: "desc" }, { enrollment: "desc" }],
    take: 25,
  });

  return courses.map((c) => ({
    id: c.id,
    title: c.title,
    provider: c.provider,
    language: c.language,
    durationHours: c.durationHours,
    priceIdr: c.priceIdr,
    isPrakerja: c.isPrakerja,
    level: c.level,
    skillIds: c.skillsTaught,
  }));
}

function buildUserPrompt(
  goal: CareerGoal,
  gap: GapAnalysis,
  courses: CourseLite[],
): string {
  return `Target role: ${goal.targetRole} (${goal.targetTrack}, kota: ${goal.targetCity ?? "fleksibel"})
Jam belajar/minggu user: ${goal.weeklyHours ?? 8}
Budget course/bulan user: Rp ${goal.budgetIdr ?? 0}

Skill yang sudah dimiliki user:
${gap.haveSkills.length ? gap.haveSkills.join(", ") : "(belum ada yang relevan)"}

Skill GAP (urutkan critical → important → nice-to-have):
${gap.missingSkills
  .map((m) => `- [${m.priority}] ${m.skill} — ${m.reason}`)
  .join("\n")}

Kandidat course (referensikan judulnya secara persis):
${courses
  .map(
    (c) =>
      `- "${c.title}" (${c.provider}, ${c.language}, ${c.durationHours ?? "?"} jam, Rp ${c.priceIdr}${c.isPrakerja ? ", Prakerja" : ""})`,
  )
  .join("\n")}

Susun roadmap belajar untuk membawa user dari skill saat ini sampai siap apply ke ${goal.targetRole}.`;
}

/** Map judul course (case-insensitive) → courseId. */
function buildTitleIndex(courses: CourseLite[]): Map<string, string> {
  const idx = new Map<string, string>();
  for (const c of courses) idx.set(c.title.toLowerCase().trim(), c.id);
  return idx;
}

function fallbackPath(
  goal: CareerGoal,
  gap: GapAnalysis,
  courses: CourseLite[],
): LearningPathPlan {
  const critical = gap.missingSkills.filter((m) => m.priority === "critical");
  const important = gap.missingSkills.filter((m) => m.priority === "important");
  const nice = gap.missingSkills.filter((m) => m.priority === "nice-to-have");
  let all = [...critical, ...important, ...nice].slice(0, 8);

  // Kalau gap kosong (e.g. market stats belum ada), generate starter milestones
  // berdasarkan target role + skill yang user sudah punya, jadi user tetap dapat path.
  if (all.length === 0) {
    const haveSample = gap.haveSkills.slice(0, 4);
    const starterTopics = haveSample.length > 0
      ? haveSample.map((s) => ({ skill: s, priority: "important" as const, reason: "Perdalam skill ini ke level production-ready" }))
      : [
          { skill: `Fondasi ${goal.targetRole}`, priority: "important" as const, reason: "Mulai dari dasar role target" },
          { skill: `Tools wajib ${goal.targetRole}`, priority: "important" as const, reason: "Setup workflow + tooling" },
          { skill: "Portfolio project", priority: "important" as const, reason: "Bangun bukti kerja konkret" },
          { skill: "Interview prep", priority: "nice-to-have" as const, reason: "Siapkan diri sebelum apply" },
        ];
    all = starterTopics;
  }

  const milestones = all.map((m, i) => {
    const course = courses.find((c) =>
      c.title.toLowerCase().includes(m.skill.toLowerCase().split(" ")[0]),
    );
    return {
      weekNumber: i + 1,
      title: `Kuasai ${m.skill}`,
      skills: [m.skill],
      recommendedCourseTitles: course ? [course.title] : [],
      projectBrief: `Bangun mini-project menggunakan ${m.skill} dan share di GitHub.`,
    };
  });
  return {
    phases: [
      { name: "Foundation", weeks: "1-3", focus: "Skill dasar yang kritis" },
      { name: "Core", weeks: `4-${Math.max(4, milestones.length)}`, focus: "Skill inti role" },
    ],
    milestones,
    totalWeeks: Math.max(milestones.length, 4),
    rationale: critical.length + important.length > 0
      ? `Path ini fokus ke ${critical.length} skill kritis dulu, lalu ${important.length} skill penting. Tiap minggu 1 milestone konkret.`
      : `Belum ada data pasar untuk role "${goal.targetRole}". Path starter ini fokus mendalami skill yang sudah kamu punya + bangun portfolio. Update goal dengan role yang lebih spesifik (misal "Frontend Developer", "Data Engineer") untuk gap analysis yang lebih akurat.`,
  };
}

export interface GeneratePathInput {
  goal: CareerGoal;
  gap: GapAnalysis;
  /** Override candidate course list (untuk testing). */
  candidateCourses?: CourseLite[];
}

export async function generateLearningPath(
  input: GeneratePathInput,
): Promise<LearningPath> {
  const courses =
    input.candidateCourses ??
    (await pickCandidateCourses(input.gap, input.goal.budgetIdr));

  let plan: LearningPathPlan;
  try {
    plan = await callJson({
      system: LEARNING_PATH_SYSTEM,
      user: buildUserPrompt(input.goal, input.gap, courses),
      schema: LearningPathSchema,
      temperature: 0.4,
      label: "generateLearningPath",
    });
  } catch (err) {
    if (err instanceof AiJsonError) {
      console.warn(
        `[path-generator] LLM gagal, pakai fallback deterministik: ${err.message}`,
      );
      plan = fallbackPath(input.goal, input.gap, courses);
    } else {
      throw err;
    }
  }

  const titleIdx = buildTitleIndex(courses);

  // Persist atomically.
  return prisma.$transaction(async (tx) => {
    const path = await tx.learningPath.create({
      data: {
        userId: input.goal.userId,
        goalId: input.goal.id,
        phases: plan.phases,
        totalWeeks: plan.totalWeeks,
        progressPct: 0,
        readinessScore: Math.min(input.gap.coveragePct, 100),
        status: "active",
        generatedByModel: MODELS.llm,
      },
    });

    for (const m of plan.milestones) {
      const skillRows = await Promise.all(
        m.skills.map((s) => findOrCreateSkill(s)),
      );
      const courseIds = m.recommendedCourseTitles
        .map((t) => titleIdx.get(t.toLowerCase().trim()))
        .filter((id): id is string => Boolean(id));
      await tx.pathMilestone.create({
        data: {
          pathId: path.id,
          weekNumber: m.weekNumber,
          title: m.title,
          skillIds: skillRows.map((s) => s.id),
          courseIds,
          projectBrief: m.projectBrief ?? null,
          status: "pending",
        },
      });
    }

    return path;
  });
}
