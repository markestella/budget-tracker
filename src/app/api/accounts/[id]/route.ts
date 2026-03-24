import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { jsonResponse, validateRequest } from '@/lib/api-utils';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { financialAccountUpdateSchema } from '@/lib/validations/accounts';

// GET specific financial account
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        id,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = await request.json().catch(() => null);
    const validation = validateRequest(financialAccountUpdateSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    const data = validation.data;
    
    // Calculate statement date for credit cards
    let statementDate = null;
    if (data.accountType === 'CREDIT_CARD' && data.cutoffDate) {
      statementDate = calculateStatementDate(data.cutoffDate);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const account = await (prisma as any).financialAccount.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        accountType: data.accountType,
        bankName: data.bankName,
        accountName: data.accountName,
        accountNumber: data.accountNumber ?? null,
        currentBalance: data.currentBalance,
        interestRate: data.interestRate ?? null,
        status: data.status ?? 'ACTIVE',
        expiryDate: data.expiryDate ?? null,
        cutoffDate: data.cutoffDate ?? null,
        statementDate,
        creditLimit: data.creditLimit ?? null,
        minimumPaymentDue: data.minimumPaymentDue ?? null,
        paymentDueDate: data.paymentDueDate ? new Date(data.paymentDueDate) : null,
      },
    });

    return jsonResponse(account);
  } catch (error) {
    console.error('Error updating account:', error);
    return jsonResponse(
      { error: 'Failed to update account' },
      { status: 500 }
    );
  }
}

// DELETE financial account
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        id,
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