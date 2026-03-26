import { prisma } from '@/lib/prisma';
import { budgetCategoryLabels } from '@/lib/expense-ui';
import { sendPushNotification } from '@/lib/notifications/sender';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function monthBoundary(date: Date) {
  return {
    end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999),
    start: new Date(date.getFullYear(), date.getMonth(), 1),
  };
}

function weekBoundary(date: Date) {
  const current = startOfDay(date);
  const day = current.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(current);
  start.setDate(current.getDate() + diffToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { end, start };
}

function dueDateDistance(referenceDate: Date, dueDay: number) {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth();
  const currentMonthLastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
  const normalizedCurrentDay = Math.min(dueDay, currentMonthLastDay);
  const currentMonthDate = new Date(currentYear, currentMonth, normalizedCurrentDay);

  if (currentMonthDate >= startOfDay(referenceDate)) {
    return Math.round((currentMonthDate.getTime() - startOfDay(referenceDate).getTime()) / DAY_IN_MS);
  }

  const nextMonthLastDay = new Date(currentYear, currentMonth + 2, 0).getDate();
  const normalizedNextMonthDay = Math.min(dueDay, nextMonthLastDay);
  const nextMonthDate = new Date(currentYear, currentMonth + 1, normalizedNextMonthDay);

  return Math.round((startOfDay(nextMonthDate).getTime() - startOfDay(referenceDate).getTime()) / DAY_IN_MS);
}

function formatBillReminderLabel(daysUntilDue: number) {
  if (daysUntilDue === 0) {
    return 'today';
  }

  if (daysUntilDue === 1) {
    return 'tomorrow';
  }

  return `in ${daysUntilDue} days`;
}

function toCurrency(value: number) {
  return new Intl.NumberFormat('en-PH', {
    currency: 'PHP',
    style: 'currency',
  }).format(value);
}

export async function billDueReminder(referenceDate = new Date()) {
  const preferences = await prisma.notificationPreference.findMany({
    where: { billReminders: true },
    select: { userId: true },
  });

  const userIds = preferences.map((preference) => preference.userId);

  if (userIds.length === 0) {
    return { notifiedUsers: 0, scannedUsers: 0 };
  }

  const budgetItems = await prisma.budgetItem.findMany({
    where: {
      isActive: true,
      userId: { in: userIds },
    },
    select: {
      amount: true,
      description: true,
      dueDate: true,
      userId: true,
    },
  });

  const grouped = new Map<string, { daysUntilDue: number; items: Array<{ amount: { toString(): string }; description: string }> }>();

  for (const item of budgetItems) {
    const daysUntilDue = dueDateDistance(referenceDate, item.dueDate);

    if (![0, 1, 3].includes(daysUntilDue)) {
      continue;
    }

    const existing = grouped.get(item.userId);

    if (!existing || daysUntilDue < existing.daysUntilDue) {
      grouped.set(item.userId, { daysUntilDue, items: [{ amount: item.amount, description: item.description }] });
      continue;
    }

    if (existing.daysUntilDue === daysUntilDue) {
      existing.items.push({ amount: item.amount, description: item.description });
    }
  }

  let notifiedUsers = 0;

  for (const [userId, summary] of grouped) {
    const titles = summary.items.slice(0, 2).map((item) => item.description).join(', ');
    const total = summary.items.reduce((sum, item) => sum + Number(item.amount), 0);
    const remainingCount = summary.items.length - Math.min(summary.items.length, 2);
    const itemSuffix = remainingCount > 0 ? ` and ${remainingCount} more` : '';

    await sendPushNotification(userId, {
      body: `${titles}${itemSuffix} are due ${formatBillReminderLabel(summary.daysUntilDue)}. Total upcoming payments: ${toCurrency(total)}.`,
      tag: `bill-reminder-${summary.daysUntilDue}`,
      title: 'Upcoming bill reminder',
      url: '/dashboard/budget',
    });
    notifiedUsers += 1;
  }

  return {
    notifiedUsers,
    scannedUsers: userIds.length,
  };
}

export async function budgetWarning(referenceDate = new Date()) {
  const preferences = await prisma.notificationPreference.findMany({
    where: { budgetWarnings: true },
    select: { userId: true },
  });
  const userIds = preferences.map((preference) => preference.userId);

  if (userIds.length === 0) {
    return { notifiedUsers: 0, scannedUsers: 0 };
  }

  const { start, end } = monthBoundary(referenceDate);
  const [categoryBudgets, expenses] = await Promise.all([
    prisma.categoryBudget.findMany({
      where: { userId: { in: userIds } },
      select: {
        category: true,
        monthlyLimit: true,
        userId: true,
      },
    }),
    prisma.expense.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
        userId: { in: userIds },
      },
      select: {
        amount: true,
        category: true,
        userId: true,
      },
    }),
  ]);

  const expenseMap = new Map<string, number>();

  for (const expense of expenses) {
    const key = `${expense.userId}:${expense.category}`;
    expenseMap.set(key, (expenseMap.get(key) ?? 0) + Number(expense.amount));
  }

  let notifiedUsers = 0;

  for (const budget of categoryBudgets) {
    const spent = expenseMap.get(`${budget.userId}:${budget.category}`) ?? 0;
    const limit = Number(budget.monthlyLimit);
    const ratio = limit > 0 ? spent / limit : 0;
    const threshold = ratio >= 1 ? 100 : ratio >= 0.9 ? 90 : ratio >= 0.8 ? 80 : 0;

    if (threshold === 0) {
      continue;
    }

    await sendPushNotification(budget.userId, {
      body: `${budgetCategoryLabels[budget.category]} spending has reached ${threshold}% of your monthly limit (${toCurrency(spent)} of ${toCurrency(limit)}).`,
      tag: `budget-warning-${budget.category.toLowerCase()}`,
      title: 'Budget warning',
      url: '/dashboard/budget',
    });
    notifiedUsers += 1;
  }

  return {
    notifiedUsers,
    scannedUsers: userIds.length,
  };
}

