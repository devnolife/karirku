-- CreateEnum
CREATE TYPE "ApplicationEventSource" AS ENUM ('manual', 'email', 'system');

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "content_hash" VARCHAR(64),
ADD COLUMN     "data_quality_score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "extraction_version" VARCHAR(50),
ADD COLUMN     "job_source_id" UUID,
ADD COLUMN     "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "role_market_stats" ADD COLUMN     "salary_sample_size" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "source_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "job_sources" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "careers_url" TEXT NOT NULL,
    "region" VARCHAR(100),
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "last_scan_at" TIMESTAMP(3),
    "last_success_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_events" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL,
    "source" "ApplicationEventSource" NOT NULL DEFAULT 'manual',
    "confidence" DOUBLE PRECISION,
    "note" TEXT,
    "email_ref_hash" VARCHAR(64),
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_impressions" (
    "id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "score_v1" INTEGER NOT NULL,
    "score_v2" INTEGER NOT NULL,
    "rank_v1" INTEGER NOT NULL,
    "rank_v2" INTEGER NOT NULL,
    "confidence_v2" DOUBLE PRECISION NOT NULL,
    "components_v2" JSONB NOT NULL,
    "displayed_version" VARCHAR(20) NOT NULL DEFAULT 'v1',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_impressions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_sources_careers_url_key" ON "job_sources"("careers_url");

-- CreateIndex
CREATE INDEX "job_sources_enabled_provider_idx" ON "job_sources"("enabled", "provider");

-- CreateIndex
CREATE INDEX "application_events_application_id_occurred_at_idx" ON "application_events"("application_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "application_events_source_created_at_idx" ON "application_events"("source", "created_at" DESC);

-- CreateIndex
CREATE INDEX "recommendation_impressions_user_id_created_at_idx" ON "recommendation_impressions"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "recommendation_impressions_job_id_created_at_idx" ON "recommendation_impressions"("job_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "recommendation_impressions_batch_id_idx" ON "recommendation_impressions"("batch_id");

-- CreateIndex
CREATE INDEX "jobs_job_source_id_last_seen_at_idx" ON "jobs"("job_source_id", "last_seen_at" DESC);

-- CreateIndex
CREATE INDEX "jobs_content_hash_idx" ON "jobs"("content_hash");

-- AddForeignKey
ALTER TABLE "job_feedback" ADD CONSTRAINT "job_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_feedback" ADD CONSTRAINT "job_feedback_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_answers" ADD CONSTRAINT "saved_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_files" ADD CONSTRAINT "resume_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_job_source_id_fkey" FOREIGN KEY ("job_source_id") REFERENCES "job_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_events" ADD CONSTRAINT "application_events_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_impressions" ADD CONSTRAINT "recommendation_impressions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_impressions" ADD CONSTRAINT "recommendation_impressions_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
