import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PaymentCalculator } from '@/lib/paymentCalculator';

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
    const period = url.searchParams.get('period') || 'monthly';
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString());
    const month = url.searchParams.get('month') ? parseInt(url.searchParams.get('month')!) : new Date().getMonth() + 1;

    const currentDate = new Date();
    const startDate = new Date(year, period === 'yearly' ? 0 : month - 1, 1);
    const endDate = period === 'yearly' 
      ? new Date(year + 1, 0, 1) 
      : new Date(year, month, 1);

    // Get all income sources for the user
    const incomeSources = await prisma.incomeSource.findMany({
      where: { userId: user.id },
      include: {
        incomeRecords: {
          where: {
            expectedDate: {
              gte: startDate,
              lt: endDate,
            },
          },
        },
      },
    });

    // Calculate statistics
    let totalExpected = 0;
    let totalReceived = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    const sourceBreakdown: Array<Record<string, unknown>> = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    incomeSources.forEach((source: any) => {
      let sourceExpected = 0;
      let sourceReceived = 0;
      let sourcePending = 0;
      let sourceOverdue = 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      source.incomeRecords.forEach((record: any) => {
        const expectedAmount = parseFloat(source.amount.toString());
        sourceExpected += expectedAmount;

        if (record.status === 'RECEIVED' && record.actualAmount) {
          sourceReceived += parseFloat(record.actualAmount.toString());
        } else if (record.status === 'PENDING') {
          sourcePending += expectedAmount;
          if (record.expectedDate < currentDate) {
            sourceOverdue += expectedAmount;
          }
        }
      });

      // If no records exist for the period, calculate expected based on frequency
      if (source.incomeRecords.length === 0) {
        let expectedPayments = 0;
        
        switch (source.frequency) {
          case 'WEEKLY':
            expectedPayments = period === 'yearly' ? 52 : 4;
            break;
          case 'BIWEEKLY':
            expectedPayments = period === 'yearly' ? 26 : 2;
            break;
          case 'MONTHLY':
            // For monthly, multiply by number of scheduled days per month
            const scheduledDaysPerMonth = source.scheduleDays?.length || 1;
            expectedPayments = (period === 'yearly' ? 12 : 1) * scheduledDaysPerMonth;
            break;
          case 'QUARTERLY':
            expectedPayments = period === 'yearly' ? 4 : (month % 3 === 1 ? 1 : 0);
            break;
          case 'YEARLY':
            expectedPayments = period === 'yearly' ? 1 : (month === 1 ? 1 : 0);
            break;
          case 'ONE_TIME':
            expectedPayments = 0; // Don't include one-time payments without records
            break;
        }

        if (source.isActive) {
          // Calculate per-payment amount for monthly frequency with multiple days
          const sourceAmount = parseFloat(source.amount.toString());
          const perPaymentAmount = source.frequency === 'MONTHLY' && source.scheduleDays?.length > 1 
            ? sourceAmount / source.scheduleDays.length 
            : sourceAmount;
          
          sourceExpected = expectedPayments * perPaymentAmount;
          sourcePending = sourceExpected; // Assume all are pending if no records
        }
      }

      totalExpected += sourceExpected;
      totalReceived += sourceReceived;
      totalPending += sourcePending;
      totalOverdue += sourceOverdue;

      sourceBreakdown.push({
        id: source.id,
        name: source.name,
        category: source.category,
        frequency: source.frequency,
        baseAmount: parseFloat(source.amount.toString()),
        expected: sourceExpected,
        received: sourceReceived,
        pending: sourcePending,
        overdue: sourceOverdue,
        isActive: source.isActive,
      });
    });

    // Calculate monthly projections for the year
    const monthlyProjections = [];
    if (period === 'yearly') {
      for (let m = 0; m < 12; m++) {
        const monthStart = new Date(year, m, 1);
        const monthEnd = new Date(year, m + 1, 1);
        
        let monthlyExpected = 0;
        let monthlyReceived = 0;
        
        for (const source of incomeSources) {
          if (!source.isActive) continue;
          
          let paymentsInMonth = 0;
          switch (source.frequency) {
            case 'WEEKLY':
              paymentsInMonth = 4;
              break;
            case 'BIWEEKLY':
              paymentsInMonth = 2;
              break;
            case 'MONTHLY':
              // For monthly, multiply by number of scheduled days per month
              paymentsInMonth = source.scheduleDays?.length || 1;
              break;
            case 'QUARTERLY':
              paymentsInMonth = (m + 1) % 3 === 1 ? 1 : 0;
              break;
            case 'YEARLY':
              paymentsInMonth = m === 0 ? 1 : 0;
              break;
            default:
              paymentsInMonth = 0;
          }
          
          // Calculate per-payment amount for monthly frequency with multiple days
          const sourceAmount = parseFloat(source.amount.toString());
          const perPaymentAmount = source.frequency === 'MONTHLY' && source.scheduleDays?.length > 1 
            ? sourceAmount / source.scheduleDays.length 
            : sourceAmount;
          
          monthlyExpected += paymentsInMonth * perPaymentAmount;
          
          // Calculate actual received for this month
          const monthRecords = await prisma.incomeRecord.findMany({
            where: {
              incomeSourceId: source.id,
              status: 'RECEIVED',
              actualDate: {
                gte: monthStart,
                lt: monthEnd,
              },
            },
          });
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          monthlyReceived += monthRecords.reduce((sum: number, record: any) => sum + (parseFloat(record.actualAmount?.toString() || '0')), 0);
        }
        
        monthlyProjections.push({
          month: m + 1,
          expected: monthlyExpected,
          received: monthlyReceived,
        });
      }
    }

    // Get recent payments (from actual records)
    const recentRecords = await prisma.incomeRecord.findMany({
      where: {
        incomeSource: { userId: user.id },
        status: 'RECEIVED',
      },
      include: {
        incomeSource: {
          select: {
            name: true,
            category: true,
          },
        },
      },
      orderBy: { actualDate: 'desc' },
      take: 10,
    });

    // Generate smart upcoming payments using the payment calculator
    const activeIncomeSources = await prisma.incomeSource.findMany({
      where: { 
        userId: user.id, 
        isActive: true,
        frequency: { not: 'ONE_TIME' } // Exclude one-time payments
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const upcomingPayments: any[] = [];
    const currentDateForCalc = new Date();
    
    // Generate upcoming payments for each active income source
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeIncomeSources.forEach((source: any) => {
      try {
        // Convert scheduleDayAmounts from JSON to proper format
        let scheduleDayAmounts = {};
        if (source.scheduleDayAmounts && typeof source.scheduleDayAmounts === 'object') {
          scheduleDayAmounts = source.scheduleDayAmounts;
        }

        const upcoming = PaymentCalculator.getUpcomingPayments(
          {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            frequency: source.frequency as any,
            scheduleDays: source.scheduleDays || undefined,
            scheduleWeekday: source.scheduleWeekday || undefined,
            scheduleWeek: source.scheduleWeek || undefined,
            scheduleTime: source.scheduleTime || undefined,
            amount: parseFloat(source.amount.toString()),
            useManualAmounts: source.useManualAmounts || false,
            scheduleDayAmounts: scheduleDayAmounts
          },
          currentDateForCalc,
          60 // Look 60 days ahead
        );

        upcoming.forEach(payment => {
          // Only add payments with valid amounts
          if (payment.amount > 0 && !isNaN(payment.amount) && isFinite(payment.amount)) {
            upcomingPayments.push({
              id: `${source.id}-${payment.date.toISOString()}`,
              expectedDate: payment.date,
              expectedAmount: payment.amount, // This is now the per-payment amount (divided for monthly)
              status: 'PENDING',
              incomeSource: {
                id: source.id, // Add the income source ID for actions
                name: source.name,
                category: source.category,
                amount: parseFloat(source.amount.toString()), // This remains the full monthly amount
                perPaymentAmount: payment.amount // Add the per-payment amount for clarity
              }
            });
          }
        });
      } catch (error) {
        console.error(`Error calculating payments for source ${source.id}:`, error);
      }
    });

    // Sort upcoming payments by date and take the first 10
    const sortedUpcomingPayments = upcomingPayments
      .sort((a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime())
      .slice(0, 10);

    // Get all existing records (not just pending ones) to filter them out properly
    const existingRecords = await prisma.incomeRecord.findMany({
      where: {
        incomeSource: { userId: user.id },
        expectedDate: {
          gte: currentDate,
        },
      },
      include: {
        incomeSource: true,
      },
      orderBy: { expectedDate: 'asc' },
      take: 20,
    });

    // Convert existing records to the same format and calculate expected amounts
    // Only include PENDING records in notifications, but use all records for filtering
    const formattedExistingPayments = existingRecords
      .filter(record => record.status === 'PENDING')
      .map((record: any) => {
      // Calculate expected amount by generating upcoming payments for this source
      // and finding the matching date
      let scheduleDayAmounts = {};
      if (record.incomeSource.scheduleDayAmounts && typeof record.incomeSource.scheduleDayAmounts === 'object') {
        scheduleDayAmounts = record.incomeSource.scheduleDayAmounts;
      }

      // Generate upcoming payments for this specific source to find the correct amount
      const sourceUpcoming = PaymentCalculator.getUpcomingPayments(
        {
          frequency: record.incomeSource.frequency as any,
          scheduleDays: record.incomeSource.scheduleDays || undefined,
          scheduleWeekday: record.incomeSource.scheduleWeekday || undefined,
          scheduleWeek: record.incomeSource.scheduleWeek || undefined,
          scheduleTime: record.incomeSource.scheduleTime || undefined,
          amount: parseFloat(record.incomeSource.amount.toString()),
          useManualAmounts: record.incomeSource.useManualAmounts || false,
          scheduleDayAmounts: scheduleDayAmounts
        },
        new Date(record.expectedDate.getFullYear(), record.expectedDate.getMonth() - 1, 1), // Start from previous month
        90 // Look ahead to ensure we find the matching date
      );

      // Find the upcoming payment that matches this record's date
      const matchingPayment = sourceUpcoming.find(payment => 
        payment.date.toDateString() === record.expectedDate.toDateString()
      );

      const expectedAmount = matchingPayment ? matchingPayment.amount : 0;

      return {
        id: record.id,
        expectedDate: record.expectedDate,
        expectedAmount: expectedAmount,
        status: record.status,
        incomeSource: {
          id: record.incomeSource.id, // Add the income source ID for actions
          name: record.incomeSource.name,
          category: record.incomeSource.category,
          amount: parseFloat(record.incomeSource.amount.toString()),
          perPaymentAmount: expectedAmount
        },
        isExistingRecord: true
      };
    }).filter((payment: any) => 
      // Filter out payments with invalid amounts
      payment.expectedAmount > 0 && 
      !isNaN(payment.expectedAmount) && 
      isFinite(payment.expectedAmount)
    );

    // Filter out calculated payments that have corresponding database records (any status)
    const existingDates = new Set(
      existingRecords.map((p: any) => p.expectedDate.toDateString())
    );

    const filteredCalculatedPayments = sortedUpcomingPayments.filter(
      payment => !existingDates.has(new Date(payment.expectedDate).toDateString())
    );

    // Combine existing records with remaining calculated payments
    const allUpcomingPayments = [...formattedExistingPayments, ...filteredCalculatedPayments]
      .sort((a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime())
      .slice(0, 10);

    const response = {
      period,
      year,
      month: period === 'monthly' ? month : undefined,
      summary: {
        totalExpected,
        totalReceived,
        totalPending,
        totalOverdue,
        receiptRate: totalExpected > 0 ? (totalReceived / totalExpected) * 100 : 0,
      },
      sourceBreakdown,
      monthlyProjections: period === 'yearly' ? monthlyProjections : undefined,
      recentPayments: recentRecords,
      upcomingPayments: allUpcomingPayments,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error calculating income statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}