-- CreateEnum
CREATE TYPE "WishlistPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "WishlistStatus" AS ENUM ('SAVING', 'AFFORDABLE', 'PURCHASED');

-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "imageUrl" TEXT,
    "productUrl" TEXT,
    "linkedSavingsGoalId" TEXT,
    "savedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "priority" "WishlistPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "WishlistStatus" NOT NULL DEFAULT 'SAVING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wishlist_items_userId_status_idx" ON "wishlist_items"("userId", "status");

-- CreateIndex
CREATE INDEX "wishlist_items_userId_priority_idx" ON "wishlist_items"("userId", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_userId_name_key" ON "wishlist_items"("userId", "name");

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_linkedSavingsGoalId_fkey" FOREIGN KEY ("linkedSavingsGoalId") REFERENCES "savings_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
