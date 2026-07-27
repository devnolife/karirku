import { Queue } from "bullmq";
import { createQueueConnection } from "../redis";

export const QUEUE_NAMES = {
  scraper: "scraper",
  enrich: "enrich",
  embed: "embed",
  marketIntel: "market-intel",
} as const;

const connection = createQueueConnection();

export const scraperQueue = new Queue(QUEUE_NAMES.scraper, { connection });
export const enrichQueue = new Queue(QUEUE_NAMES.enrich, { connection });
export const embedQueue = new Queue(QUEUE_NAMES.embed, { connection });
export const marketIntelQueue = new Queue(QUEUE_NAMES.marketIntel, { connection });

export const allQueues = [scraperQueue, enrichQueue, embedQueue, marketIntelQueue];
