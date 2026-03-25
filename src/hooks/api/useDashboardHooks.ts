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
  totalBudgetThisMonth: number;
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

export interface DashboardMonthlyTrendDatum {
  month: string;
  income: number;
  expenses: number;
}

export interface DashboardCategoryBreakdownDatum {
  category: string;
  amount: number;
  percentage: number;
}

export interface DashboardBudgetProgressDatum {
  category: string;
  spent: number;
  budget: number;
  percentage: number;
}

export interface DashboardCharts {
  monthlyTrend: DashboardMonthlyTrendDatum[];
  categoryBreakdown: DashboardCategoryBreakdownDatum[];
  budgetProgress: DashboardBudgetProgressDatum[];
}

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
  charts: () => [...dashboardKeys.all, 'charts'] as const,
};

const fetchDashboardSummary = () => apiClient<DashboardSummary>('/api/dashboard');
const fetchDashboardCharts = () => apiClient<DashboardCharts>('/api/dashboard/charts');

export function useDashboardQuery() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: fetchDashboardSummary,
  });
}

export function useDashboardChartsQuery() {
  return useQuery({
    queryKey: dashboardKeys.charts(),
    queryFn: fetchDashboardCharts,
  });
}