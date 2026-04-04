/**
 * Centralized demo data for all dashboard pages.
 * Each export matches the exact return type of its corresponding API endpoint.
 */

import type { DashboardSummary, DashboardCharts } from '@/hooks/api/useDashboardHooks';
import type { BudgetItem, BudgetSummary, CategoryBudgetRow } from '@/types/budgets';
import type { ExpenseListResponse, ExpenseRecord } from '@/types/expenses';
import type { SavingsGoalRecord, SavingsTransactionRecord } from '@/types/savings';

// ── Dashboard ─────────────────────────────────────────────────────

export const DEMO_DASHBOARD: DashboardSummary = {
  totalIncomeThisMonth: 45000,
  totalExpensesThisMonth: 28500,
  totalBudgetThisMonth: 35000,
  netSavings: 16500,
  budgetUsedPercent: 81,
  topCategories: [
    { category: 'FOOD_DINING', amount: 8500 },
    { category: 'TRANSPORTATION', amount: 5200 },
    { category: 'ENTERTAINMENT', amount: 4800 },
    { category: 'UTILITIES', amount: 3500 },
    { category: 'HOUSING', amount: 6500 },
  ],
  trends: {
    totalIncomeThisMonth: { direction: 'up', percentage: 5.2 },
    totalExpensesThisMonth: { direction: 'down', percentage: 3.1 },
    netSavings: { direction: 'up', percentage: 12.4 },
    budgetUsedPercent: { direction: 'down', percentage: 2.8 },
  },
};

export const DEMO_CHARTS: DashboardCharts = {
  monthlyTrend: [
    { month: 'Oct', income: 40000, expenses: 32000 },
    { month: 'Nov', income: 42000, expenses: 30000 },
    { month: 'Dec', income: 43000, expenses: 35000 },
    { month: 'Jan', income: 41000, expenses: 29000 },
    { month: 'Feb', income: 44000, expenses: 27000 },
    { month: 'Mar', income: 45000, expenses: 28500 },
  ],
  categoryBreakdown: [
    { category: 'Food & Dining', amount: 8500, percentage: 30 },
    { category: 'Housing', amount: 6500, percentage: 23 },
    { category: 'Transportation', amount: 5200, percentage: 18 },
    { category: 'Entertainment', amount: 4800, percentage: 17 },
    { category: 'Utilities', amount: 3500, percentage: 12 },
  ],
  budgetProgress: [
    { category: 'Food & Dining', spent: 8500, budget: 10000, percentage: 85 },
    { category: 'Housing', spent: 6500, budget: 7000, percentage: 93 },
    { category: 'Transportation', spent: 5200, budget: 6000, percentage: 87 },
    { category: 'Entertainment', spent: 4800, budget: 5000, percentage: 96 },
    { category: 'Utilities', spent: 3500, budget: 4000, percentage: 88 },
  ],
};

// ── Budgets ───────────────────────────────────────────────────────

export const DEMO_BUDGET_ITEMS: BudgetItem[] = [
  {
    id: 'demo-b1', userId: 'demo', type: 'CONSTANT', description: 'Rent Payment',
    amount: 7000, dueDate: 1, merchant: 'Landlord', category: 'HOUSING',
    linkedAccountId: null, linkedAccount: null, isActive: true,
    totalMonths: null, startDate: null, endDate: null, completedPayments: 0,
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'demo-b2', userId: 'demo', type: 'CONSTANT', description: 'Groceries',
    amount: 10000, dueDate: 15, merchant: null, category: 'FOOD_DINING',
    linkedAccountId: null, linkedAccount: null, isActive: true,
    totalMonths: null, startDate: null, endDate: null, completedPayments: 0,
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'demo-b3', userId: 'demo', type: 'CONSTANT', description: 'Electricity Bill',
    amount: 4000, dueDate: 20, merchant: 'Power Co.', category: 'UTILITIES',
    linkedAccountId: null, linkedAccount: null, isActive: true,
    totalMonths: null, startDate: null, endDate: null, completedPayments: 0,
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'demo-b4', userId: 'demo', type: 'DURATION', description: 'Car Loan',
    amount: 6000, dueDate: 5, merchant: 'Auto Finance', category: 'DEBT_PAYMENTS',
    linkedAccountId: null, linkedAccount: null, isActive: true,
    totalMonths: 48, startDate: '2024-06-01T00:00:00Z', endDate: '2028-06-01T00:00:00Z',
    completedPayments: 21,
    createdAt: '2024-06-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'demo-b5', userId: 'demo', type: 'CONSTANT', description: 'Streaming Services',
    amount: 1500, dueDate: 10, merchant: null, category: 'ENTERTAINMENT',
    linkedAccountId: null, linkedAccount: null, isActive: true,
    totalMonths: null, startDate: null, endDate: null, completedPayments: 0,
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
  },
];

