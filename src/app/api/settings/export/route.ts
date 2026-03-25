import { buildCsv, normalizeExportRecord } from '@/lib/export-utils';
import { errorResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { exportQuerySchema } from '@/lib/validations/settings';

export async function GET(request: Request) {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const searchParams = new URL(request.url).searchParams;
    const parsed = exportQuerySchema.parse({
      format: searchParams.get('format') ?? undefined,
    });

    const [user, accounts, expenses, incomeSources, incomeRecords, budgetItems, categoryBudgets, savingsGoals, savingsTransactions, customCategories] = await Promise.all([
      prisma.user.findUnique({
        where: { id: auth.user.id },
        select: {
          bio: true,
          createdAt: true,
          email: true,
          image: true,
          lastExportedAt: true,
          name: true,
          preferredCurrency: true,
          preferredTheme: true,
          updatedAt: true,
        },
      }),
      prisma.financialAccount.findMany({ where: { userId: auth.user.id } }),
      prisma.expense.findMany({ where: { userId: auth.user.id } }),
      prisma.incomeSource.findMany({ where: { userId: auth.user.id } }),
      prisma.incomeRecord.findMany({ where: { userId: auth.user.id } }),
      prisma.budgetItem.findMany({ where: { userId: auth.user.id } }),
      prisma.categoryBudget.findMany({ where: { userId: auth.user.id } }),
      prisma.savingsGoal.findMany({ where: { userId: auth.user.id } }),
      prisma.savingsTransaction.findMany({ where: { userId: auth.user.id } }),
      prisma.customCategory.findMany({ where: { userId: auth.user.id } }),
    ]);

    await prisma.user.update({
      where: { id: auth.user.id },
      data: { lastExportedAt: new Date() },
    });

    const payload = {
      exportedAt: new Date().toISOString(),
      user: user ? normalizeExportRecord(user) : null,
      accounts: accounts.map(normalizeExportRecord),
      expenses: expenses.map(normalizeExportRecord),
      incomeSources: incomeSources.map(normalizeExportRecord),
      incomeRecords: incomeRecords.map(normalizeExportRecord),
      budgetItems: budgetItems.map(normalizeExportRecord),
      categoryBudgets: categoryBudgets.map(normalizeExportRecord),
      savingsGoals: savingsGoals.map(normalizeExportRecord),
      savingsTransactions: savingsTransactions.map(normalizeExportRecord),
      customCategories: customCategories.map(normalizeExportRecord),
    };

    if (parsed.format === 'csv') {
      const csv = buildCsv([
        { name: 'user', rows: payload.user ? [payload.user] : [] },
        { name: 'accounts', rows: payload.accounts },
        { name: 'expenses', rows: payload.expenses },
        { name: 'incomeSources', rows: payload.incomeSources },
        { name: 'incomeRecords', rows: payload.incomeRecords },
        { name: 'budgetItems', rows: payload.budgetItems },
        { name: 'categoryBudgets', rows: payload.categoryBudgets },
        { name: 'savingsGoals', rows: payload.savingsGoals },
        { name: 'savingsTransactions', rows: payload.savingsTransactions },
        { name: 'customCategories', rows: payload.customCategories },
      ]);

      return new Response(csv, {
        headers: {
          'Content-Disposition': 'attachment; filename="moneyquest-export.csv"',
          'Content-Type': 'text/csv; charset=utf-8',
        },
        status: 200,
      });
    }

    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Disposition': 'attachment; filename="moneyquest-export.json"',
        'Content-Type': 'application/json; charset=utf-8',
      },
      status: 200,
    });
  } catch (error) {
    console.error('Error exporting settings data:', error);
    return errorResponse('Failed to export user data', 500);
  }
}