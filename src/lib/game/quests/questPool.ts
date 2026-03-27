import type { QuestType } from '@prisma/client';

export interface QuestPoolEntry {
  title: string;
  description: string;
  type: QuestType;
  xpReward: number;
  category: string;
  conditions: {
    metric: string;
    operator: '>=' | '==' | '<=' | '>';
    value: number;
  };
}

export const QUEST_POOL: QuestPoolEntry[] = [
  // ─── DAILY (20+) ─────────────────────────────────────
  { title: 'Log All Expenses Today', description: 'Record at least 1 expense today', type: 'DAILY', xpReward: 10, category: 'tracking', conditions: { metric: 'expenses_logged_today', operator: '>=', value: 1 } },
  { title: 'Triple Logger', description: 'Log 3 expenses today', type: 'DAILY', xpReward: 15, category: 'tracking', conditions: { metric: 'expenses_logged_today', operator: '>=', value: 3 } },
  { title: 'Five-a-Day', description: 'Log 5 expenses today', type: 'DAILY', xpReward: 25, category: 'tracking', conditions: { metric: 'expenses_logged_today', operator: '>=', value: 5 } },
  { title: 'No Entertainment Spending', description: "Don't spend on entertainment today", type: 'DAILY', xpReward: 20, category: 'discipline', conditions: { metric: 'entertainment_expenses_today', operator: '==', value: 0 } },
  { title: 'No Food & Dining Out', description: "Don't eat out today", type: 'DAILY', xpReward: 20, category: 'discipline', conditions: { metric: 'food_dining_expenses_today', operator: '==', value: 0 } },
  { title: 'Check Your Budget', description: 'Visit the budget page', type: 'DAILY', xpReward: 5, category: 'engagement', conditions: { metric: 'visited_budget_page', operator: '>=', value: 1 } },
  { title: 'Review Savings Progress', description: 'Visit the savings page', type: 'DAILY', xpReward: 5, category: 'engagement', conditions: { metric: 'visited_savings_page', operator: '>=', value: 1 } },
  { title: 'Small Spender', description: 'Keep total spending under ₱500 today', type: 'DAILY', xpReward: 15, category: 'discipline', conditions: { metric: 'total_spent_today', operator: '<=', value: 500 } },
  { title: 'Thrifty Thursday', description: 'Spend under ₱200 today', type: 'DAILY', xpReward: 20, category: 'discipline', conditions: { metric: 'total_spent_today', operator: '<=', value: 200 } },
  { title: 'Category Tracker', description: 'Log expenses in 2+ categories today', type: 'DAILY', xpReward: 15, category: 'tracking', conditions: { metric: 'categories_logged_today', operator: '>=', value: 2 } },
  { title: 'No Miscellaneous Spending', description: 'Avoid miscellaneous spending today', type: 'DAILY', xpReward: 10, category: 'discipline', conditions: { metric: 'misc_expenses_today', operator: '==', value: 0 } },
  { title: 'Morning Logger', description: 'Log an expense before noon', type: 'DAILY', xpReward: 10, category: 'engagement', conditions: { metric: 'morning_expense_logged', operator: '>=', value: 1 } },
  { title: 'Budget Check-in', description: 'View your budget progress', type: 'DAILY', xpReward: 5, category: 'engagement', conditions: { metric: 'visited_budget_page', operator: '>=', value: 1 } },
  { title: 'Savings Peek', description: 'Check your savings goals', type: 'DAILY', xpReward: 5, category: 'engagement', conditions: { metric: 'visited_savings_page', operator: '>=', value: 1 } },
  { title: 'Zero Spend Day', description: 'No expenses at all today', type: 'DAILY', xpReward: 30, category: 'challenge', conditions: { metric: 'expenses_logged_today', operator: '==', value: 0 } },
  { title: 'Detail Oriented', description: 'Add notes to all expenses today', type: 'DAILY', xpReward: 15, category: 'tracking', conditions: { metric: 'expenses_with_notes_today', operator: '>=', value: 1 } },
  { title: 'Account Linker', description: 'Link an expense to an account', type: 'DAILY', xpReward: 10, category: 'tracking', conditions: { metric: 'linked_expenses_today', operator: '>=', value: 1 } },
  { title: 'Under ₱1000', description: 'Total spending under ₱1,000 today', type: 'DAILY', xpReward: 15, category: 'discipline', conditions: { metric: 'total_spent_today', operator: '<=', value: 1000 } },
  { title: 'Essential Only', description: 'Only spend on housing/food/utilities today', type: 'DAILY', xpReward: 20, category: 'discipline', conditions: { metric: 'non_essential_expenses_today', operator: '==', value: 0 } },
  { title: 'Dashboard Visit', description: 'Check your financial dashboard', type: 'DAILY', xpReward: 5, category: 'engagement', conditions: { metric: 'visited_dashboard', operator: '>=', value: 1 } },
  { title: 'Expense Categorizer', description: 'Log expenses in 3+ categories', type: 'DAILY', xpReward: 20, category: 'tracking', conditions: { metric: 'categories_logged_today', operator: '>=', value: 3 } },

  // ─── WEEKLY (15+) ────────────────────────────────────
  { title: 'Stay Under Food Budget', description: 'Keep food spending within budget this week', type: 'WEEKLY', xpReward: 50, category: 'discipline', conditions: { metric: 'food_under_budget_week', operator: '>=', value: 1 } },
  { title: 'Daily Logger', description: 'Log at least one expense every day this week', type: 'WEEKLY', xpReward: 75, category: 'consistency', conditions: { metric: 'days_logged_this_week', operator: '>=', value: 7 } },
  { title: 'Add to Emergency Fund', description: 'Make a deposit to emergency fund this week', type: 'WEEKLY', xpReward: 50, category: 'savings', conditions: { metric: 'emergency_deposit_this_week', operator: '>', value: 0 } },
  { title: 'Weekly Review', description: 'Visit dashboard 5 out of 7 days', type: 'WEEKLY', xpReward: 30, category: 'engagement', conditions: { metric: 'dashboard_visits_this_week', operator: '>=', value: 5 } },
  { title: 'Under Budget Week', description: 'Stay under total budget for the week', type: 'WEEKLY', xpReward: 60, category: 'discipline', conditions: { metric: 'under_total_budget_week', operator: '>=', value: 1 } },
  { title: 'Transport Saver', description: 'Keep transportation expenses under budget', type: 'WEEKLY', xpReward: 40, category: 'discipline', conditions: { metric: 'transport_under_budget_week', operator: '>=', value: 1 } },
  { title: 'Entertainment Control', description: 'Entertainment spending under ₱500 this week', type: 'WEEKLY', xpReward: 40, category: 'discipline', conditions: { metric: 'entertainment_spent_week', operator: '<=', value: 500 } },
  { title: 'Category Diversity', description: 'Log expenses in 5+ categories this week', type: 'WEEKLY', xpReward: 35, category: 'tracking', conditions: { metric: 'categories_logged_week', operator: '>=', value: 5 } },
  { title: 'Savings Boost', description: 'Deposit into any savings goal this week', type: 'WEEKLY', xpReward: 45, category: 'savings', conditions: { metric: 'savings_deposit_this_week', operator: '>', value: 0 } },
  { title: '15 Expenses Tracked', description: 'Log at least 15 expenses this week', type: 'WEEKLY', xpReward: 50, category: 'tracking', conditions: { metric: 'expenses_this_week', operator: '>=', value: 15 } },
  { title: 'No Impulse Week', description: 'No miscellaneous purchases all week', type: 'WEEKLY', xpReward: 55, category: 'discipline', conditions: { metric: 'misc_expenses_week', operator: '==', value: 0 } },
  { title: 'Debt Payment', description: 'Make a debt payment this week', type: 'WEEKLY', xpReward: 50, category: 'responsibility', conditions: { metric: 'debt_payment_this_week', operator: '>', value: 0 } },
  { title: 'Budget Architect', description: 'Review all category budgets', type: 'WEEKLY', xpReward: 30, category: 'engagement', conditions: { metric: 'budget_categories_reviewed', operator: '>=', value: 1 } },
  { title: 'Seven Day Streak', description: 'Maintain your streak all week', type: 'WEEKLY', xpReward: 60, category: 'consistency', conditions: { metric: 'streak_maintained_week', operator: '>=', value: 7 } },
  { title: 'Low Spend Week', description: 'Total weekly spending under ₱5,000', type: 'WEEKLY', xpReward: 50, category: 'discipline', conditions: { metric: 'total_spent_week', operator: '<=', value: 5000 } },

  // ─── MONTHLY (5+) ────────────────────────────────────
  { title: 'No-Spend Week', description: 'Have at least 7 days with zero expenses this month', type: 'MONTHLY', xpReward: 200, category: 'challenge', conditions: { metric: 'zero_expense_days_month', operator: '>=', value: 7 } },
  { title: 'Budget Master', description: 'Stay under budget in all categories this month', type: 'MONTHLY', xpReward: 250, category: 'discipline', conditions: { metric: 'all_categories_under_budget', operator: '>=', value: 1 } },
  { title: 'Savings Sprint', description: 'Save 20% more than usual this month', type: 'MONTHLY', xpReward: 200, category: 'savings', conditions: { metric: 'savings_rate_above_target', operator: '>=', value: 1 } },
  { title: 'Complete Logger', description: 'Log expenses every day this month', type: 'MONTHLY', xpReward: 300, category: 'consistency', conditions: { metric: 'days_logged_month', operator: '>=', value: 28 } },
  { title: 'Expense Analyst', description: 'Log 50+ expenses this month', type: 'MONTHLY', xpReward: 150, category: 'tracking', conditions: { metric: 'expenses_this_month', operator: '>=', value: 50 } },
  { title: 'Emergency Builder', description: 'Grow your emergency fund by 10% this month', type: 'MONTHLY', xpReward: 250, category: 'savings', conditions: { metric: 'emergency_fund_growth_pct', operator: '>=', value: 10 } },
  { title: 'Debt Reducer', description: 'Reduce total debt this month', type: 'MONTHLY', xpReward: 200, category: 'responsibility', conditions: { metric: 'debt_reduced_month', operator: '>', value: 0 } },
];
