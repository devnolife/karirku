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
  a."id",
  a."status",
  'system'::"ApplicationEventSource",
  1,
  'Riwayat awal dimigrasikan dari status lamaran.',
  a."applied_at",
  CURRENT_TIMESTAMP
FROM "applications" a
WHERE NOT EXISTS (
  SELECT 1
  FROM "application_events" e
  WHERE e."application_id" = a."id"
);

INSERT INTO "application_outcomes" (
  "application_id",
  "stage_reached",
  "updated_at"
)
SELECT
  a."id",
  CASE
    WHEN a."status" IN ('applied', 'screened', 'interview', 'offered', 'accepted')
      THEN a."status"::text
    ELSE 'applied'
  END,
  CURRENT_TIMESTAMP
FROM "applications" a
ON CONFLICT ("application_id") DO NOTHING;
