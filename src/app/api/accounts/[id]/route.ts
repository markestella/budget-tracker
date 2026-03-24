import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET specific financial account
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const account = await (prisma as any).financialAccount.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    );
  }
}

// PUT update financial account
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    let statementDate = body.statementDate;
    if (body.accountType === 'CREDIT_CARD' && body.cutoffDate) {
      statementDate = calculateStatementDate(body.cutoffDate);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const account = await (prisma as any).financialAccount.update({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: {
        accountType: body.accountType,
        bankName: body.bankName,
        accountName: body.accountName,
        accountNumber: body.accountNumber || null,
        currentBalance: body.currentBalance,
        interestRate: body.interestRate || null,
        status: body.status,
        expiryDate: body.expiryDate || null,
        cutoffDate: body.cutoffDate || null,
        statementDate,
        creditLimit: body.creditLimit || null,
        minimumPaymentDue: body.minimumPaymentDue || null,
        paymentDueDate: body.paymentDueDate ? new Date(body.paymentDueDate) : null,
      },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    );
  }
}

// DELETE financial account
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    await (prisma as any).financialAccount.delete({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}

// Helper function to calculate statement date
function calculateStatementDate(cutoffDate: number): number {
  // Statement date is cutoff date + 20 days
  let statementDate = cutoffDate + 20;
  
  // Handle month overflow - for simplicity, we'll use 30 days as month length
  if (statementDate > 30) {
    statementDate = statementDate - 30;
  }
  
  return statementDate;
}