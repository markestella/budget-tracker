import { PaymentCalculator } from '@/lib/paymentCalculator';

import { errorResponse, jsonResponse } from '@/lib/api-utils';
import {
  getMonthDateRange,
  toNumber,
} from '@/lib/budgets';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function calculateMonthlyIncomeFromSources(
  sources: Array<{
    amount: { toString(): string };
    frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
    scheduleDayAmounts: unknown;
    scheduleDays: number[];
    scheduleTime: string | null;
    scheduleWeek: 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH' | 'LAST' | null;
    scheduleWeekday: number | null;
    useManualAmounts: boolean;
  }>,
  monthStart: Date,
  monthEnd: Date,
) {
  const fromDate = new Date(monthStart);
  fromDate.setDate(fromDate.getDate() - 1);
  const daysAhead = Math.max(
    1,
    Math.ceil((monthEnd.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return roundCurrency(
    sources.reduce((total, source) => {
      const upcomingPayments = PaymentCalculator.getUpcomingPayments(
        {
          amount: toNumber(source.amount),
          frequency: source.frequency,
          scheduleDayAmounts: source.scheduleDayAmounts as Record<number, number> | undefined,
          scheduleDays: source.scheduleDays,
          scheduleTime: source.scheduleTime ?? undefined,
          scheduleWeek: source.scheduleWeek ?? undefined,
          scheduleWeekday: source.scheduleWeekday ?? undefined,
          useManualAmounts: source.useManualAmounts,
        },
        fromDate,
        daysAhead,
      );

      return total + upcomingPayments.reduce((sourceTotal, payment) => {
        if (payment.date < monthStart || payment.date > monthEnd) {
          return sourceTotal;
        }

        return sourceTotal + payment.amount;
      }, 0);
    }, 0),
  );
}

export async function GET() {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const { start, end } = getMonthDateRange();
    const [incomeSources, fixedExpenseAggregate, durationItems] = await Promise.all([
      prisma.incomeSource.findMany({
        where: {
          userId: auth.user.id,
          isActive: true,
        },
        select: {
          amount: true,
          frequency: true,
          scheduleDayAmounts: true,
          scheduleDays: true,
          scheduleTime: true,
          scheduleWeek: true,
          scheduleWeekday: true,
          useManualAmounts: true,
        },
      }),
      prisma.budgetItem.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          userId: auth.user.id,
          type: 'CONSTANT',
          isActive: true,
        },
      }),
      prisma.budgetItem.findMany({
        where: {
          userId: auth.user.id,
          type: 'DURATION',
          isActive: true,
          startDate: {
            lte: end,
          },
          endDate: {
            gte: start,
          },
        },
        select: {
          amount: true,
          completedPayments: true,
          totalMonths: true,
        },
      }),
    ]);

    const totalMonthlyIncome = calculateMonthlyIncomeFromSources(incomeSources, start, end);
    const totalFixedExpenses = roundCurrency(toNumber(fixedExpenseAggregate._sum.amount));
    const totalLoanPayments = roundCurrency(
      durationItems.reduce((total, item) => {
        if (item.totalMonths !== null && item.completedPayments >= item.totalMonths) {
          return total;
        }

        return total + toNumber(item.amount);
      }, 0),
    );
    const disposableIncome = roundCurrency(
      totalMonthlyIncome - totalFixedExpenses - totalLoanPayments,
    );

    return jsonResponse({
      disposableIncome,
      totalFixedExpenses,
      totalLoanPayments,
      totalMonthlyIncome,
    });
  } catch (error) {
    console.error('Error fetching budget summary:', error);
    return errorResponse('Failed to fetch budget summary', 500);
  }
}