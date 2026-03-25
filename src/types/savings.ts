export type NumericValue = number | string;

export type SavingsGoalType =
  | 'EMERGENCY_FUND'
  | 'RETIREMENT'
  | 'VACATION'
  | 'EDUCATION'
  | 'INVESTMENT'
  | 'GENERAL';

export type SavingsGoalStatus = 'ACTIVE' | 'IDLE' | 'WITHDRAWN';

export type SavingsTransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'INTEREST';

export interface SavingsTransactionRecord {
  id: string;
  userId: string;
  savingsGoalId: string;
  amount: NumericValue;
  type: SavingsTransactionType;
  date: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoalRecord {
  id: string;
  userId: string;
  name: string;
  institution: string;
  type: SavingsGoalType;
  monthlyContribution: NumericValue;
  currentBalance: NumericValue;
  targetAmount: NumericValue | null;
  interestRate: NumericValue | null;
  startDate: string;
  lastUpdatedBalance: string;
  status: SavingsGoalStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  transactions?: SavingsTransactionRecord[];
}

export interface SavingsGoalPayload {
  name: string;
  institution: string;
  type: SavingsGoalType;
  monthlyContribution: number;
  currentBalance: number;
  targetAmount?: number;
  interestRate?: number;
  startDate: string;
  lastUpdatedBalance?: string;
  status?: SavingsGoalStatus;
  notes?: string;
}

export type SavingsGoalUpdatePayload = Partial<SavingsGoalPayload>;

export interface SavingsTransactionPayload {
  amount: number;
  type: SavingsTransactionType;
  date: string;
  notes?: string;
}