export const DEMO_BUDGET_SUMMARY: BudgetSummary = {
  totalMonthlyIncome: 45000,
  totalFixedExpenses: 22500,
  totalLoanPayments: 6000,
  disposableIncome: 16500,
};

export const DEMO_CATEGORY_BUDGETS: CategoryBudgetRow[] = [
  { id: 'demo-cb1', category: 'FOOD_DINING', categoryLabel: 'Food & Dining', monthlyLimit: 10000, rollover: false, spentAmount: 8500, utilizationPercent: 85 },
  { id: 'demo-cb2', category: 'HOUSING', categoryLabel: 'Housing', monthlyLimit: 7000, rollover: false, spentAmount: 6500, utilizationPercent: 93 },
  { id: 'demo-cb3', category: 'TRANSPORTATION', categoryLabel: 'Transportation', monthlyLimit: 6000, rollover: false, spentAmount: 5200, utilizationPercent: 87 },
  { id: 'demo-cb4', category: 'ENTERTAINMENT', categoryLabel: 'Entertainment', monthlyLimit: 5000, rollover: false, spentAmount: 4800, utilizationPercent: 96 },
  { id: 'demo-cb5', category: 'UTILITIES', categoryLabel: 'Utilities', monthlyLimit: 4000, rollover: false, spentAmount: 3500, utilizationPercent: 88 },
];

// ── Expenses ──────────────────────────────────────────────────────

const now = new Date().toISOString();

const DEMO_EXPENSE_RECORDS: ExpenseRecord[] = [
  { id: 'demo-e1', userId: 'demo', amount: 2500, category: 'FOOD_DINING', merchant: 'Grocery Store', date: '2026-03-28', notes: 'Weekly groceries', linkedAccountId: null, linkedBudgetItemId: null, isRecurring: false, createdAt: now, updatedAt: now, linkedAccount: null, linkedBudgetItem: null },
  { id: 'demo-e2', userId: 'demo', amount: 1200, category: 'TRANSPORTATION', merchant: 'Gas Station', date: '2026-03-27', notes: null, linkedAccountId: null, linkedBudgetItemId: null, isRecurring: false, createdAt: now, updatedAt: now, linkedAccount: null, linkedBudgetItem: null },
  { id: 'demo-e3', userId: 'demo', amount: 3500, category: 'ENTERTAINMENT', merchant: 'Cinema', date: '2026-03-25', notes: 'Movie night', linkedAccountId: null, linkedBudgetItemId: null, isRecurring: false, createdAt: now, updatedAt: now, linkedAccount: null, linkedBudgetItem: null },
  { id: 'demo-e4', userId: 'demo', amount: 800, category: 'FOOD_DINING', merchant: 'Coffee Shop', date: '2026-03-24', notes: null, linkedAccountId: null, linkedBudgetItemId: null, isRecurring: false, createdAt: now, updatedAt: now, linkedAccount: null, linkedBudgetItem: null },
  { id: 'demo-e5', userId: 'demo', amount: 6500, category: 'HOUSING', merchant: 'Landlord', date: '2026-03-01', notes: 'March rent', linkedAccountId: null, linkedBudgetItemId: null, isRecurring: true, createdAt: now, updatedAt: now, linkedAccount: null, linkedBudgetItem: null },
  { id: 'demo-e6', userId: 'demo', amount: 4000, category: 'UTILITIES', merchant: 'Power Co.', date: '2026-03-20', notes: 'Electricity', linkedAccountId: null, linkedBudgetItemId: null, isRecurring: true, createdAt: now, updatedAt: now, linkedAccount: null, linkedBudgetItem: null },
  { id: 'demo-e7', userId: 'demo', amount: 1500, category: 'HEALTHCARE', merchant: 'Pharmacy', date: '2026-03-22', notes: null, linkedAccountId: null, linkedBudgetItemId: null, isRecurring: false, createdAt: now, updatedAt: now, linkedAccount: null, linkedBudgetItem: null },
  { id: 'demo-e8', userId: 'demo', amount: 2000, category: 'TRANSPORTATION', merchant: 'Ride Share', date: '2026-03-15', notes: null, linkedAccountId: null, linkedBudgetItemId: null, isRecurring: false, createdAt: now, updatedAt: now, linkedAccount: null, linkedBudgetItem: null },
];

