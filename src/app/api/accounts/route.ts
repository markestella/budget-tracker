import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all financial accounts for the user
export async function GET(request: Request) {
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
      where: { userId: user.id },
      orderBy: [
        { accountType: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    // Calculate derived fields for each account
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accountsWithCalculations = accounts.map((account: any) => {
      let calculations: any = {};

      if (account.accountType === 'CREDIT_CARD') {
        // Calculate available credit
        const availableCredit = account.creditLimit 
          ? parseFloat(account.creditLimit.toString()) - parseFloat(account.currentBalance.toString())
          : 0;

        // Calculate utilization percentage
        const utilizationRate = account.creditLimit 
          ? (parseFloat(account.currentBalance.toString()) / parseFloat(account.creditLimit.toString())) * 100
          : 0;

        calculations = {
          availableCredit,
          utilizationRate,
        };
      }

      return {
        ...account,
        calculations,
      };
    });

    return NextResponse.json(accountsWithCalculations);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

// POST create new financial account
export async function POST(request: Request) {
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

    const body = await request.json();
    
    // Calculate statement date for credit cards
    let statementDate = null;
    if (body.accountType === 'CREDIT_CARD' && body.cutoffDate) {
      statementDate = calculateStatementDate(body.cutoffDate);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const account = await (prisma as any).financialAccount.create({
      data: {
        userId: user.id,
        accountType: body.accountType,
        bankName: body.bankName,
        accountName: body.accountName,
        accountNumber: body.accountNumber || null,
        currentBalance: body.currentBalance,
        interestRate: body.interestRate || null,
        status: body.status || 'ACTIVE',
        expiryDate: body.expiryDate || null,
        cutoffDate: body.cutoffDate || null,
        statementDate,
        creditLimit: body.creditLimit || null,
        minimumPaymentDue: body.minimumPaymentDue || null,
        paymentDueDate: body.paymentDueDate ? new Date(body.paymentDueDate) : null,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}

// Helper function to calculate statement date
function calculateStatementDate(cutoffDate: number): number {
  // Statement date is cutoff date + 20 days
  let statementDate = cutoffDate + 20;
  
  // Handle month overflow - for simplicity, we'll use 30 days as month length
  // In a production app, you'd want more sophisticated date handling
  if (statementDate > 30) {
    statementDate = statementDate - 30;
  }
  
  return statementDate;
}