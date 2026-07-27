/**
 * Prisma client — DUAL MODE.
 *
 * - `DATABASE_URL` di-set  → PrismaClient asli (mode full-stack).
 * - `DATABASE_URL` kosong   → stub Proxy yang melempar error jelas saat dipakai.
 *
 * App selalu full-stack begitu DATABASE_URL tersedia (.env / .env.local).
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var __prisma: PrismaClient | undefined;
}

const STUB_MESSAGE =
  "[craftworks] DATABASE_URL belum di-set — prisma tidak tersedia. " +
  "Set DATABASE_URL di .env.local untuk mengaktifkan mode full-stack.";

/** Stub yang selalu throw saat properti/method diakses. Bertipe PrismaClient agar konsumen tetap type-safe. */
function makeStub(): PrismaClient {
  return new Proxy({} as PrismaClient, {
    get() {
      throw new Error(STUB_MESSAGE);
    },
  });
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return makeStub();
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
