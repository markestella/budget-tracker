-- CreateEnum
CREATE TYPE "AIMessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "SpendingPatternType" AS ENUM ('OVERSPEND', 'UNDERSPEND', 'TREND');

-- CreateEnum
CREATE TYPE "BudgetSuggestionStatus" AS ENUM ('PENDING', 'APPLIED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReceiptScanStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DISCARDED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "AIMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spending_patterns" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SpendingPatternType" NOT NULL,
    "category" TEXT NOT NULL,
    "deviation" DOUBLE PRECISION NOT NULL,
    "insight" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spending_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_suggestions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "currentAmount" DOUBLE PRECISION NOT NULL,
    "suggestedAmount" DOUBLE PRECISION NOT NULL,
    "reasoning" TEXT NOT NULL,
    "estimatedSavings" DOUBLE PRECISION NOT NULL,
    "status" "BudgetSuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt_scans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "merchantName" TEXT,
    "totalAmount" DOUBLE PRECISION,
    "scanDate" TIMESTAMP(3),
    "items" JSONB,
    "suggestedCategory" TEXT,
    "status" "ReceiptScanStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipt_scans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_conversations_userId_updatedAt_idx" ON "ai_conversations"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "ai_messages_conversationId_createdAt_idx" ON "ai_messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "spending_patterns_userId_createdAt_idx" ON "spending_patterns"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "budget_suggestions_userId_status_idx" ON "budget_suggestions"("userId", "status");

-- CreateIndex
CREATE INDEX "receipt_scans_userId_createdAt_idx" ON "receipt_scans"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spending_patterns" ADD CONSTRAINT "spending_patterns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_suggestions" ADD CONSTRAINT "budget_suggestions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_scans" ADD CONSTRAINT "receipt_scans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
