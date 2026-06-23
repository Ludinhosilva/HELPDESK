-- AlterTable: Add SLA, Payment, and Sentiment fields to Ticket
ALTER TABLE "Ticket" ADD COLUMN "aiSentiment" TEXT;
ALTER TABLE "Ticket" ADD COLUMN "slaExpiresAt" TIMESTAMPTZ;
ALTER TABLE "Ticket" ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'NONE';
ALTER TABLE "Ticket" ADD COLUMN "paymentAmount" INTEGER;
ALTER TABLE "Ticket" ADD COLUMN "paymentReference" TEXT;
