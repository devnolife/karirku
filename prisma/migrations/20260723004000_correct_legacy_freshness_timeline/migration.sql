-- Deployment time is not evidence that a legacy listing was just seen.
UPDATE "jobs"
SET "last_seen_at" = "scraped_at"
WHERE "content_hash" IS NULL
  AND "extraction_version" IS NULL
  AND "data_quality_score" = 0;

-- The first migration used the latest status at applied_at. Correct it into
-- an honest applied baseline, then add a migration-time current-state event.
UPDATE "application_events" event
SET
  "status" = 'applied',
  "source" = 'system',
  "confidence" = 1,
  "note" = 'Baseline lamaran dimigrasikan dari data lama.',
  "occurred_at" = application."applied_at"
FROM "applications" application
WHERE event."application_id" = application."id"
  AND event."note" = 'Riwayat awal dimigrasikan dari status lamaran.';

INSERT INTO "application_events" (
  "id",
  "application_id",
  "status",
  "source",
  "confidence",
  "note",
  "occurred_at",
  "created_at"
)
SELECT
  gen_random_uuid(),
  application."id",
  application."status",
  'system'::"ApplicationEventSource",
  1,
  'Status terkini saat migrasi timeline.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "applications" application
WHERE application."status" <> 'applied'
  AND NOT EXISTS (
    SELECT 1
    FROM "application_events" event
    WHERE event."application_id" = application."id"
      AND event."note" = 'Status terkini saat migrasi timeline.'
  );
