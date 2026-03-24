import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { jsonResponse, validateRequest } from '@/lib/api-utils';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { incomeSourceSchema } from '@/lib/validations/income';

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

    const incomeSources = await prisma.incomeSource.findMany({
      where: { userId: user.id },
      include: {
        incomeRecords: {
          orderBy: { expectedDate: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            incomeRecords: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(incomeSources);
  } catch (error) {
    console.error('Error fetching income sources:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const body = await request.json().catch(() => null);
    const validation = validateRequest(incomeSourceSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    const {
      amount,
      category,
      description,
      frequency,
      name,
      scheduleDayAmounts,
      scheduleDays,
      scheduleTime,
      scheduleWeek,
      scheduleWeekday,
      useManualAmounts,
    } = validation.data;

    const incomeSource = await prisma.incomeSource.create({
      data: {
        userId: user.id,
        name,
        category,
        description,
        frequency,
        amount,
        scheduleDays: scheduleDays ?? [],
        scheduleWeekday: scheduleWeekday !== undefined ? scheduleWeekday : null,
        scheduleWeek: scheduleWeek ?? null,
        scheduleTime: scheduleTime ?? null,
        useManualAmounts: useManualAmounts ?? false,
        scheduleDayAmounts: scheduleDayAmounts ?? Prisma.JsonNull,
      },
      include: {
        _count: {
          select: {
            incomeRecords: true,
          },
        },
      },
    });

    return jsonResponse(incomeSource, { status: 201 });
  } catch (error) {
    console.error('Error creating income source:', error);
    return jsonResponse(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}