import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { jsonResponse, validateRequest } from '@/lib/api-utils';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { incomeSourceUpdateSchema } from '@/lib/validations/income';

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

    const incomeSource = await prisma.incomeSource.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
      include: {
        incomeRecords: {
          orderBy: { expectedDate: 'desc' },
        },
        _count: {
          select: {
            incomeRecords: true,
          },
        },
      },
    });

    if (!incomeSource) {
      return NextResponse.json({ error: 'Income source not found' }, { status: 404 });
    }

    return NextResponse.json(incomeSource);
  } catch (error) {
    console.error('Error fetching income source:', error);
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
    const validation = validateRequest(incomeSourceUpdateSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    const {
      amount,
      category,
      description,
      frequency,
      isActive,
      name,
      scheduleDayAmounts,
      scheduleDays,
      scheduleTime,
      scheduleWeek,
      scheduleWeekday,
      useManualAmounts,
    } = validation.data;

    const incomeSource = await prisma.incomeSource.updateMany({
      where: {
        id: id,
        userId: user.id,
      },
      data: {
        name,
        category,
        description,
        frequency,
        amount,
        isActive: isActive !== undefined ? isActive : true,
        scheduleDays: { set: scheduleDays ?? [] },
        scheduleWeekday: scheduleWeekday !== undefined ? scheduleWeekday : null,
        scheduleWeek: scheduleWeek ?? null,
        scheduleTime: scheduleTime ?? null,
        useManualAmounts: useManualAmounts ?? false,
        scheduleDayAmounts: scheduleDayAmounts ?? Prisma.JsonNull,
      },
    });

    if (incomeSource.count === 0) {
      return NextResponse.json({ error: 'Income source not found' }, { status: 404 });
    }

    const updatedSource = await prisma.incomeSource.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            incomeRecords: true,
          },
        },
      },
    });

    return jsonResponse(updatedSource);
  } catch (error) {
    console.error('Error updating income source:', error);
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

    const deleted = await prisma.incomeSource.deleteMany({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Income source not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Income source deleted successfully' });
  } catch (error) {
    console.error('Error deleting income source:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}