export async function streakWarning(referenceDate = new Date()) {
  if (referenceDate.getHours() < 20) {
    return { notifiedUsers: 0, scannedUsers: 0, skipped: true };
  }

  const preferences = await prisma.notificationPreference.findMany({
    where: { streakWarnings: true },
    select: { userId: true },
  });

  const userIds = preferences.map((preference) => preference.userId);

  if (userIds.length === 0) {
    return { notifiedUsers: 0, scannedUsers: 0, skipped: false };
  }

  const dayStart = startOfDay(referenceDate);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  let notifiedUsers = 0;

  for (const userId of userIds) {
    const [expenseCount, incomeCount, savingsCount] = await Promise.all([
      prisma.expense.count({ where: { userId, date: { gte: dayStart, lte: dayEnd } } }),
      prisma.incomeRecord.count({ where: { userId, actualDate: { gte: dayStart, lte: dayEnd } } }),
      prisma.savingsTransaction.count({ where: { userId, date: { gte: dayStart, lte: dayEnd } } }),
    ]);

    if (expenseCount > 0 || incomeCount > 0 || savingsCount > 0) {
      continue;
    }

    await sendPushNotification(userId, {
      body: 'Log an expense, income update, or savings move tonight to keep your MoneyQuest streak alive.',
      tag: 'streak-warning',
      title: 'Your streak needs activity',
      url: '/dashboard',
    });
    notifiedUsers += 1;
  }

  return {
    notifiedUsers,
    scannedUsers: userIds.length,
    skipped: false,
  };
}

export async function weeklySummary(referenceDate = new Date()) {
  const preferences = await prisma.notificationPreference.findMany({
    where: { weeklySummary: true },
    select: { userId: true },
  });

  const userIds = preferences.map((preference) => preference.userId);

  if (userIds.length === 0) {
    return { notifiedUsers: 0, scannedUsers: 0 };
  }

  const { start, end } = weekBoundary(referenceDate);
  let notifiedUsers = 0;

  for (const userId of userIds) {
    const [expenseAggregate, incomeAggregate, savingsAggregate] = await Promise.all([
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: { userId, date: { gte: start, lte: end } },
      }),
      prisma.incomeRecord.aggregate({
        _sum: { actualAmount: true },
        where: { userId, actualDate: { gte: start, lte: end } },
      }),
      prisma.savingsTransaction.aggregate({
        _sum: { amount: true },
        where: { userId, date: { gte: start, lte: end } },
      }),
    ]);

    const expenses = Number(expenseAggregate._sum.amount ?? 0);
    const income = Number(incomeAggregate._sum.actualAmount ?? 0);
    const savings = Number(savingsAggregate._sum.amount ?? 0);

    await sendPushNotification(userId, {
      body: `This week: income ${toCurrency(income)}, spending ${toCurrency(expenses)}, savings activity ${toCurrency(savings)}. Open MoneyQuest for your full recap.`,
      tag: 'weekly-summary',
      title: 'Your weekly MoneyQuest summary',
      url: '/dashboard',
    });
    notifiedUsers += 1;
  }

  return {
    notifiedUsers,
    scannedUsers: userIds.length,
  };
}

export async function runDailyNotificationJobs(referenceDate = new Date()) {
  const [billReminders, budgetWarnings, streakWarnings] = await Promise.all([
    billDueReminder(referenceDate),
    budgetWarning(referenceDate),
    streakWarning(referenceDate),
  ]);

  return {
    billReminders,
    budgetWarnings,
    streakWarnings,
  };
}

export async function runWeeklyNotificationJobs(referenceDate = new Date()) {
  const summary = await weeklySummary(referenceDate);

  return {
    weeklySummary: summary,
  };
}
