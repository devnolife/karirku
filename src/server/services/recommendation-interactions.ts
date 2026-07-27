import { prisma } from "@/core/db";

export type RecommendationInteraction =
  | "open"
  | "save"
  | "hide"
  | "irrelevant"
  | "apply";

const FIELD: Record<RecommendationInteraction, string> = {
  open: "openedAt",
  save: "savedAt",
  hide: "hiddenAt",
  irrelevant: "irrelevantAt",
  apply: "appliedAt",
};

/**
 * Attribute an action to the latest sampled impression for this user/job.
 * No impression means no-op; product behavior must never depend on analytics.
 */
export async function markRecommendationInteraction(
  userId: string,
  jobId: string,
  interaction: RecommendationInteraction,
  impressionId?: string,
  occurredAt = new Date(),
): Promise<boolean> {
  if (!impressionId) return false;
  const impression = await prisma.recommendationImpression.findFirst({
    where: {
      id: impressionId,
      userId,
      jobId,
      displayed: true,
      createdAt: {
        lte: occurredAt,
        gte: new Date(occurredAt.getTime() - 30 * 86_400_000),
      },
    },
    select: { id: true },
  });
  if (!impression) return false;

  const field = FIELD[interaction];
  await prisma.recommendationImpression.update({
    where: { id: impression.id },
    data: { [field]: occurredAt },
  });
  return true;
}
