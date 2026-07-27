/**
 * Root barrel — intentionally limited to pure, side-effect-free modules.
 *
 * Heavier subsystems are subpath-only so that importing one of them never
 * drags in a database connection, a Redis client, or a browser runtime:
 *
 *   import { prisma } from "@devnolife/karirku-core/db";
 *   import { embed } from "@devnolife/karirku-core/ai/embeddings";
 *   import { enqueue } from "@devnolife/karirku-core/queue";
 *   import { runScraper } from "@devnolife/karirku-core/scraper/run";
 */
export * from "./mode.js";
export * from "./roles.js";
export * from "./source.js";
export * from "./location.js";
export * from "./username.js";
export * from "./html.js";
export * from "./utils.js";
