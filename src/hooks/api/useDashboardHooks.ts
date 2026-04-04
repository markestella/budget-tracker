'use client';

import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/hooks/api/apiClient';
import { useDemo } from '@/components/providers/DemoProvider';
import { DEMO_DASHBOARD, DEMO_CHARTS } from '@/lib/demo-data';

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
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: isDemo ? () => Promise.resolve(DEMO_DASHBOARD) : fetchDashboardSummary,
    staleTime: isDemo ? Infinity : undefined,
  });
}

export function useDashboardChartsQuery() {
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: dashboardKeys.charts(),
    queryFn: isDemo ? () => Promise.resolve(DEMO_CHARTS) : fetchDashboardCharts,
    staleTime: isDemo ? Infinity : undefined,
  });
}