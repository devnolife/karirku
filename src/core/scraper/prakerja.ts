/**
 * Prakerja scraper — SKELETON.
 * Prioritas pakai API resmi jika tersedia.
 */
import { createCrawler } from "./base";

export async function scrapePrakerja() {
  const crawler = createCrawler({
    source: "prakerja",
    async requestHandler({ page, request, log }) {
      log.info(`Visiting ${request.url}`);
      // TODO: extract listing atau replace ke API call.
      void page;
    },
  });

  await crawler.run(["https://dashboard.prakerja.go.id/"]);
}
