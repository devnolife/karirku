/**
 * Scraper base utilities. Semua scraper memakai wrapper ini supaya
 * policy (rate limit, UA, dedupe) seragam.
 */

import { PlaywrightCrawler, type PlaywrightCrawlerOptions } from "crawlee";
import { prisma } from "@/lib/db";

export const DEFAULT_USER_AGENT =
  "KarirkuBot/0.1 (+https://karirku.id/bot; contact@karirku.id)";

export interface ScraperConfig extends PlaywrightCrawlerOptions {
  source: string;
}

export function createCrawler(config: ScraperConfig): PlaywrightCrawler {
  const { source, ...crawlerOptions } = config;
  void source;

  return new PlaywrightCrawler({
    maxRequestsPerMinute: 30,
    requestHandlerTimeoutSecs: 30,
    navigationTimeoutSecs: 30,
    headless: true,
    preNavigationHooks: [
      async ({ page }) => {
        await page.setExtraHTTPHeaders({ "User-Agent": DEFAULT_USER_AGENT });
      },
    ],
    ...crawlerOptions,
  });
}

export async function isDuplicate(sourceUrl: string): Promise<boolean> {
  const existing = await prisma.job.findUnique({
    where: { sourceUrl },
    select: { id: true },
  });
  return existing != null;
}
