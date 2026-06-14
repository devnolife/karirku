/**
 * Prisma client — DUAL MODE.
 *
 * - `DATABASE_URL` di-set  → PrismaClient asli (mode full-stack).
 * - `DATABASE_URL` kosong   → stub Proxy yang melempar error jelas saat dipakai
 *   (mode UI/UX mock; gunakan helper di src/lib/mock/ untuk data).
 *
 * Dengan ini app demo tetap jalan tanpa DB, dan otomatis full-stack begitu
 * DATABASE_URL tersedia — tanpa perlu menukar file dari git history.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var __prisma: PrismaClient | undefined;
}

const STUB_MESSAGE =
  "[craftworks] DATABASE_URL belum di-set — prisma tidak tersedia (UI/UX mock mode). " +
  "Set DATABASE_URL di .env.local untuk mengaktifkan mode full-stack, " +
  "atau gunakan helper di src/lib/mock/ untuk data demo.";

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
