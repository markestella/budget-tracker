'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownCircle, ArrowUpCircle, PiggyBank, Trash2 } from 'lucide-react';

import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Input from '@/components/ui/Input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, getSavingsTypeBadgeClass, getSavingsTypeLabel } from '@/lib/expense-ui';
import { useSavingsHistoryQuery } from '@/hooks/api/useSavingsHooks';
import type { SavingsGoalRecord, SavingsTransactionPayload, SavingsTransactionType } from '@/types/savings';

interface SavingsGoalCardProps {
  goal: SavingsGoalRecord;
  isDeleting?: boolean;
  isSubmittingTransaction?: boolean;
  onDelete: (goal: SavingsGoalRecord) => void;
  onEdit: (goal: SavingsGoalRecord) => void;
  onSubmitTransaction: (goalId: string, payload: SavingsTransactionPayload) => Promise<void> | void;
}

function labelizeStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function SavingsGoalCard({ goal, isDeleting, isSubmittingTransaction, onDelete, onEdit, onSubmitTransaction }: SavingsGoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<SavingsTransactionType>('DEPOSIT');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const historyQuery = useSavingsHistoryQuery(goal.id, expanded);

  const currentBalance = Number(goal.currentBalance);
  const targetAmount = goal.targetAmount ? Number(goal.targetAmount) : null;
  const progress = targetAmount && targetAmount > 0 ? Math.min((currentBalance / targetAmount) * 100, 100) : 0;

  const chartData = useMemo(() => {
    const transactions = historyQuery.data ?? [];

    return transactions.reduce<Array<{ balance: number; date: string }>>((accumulator, transaction) => {
      const previousBalance = accumulator.length > 0 ? accumulator[accumulator.length - 1].balance : 0;
      const transactionAmount = Number(transaction.amount);
      const nextBalance = transaction.type === 'WITHDRAWAL'
        ? previousBalance - transactionAmount
        : previousBalance + transactionAmount;

      accumulator.push({
        balance: nextBalance,
        date: new Date(transaction.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
      });

      return accumulator;
    }, []);
  }, [historyQuery.data]);

  async function handleTransactionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return;
    }

    await onSubmitTransaction(goal.id, {
      amount: numericAmount,
      date: new Date().toISOString(),
      notes: notes.trim() || undefined,
      type: transactionType,
    });

    setAmount('');
    setNotes('');
    setTransactionDialogOpen(false);
  }

  return (
    <>
      <Card className="overflow-hidden rounded-[2rem] border-white/60 bg-white/90 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.4)] dark:border-slate-800/80 dark:bg-slate-950/85">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{goal.name}</CardTitle>
                <Badge className={getSavingsTypeBadgeClass(goal.type)}>{getSavingsTypeLabel(goal.type)}</Badge>
                <Badge variant="outline">{labelizeStatus(goal.status)}</Badge>
              </div>
              <CardDescription className="mt-1">{goal.institution}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setTransactionType('DEPOSIT'); setTransactionDialogOpen(true); }}>
                <ArrowUpCircle className="size-4" />
                Add Deposit
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setTransactionType('WITHDRAWAL'); setTransactionDialogOpen(true); }}>
                <ArrowDownCircle className="size-4" />
                Update Balance
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-slate-200/70 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="relative flex size-36 items-center justify-center">
                <svg className="size-36 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" stroke="rgba(148,163,184,0.18)" strokeWidth="10" fill="none" />
                  <motion.circle
                    animate={{ strokeDashoffset: 314 - (314 * progress) / 100 }}
                    cx="60"
                    cy="60"
                    fill="none"
                    initial={{ strokeDashoffset: 314 }}
                    r="50"
                    stroke="url(#progress-gradient)"
                    strokeDasharray="314"
                    strokeLinecap="round"
                    strokeWidth="10"
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient id="progress-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--chart-2)" />
                      <stop offset="100%" stopColor="var(--chart-1)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <PiggyBank className="size-5 text-slate-500 dark:text-slate-400" />
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">{Math.round(progress)}%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">funded</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
                  {formatCurrency(goal.currentBalance)}
                  {targetAmount ? ` / ${formatCurrency(targetAmount)}` : ''}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Monthly contribution {formatCurrency(goal.monthlyContribution)} · Last updated {new Date(goal.lastUpdatedBalance).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <Progress value={progress} className="gap-2" />

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Monthly</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-100">{formatCurrency(goal.monthlyContribution)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Interest</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-100">{goal.interestRate ? `${goal.interestRate}%` : 'N/A'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Remaining</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-100">{targetAmount ? formatCurrency(Math.max(targetAmount - currentBalance, 0)) : 'Open-ended'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setExpanded((current) => !current)}>
                  {expanded ? 'Hide History' : 'View History'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => onEdit(goal)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(goal)} isLoading={isDeleting}>
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>

          {expanded ? (
            <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
              <Card className="rounded-[1.75rem] border-slate-200/70 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40">
                <CardHeader>
                  <CardTitle className="text-lg">Growth Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.length === 0 ? (
                    <div className="flex h-48 sm:h-56 md:h-64 items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300/80 bg-white/70 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-400">
                      No transactions logged yet.
                    </div>
                  ) : (
                    <div className="h-48 sm:h-56 md:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value: number) => formatCurrency(value)} width={84} />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Line dataKey="balance" stroke="var(--chart-2)" strokeWidth={3} dot={{ r: 3 }} type="monotone" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-[1.75rem] border-slate-200/70 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40">
                <CardHeader>
                  <CardTitle className="text-lg">Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  {historyQuery.isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />)}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(historyQuery.data ?? []).map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{new Date(transaction.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                            <TableCell>{labelizeStatus(transaction.type)}</TableCell>
                            <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
        <DialogContent className="max-w-md rounded-[2rem] bg-white dark:bg-slate-950">
          <form onSubmit={handleTransactionSubmit}>
            <DialogHeader>
              <DialogTitle>{transactionType === 'DEPOSIT' ? 'Add Deposit' : 'Update Balance'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input label="Amount (₱)" type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required />
              <Input label="Type" value={labelizeStatus(transactionType)} disabled />
              <Input label="Date" type="date" value={new Date().toISOString().split('T')[0]} disabled />
              <Input label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTransactionDialogOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={isSubmittingTransaction}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}