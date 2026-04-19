-- pgvector ivfflat indexes untuk semantic search.
-- Dipisah dari migration init supaya ivfflat bisa di-tune (lists param).
-- Catatan: ivfflat butuh data sebelum di-populate dengan baik.
-- Alternatif: gunakan hnsw (lebih akurat, lebih lambat build).

CREATE INDEX IF NOT EXISTS profiles_embedding_idx
  ON "profiles" USING ivfflat ("embedding" vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS jobs_embedding_idx
  ON "jobs" USING ivfflat ("embedding" vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS projects_embedding_idx
  ON "projects" USING ivfflat ("embedding" vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS skill_taxonomy_embedding_idx
  ON "skill_taxonomy" USING ivfflat ("embedding" vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS courses_embedding_idx
  ON "courses" USING ivfflat ("embedding" vector_cosine_ops)
  WITH (lists = 100);
