ALTER TABLE "jobs"
  ADD COLUMN "source_external_id" VARCHAR(255);

CREATE UNIQUE INDEX "jobs_job_source_id_source_external_id_key"
  ON "jobs"("job_source_id", "source_external_id");
