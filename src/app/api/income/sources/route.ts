import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const { 
      name, 
      category, 
      description, 
      frequency, 
      amount,
      scheduleDays,
      scheduleWeekday,
      scheduleWeek,
      scheduleTime,
      useManualAmounts,
      scheduleDayAmounts
    } = await request.json();

    // Validate input
    if (!name || !category || !frequency || !amount) {
      return NextResponse.json(
        { error: 'Name, category, frequency, and amount are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate scheduling fields based on frequency
    if (frequency !== 'ONE_TIME') {
      if (frequency === 'MONTHLY' && (!scheduleDays || scheduleDays.length === 0)) {
        return NextResponse.json(
          { error: 'Monthly payments require at least one scheduled day' },
          { status: 400 }
        );
      }

      if ((frequency === 'WEEKLY' || frequency === 'BIWEEKLY') && scheduleWeekday === undefined) {
        return NextResponse.json(
          { error: 'Weekly and bi-weekly payments require a scheduled weekday' },
          { status: 400 }
        );
      }

      if (frequency === 'BIWEEKLY' && !scheduleWeek) {
        return NextResponse.json(
          { error: 'Bi-weekly payments require a scheduled week of the month' },
          { status: 400 }
        );
      }
    }

    const incomeSource = await prisma.incomeSource.create({
      data: {
        userId: user.id,
        name,
        category,
        description,
        frequency,
        amount: parseFloat(amount),
        scheduleDays: scheduleDays || null,
        scheduleWeekday: scheduleWeekday !== undefined ? scheduleWeekday : null,
        scheduleWeek: scheduleWeek || null,
        scheduleTime: scheduleTime || null,
        useManualAmounts: useManualAmounts || false,
        scheduleDayAmounts: scheduleDayAmounts || null,
      },
      include: {
        _count: {
          select: {
            incomeRecords: true,
          },
        },
      },
    });

    return NextResponse.json(incomeSource, { status: 201 });
  } catch (error) {
    console.error('Error creating income source:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}