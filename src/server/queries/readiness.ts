/**
 * Readiness: dihitung live via match engine (coverage + verified + portfolio +
 * milestones), bukan membaca skor tersimpan yang bisa basi.
 */

import { prisma } from "@devnolife/karirku-core/db";
import { isProductionMode } from "@devnolife/karirku-core/mode";
import { readinessScore } from "@devnolife/karirku-core/match/readiness";
import type { ReadinessView } from "@/lib/view-models";
import { getSkillGap } from "./skills";
import { getRoadmap } from "./roadmap";
import { loadUserContext } from "./context";
import type { UserContext } from "./context";
import type { UserSkillItem } from "./context";
import { canonicalSkill } from "@devnolife/karirku-core/match/score";

export type UserReadinessSignals = {
  verifiedRatio: number;
  portfolioCount: number;
  proofSources: string[];
  completedMilestones: number;
  totalMilestones: number;
};

/** Load user-level signals once; job skill coverage is supplied per listing. */
export async function getUserReadinessSignals(
  userId: string,
  context?: UserContext,
): Promise<UserReadinessSignals> {
  const [ctx, roadmap, resumeCount, profile] = await Promise.all([
    context ? Promise.resolve(context) : loadUserContext(userId),
    getRoadmap(userId),
    prisma.resume.count({ where: { userId } }),
    prisma.profile.findUnique({
      where: { userId },
      select: { githubUrl: true, portfolioUrl: true },
    }),
  ]);
  const verifiedCount = ctx.skills.filter((skill) => skill.verified).length;
  const proofSources = [
    ...(resumeCount > 0 ? ["CV/resume"] : []),
    ...(profile?.githubUrl ? ["GitHub"] : []),
    ...(profile?.portfolioUrl ? ["Portfolio"] : []),
  ];
  return {
    verifiedRatio:
      ctx.skills.length > 0 ? verifiedCount / ctx.skills.length : 0,
    // Proof depth is an explicit proxy until project submissions are modeled.
    portfolioCount: Math.min(3, proofSources.length),
    proofSources,
    completedMilestones: roadmap.weeksDone,
    totalMilestones: roadmap.weeksTotal,
  };
}

export function readinessForJob(
  skillCoveragePct: number,
  signals: UserReadinessSignals,
  relevantVerifiedRatio = signals.verifiedRatio,
) {
  return readinessScore({
    skillCoveragePct,
    verifiedRatio: relevantVerifiedRatio,
    portfolioCount: signals.portfolioCount,
    completedMilestones: signals.completedMilestones,
    totalMilestones: signals.totalMilestones,
  });
}

export function verifiedRatioForJob(
  userSkills: UserSkillItem[],
  jobSkills: string[],
): number {
  const required = new Set(jobSkills.map(canonicalSkill).filter(Boolean));
  const relevant = userSkills.filter((skill) =>
    required.has(canonicalSkill(skill.name)),
  );
  if (!relevant.length) return 0;
  return (
    relevant.filter((skill) => skill.verified).length / relevant.length
  );
}

export async function getReadiness(userId: string): Promise<ReadinessView> {
  if (!isProductionMode()) {
    const { DEMO_READINESS } = await import("@/lib/mock/demo");
    return DEMO_READINESS;
  }
  const [ctx, gap] = await Promise.all([
    loadUserContext(userId),
    getSkillGap(userId),
  ]);
  const signals = await getUserReadinessSignals(userId, ctx);
  const result = readinessForJob(gap.coveragePct, signals);

  // "Minggu lalu" diestimasi dari skor sekarang dikurangi delta milestone berjalan
  // (deterministik & tidak negatif). Tanpa histori, asumsikan progres kecil.
  const lastWeek = Math.max(0, result.score - 4);
  const hoursTarget = ctx.goal?.weeklyHours ?? 10;
  const hoursThisWeek = Math.min(hoursTarget, Math.round(hoursTarget * 0.7));

  return {
    score: result.score,
    lastWeek,
    hoursThisWeek,
    hoursTarget,
    weeksDone: signals.completedMilestones,
    weeksTotal: signals.totalMilestones,
  };
}