export const DEMO_EXPENSES: ExpenseListResponse = {
  data: DEMO_EXPENSE_RECORDS,
  page: 1,
  pageSize: 20,
  totalCount: DEMO_EXPENSE_RECORDS.length,
  totalPages: 1,
  summaries: {
    totalAmount: 22000,
    accountUsage: [],
  },
};

export const DEMO_RECENT_EXPENSES: ExpenseRecord[] = DEMO_EXPENSE_RECORDS.slice(0, 5);

// ── Income ────────────────────────────────────────────────────────

export const DEMO_INCOME_SOURCES = [
  {
    id: 'demo-i1', userId: 'demo', name: 'Main Salary', category: 'SALARY' as const,
    description: 'Monthly salary from employer', frequency: 'MONTHLY' as const,
    amount: 40000, scheduleDays: [25], scheduleWeekday: null, scheduleWeek: null,
    scheduleTime: null, useManualAmounts: false, scheduleDayAmounts: null,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
    incomeRecords: [
      { id: 'demo-ir1', expectedDate: '2026-03-25', actualAmount: 40000, actualDate: '2026-03-25', status: 'RECEIVED' as const, notes: null },
      { id: 'demo-ir2', expectedDate: '2026-02-25', actualAmount: 40000, actualDate: '2026-02-25', status: 'RECEIVED' as const, notes: null },
    ],
    _count: { incomeRecords: 14 },
  },
  {
    id: 'demo-i2', userId: 'demo', name: 'Freelance Design', category: 'FREELANCE' as const,
    description: 'Side projects', frequency: 'MONTHLY' as const,
    amount: 5000, scheduleDays: [15], scheduleWeekday: null, scheduleWeek: null,
    scheduleTime: null, useManualAmounts: false, scheduleDayAmounts: null,
    createdAt: '2025-06-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
    incomeRecords: [
      { id: 'demo-ir3', expectedDate: '2026-03-15', actualAmount: 5000, actualDate: '2026-03-15', status: 'RECEIVED' as const, notes: null },
    ],
    _count: { incomeRecords: 9 },
  },
];

// ── Savings ───────────────────────────────────────────────────────

export const DEMO_SAVINGS_GOALS: SavingsGoalRecord[] = [
  {
    id: 'demo-s1', userId: 'demo', name: 'Emergency Fund', institution: 'Online Bank',
    type: 'EMERGENCY_FUND', monthlyContribution: 5000, currentBalance: 85000,
    targetAmount: 120000, interestRate: 4.5, startDate: '2025-01-01T00:00:00Z',
    lastUpdatedBalance: '2026-03-01T00:00:00Z', status: 'ACTIVE', notes: null,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'demo-s2', userId: 'demo', name: 'Vacation Fund', institution: 'Credit Union',
    type: 'VACATION', monthlyContribution: 3000, currentBalance: 28000,
    targetAmount: 50000, interestRate: 3.0, startDate: '2025-06-01T00:00:00Z',
    lastUpdatedBalance: '2026-03-01T00:00:00Z', status: 'ACTIVE', notes: 'Beach trip 2027',
    createdAt: '2025-06-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'demo-s3', userId: 'demo', name: 'Retirement', institution: 'Vanguard',
    type: 'RETIREMENT', monthlyContribution: 8000, currentBalance: 250000,
    targetAmount: null, interestRate: 7.0, startDate: '2023-01-01T00:00:00Z',
    lastUpdatedBalance: '2026-03-01T00:00:00Z', status: 'ACTIVE', notes: null,
    createdAt: '2023-01-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
  },
];

