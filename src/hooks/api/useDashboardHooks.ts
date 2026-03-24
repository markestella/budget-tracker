'use client';

import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/hooks/api/apiClient';

export type DashboardTrendDirection = 'up' | 'down' | 'flat';

export interface DashboardTrend {
  direction: DashboardTrendDirection;
  percentage: number;
}

export interface DashboardCategory {
  category: string;
  amount: number;
}

export interface DashboardSummary {
  totalIncomeThisMonth: number;
  totalExpensesThisMonth: number;
  netSavings: number;
  budgetUsedPercent: number;
  topCategories: DashboardCategory[];
  trends: {
    totalIncomeThisMonth: DashboardTrend;
    totalExpensesThisMonth: DashboardTrend;
    netSavings: DashboardTrend;
    budgetUsedPercent: DashboardTrend;
  };
}

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
};

const fetchDashboardSummary = () => apiClient<DashboardSummary>('/api/dashboard');

export function useDashboardQuery() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: fetchDashboardSummary,
  });
}