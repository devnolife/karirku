-- CreateEnum
CREATE TYPE "ApplicationMode" AS ENUM ('native', 'external');

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "mode" "ApplicationMode" NOT NULL DEFAULT 'native';

-- AlterTable
ALTER TABLE "career_goals" ADD COLUMN     "readiness_score" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "company_profile_id" UUID;

-- CreateTable
CREATE TABLE "company_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "website" TEXT,
    "logo_url" TEXT,
    "industry" VARCHAR(100),
    "location" VARCHAR(255),
    "about" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_user_id_key" ON "company_profiles"("user_id");

-- CreateIndex
CREATE INDEX "jobs_company_profile_id_idx" ON "jobs"("company_profile_id");

-- AddForeignKey
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_profile_id_fkey" FOREIGN KEY ("company_profile_id") REFERENCES "company_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
