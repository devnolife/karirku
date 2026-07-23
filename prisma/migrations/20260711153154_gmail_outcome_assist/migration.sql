-- CreateEnum
CREATE TYPE "GmailSuggestionState" AS ENUM ('pending', 'confirmed', 'dismissed');

-- CreateTable
CREATE TABLE "gmail_connections" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "email" VARCHAR(255),
    "encrypted_access_token" TEXT,
    "encrypted_refresh_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "scopes" TEXT[],
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gmail_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gmail_status_suggestions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "application_id" UUID,
    "message_id_hash" VARCHAR(64) NOT NULL,
    "sender_domain" VARCHAR(255),
    "subject_preview" VARCHAR(200),
    "received_at" TIMESTAMP(3),
    "suggested_status" "ApplicationStatus" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "state" "GmailSuggestionState" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at" TIMESTAMP(3),

    CONSTRAINT "gmail_status_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gmail_connections_user_id_key" ON "gmail_connections"("user_id");

-- CreateIndex
CREATE INDEX "gmail_status_suggestions_user_id_state_created_at_idx" ON "gmail_status_suggestions"("user_id", "state", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "gmail_status_suggestions_user_id_message_id_hash_key" ON "gmail_status_suggestions"("user_id", "message_id_hash");

-- AddForeignKey
ALTER TABLE "gmail_connections" ADD CONSTRAINT "gmail_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gmail_status_suggestions" ADD CONSTRAINT "gmail_status_suggestions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gmail_status_suggestions" ADD CONSTRAINT "gmail_status_suggestions_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
