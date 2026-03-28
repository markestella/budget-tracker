'use client';

import React, { createContext, useContext } from 'react';

interface DemoContextValue {
  isDemo: boolean;
  guardMutation: () => boolean;
}

const DemoContext = createContext<DemoContextValue>({
  isDemo: false,
  guardMutation: () => true,
});

export function useDemo() {
  return useContext(DemoContext);
}

// Static demo data matching real dashboard types
export const DEMO_DASHBOARD = {
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
    totalIncomeThisMonth: { direction: 'up' as const, percentage: 5.2 },
    totalExpensesThisMonth: { direction: 'down' as const, percentage: 3.1 },
    netSavings: { direction: 'up' as const, percentage: 12.4 },
    budgetUsedPercent: { direction: 'down' as const, percentage: 2.8 },
  },
};

export const DEMO_CHARTS = {
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

export const DEMO_GAME_PROFILE = {
  id: 'demo',
  userId: 'demo',
  xp: 4250,
  level: 12,
  currentStreak: 15,
  longestStreak: 23,
  lastActiveDate: new Date().toISOString(),
  totalBadges: 18,
  financialHealthScore: 78,
  moneyPersonality: 'Strategic Planner',
  currentLevelXp: 3600,
  nextLevelXp: 4900,
  progressPercent: 50,
};

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const guardMutation = () => {
    return false;
  };

  return (
    <DemoContext.Provider value={{ isDemo: true, guardMutation }}>
      {children}
    </DemoContext.Provider>
  );
}