export const DEMO_SAVINGS_HISTORY: SavingsTransactionRecord[] = [
  { id: 'demo-st1', userId: 'demo', savingsGoalId: 'demo-s1', amount: 5000, type: 'DEPOSIT', date: '2026-03-01', notes: 'Monthly contribution', createdAt: now, updatedAt: now },
  { id: 'demo-st2', userId: 'demo', savingsGoalId: 'demo-s1', amount: 5000, type: 'DEPOSIT', date: '2026-02-01', notes: 'Monthly contribution', createdAt: now, updatedAt: now },
  { id: 'demo-st3', userId: 'demo', savingsGoalId: 'demo-s1', amount: 320, type: 'INTEREST', date: '2026-02-28', notes: null, createdAt: now, updatedAt: now },
];

// ── Game ──────────────────────────────────────────────────────────

export const DEMO_GAME_PROFILE = {
  id: 'demo',
  userId: 'demo',
  xp: 4250,
  level: 12,
  currentStreak: 15,
  longestStreak: 23,
  lastActiveDate: now,
  totalBadges: 18,
  financialHealthScore: 78,
  moneyPersonality: 'Strategic Planner',
  currentXP: 650,
  xpNeeded: 1300,
  progress: 50,
};

export const DEMO_BADGES = [
  { id: 'demo-badge1', key: 'first_budget', name: 'Budget Beginner', description: 'Created your first budget', icon: '💰', category: 'FINANCE', tier: 'BRONZE', xpReward: 50, earned: true, earnedAt: '2025-01-15T00:00:00Z', isShowcased: true },
  { id: 'demo-badge2', key: 'streak_7', name: 'Streak Master', description: '7-day login streak', icon: '🔥', category: 'ENGAGEMENT', tier: 'SILVER', xpReward: 100, earned: true, earnedAt: '2025-02-01T00:00:00Z', isShowcased: true },
  { id: 'demo-badge3', key: 'savings_10k', name: 'Smart Saver', description: 'Saved ₱10,000', icon: '🏦', category: 'SAVINGS', tier: 'SILVER', xpReward: 150, earned: true, earnedAt: '2025-03-15T00:00:00Z', isShowcased: false },
  { id: 'demo-badge4', key: 'expense_tracker', name: 'Expense Hawk', description: 'Tracked 100 expenses', icon: '🦅', category: 'FINANCE', tier: 'GOLD', xpReward: 200, earned: true, earnedAt: '2025-06-01T00:00:00Z', isShowcased: true },
  { id: 'demo-badge5', key: 'level_10', name: 'Rising Star', description: 'Reached level 10', icon: '⭐', category: 'PROGRESSION', tier: 'GOLD', xpReward: 250, earned: true, earnedAt: '2025-08-01T00:00:00Z', isShowcased: false },
  { id: 'demo-badge6', key: 'quest_master', name: 'Quest Master', description: 'Complete all quests in a week', icon: '🗡️', category: 'ENGAGEMENT', tier: 'PLATINUM', xpReward: 500, earned: false, earnedAt: null, isShowcased: false },
];

export const DEMO_EARNED_BADGES = DEMO_BADGES.filter(b => b.earned);

export const DEMO_ACTIVE_QUESTS = [
  {
    id: 'demo-q1', userId: 'demo', questDefinitionId: 'qd1', assignedAt: '2026-03-28T00:00:00Z',
    expiresAt: '2026-04-04T00:00:00Z', progress: 60, status: 'IN_PROGRESS', completedAt: null,
    questDefinition: { id: 'qd1', title: 'Track 5 Expenses', description: 'Log 5 expenses this week', type: 'DAILY', xpReward: 50, category: 'FINANCE' },
  },
  {
    id: 'demo-q2', userId: 'demo', questDefinitionId: 'qd2', assignedAt: '2026-03-28T00:00:00Z',
    expiresAt: '2026-04-04T00:00:00Z', progress: 30, status: 'IN_PROGRESS', completedAt: null,
    questDefinition: { id: 'qd2', title: 'Stay Under Budget', description: 'Keep spending under budget for 3 categories', type: 'WEEKLY', xpReward: 100, category: 'SAVINGS' },
  },
];

