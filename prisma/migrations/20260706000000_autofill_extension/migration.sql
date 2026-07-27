-- Autofill extension tables (spec: 2026-07-06-autofill-extension-design.md)

-- CreateTable
CREATE TABLE "extension_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "scope" VARCHAR(100) NOT NULL DEFAULT 'autofill',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extension_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autofill_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "portal" VARCHAR(100),
    "fields_total" INTEGER NOT NULL,
    "fields_filled" INTEGER NOT NULL,
    "method" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "autofill_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "extension_tokens_token_hash_key" ON "extension_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "extension_tokens_user_id_idx" ON "extension_tokens"("user_id");

-- CreateIndex
CREATE INDEX "autofill_logs_user_id_created_at_idx" ON "autofill_logs"("user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "extension_tokens" ADD CONSTRAINT "extension_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autofill_logs" ADD CONSTRAINT "autofill_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
