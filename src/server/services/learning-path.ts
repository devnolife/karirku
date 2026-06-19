/**
 * Service learning path: orkestrasi generate/regenerate roadmap dinamis.
 *
 * Sumber gap = getSkillGap deterministik (src/server/queries/skills.ts), diubah
 * ke bentuk GapAnalysis yang dipahami path-generator. Satu AI call (path), bukan
 * dua — lebih hemat & robust. Path lama dinonaktifkan saat regenerate.
 */

import { prisma } from "@/lib/db";
import { generateLearningPath } from "@/lib/ai/path-generator";
import type { GapAnalysis } from "@/lib/ai/schemas";
import { getSkillGap } from "@/server/queries/skills";

/** Bentuk GapAnalysis dari skill-gap deterministik milik user. */
async function buildGapAnalysis(userId: string): Promise<GapAnalysis> {
  const gap = await getSkillGap(userId, 16);

  // Map kategori SkillView → prioritas gap.
  const priorityByName = new Map<string, "critical" | "important" | "nice-to-have">();
  for (const s of gap.skills) {
    const p = s.category === "core" ? "critical" : s.category === "nice-to-have" ? "important" : "nice-to-have";
    priorityByName.set(s.name.toLowerCase(), p);
  }

  const missingSkills = gap.missingNames.map((name) => ({
    skill: name,
    priority: priorityByName.get(name.toLowerCase()) ?? "important",
    reason: `Diminta lowongan untuk role target, belum kamu kuasai.`,
  }));

  return {
    haveSkills: gap.matchedNames,
    missingSkills,
    coveragePct: gap.coveragePct,
    summary: `Coverage skill saat ini ${gap.coveragePct}% terhadap kebutuhan role target.`,
  };
}

export type RegenerateResult =
  | { ok: true; pathId: string }
  | { ok: false; reason: "no_goal" };

/**
 * Generate roadmap baru untuk user: butuh goal aktif. Menonaktifkan path lama,
 * lalu generate path baru (AI + fallback deterministik di path-generator).
 */
export async function regenerateUserPath(userId: string): Promise<RegenerateResult> {
  const goal = await prisma.careerGoal.findFirst({
    where: { userId, status: "active" },
    orderBy: { createdAt: "desc" },
  });
  if (!goal) return { ok: false, reason: "no_goal" };

  const gap = await buildGapAnalysis(userId);

  // Nonaktifkan path aktif lama (arsip), supaya roadmap menampilkan yang baru.
  await prisma.learningPath.updateMany({
    where: { userId, status: "active" },
    data: { status: "abandoned" },
  });

  const path = await generateLearningPath({ goal, gap });
  return { ok: true, pathId: path.id };
}

/** Apakah user sudah punya learning path (aktif/historis)? */
export async function hasAnyPath(userId: string): Promise<boolean> {
  const count = await prisma.learningPath.count({ where: { userId } });
  return count > 0;
}
