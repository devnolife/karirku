-- Penanda user sudah menyelesaikan onboarding (skill + goal).
-- NULL = belum pernah onboarding → diarahkan ke /onboarding saat login pertama.
ALTER TABLE "users"
  ADD COLUMN "onboarded_at" TIMESTAMP(3);

-- Backfill: user lama yang sudah punya goal ATAU skill dianggap sudah
-- onboarding, supaya tidak tiba-tiba dipaksa mengulang alur.
UPDATE "users" u
SET "onboarded_at" = u."created_at"
WHERE EXISTS (SELECT 1 FROM "career_goals" g WHERE g."user_id" = u."id")
   OR EXISTS (SELECT 1 FROM "user_skills" s WHERE s."user_id" = u."id");

-- Role non-jobseeker/freelancer tidak memakai onboarding sama sekali.
UPDATE "users"
SET "onboarded_at" = COALESCE("onboarded_at", "created_at")
WHERE "role" IN ('company', 'admin');
