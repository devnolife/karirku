import { createHash, randomUUID } from "node:crypto";
import { prisma } from "@/core/db";
import {
  RECOMMENDATION_SCORE_VERSION,
  type ScoreV2Components,
} from "@/core/match/v2";

export type ShadowCandidate = {
  jobId: string;
  scoreV1: number;
  scoreV2: number;
  rankV1: number;
  rankV2: number;
  confidenceV2: number;
  componentsV2: ScoreV2Components;
  /** False for V2-only shadow candidates that the user did not see. */
  displayed: boolean;
};

export type ShadowContext = {
  surface: "dashboard" | "jobs";
  /** Stable serialization of filters/search, never raw PII in storage. */
  queryKey: string;
};

function sampleRate(): number {
  const fallback = process.env.NODE_ENV === "production" ? 0.2 : 1;
  const configured = Number(
    process.env.RECOMMENDATION_SHADOW_SAMPLE_RATE ?? fallback,
  );
  return Number.isFinite(configured)
    ? Math.max(0, Math.min(1, configured))
    : fallback;
}

/** Deterministic per user/hour sampling avoids random render inconsistencies. */
export function shouldSampleShadow(
  userId: string,
  now = new Date(),
  rate = sampleRate(),
  sampleKey = "default",
): boolean {
  if (rate <= 0) return false;
  if (rate >= 1) return true;
  const hour = now.toISOString().slice(0, 13);
  const value = createHash("sha256")
    .update(`${userId}:${sampleKey}:${hour}`)
    .digest()
    .readUInt32BE(0);
  return value / 0xffffffff < rate;
}

/**
 * Persist at most one sampled batch per user/hour. Logging is observability;
 * failures are surfaced to server logs but never block recommendations.
 */
export async function logShadowImpressions(
  userId: string,
  candidates: ShadowCandidate[],
  context: ShadowContext,
  now = new Date(),
  displayedVersion: "v1" | "v2" = "v1",
): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  if (!candidates.length) return ids;

  const hourStart = new Date(now);
  hourStart.setMinutes(0, 0, 0);
  const queryHash = createHash("sha256")
    .update(context.queryKey)
    .digest("hex");
  const sampleKey = `${context.surface}:${queryHash}`;
  if (!shouldSampleShadow(userId, now, sampleRate(), sampleKey)) return ids;

  const batchId = randomUUID();
  const rows = candidates.slice(0, 30).map((candidate) => ({
    id: randomUUID(),
    batchId,
    userId,
    jobId: candidate.jobId,
    scoreV1: candidate.scoreV1,
    scoreV2: candidate.scoreV2,
    rankV1: candidate.rankV1,
    rankV2: candidate.rankV2,
    confidenceV2: candidate.confidenceV2,
    componentsV2: candidate.componentsV2,
    displayedVersion,
    scoreVersion: RECOMMENDATION_SCORE_VERSION,
    surface: context.surface,
    queryHash,
    windowStart: hourStart,
    displayed: candidate.displayed,
  }));
  await prisma.recommendationImpression.createMany({
    data: rows,
    skipDuplicates: true,
  });

  // Reconcile exposure within the window: a job that was a V2-only shadow
  // candidate earlier this hour but is now visible (e.g. after a re-rank or a
  // larger page) must be promoted to displayed=true so its interactions are
  // attributed. `skipDuplicates` above keeps the stale row, so flip it here.
  // Promotion is monotonic — once shown, always counted as an exposure.
  const displayedJobIds = rows
    .filter((row) => row.displayed)
    .map((row) => row.jobId);
  if (displayedJobIds.length) {
    await prisma.recommendationImpression.updateMany({
      where: {
        userId,
        surface: context.surface,
        queryHash,
        windowStart: hourStart,
        jobId: { in: displayedJobIds },
        displayed: false,
      },
      data: { displayed: true },
    });
  }

  const persisted = await prisma.recommendationImpression.findMany({
    where: {
      userId,
      surface: context.surface,
      queryHash,
      windowStart: hourStart,
      jobId: { in: rows.map((row) => row.jobId) },
    },
    select: { id: true, jobId: true },
  });
  for (const row of persisted) ids.set(row.jobId, row.id);
  return ids;
}
