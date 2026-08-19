-- Username opsional untuk login (alternatif email).
-- Nilai selalu disimpan lowercase (dinormalisasi di src/lib/username.ts),
-- sehingga unique index biasa sudah setara case-insensitive.
ALTER TABLE "users"
  ADD COLUMN "username" VARCHAR(50);

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
