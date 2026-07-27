/**
 * Jobstreet Indonesia scraper — SKELETON (belum dijalankan).
 * Legal review + selector verification required sebelum enable.
 */
import { createCrawler } from "./base";

export async function scrapeJobstreet() {
  const crawler = createCrawler({
    source: "jobstreet",
    async requestHandler({ page, request, log }) {
      log.info(`Visiting ${request.url}`);
      await page.waitForSelector('[data-automation="job-card"]', { timeout: 15000 }).catch(() => {});
      // TODO: extract + push ke enrichQueue setelah dedupe.
    },
  });

  await crawler.run(["https://www.jobstreet.co.id/jobs"]);
}
