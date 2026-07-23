CREATE TABLE "oauth_states" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "provider" VARCHAR(50) NOT NULL,
  "state_hash" VARCHAR(64) NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "oauth_states_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "oauth_states_state_hash_key"
  ON "oauth_states"("state_hash");
CREATE INDEX "oauth_states_user_id_provider_expires_at_idx"
  ON "oauth_states"("user_id", "provider", "expires_at");
ALTER TABLE "oauth_states"
  ADD CONSTRAINT "oauth_states_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "role_market_stats"
  ADD COLUMN "salary_values" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[];

ALTER TABLE "recommendation_impressions"
  ADD COLUMN "score_version" VARCHAR(50) NOT NULL DEFAULT 'v2-shadow-1',
  ADD COLUMN "surface" VARCHAR(50) NOT NULL DEFAULT 'legacy',
  ADD COLUMN "query_hash" VARCHAR(64) NOT NULL DEFAULT 'legacy',
  ADD COLUMN "window_start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Retain the newest observation if a pre-release environment already produced
-- duplicate legacy impressions in the same migration window.
DELETE FROM "recommendation_impressions" target
USING (
  SELECT "id"
  FROM (
    SELECT
      "id",
      row_number() OVER (
        PARTITION BY "user_id", "job_id", "surface", "query_hash", "window_start"
        ORDER BY "created_at" DESC, "id" DESC
      ) AS duplicate_rank
    FROM "recommendation_impressions"
  ) ranked
  WHERE duplicate_rank > 1
) duplicates
WHERE target."id" = duplicates."id";

CREATE UNIQUE INDEX "recommendation_impressions_exposure_key"
  ON "recommendation_impressions"(
    "user_id",
    "job_id",
    "surface",
    "query_hash",
    "window_start"
  );
