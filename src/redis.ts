import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

declare global {
  var __redis: Redis | undefined;
}

export const redis =
  globalThis.__redis ??
  new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__redis = redis;
}

export function createQueueConnection() {
  return new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    // Jangan connect saat import — tanpa Redis (demo mode) ioredis akan
    // retry tanpa henti. BullMQ connect sendiri saat command pertama.
    lazyConnect: true,
  });
}
