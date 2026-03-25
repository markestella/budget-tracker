/*
  Warnings:

  - You are about to drop the column `description` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `expenseDate` on the `expenses` table. All the data in the column will be lost.
  - Added the required column `date` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `merchant` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `expenses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SavingsGoalType" AS ENUM ('EMERGENCY_FUND', 'RETIREMENT', 'VACATION', 'EDUCATION', 'INVESTMENT', 'GENERAL');

-- CreateEnum
CREATE TYPE "SavingsGoalStatus" AS ENUM ('ACTIVE', 'IDLE', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "SavingsTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'INTEREST');

-- CreateEnum
CREATE TYPE "ThemePreference" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- DropIndex
DROP INDEX "public"."expenses_userId_expenseDate_idx";

-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "description",
DROP COLUMN "expenseDate",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkedAccountId" TEXT,
ADD COLUMN     "linkedBudgetItemId" TEXT,
ADD COLUMN     "merchant" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
DROP COLUMN "category",
ADD COLUMN     "category" "BudgetCategory" NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "lastExportedAt" TIMESTAMP(3),
ADD COLUMN     "preferredCurrency" TEXT NOT NULL DEFAULT 'PHP',
ADD COLUMN     "preferredTheme" "ThemePreference" NOT NULL DEFAULT 'SYSTEM';

-- CreateTable
CREATE TABLE "savings_goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "type" "SavingsGoalType" NOT NULL,
    "monthlyContribution" DECIMAL(10,2) NOT NULL,
    "currentBalance" DECIMAL(10,2) NOT NULL,
    "targetAmount" DECIMAL(10,2),
    "interestRate" DECIMAL(5,4),
    "startDate" TIMESTAMP(3) NOT NULL,
    "lastUpdatedBalance" TIMESTAMP(3) NOT NULL,
    "status" "SavingsGoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "savingsGoalId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "SavingsTransactionType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_categories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "savings_goals_userId_status_idx" ON "savings_goals"("userId", "status");

-- CreateIndex
CREATE INDEX "savings_goals_userId_type_idx" ON "savings_goals"("userId", "type");

-- CreateIndex
CREATE INDEX "savings_transactions_userId_date_idx" ON "savings_transactions"("userId", "date");

-- CreateIndex
CREATE INDEX "savings_transactions_savingsGoalId_date_idx" ON "savings_transactions"("savingsGoalId", "date");

-- CreateIndex
CREATE INDEX "custom_categories_userId_idx" ON "custom_categories"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_categories_userId_name_key" ON "custom_categories"("userId", "name");

-- CreateIndex
CREATE INDEX "expenses_userId_date_idx" ON "expenses"("userId", "date");

-- CreateIndex
CREATE INDEX "expenses_userId_category_idx" ON "expenses"("userId", "category");

-- CreateIndex
CREATE INDEX "expenses_linkedAccountId_idx" ON "expenses"("linkedAccountId");

-- CreateIndex
CREATE INDEX "expenses_linkedBudgetItemId_idx" ON "expenses"("linkedBudgetItemId");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_linkedAccountId_fkey" FOREIGN KEY ("linkedAccountId") REFERENCES "financial_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_linkedBudgetItemId_fkey" FOREIGN KEY ("linkedBudgetItemId") REFERENCES "budget_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_transactions" ADD CONSTRAINT "savings_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_transactions" ADD CONSTRAINT "savings_transactions_savingsGoalId_fkey" FOREIGN KEY ("savingsGoalId") REFERENCES "savings_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_categories" ADD CONSTRAINT "custom_categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
