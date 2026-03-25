'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { SavingsGoalCard } from '@/components/savings/SavingsGoalCard';
import { SavingsGoalDialog } from '@/components/savings/SavingsGoalDialog';
import {
  useCreateSavingsGoalMutation,
  useCreateSavingsTransactionMutation,
  useDeleteSavingsGoalMutation,
  useSavingsGoalsQuery,
  useUpdateSavingsGoalMutation,
} from '@/hooks/api/useSavingsHooks';
import { formatCurrency } from '@/lib/expense-ui';
import type { SavingsGoalPayload, SavingsGoalRecord, SavingsTransactionPayload } from '@/types/savings';

export default function InvestmentsPage() {
  const savingsGoalsQuery = useSavingsGoalsQuery();
  const createGoalMutation = useCreateSavingsGoalMutation();
  const updateGoalMutation = useUpdateSavingsGoalMutation();
  const deleteGoalMutation = useDeleteSavingsGoalMutation();
  const createTransactionMutation = useCreateSavingsTransactionMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoalRecord | null>(null);

  const goals = useMemo(() => savingsGoalsQuery.data ?? [], [savingsGoalsQuery.data]);
  const portfolioMetrics = useMemo(() => {
    const totalBalance = goals.reduce((sum, goal) => sum + Number(goal.currentBalance), 0);
    const monthlyContribution = goals.reduce((sum, goal) => sum + Number(goal.monthlyContribution), 0);
    const targetAmount = goals.reduce((sum, goal) => sum + Number(goal.targetAmount ?? 0), 0);
    const activeGoals = goals.filter((goal) => goal.status === 'ACTIVE').length;

    return {
      activeGoals,
      monthlyContribution,
      targetAmount,
      totalBalance,
    };
  }, [goals]);

  async function handleGoalSubmit(payload: SavingsGoalPayload) {
    try {
      if (editingGoal) {
        await updateGoalMutation.mutateAsync({ id: editingGoal.id, payload });
        toast.success('Savings goal updated');
      } else {
        await createGoalMutation.mutateAsync(payload);
        toast.success('Savings goal created');
      }

      setDialogOpen(false);
      setEditingGoal(null);
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('Failed to save goal');
    }
  }

  async function handleDelete(goal: SavingsGoalRecord) {
    if (!window.confirm(`Delete ${goal.name}?`)) {
      return;
    }

    try {
      await deleteGoalMutation.mutateAsync(goal.id);
      toast.success('Savings goal deleted');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  }

  async function handleTransaction(goalId: string, payload: SavingsTransactionPayload) {
    try {
      await createTransactionMutation.mutateAsync({ id: goalId, payload });
      toast.success('Savings transaction logged');
    } catch (error) {
      console.error('Error logging transaction:', error);
      toast.error('Failed to log transaction');
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.08),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.08),_transparent_24%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">Savings & Investments</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
                  Turn goals into balances you can actually watch grow.
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Track emergency funds, retirement, education, and investment buckets with progress visuals and transaction history.
                </p>
              </div>
              <Button onClick={() => { setEditingGoal(null); setDialogOpen(true); }}>
                Add Savings Goal
              </Button>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card><CardContent className="p-6"><p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Total Balance</p><p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">{formatCurrency(portfolioMetrics.totalBalance)}</p></CardContent></Card>
            <Card><CardContent className="p-6"><p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Monthly Contribution</p><p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">{formatCurrency(portfolioMetrics.monthlyContribution)}</p></CardContent></Card>
            <Card><CardContent className="p-6"><p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Combined Targets</p><p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">{formatCurrency(portfolioMetrics.targetAmount)}</p></CardContent></Card>
            <Card><CardContent className="p-6"><p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Active Goals</p><p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">{portfolioMetrics.activeGoals}</p></CardContent></Card>
          </div>

          <div className="grid gap-6">
            {savingsGoalsQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-[2rem] bg-slate-100 dark:bg-slate-900" />)
            ) : goals.length === 0 ? (
              <Card className="rounded-[2rem] border-dashed"><CardContent className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">No savings goals yet. Create one to start tracking progress and deposits.</CardContent></Card>
            ) : (
              goals.map((goal) => (
                <SavingsGoalCard
                  key={goal.id}
                  goal={goal}
                  isDeleting={deleteGoalMutation.isPending}
                  isSubmittingTransaction={createTransactionMutation.isPending}
                  onDelete={handleDelete}
                  onEdit={(selectedGoal) => { setEditingGoal(selectedGoal); setDialogOpen(true); }}
                  onSubmitTransaction={handleTransaction}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <SavingsGoalDialog
        key={`${editingGoal?.id ?? 'new-goal'}-${dialogOpen ? 'open' : 'closed'}`}
        goal={editingGoal}
        isPending={createGoalMutation.isPending || updateGoalMutation.isPending}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingGoal(null);
          }
        }}
        onSubmit={handleGoalSubmit}
        open={dialogOpen}
      />
    </DashboardLayout>
  );
}