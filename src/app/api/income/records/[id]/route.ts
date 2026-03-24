import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { jsonResponse, validateRequest } from '@/lib/api-utils';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { incomeRecordUpdateSchema } from '@/lib/validations/income';

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

    const body = await request.json().catch(() => null);
    const validation = validateRequest(incomeRecordUpdateSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    const { actualAmount, actualDate, expectedDate, notes, status } = validation.data;

    const incomeRecord = await prisma.incomeRecord.updateMany({
      where: {
        id: id,
        incomeSource: {
          userId: user.id,
        },
      },
      data: {
        expectedDate: expectedDate ? new Date(expectedDate) : undefined,
        actualAmount: actualAmount !== undefined ? actualAmount : undefined,
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

    return jsonResponse(updatedRecord);
  } catch (error) {
    console.error('Error updating income record:', error);
    return jsonResponse(
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