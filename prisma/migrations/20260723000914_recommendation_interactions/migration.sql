-- AlterTable
ALTER TABLE "recommendation_impressions" ADD COLUMN     "applied_at" TIMESTAMP(3),
ADD COLUMN     "hidden_at" TIMESTAMP(3),
ADD COLUMN     "irrelevant_at" TIMESTAMP(3),
ADD COLUMN     "opened_at" TIMESTAMP(3),
ADD COLUMN     "saved_at" TIMESTAMP(3);