export const DEMO_QUEST_HISTORY = [
  {
    id: 'demo-qh1', userId: 'demo', questDefinitionId: 'qd3', assignedAt: '2026-03-21T00:00:00Z',
    expiresAt: '2026-03-28T00:00:00Z', progress: 100, status: 'COMPLETED', completedAt: '2026-03-27T00:00:00Z',
    questDefinition: { id: 'qd3', title: 'Budget Check-in', description: 'Review your budget summary', type: 'DAILY', xpReward: 25, category: 'FINANCE' },
  },
];

export const DEMO_STREAKS = {
  current: 15,
  longest: 23,
  isAtRisk: false,
  freezesRemaining: 2,
  nextMilestone: 30,
  lastActiveDate: now,
};

export const DEMO_HEALTH_SCORE = {
  score: 78,
  tier: 'GOOD',
  tierTitle: 'Good',
  tierEmoji: '💪',
  components: { budget: 85, savings: 71, emergency: 70, debt: 80, consistency: 82 },
  trend: 'up' as const,
  history: [
    { id: 'hs1', score: 72, tier: 'GOOD', calculatedAt: '2026-02-01T00:00:00Z' },
    { id: 'hs2', score: 75, tier: 'GOOD', calculatedAt: '2026-02-15T00:00:00Z' },
    { id: 'hs3', score: 78, tier: 'GOOD', calculatedAt: '2026-03-01T00:00:00Z' },
  ],
};

