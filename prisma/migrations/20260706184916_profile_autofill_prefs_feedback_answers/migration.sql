-- CreateEnum
CREATE TYPE "JobFeedbackAction" AS ENUM ('saved', 'hidden', 'irrelevant');

-- DropIndex
DROP INDEX "courses_embedding_idx";

-- DropIndex
DROP INDEX "jobs_embedding_idx";

-- DropIndex
DROP INDEX "profiles_embedding_idx";

-- DropIndex
DROP INDEX "projects_embedding_idx";

-- DropIndex
DROP INDEX "skill_taxonomy_embedding_idx";

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "city" VARCHAR(120),
ADD COLUMN     "country" VARCHAR(120),
ADD COLUMN     "current_company" VARCHAR(255),
ADD COLUMN     "current_title" VARCHAR(255),
ADD COLUMN     "desired_level" "SeniorityLevel",
ADD COLUMN     "desired_roles" TEXT[],
ADD COLUMN     "expected_salary_idr" INTEGER,
ADD COLUMN     "github_url" TEXT,
ADD COLUMN     "linkedin_url" TEXT,
ADD COLUMN     "min_salary_idr" INTEGER,
ADD COLUMN     "phone" VARCHAR(50),
ADD COLUMN     "portfolio_url" TEXT,
ADD COLUMN     "preferred_locations" TEXT[],
ADD COLUMN     "remote_only" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "years_experience" INTEGER;

-- CreateTable
CREATE TABLE "job_feedback" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "action" "JobFeedbackAction" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_answers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "question_key" VARCHAR(500) NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "times_used" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_feedback_user_id_action_idx" ON "job_feedback"("user_id", "action");

-- CreateIndex
CREATE UNIQUE INDEX "job_feedback_user_id_job_id_key" ON "job_feedback"("user_id", "job_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_answers_user_id_question_key_key" ON "saved_answers"("user_id", "question_key");
