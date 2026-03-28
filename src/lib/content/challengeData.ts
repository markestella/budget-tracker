export interface ChallengeTemplate {
  title: string;
  description: string;
  type: 'MONTHLY' | 'SEASONAL' | 'SPECIAL_EVENT';
  month: number | null;
  completionCriteria: Record<string, unknown>;
  xpReward: number;
  exclusiveBadgeKey: string | null;
}

export const challengeData: ChallengeTemplate[] = [
  {
    title: 'Fresh Start Sprint',
    description: 'Kick off the new year! Track all expenses for 30 straight days and set budgets for every category.',
    type: 'MONTHLY',
    month: 1,
    completionCriteria: { type: 'track_expenses_and_budgets', daysRequired: 30, categoriesRequired: 8 },
    xpReward: 300,
    exclusiveBadgeKey: 'fresh-start-champion',
  },
  {
    title: 'Love Your Finances',
    description: 'Show your wallet some love! Save at least ₱5,000 this month and stay under budget in all categories.',
    type: 'MONTHLY',
    month: 2,
    completionCriteria: { type: 'save_and_budget', savingsTarget: 5000, underBudgetRequired: true },
    xpReward: 250,
    exclusiveBadgeKey: 'finance-lover',
  },
  {
    title: 'Spring Savings Surge',
    description: 'Plant the seeds of wealth! Increase your savings rate by 10% compared to last month.',
    type: 'SEASONAL',
    month: 3,
    completionCriteria: { type: 'savings_rate_increase', increasePercent: 10 },
    xpReward: 350,
    exclusiveBadgeKey: null,
  },
  {
    title: 'Mid-Year Review Rally',
    description: 'Halfway through! Review all budgets, update savings goals, and earn your milestone badge.',
    type: 'MONTHLY',
    month: 6,
    completionCriteria: { type: 'mid_year_review', reviewBudgets: true, updateGoals: true },
    xpReward: 400,
    exclusiveBadgeKey: 'mid-year-master',
  },
  {
    title: 'Spooky Savings',
    description: "Don't let your money disappear! Track every expense and keep discretionary spending under ₱3,000.",
    type: 'MONTHLY',
    month: 10,
    completionCriteria: { type: 'expense_control', trackAll: true, discretionaryLimit: 3000 },
    xpReward: 250,
    exclusiveBadgeKey: 'spooky-saver',
  },
  {
    title: 'Holiday Budget Warrior',
    description: 'Survive the holiday season! Set a gift budget, stick to it, and avoid impulse purchases for 31 days.',
    type: 'MONTHLY',
    month: 12,
    completionCriteria: { type: 'holiday_discipline', giftBudget: true, noImpulseDays: 31 },
    xpReward: 500,
    exclusiveBadgeKey: 'holiday-warrior',
  },
  {
    title: 'Budget Master',
    description: 'The ultimate challenge! Maintain a 7-day financial tracking streak and achieve a health score of 80+.',
    type: 'SPECIAL_EVENT',
    month: null,
    completionCriteria: { type: 'master_challenge', streakDays: 7, healthScoreMin: 80 },
    xpReward: 1000,
    exclusiveBadgeKey: 'budget-master',
  },
];