export const DEMO_AVATAR = {
  avatar: {
    id: 'demo-av', userId: 'demo', baseId: 'ai1',
    hatId: null, backgroundId: null, frameId: null, accessoryId: null, title: null,
  },
  items: [
    { id: 'ai1', name: 'Adventurer', type: 'BASE', unlockCondition: 'FREE', unlockValue: null, imageUrl: '🧑', unlocked: true },
    { id: 'ai2', name: 'Warrior', type: 'BASE', unlockCondition: 'FREE', unlockValue: null, imageUrl: '⚔️', unlocked: true },
    { id: 'ai3', name: 'Wizard', type: 'BASE', unlockCondition: 'FREE', unlockValue: null, imageUrl: '🧙', unlocked: true },
    { id: 'ai4', name: 'Robot', type: 'BASE', unlockCondition: 'FREE', unlockValue: null, imageUrl: '🤖', unlocked: true },
    { id: 'ai5', name: 'Cat', type: 'BASE', unlockCondition: 'FREE', unlockValue: null, imageUrl: '🐱', unlocked: true },
    { id: 'ai6', name: 'Party Hat', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:3', imageUrl: '🎉', unlocked: true },
    { id: 'ai7', name: 'Crown', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:5', imageUrl: '👑', unlocked: true },
    { id: 'ai8', name: 'Top Hat', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:7', imageUrl: '🎩', unlocked: true },
    { id: 'ai9', name: 'Cowboy Hat', type: 'HAT', unlockCondition: 'LEVEL', unlockValue: 'level:15', imageUrl: '🤠', unlocked: false },
    { id: 'ai10', name: 'Forest', type: 'BACKGROUND', unlockCondition: 'BADGE', unlockValue: 'badge:first_step', imageUrl: '🌲', unlocked: true },
    { id: 'ai11', name: 'Ocean', type: 'BACKGROUND', unlockCondition: 'BADGE', unlockValue: 'badge:first_save', imageUrl: '🌊', unlocked: true },
    { id: 'ai12', name: 'Space', type: 'BACKGROUND', unlockCondition: 'BADGE', unlockValue: 'badge:lightning', imageUrl: '🌌', unlocked: false },
    { id: 'ai13', name: 'Wooden Frame', type: 'FRAME', unlockCondition: 'FREE', unlockValue: null, imageUrl: '🪵', unlocked: true },
    { id: 'ai14', name: 'Gold Frame', type: 'FRAME', unlockCondition: 'LEVEL', unlockValue: 'level:30', imageUrl: '🥇', unlocked: false },
    { id: 'ai15', name: 'Sunglasses', type: 'ACCESSORY', unlockCondition: 'FREE', unlockValue: null, imageUrl: '🕶️', unlocked: true },
    { id: 'ai16', name: 'Shield', type: 'ACCESSORY', unlockCondition: 'BADGE', unlockValue: 'badge:safety_net', imageUrl: '🛡️', unlocked: false },
  ],
};

// ── Social / Challenges ───────────────────────────────────────────

export const DEMO_CHALLENGES = [
  {
    id: 'demo-ch1', title: 'No-Spend Weekend', description: 'Go the entire weekend without spending',
    type: 'MONTHLY', month: 3, xpReward: 200, exclusiveBadgeKey: null,
    completionCriteria: { type: 'no_spend', days: 2 }, participantCount: 142,
    userProgress: { progress: 50, status: 'IN_PROGRESS', completedAt: null },
  },
  {
    id: 'demo-ch2', title: 'Savings Sprint', description: 'Save 5,000 extra this month',
    type: 'MONTHLY', month: 3, xpReward: 300, exclusiveBadgeKey: 'savings_sprint',
    completionCriteria: { type: 'save_amount', amount: 5000 }, participantCount: 89,
    userProgress: { progress: 80, status: 'IN_PROGRESS', completedAt: null },
  },
];

export const DEMO_CHALLENGE_LEADERBOARD = {
  entries: [
    { rank: 1, userId: 'u1', name: 'Alex M.', completedChallenges: 12 },
    { rank: 2, userId: 'u2', name: 'Sam K.', completedChallenges: 10 },
    { rank: 3, userId: 'demo', name: 'Demo User', completedChallenges: 8 },
    { rank: 4, userId: 'u3', name: 'Jordan L.', completedChallenges: 7 },
    { rank: 5, userId: 'u4', name: 'Casey B.', completedChallenges: 5 },
  ],
  totalEntries: 142,
  page: 1,
  totalPages: 15,
};

export const DEMO_LEADERBOARD = {
  entries: [
    { rank: 1, userId: 'u1', displayName: 'Alex M.', avatarEmoji: '🦊', level: 25, score: 12500, medalEmoji: '🥇' },
    { rank: 2, userId: 'u2', displayName: 'Sam K.', avatarEmoji: '🐻', level: 22, score: 10800, medalEmoji: '🥈' },
    { rank: 3, userId: 'u3', displayName: 'Jordan L.', avatarEmoji: '🦁', level: 20, score: 9500, medalEmoji: '🥉' },
    { rank: 4, userId: 'demo', displayName: 'Demo User', avatarEmoji: '🐱', level: 12, score: 4250, medalEmoji: null },
    { rank: 5, userId: 'u4', displayName: 'Casey B.', avatarEmoji: '🐼', level: 11, score: 3900, medalEmoji: null },
  ],
  totalEntries: 250,
  page: 1,
  totalPages: 25,
};

export const DEMO_LEADERBOARD_OPT_IN = {
  id: 'demo-opt',
  isOptedIn: true,
  displayName: 'Demo User',
};

export const DEMO_MY_RANK = {
  rank: 4,
  score: 4250,
  displayName: 'Demo User',
  level: 12,
  totalParticipants: 250,
};

export const DEMO_GUILDS = [
  {
    id: 'demo-g1', name: 'Budget Warriors', description: 'A guild for budget enthusiasts',
    isPublic: true, memberCount: 12, myRole: 'MEMBER',
    activeChallenge: { id: 'gc1', title: 'Guild Savings Race', currentValue: 35000, targetValue: 50000 },
  },
];

export const DEMO_GUILD_DISCOVER = {
  guilds: [
    { id: 'demo-g1', name: 'Budget Warriors', description: 'A guild for budget enthusiasts', memberCount: 12, maxMembers: 25, isMember: true, createdAt: '2025-09-01T00:00:00Z' },
    { id: 'demo-g2', name: 'Savings Squad', description: 'Save more, spend less', memberCount: 8, maxMembers: 20, isMember: false, createdAt: '2025-10-15T00:00:00Z' },
    { id: 'demo-g3', name: 'Investment Club', description: 'Learn and grow your wealth', memberCount: 15, maxMembers: 30, isMember: false, createdAt: '2025-08-01T00:00:00Z' },
  ],
  totalGuilds: 3,
  page: 1,
  totalPages: 1,
};

export const DEMO_GUILD_DETAIL = {
  id: 'demo-g1', name: 'Budget Warriors', description: 'A guild for budget enthusiasts',
  inviteCode: 'DEMO123', isPublic: true, maxMembers: 25, createdAt: '2025-09-01T00:00:00Z',
  myRole: 'MEMBER',
  members: [
    { id: 'm1', userId: 'u1', name: 'Alex M.', role: 'LEADER', joinedAt: '2025-09-01T00:00:00Z' },
    { id: 'm2', userId: 'demo', name: 'Demo User', role: 'MEMBER', joinedAt: '2025-10-01T00:00:00Z' },
    { id: 'm3', userId: 'u2', name: 'Sam K.', role: 'MEMBER', joinedAt: '2025-10-15T00:00:00Z' },
  ],
  challenges: [
    { id: 'gc1', title: 'Guild Savings Race', targetType: 'SAVINGS', targetValue: 50000, currentValue: 35000, status: 'ACTIVE', xpReward: 500 },
  ],
  messages: [
    { id: 'msg1', userId: 'u1', userName: 'Alex M.', content: 'Welcome to Budget Warriors!', createdAt: '2026-03-25T10:00:00Z' },
    { id: 'msg2', userId: 'u2', userName: 'Sam K.', content: 'Great progress on the savings challenge!', createdAt: '2026-03-27T14:30:00Z' },
  ],
};

export const DEMO_GUILD_LEADERBOARD = [
  { rank: 1, userId: 'u1', name: 'Alex M.', role: 'LEADER', xp: 8500, level: 18 },
  { rank: 2, userId: 'u2', name: 'Sam K.', role: 'MEMBER', xp: 6200, level: 15 },
  { rank: 3, userId: 'demo', name: 'Demo User', role: 'MEMBER', xp: 4250, level: 12 },
];

// ── Wishlist ──────────────────────────────────────────────────────

export const DEMO_WISHLIST = [
  { id: 'demo-w1', userId: 'demo', name: 'New Laptop', price: '45000', savedAmount: '28000', imageUrl: null, productUrl: null, linkedSavingsGoalId: null, priority: 'HIGH' as const, status: 'SAVING' as const, createdAt: '2026-01-01T00:00:00Z', updatedAt: now },
  { id: 'demo-w2', userId: 'demo', name: 'Noise-Cancelling Headphones', price: '15000', savedAmount: '15000', imageUrl: null, productUrl: null, linkedSavingsGoalId: null, priority: 'MEDIUM' as const, status: 'AFFORDABLE' as const, createdAt: '2026-02-01T00:00:00Z', updatedAt: now },
  { id: 'demo-w3', userId: 'demo', name: 'Standing Desk', price: '25000', savedAmount: '5000', imageUrl: null, productUrl: null, linkedSavingsGoalId: null, priority: 'LOW' as const, status: 'SAVING' as const, createdAt: '2026-03-01T00:00:00Z', updatedAt: now },
];

// ── Daily Quote ───────────────────────────────────────────────────

export const DEMO_DAILY_QUOTE = {
  id: 1,
  text: 'A budget is telling your money where to go instead of wondering where it went.',
  author: 'Dave Ramsey',
  category: 'budgeting',
};

// ── Social Feed ───────────────────────────────────────────────────

export const DEMO_SOCIAL_FEED = {
  events: [
    { id: 'fe1', userId: 'u1', userName: 'Alex M.', eventType: 'BADGE_EARNED', displayText: 'earned the Savings Champion badge!', createdAt: '2026-03-29T10:00:00Z', reactions: { '🎉': 3, '👏': 2 } as Record<string, number>, totalReactions: 5, userReaction: null },
    { id: 'fe2', userId: 'u2', userName: 'Sam K.', eventType: 'LEVEL_UP', displayText: 'reached Level 22!', createdAt: '2026-03-28T15:30:00Z', reactions: { '🔥': 4 } as Record<string, number>, totalReactions: 4, userReaction: '🔥' },
    { id: 'fe3', userId: 'demo', userName: 'Demo User', eventType: 'STREAK_MILESTONE', displayText: 'hit a 15-day streak!', createdAt: '2026-03-27T09:00:00Z', reactions: { '🎉': 2, '💪': 1 } as Record<string, number>, totalReactions: 3, userReaction: null },
  ],
  totalEvents: 3,
  page: 1,
  totalPages: 1,
};

// ── AI Insights ───────────────────────────────────────────────────

export const DEMO_SPENDING_PATTERNS = {
  patterns: [
    { id: 'sp1', type: 'OVERSPEND', category: 'ENTERTAINMENT', deviation: 18, insight: 'Entertainment spending is 18% above your 3-month average', period: 'March 2026' },
    { id: 'sp2', type: 'TRENDING_UP', category: 'FOOD_DINING', deviation: 8, insight: 'Food & Dining costs have increased steadily over the past 3 months', period: 'Q1 2026' },
    { id: 'sp3', type: 'UNDERSPEND', category: 'TRANSPORTATION', deviation: -12, insight: 'Transportation spending is 12% below budget — great job!', period: 'March 2026' },
  ],
};

export const DEMO_BUDGET_SUGGESTIONS = {
  suggestions: [
    { id: 'bs1', category: 'ENTERTAINMENT', currentAmount: 5000, suggestedAmount: 4000, reasoning: 'Based on your 3-month average and income, reducing entertainment by 20% could increase savings', estimatedSavings: 1000, status: 'PENDING' },
    { id: 'bs2', category: 'FOOD_DINING', currentAmount: 10000, suggestedAmount: 9000, reasoning: 'Slight reduction aligned with actual spending patterns', estimatedSavings: 1000, status: 'PENDING' },
  ],
};

export const DEMO_CASH_FLOW = {
  dailyBalances: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    date: `2026-03-${String(i + 1).padStart(2, '0')}`,
    projectedBalance: Math.max(0, 45000 - (i * 1500) + (i === 24 ? 40000 : 0)),
    isProjected: i > 28,
  })),
  projectedZeroDate: null,
  summary: 'Your cash flow is healthy. Income on the 25th provides a comfortable buffer for end-of-month expenses.',
  stats: { totalBudget: 35000, totalSpent: 28500, remaining: 6500, dailySpendRate: 950, daysRemaining: 2 },
};

