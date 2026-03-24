'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';

type NumericValue = number | string;
type IncomeCategory =
  | 'SALARY'
  | 'FREELANCE'
  | 'BUSINESS'
  | 'INVESTMENT'
  | 'RENTAL'
  | 'PENSION'
  | 'BENEFITS'
  | 'OTHER';
type PaymentFrequency =
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'YEARLY'
  | 'ONE_TIME';
type ScheduleWeek = 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH' | 'LAST';
type IncomeRecordStatus = 'PENDING' | 'RECEIVED' | 'MISSED' | 'CANCELLED';

export interface IncomeSource {
  id: string;
  userId: string;
  name: string;
  category: IncomeCategory;
  description: string | null;
  frequency: PaymentFrequency;
  amount: NumericValue;
  scheduleDays: number[] | null;
  scheduleWeekday: number | null;
  scheduleWeek: ScheduleWeek | null;
  scheduleTime: string | null;
  useManualAmounts: boolean;
  scheduleDayAmounts: Record<number, NumericValue> | null;
  createdAt: string;
  updatedAt: string;
  incomeRecords: Array<{
    id: string;
    expectedDate: string;
    actualAmount: NumericValue | null;
    actualDate: string | null;
    status: IncomeRecordStatus;
    notes: string | null;
  }>;
  _count: {
    incomeRecords: number;
  };
}

export interface IncomeRecord {
  id: string;
  userId: string;
  incomeSourceId: string;
  expectedDate: string;
  actualAmount: NumericValue | null;
  actualDate: string | null;
  status: IncomeRecordStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  incomeSource: {
    name: string;
    category: IncomeCategory;
    frequency: PaymentFrequency;
  };
}

export interface IncomeMutationInput {
  incomeSourceId: string;
  expectedDate: string;
  actualAmount?: number;
  actualDate?: string;
  status?: IncomeRecordStatus;
  notes?: string;
}

export const incomeKeys = {
  all: ['income'] as const,
  sources: () => [...incomeKeys.all, 'sources'] as const,
  records: () => [...incomeKeys.all, 'records'] as const,
};

const fetchIncomeSources = () =>
  apiClient<IncomeSource[]>('/api/income/sources');

const createIncomeRecord = (payload: IncomeMutationInput) =>
  apiClient<IncomeRecord>('/api/income/records', {
    method: 'POST',
    body: payload,
  });

export function useIncomeSourcesQuery() {
  return useQuery({
    queryKey: incomeKeys.sources(),
    queryFn: fetchIncomeSources,
  });
}

export function useIncomeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIncomeRecord,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: incomeKeys.sources() }),
        queryClient.invalidateQueries({ queryKey: incomeKeys.records() }),
      ]);
    },
  });
}