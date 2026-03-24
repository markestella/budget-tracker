import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { jsonResponse, validateRequest } from '@/lib/api-utils';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { incomeRecordSchema } from '@/lib/validations/income';

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

    const url = new URL(request.url);
    const sourceId = url.searchParams.get('sourceId');
    const status = url.searchParams.get('status');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      incomeSource: {
        userId: user.id,
      },
    };

    if (sourceId) {
      where.incomeSourceId = sourceId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.expectedDate = {};
      if (startDate) where.expectedDate.gte = new Date(startDate);
      if (endDate) where.expectedDate.lte = new Date(endDate);
    }

    const [records, total] = await Promise.all([
      prisma.incomeRecord.findMany({
        where,
        include: {
          incomeSource: {
            select: {
              name: true,
              category: true,
              frequency: true,
            },
          },
        },
        orderBy: { expectedDate: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.incomeRecord.count({ where }),
    ]);

    return NextResponse.json({
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching income records:', error);
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
    const validation = validateRequest(incomeRecordSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    const { actualAmount, actualDate, expectedDate, incomeSourceId, notes, status } = validation.data;

    // Verify the income source belongs to the user
    const incomeSource = await prisma.incomeSource.findFirst({
      where: {
        id: incomeSourceId,
        userId: user.id,
      },
    });

    if (!incomeSource) {
      return NextResponse.json({ error: 'Income source not found' }, { status: 404 });
    }

    const incomeRecord = await prisma.incomeRecord.create({
      data: {
        userId: user.id,
        incomeSourceId,
        expectedDate: new Date(expectedDate),
        actualAmount: actualAmount ?? null,
        actualDate: actualDate ? new Date(actualDate) : null,
        status: status ?? 'PENDING',
        notes,
      },
      include: {
        incomeSource: {
          select: {
            name: true,
            category: true,
            frequency: true,
          },
        },
      },
    });

    return jsonResponse(incomeRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating income record:', error);
    return jsonResponse(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}