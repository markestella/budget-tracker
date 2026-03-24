import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface DashboardAccount {
  id: string;
  accountName: string;
  accountType: 'SAVINGS' | 'CHECKING' | 'CREDIT_CARD' | 'DEBIT_CARD';
  creditLimit: { toString(): string } | null;
  currentBalance: { toString(): string };
  expiryDate: string | null;
  paymentDueDate: Date | null;
}

interface AccountAlert {
  accountId: string;
  accountName: string;
  message: string;
  severity: 'info' | 'warning' | 'danger';
  type: 'low_balance' | 'high_utilization' | 'card_expiry' | 'payment_due';
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accounts = await (prisma as any).financialAccount.findMany({
      where: { 
        userId: user.id,
        status: 'ACTIVE' 
      },
    }) as DashboardAccount[];

    // Calculate totals and statistics
    let totalLiquidAssets = 0;
    let totalCreditLimit = 0;
    let totalCreditBalance = 0;
    let totalAvailableCredit = 0;
    
    const alerts: AccountAlert[] = [];
    const currentDate = new Date();
    
    accounts.forEach((account) => {
      const currentBalance = parseFloat(account.currentBalance.toString());
      
      if (account.accountType === 'SAVINGS' || account.accountType === 'CHECKING') {
        totalLiquidAssets += currentBalance;
        
        // Low balance alert (less than $100)
        if (currentBalance < 100) {
          alerts.push({
            type: 'low_balance',
            accountId: account.id,
            accountName: account.accountName,
            message: `Low balance in ${account.accountName}: $${currentBalance.toFixed(2)}`,
            severity: 'warning'
          });
        }
      }
      
      if (account.accountType === 'CREDIT_CARD') {
        const creditLimit = parseFloat(account.creditLimit?.toString() || '0');
        const availableCredit = creditLimit - currentBalance;
        
        totalCreditLimit += creditLimit;
        totalCreditBalance += currentBalance;
        totalAvailableCredit += availableCredit;
        
        // High utilization alert (above 70%)
        const utilizationRate = creditLimit > 0 ? (currentBalance / creditLimit) * 100 : 0;
        if (utilizationRate > 70) {
          alerts.push({
            type: 'high_utilization',
            accountId: account.id,
            accountName: account.accountName,
            message: `High credit utilization on ${account.accountName}: ${utilizationRate.toFixed(1)}%`,
            severity: utilizationRate > 90 ? 'danger' : 'warning'
          });
        }
        
        // Card expiry alert (within 3 months)
        if (account.expiryDate) {
          const [month, year] = account.expiryDate.split('/');
          const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
          const monthsUntilExpiry = (expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
          
          if (monthsUntilExpiry <= 3 && monthsUntilExpiry > 0) {
            alerts.push({
              type: 'card_expiry',
              accountId: account.id,
              accountName: account.accountName,
              message: `${account.accountName} expires in ${Math.ceil(monthsUntilExpiry)} months (${account.expiryDate})`,
              severity: 'info'
            });
          }
        }
        
        // Payment due date alert (within 3 days)
        if (account.paymentDueDate) {
          const dueDate = new Date(account.paymentDueDate);
          const daysUntilDue = (dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysUntilDue <= 3 && daysUntilDue >= 0) {
            alerts.push({
              type: 'payment_due',
              accountId: account.id,
              accountName: account.accountName,
              message: `Payment due for ${account.accountName} in ${Math.ceil(daysUntilDue)} days`,
              severity: daysUntilDue <= 1 ? 'danger' : 'warning'
            });
          }
        }
      }
    });

    const totalCreditUtilization = totalCreditLimit > 0 ? (totalCreditBalance / totalCreditLimit) * 100 : 0;

    const summary = {
      totalLiquidAssets,
      totalCreditLimit,
      totalCreditBalance,
      totalAvailableCredit,
      totalCreditUtilization,
      accountCounts: {
        savings: accounts.filter((account) => account.accountType === 'SAVINGS').length,
        checking: accounts.filter((account) => account.accountType === 'CHECKING').length,
        creditCards: accounts.filter((account) => account.accountType === 'CREDIT_CARD').length,
        debitCards: accounts.filter((account) => account.accountType === 'DEBIT_CARD').length,
      },
      alerts,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching account dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account dashboard' },
      { status: 500 }
    );
  }
}