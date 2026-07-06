
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('jobseeker', 'freelancer', 'company', 'admin');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('fulltime', 'parttime', 'contract', 'remote', 'hybrid', 'onsite');

-- CreateEnum
CREATE TYPE "SeniorityLevel" AS ENUM ('intern', 'junior', 'mid', 'senior', 'lead', 'manager');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('applied', 'screened', 'interview', 'offered', 'accepted', 'rejected', 'ghosted', 'withdrawn');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('active', 'paused', 'achieved', 'abandoned');

-- CreateEnum
CREATE TYPE "CareerTrack" AS ENUM ('fulltime', 'freelance', 'both');

-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "PathStatus" AS ENUM ('active', 'paused', 'completed', 'abandoned');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('pending', 'in_progress', 'done', 'skipped');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "image" TEXT,
    "email_verified" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'jobseeker',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "headline" TEXT,
    "summary" TEXT,
    "skills" TEXT[],
    "experience" JSONB,
    "education" JSONB,
    "embedding" vector(768),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL,
    "source" VARCHAR(100) NOT NULL,
    "source_url" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "company" VARCHAR(255),
    "location" VARCHAR(255),
    "type" "JobType",
    "level" "SeniorityLevel",
    "description" TEXT,
    "requirements" TEXT[],
    "skills" TEXT[],
    "salary_min" INTEGER,
    "salary_max" INTEGER,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'IDR',
    "embedding" vector(768),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "posted_at" TIMESTAMP(3),
    "scraped_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "source" VARCHAR(100) NOT NULL,
    "source_url" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "client" VARCHAR(255),
    "budget_min" INTEGER,
    "budget_max" INTEGER,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'IDR',
    "duration_days" INTEGER,
    "skills" TEXT[],
    "description" TEXT,
    "embedding" vector(768),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "posted_at" TIMESTAMP(3),
    "scraped_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "resume_used" JSONB,
    "cover_letter" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'applied',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_outcomes" (
    "application_id" UUID NOT NULL,
    "stage_reached" VARCHAR(50),
    "feedback" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_outcomes_pkey" PRIMARY KEY ("application_id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "job_id" UUID,
    "content" JSONB NOT NULL,
    "ats_score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmaps" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "goal" TEXT,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_taxonomy" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50),
    "aliases" TEXT[],
    "related_skills" UUID[],
    "demand_score" DOUBLE PRECISION,
    "avg_salary_idr" INTEGER,
    "embedding" vector(768),

    CONSTRAINT "skill_taxonomy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_skills" (
    "user_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "proficiency" SMALLINT NOT NULL DEFAULT 1,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_by" VARCHAR(50),
    "evidence_url" TEXT,
    "acquired_at" TIMESTAMP(3),

    CONSTRAINT "user_skills_pkey" PRIMARY KEY ("user_id","skill_id")
);

-- CreateTable
CREATE TABLE "career_goals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "target_role" VARCHAR(255) NOT NULL,
    "target_track" "CareerTrack" NOT NULL DEFAULT 'fulltime',
    "target_city" VARCHAR(100),
    "target_date" DATE,
    "why" TEXT,
    "weekly_hours" SMALLINT,
    "budget_idr" INTEGER,
    "status" "GoalStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL,
    "source" VARCHAR(50) NOT NULL,
    "source_url" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "provider" VARCHAR(255),
    "language" VARCHAR(20) NOT NULL DEFAULT 'id',
    "level" "CourseLevel",
    "skills_taught" UUID[],
    "prerequisites" UUID[],
    "duration_hours" DOUBLE PRECISION,
    "price_idr" INTEGER NOT NULL DEFAULT 0,
    "is_prakerja" BOOLEAN NOT NULL DEFAULT false,
    "affiliate_url" TEXT,
    "rating" DOUBLE PRECISION,
    "enrollment" INTEGER,
    "description" TEXT,
    "embedding" vector(768),
    "scraped_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_paths" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "goal_id" UUID NOT NULL,
    "phases" JSONB NOT NULL,
    "total_weeks" INTEGER,
    "progress_pct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "readiness_score" INTEGER NOT NULL DEFAULT 0,
    "status" "PathStatus" NOT NULL DEFAULT 'active',
    "generated_by_model" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "path_milestones" (
    "id" UUID NOT NULL,
    "path_id" UUID NOT NULL,
    "week_number" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "skill_ids" UUID[],
    "course_ids" UUID[],
    "project_brief" TEXT,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'pending',
    "submission_url" TEXT,
    "ai_feedback" TEXT,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "path_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_market_stats" (
    "id" UUID NOT NULL,
    "role_name" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "snapshot_date" DATE NOT NULL,
    "top_skills" JSONB NOT NULL,
    "salary_p25" INTEGER,
    "salary_p50" INTEGER,
    "salary_p75" INTEGER,
    "open_positions" INTEGER,
    "trend_3mo" DOUBLE PRECISION,
    "top_companies" TEXT[],

    CONSTRAINT "role_market_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_source_url_key" ON "jobs"("source_url");

-- CreateIndex
CREATE INDEX "jobs_is_active_posted_at_idx" ON "jobs"("is_active", "posted_at" DESC);

-- CreateIndex
CREATE INDEX "jobs_source_idx" ON "jobs"("source");

-- CreateIndex
CREATE UNIQUE INDEX "projects_source_url_key" ON "projects"("source_url");

-- CreateIndex
CREATE INDEX "projects_is_active_posted_at_idx" ON "projects"("is_active", "posted_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "skill_taxonomy_name_key" ON "skill_taxonomy"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skill_taxonomy_slug_key" ON "skill_taxonomy"("slug");

-- CreateIndex
CREATE INDEX "skill_taxonomy_category_idx" ON "skill_taxonomy"("category");

-- CreateIndex
CREATE UNIQUE INDEX "courses_source_url_key" ON "courses"("source_url");

-- CreateIndex
CREATE INDEX "courses_is_prakerja_price_idr_idx" ON "courses"("is_prakerja", "price_idr");

-- CreateIndex
CREATE INDEX "courses_source_idx" ON "courses"("source");

-- CreateIndex
CREATE INDEX "path_milestones_path_id_week_number_idx" ON "path_milestones"("path_id", "week_number");

-- CreateIndex
CREATE INDEX "role_market_stats_role_name_idx" ON "role_market_stats"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "role_market_stats_role_name_city_snapshot_date_key" ON "role_market_stats"("role_name", "city", "snapshot_date");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_outcomes" ADD CONSTRAINT "application_outcomes_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skill_taxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_goals" ADD CONSTRAINT "career_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "career_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path_milestones" ADD CONSTRAINT "path_milestones_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

