-- Entitlements: generic per-feature premium access flag
-- (spec: 2026-07-06-hunter-premium-foundation-design.md)
--
-- CATATAN: migration ini ditulis manual dan BELUM diterapkan (tidak dijalankan
-- lewat `prisma migrate` di sesi ini karena belum ada Postgres nyata). Terapkan
-- dengan `pnpm db:migrate` / `pnpm db:deploy` begitu server production disiapkan.

-- CreateEnum
CREATE TYPE "EntitlementStatus" AS ENUM ('active', 'revoked');

-- CreateEnum
CREATE TYPE "EntitlementSource" AS ENUM ('manual', 'payment');

-- CreateTable
CREATE TABLE "entitlements" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "feature" TEXT NOT NULL,
    "status" "EntitlementStatus" NOT NULL DEFAULT 'active',
    "source" "EntitlementSource" NOT NULL DEFAULT 'manual',
    "activated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "entitlements_user_id_feature_key" ON "entitlements"("user_id", "feature");

-- AddForeignKey
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
