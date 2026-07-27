/**
 * Dicoding course scraper — SKELETON.
 * Pertimbangkan hubungi partnership Dicoding sebelum scraping agresif.
 */
import { createCrawler } from "./base";

export async function scrapeDicoding() {
  const crawler = createCrawler({
    source: "dicoding",
    async requestHandler({ page, request, log }) {
      log.info(`Visiting ${request.url}`);
      // TODO: extract course metadata (title, level, duration, price, prakerja flag, skills).
      void page;
    },
  });

  await crawler.run(["https://www.dicoding.com/academies"]);
}
