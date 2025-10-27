import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const { 
      name, 
      category, 
      description, 
      frequency, 
      amount, 
      isActive,
      scheduleDays,
      scheduleWeekday,
      scheduleWeek,
      scheduleTime,
      useManualAmounts,
      scheduleDayAmounts
    } = await request.json();

    // Validate input
    if (!name || !category || !frequency || amount === undefined) {
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
        amount: parseFloat(amount),
        isActive: isActive !== undefined ? isActive : true,
        scheduleDays: scheduleDays || null,
        scheduleWeekday: scheduleWeekday !== undefined ? scheduleWeekday : null,
        scheduleWeek: scheduleWeek || null,
        scheduleTime: scheduleTime || null,
        useManualAmounts: useManualAmounts || false,
        scheduleDayAmounts: scheduleDayAmounts || null,
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

    return NextResponse.json(updatedSource);
  } catch (error) {
    console.error('Error updating income source:', error);
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