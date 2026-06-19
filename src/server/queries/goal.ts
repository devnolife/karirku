/**
 * Query goal karier user dari DB (career_goals). Menggantikan getGoal() mock.
 * Server-only (mengimpor Prisma).
 */

import { prisma } from "@/lib/db";

export type GoalTrack = "fulltime" | "freelance" | "both";

export type UserGoal = {
  id: string;
  targetRole: string;
  targetTrack: GoalTrack;
  targetCity: string | null;
  weeklyHours: number;
  budgetIdr: number;
  readinessScore: number;
};

/** Goal aktif terbaru milik user, atau null kalau belum ada. */
export async function getActiveGoal(userId: string): Promise<UserGoal | null> {
  const goal = await prisma.careerGoal.findFirst({
    where: { userId, status: "active" },
    orderBy: { createdAt: "desc" },
  });
  if (!goal) return null;

  return {
    id: goal.id,
    targetRole: goal.targetRole,
    targetTrack: goal.targetTrack as GoalTrack,
    targetCity: goal.targetCity,
    weeklyHours: goal.weeklyHours ?? 0,
    budgetIdr: goal.budgetIdr ?? 0,
    readinessScore: goal.readinessScore,
  };
}

/** Upsert goal aktif user (dipakai onboarding). */
export async function saveActiveGoal(
  userId: string,
  data: {
    targetRole: string;
    targetTrack: GoalTrack;
    targetCity?: string | null;
    weeklyHours?: number;
    budgetIdr?: number;
  },
): Promise<UserGoal> {
  const existing = await prisma.careerGoal.findFirst({
    where: { userId, status: "active" },
    orderBy: { createdAt: "desc" },
  });

  const goal = existing
    ? await prisma.careerGoal.update({
        where: { id: existing.id },
        data: {
          targetRole: data.targetRole,
          targetTrack: data.targetTrack,
          targetCity: data.targetCity ?? null,
          weeklyHours: data.weeklyHours ?? null,
          budgetIdr: data.budgetIdr ?? null,
        },
      })
    : await prisma.careerGoal.create({
        data: {
          userId,
          targetRole: data.targetRole,
          targetTrack: data.targetTrack,
          targetCity: data.targetCity ?? null,
          weeklyHours: data.weeklyHours ?? null,
          budgetIdr: data.budgetIdr ?? null,
        },
      });

  return {
    id: goal.id,
    targetRole: goal.targetRole,
    targetTrack: goal.targetTrack as GoalTrack,
    targetCity: goal.targetCity,
    weeklyHours: goal.weeklyHours ?? 0,
    budgetIdr: goal.budgetIdr ?? 0,
    readinessScore: goal.readinessScore,
  };
}
