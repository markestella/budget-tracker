-- CreateEnum
CREATE TYPE "BudgetItemType" AS ENUM ('CONSTANT', 'DURATION');

-- CreateEnum
CREATE TYPE "BudgetCategory" AS ENUM ('HOUSING', 'TRANSPORTATION', 'FOOD_DINING', 'UTILITIES', 'ENTERTAINMENT', 'HEALTHCARE', 'SAVINGS_ALLOCATION', 'DEBT_PAYMENTS', 'MISCELLANEOUS', 'CUSTOM');

-- CreateTable
CREATE TABLE "budget_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "BudgetItemType" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "dueDate" INTEGER NOT NULL,
    "merchant" TEXT,
    "category" "BudgetCategory" NOT NULL,
    "linkedAccountId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalMonths" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "completedPayments" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_budgets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "BudgetCategory" NOT NULL,
    "monthlyLimit" DECIMAL(10,2) NOT NULL,
    "rollover" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "budget_items_userId_type_idx" ON "budget_items"("userId", "type");

-- CreateIndex
CREATE INDEX "budget_items_userId_category_idx" ON "budget_items"("userId", "category");

-- CreateIndex
CREATE INDEX "budget_items_userId_isActive_idx" ON "budget_items"("userId", "isActive");

-- CreateIndex
CREATE INDEX "budget_items_linkedAccountId_idx" ON "budget_items"("linkedAccountId");

-- CreateIndex
CREATE INDEX "category_budgets_userId_idx" ON "category_budgets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "category_budgets_userId_category_key" ON "category_budgets"("userId", "category");

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_linkedAccountId_fkey" FOREIGN KEY ("linkedAccountId") REFERENCES "financial_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_budgets" ADD CONSTRAINT "category_budgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