// ── Notifications ─────────────────────────────────────────────────

export const DEMO_NOTIFICATION_PREFERENCES = {
  achievementAlerts: true,
  billReminders: true,
  budgetWarnings: true,
  challengeDeadlines: true,
  dailyTips: false,
  streakWarnings: true,
  userId: 'demo',
  weeklySummary: true,
};

// ── Accounts ──────────────────────────────────────────────────────

export const DEMO_ACCOUNTS = [
  {
    id: 'demo-acc1', userId: 'demo', accountType: 'CHECKING' as const, bankName: 'National Bank',
    accountName: 'Main Checking', accountNumber: null, currentBalance: 32000,
    interestRate: null, status: 'ACTIVE' as const, expiryDate: null, cutoffDate: null,
    statementDate: null, creditLimit: null, minimumPaymentDue: null, paymentDueDate: null,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: now, calculations: {},
  },
  {
    id: 'demo-acc2', userId: 'demo', accountType: 'SAVINGS' as const, bankName: 'Online Bank',
    accountName: 'High-Yield Savings', accountNumber: null, currentBalance: 85000,
    interestRate: 4.5, status: 'ACTIVE' as const, expiryDate: null, cutoffDate: null,
    statementDate: null, creditLimit: null, minimumPaymentDue: null, paymentDueDate: null,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: now, calculations: {},
  },
  {
    id: 'demo-acc3', userId: 'demo', accountType: 'CREDIT_CARD' as const, bankName: 'Bank Plus',
    accountName: 'Rewards Card', accountNumber: null, currentBalance: 12000,
    interestRate: 18.0, status: 'ACTIVE' as const, expiryDate: '2028-12-31', cutoffDate: 15,
    statementDate: 20, creditLimit: 50000, minimumPaymentDue: 2500, paymentDueDate: '2026-04-05',
    createdAt: '2025-03-01T00:00:00Z', updatedAt: now,
    calculations: { availableCredit: 38000, utilizationRate: 24 },
  },
];

export const DEMO_ACCOUNT_DASHBOARD = {
  totalLiquidAssets: 117000,
  totalCreditLimit: 50000,
  totalCreditBalance: 12000,
  totalAvailableCredit: 38000,
  totalCreditUtilization: 24,
  accountCounts: { savings: 1, checking: 1, creditCards: 1, debitCards: 0 },
  alerts: [
    { type: 'payment_due', accountId: 'demo-acc3', accountName: 'Rewards Card', message: 'Payment due on April 5', severity: 'info' as const },
  ],
};
