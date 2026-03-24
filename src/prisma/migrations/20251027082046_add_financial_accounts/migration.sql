-- CreateEnum
CREATE TYPE "FinancialAccountType" AS ENUM ('SAVINGS', 'CHECKING', 'CREDIT_CARD', 'DEBIT_CARD');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CLOSED');

-- CreateTable
CREATE TABLE "financial_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountType" "FinancialAccountType" NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT,
    "currentBalance" DECIMAL(10,2) NOT NULL,
    "interestRate" DECIMAL(5,4),
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiryDate" TEXT,
    "cutoffDate" INTEGER,
    "statementDate" INTEGER,
    "creditLimit" DECIMAL(10,2),
    "minimumPaymentDue" DECIMAL(10,2),
    "paymentDueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_accounts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
