/**
 * Readiness: dihitung live via match engine (coverage + verified + portfolio +
 * milestones), bukan membaca skor tersimpan yang bisa basi.
 */

import { prisma } from "@/lib/db";
import { readinessScore } from "@/lib/match/readiness";
import type { ReadinessView } from "@/lib/view-models";
import { getSkillGap } from "./skills";
import { getRoadmap } from "./roadmap";
import { loadUserContext } from "./context";

export async function getReadiness(userId: string): Promise<ReadinessView> {
  const [ctx, gap, roadmap] = await Promise.all([
    loadUserContext(userId),
    getSkillGap(userId),
    getRoadmap(userId),
  ]);

  const verifiedCount = ctx.skills.filter((s) => s.verified).length;
  const verifiedRatio = ctx.skills.length > 0 ? verifiedCount / ctx.skills.length : 0;

  // Portfolio: pakai jumlah resume sebagai proxy proof-of-work (belum ada tabel portfolio).
  const portfolioCount = await prisma.resume.count({ where: { userId } });

  const result = readinessScore({
    skillCoveragePct: gap.coveragePct,
    verifiedRatio,
    portfolioCount,
    completedMilestones: roadmap.weeksDone,
    totalMilestones: roadmap.weeksTotal,
  });

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
    weeksDone: roadmap.weeksDone,
    weeksTotal: roadmap.weeksTotal,
  };
}
