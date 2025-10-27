import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const incomeRecord = await prisma.incomeRecord.findFirst({
      where: {
        id: id,
        incomeSource: {
          userId: user.id,
        },
      },
      include: {
        incomeSource: {
          select: {
            name: true,
            category: true,
            frequency: true,
            amount: true,
          },
        },
      },
    });

    if (!incomeRecord) {
      return NextResponse.json({ error: 'Income record not found' }, { status: 404 });
    }

    return NextResponse.json(incomeRecord);
  } catch (error) {
    console.error('Error fetching income record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const { expectedDate, actualAmount, actualDate, status, notes } = await request.json();

    // Validate status-specific fields
    if (status === 'RECEIVED' && !actualAmount) {
      return NextResponse.json(
        { error: 'Actual amount is required when status is RECEIVED' },
        { status: 400 }
      );
    }

    const incomeRecord = await prisma.incomeRecord.updateMany({
      where: {
        id: id,
        incomeSource: {
          userId: user.id,
        },
      },
      data: {
        expectedDate: expectedDate ? new Date(expectedDate) : undefined,
        actualAmount: actualAmount !== undefined ? (actualAmount ? parseFloat(actualAmount) : null) : undefined,
        actualDate: actualDate !== undefined ? (actualDate ? new Date(actualDate) : null) : undefined,
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    if (incomeRecord.count === 0) {
      return NextResponse.json({ error: 'Income record not found' }, { status: 404 });
    }

    const updatedRecord = await prisma.incomeRecord.findUnique({
      where: { id: id },
      include: {
        incomeSource: {
          select: {
            name: true,
            category: true,
            frequency: true,
            amount: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('Error updating income record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const deleted = await prisma.incomeRecord.deleteMany({
      where: {
        id: id,
        incomeSource: {
          userId: user.id,
        },
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Income record not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Income record deleted successfully' });
  } catch (error) {
    console.error('Error deleting income record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}