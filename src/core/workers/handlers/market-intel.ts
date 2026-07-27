import { prisma } from "@/core/db";
import {
  aggregateMarketStats,
  marketGroupKey,
  subtractUtcMonths,
} from "../market-intel-helpers";

export interface MarketIntelJobData {
  /** UTC calendar date (`YYYY-MM-DD`); defaults to today. */
  snapshotDate?: string;
}

export interface MarketIntelSummary {
  snapshotDate: string;
  jobs: number;
  groups: number;
}

export function parseSnapshotDate(value?: string): Date {
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  if (!value) return today;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("snapshotDate must use YYYY-MM-DD");
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`invalid snapshotDate: ${value}`);
  }
  if (date.getTime() !== today.getTime()) {
    throw new Error(
      "historical snapshots are unsupported without as-of job lifecycle data",
    );
  }
  return date;
}

export async function handleMarketIntel(
  data: MarketIntelJobData = {},
): Promise<MarketIntelSummary> {
  const snapshotDate = parseSnapshotDate(data.snapshotDate);
  const threeMonthsAgo = subtractUtcMonths(snapshotDate, 3);
  const historyStart = new Date(threeMonthsAgo.getTime() - 14 * 86_400_000);

  const [jobs, history] = await Promise.all([
    prisma.job.findMany({
      where: { isActive: true },
      select: {
        title: true,
        location: true,
        type: true,
        skills: true,
        salaryMin: true,
        salaryMax: true,
        currency: true,
        company: true,
        source: true,
        jobSourceId: true,
      },
    }),
    prisma.roleMarketStat.findMany({
      where: {
        snapshotDate: {
          gte: historyStart,
          lte: threeMonthsAgo,
        },
      },
      orderBy: { snapshotDate: "desc" },
      select: {
        roleName: true,
        city: true,
        openPositions: true,
      },
    }),
  ]);

  const previousOpenPositions = new Map<string, number>();
  for (const row of history) {
    const key = marketGroupKey(row.roleName, row.city);
    if (!previousOpenPositions.has(key) && row.openPositions !== null) {
      previousOpenPositions.set(key, row.openPositions);
    }
  }

  const aggregates = aggregateMarketStats(jobs, snapshotDate, previousOpenPositions);
  await prisma.$transaction(async (tx) => {
    await tx.roleMarketStat.deleteMany({ where: { snapshotDate } });
    if (aggregates.length > 0) {
      await tx.roleMarketStat.createMany({
        data: aggregates.map((row) => ({
          roleName: row.roleName,
          city: row.city,
          snapshotDate: row.snapshotDate,
          topSkills: row.topSkills,
          salaryP25: row.salaryP25,
          salaryP50: row.salaryP50,
          salaryP75: row.salaryP75,
          salaryValues: row.salaryValues,
          salarySampleSize: row.salarySampleSize,
          openPositions: row.openPositions,
          sourceCount: row.sourceCount,
          trend3mo: row.trend3mo,
          topCompanies: row.topCompanies,
        })),
      });
    }
  });

  return {
    snapshotDate: snapshotDate.toISOString().slice(0, 10),
    jobs: jobs.length,
    groups: aggregates.length,
  };
}
