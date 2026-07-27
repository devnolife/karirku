import { prisma } from "@devnolife/karirku-core/db";
import {
  evaluateRecommendationShadow,
  type RecommendationObservation,
} from "@devnolife/karirku-core/match/evaluation";
import { RECOMMENDATION_SCORE_VERSION } from "@devnolife/karirku-core/match/v2";

const INTERVIEW_STATUSES = new Set(["interview", "offered", "accepted"]);

export async function getRecommendationShadowMetrics(days = 30) {
  const since = new Date(Date.now() - days * 86_400_000);
  const impressions = await prisma.recommendationImpression.findMany({
    where: {
      createdAt: { gte: since },
      scoreVersion: RECOMMENDATION_SCORE_VERSION,
      surface: "jobs",
      displayed: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5_000,
    select: {
      userId: true,
      jobId: true,
      scoreV1: true,
      scoreV2: true,
      rankV1: true,
      rankV2: true,
      confidenceV2: true,
      openedAt: true,
      savedAt: true,
      hiddenAt: true,
      irrelevantAt: true,
      appliedAt: true,
      displayedVersion: true,
    },
  });
  if (!impressions.length) {
    return {
      ...evaluateRecommendationShadow([]),
      impressions: 0,
      days,
    };
  }

  const userIds = [...new Set(impressions.map((row) => row.userId))];
  const jobIds = [...new Set(impressions.map((row) => row.jobId))];
  const applications = await prisma.application.findMany({
    where: { userId: { in: userIds }, jobId: { in: jobIds } },
    select: {
      userId: true,
      jobId: true,
      events: { select: { status: true, occurredAt: true } },
    },
  });
  const applicationByKey = new Map(
    applications.map((row) => [`${row.userId}:${row.jobId}`, row]),
  );
  const observations: RecommendationObservation[] = impressions.map((row) => {
    const key = `${row.userId}:${row.jobId}`;
    const application = applicationByKey.get(key);
    const positive = Boolean(row.savedAt || row.appliedAt);
    const negative = Boolean(row.hiddenAt || row.irrelevantAt);
    return {
      scoreV1: row.scoreV1,
      scoreV2: row.scoreV2,
      rankV1: row.rankV1,
      rankV2: row.rankV2,
      confidenceV2: row.confidenceV2,
      label: positive ? "positive" : negative ? "negative" : null,
      opened: Boolean(row.openedAt),
      applied: Boolean(row.appliedAt),
      displayedVersion:
        row.displayedVersion === "v2" ? "v2" : "v1",
      reachedInterview: Boolean(
        row.appliedAt &&
          application?.events.some(
            (event) =>
              event.occurredAt >= row.appliedAt! &&
              INTERVIEW_STATUSES.has(event.status),
          ),
      ),
    };
  });

  return {
    ...evaluateRecommendationShadow(observations),
    impressions: impressions.length,
    days,
  };
}

export type RecommendationDataHealth = {
  activeJobs: number;
  freshJobs: number;
  qualityMeasuredJobs: number;
  embeddedJobs: number;
  staleSources: number;
  latestMarketSnapshot: string | null;
};

export async function getRecommendationDataHealth(): Promise<RecommendationDataHealth> {
  const staleBefore = new Date(Date.now() - 48 * 3_600_000);
  const freshAfter = new Date(Date.now() - 14 * 86_400_000);
  const [
    activeJobs,
    freshJobs,
    qualityMeasuredJobs,
    embeddedRows,
    staleSources,
    latestMarket,
  ] = await Promise.all([
    prisma.job.count({ where: { isActive: true } }),
    prisma.job.count({
      where: { isActive: true, lastSeenAt: { gte: freshAfter } },
    }),
    prisma.job.count({
      where: { isActive: true, dataQualityScore: { gt: 0 } },
    }),
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*)::bigint AS count
      FROM jobs
      WHERE is_active = true AND embedding IS NOT NULL
    `,
    prisma.jobSource.count({
      where: {
        enabled: true,
        OR: [{ lastSuccessAt: null }, { lastSuccessAt: { lt: staleBefore } }],
      },
    }),
    prisma.roleMarketStat.findFirst({
      orderBy: { snapshotDate: "desc" },
      select: { snapshotDate: true },
    }),
  ]);

  return {
    activeJobs,
    freshJobs,
    qualityMeasuredJobs,
    embeddedJobs: Number(embeddedRows[0]?.count ?? 0),
    staleSources,
    latestMarketSnapshot:
      latestMarket?.snapshotDate.toISOString().slice(0, 10) ?? null,
  };
}
