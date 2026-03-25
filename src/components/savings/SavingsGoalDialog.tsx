'use client';

import { useState } from 'react';

import Button from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Input from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type {
  SavingsGoalPayload,
  SavingsGoalRecord,
  SavingsGoalStatus,
  SavingsGoalType,
} from '@/types/savings';

const goalTypes: SavingsGoalType[] = ['EMERGENCY_FUND', 'RETIREMENT', 'VACATION', 'EDUCATION', 'INVESTMENT', 'GENERAL'];
const statuses: SavingsGoalStatus[] = ['ACTIVE', 'IDLE', 'WITHDRAWN'];

interface SavingsGoalDialogProps {
  goal?: SavingsGoalRecord | null;
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: SavingsGoalPayload) => Promise<void> | void;
  open: boolean;
}

interface FormState {
  currentBalance: string;
  institution: string;
  interestRate: string;
  monthlyContribution: string;
  name: string;
  notes: string;
  startDate: string;
  status: SavingsGoalStatus;
  targetAmount: string;
  type: SavingsGoalType;
}

function createInitialState(goal?: SavingsGoalRecord | null): FormState {
  return {
    currentBalance: goal ? String(goal.currentBalance) : '',
    institution: goal?.institution ?? '',
    interestRate: goal?.interestRate ? String(goal.interestRate) : '',
    monthlyContribution: goal ? String(goal.monthlyContribution) : '',
    name: goal?.name ?? '',
    notes: goal?.notes ?? '',
    startDate: goal?.startDate ? goal.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
    status: goal?.status ?? 'ACTIVE',
    targetAmount: goal?.targetAmount ? String(goal.targetAmount) : '',
    type: goal?.type ?? 'GENERAL',
  };
}

function labelize(value: string) {
  return value.toLowerCase().split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

export function SavingsGoalDialog({ goal, isPending, onOpenChange, onSubmit, open }: SavingsGoalDialogProps) {
  const [form, setForm] = useState<FormState>(() => createInitialState(goal));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const currentBalance = Number(form.currentBalance);
    const monthlyContribution = Number(form.monthlyContribution);

    if (!form.name.trim() || !form.institution.trim() || !Number.isFinite(currentBalance) || !Number.isFinite(monthlyContribution)) {
      return;
    }

    await onSubmit({
      currentBalance,
      institution: form.institution.trim(),
      interestRate: form.interestRate ? Number(form.interestRate) : undefined,
      lastUpdatedBalance: new Date().toISOString(),
      monthlyContribution,
      name: form.name.trim(),
      notes: form.notes.trim() || undefined,
      startDate: form.startDate,
      status: form.status,
      targetAmount: form.targetAmount ? Number(form.targetAmount) : undefined,
      type: form.type,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-[2rem] bg-white p-0 dark:bg-slate-950">
        <form key={goal?.id ?? 'new-goal'} onSubmit={handleSubmit}>
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{goal ? 'Edit Savings Goal' : 'Add Savings Goal'}</DialogTitle>
            <DialogDescription>Track balances, targets, contributions, and the institution holding the funds.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 p-6 pt-4 md:grid-cols-2">
            <Input label="Goal Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            <Input label="Institution" value={form.institution} onChange={(event) => setForm((current) => ({ ...current, institution: event.target.value }))} required />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground/90">Type</label>
              <Select value={form.type} onValueChange={(value) => setForm((current) => ({ ...current, type: (value ?? current.type) as SavingsGoalType }))}>
                <SelectTrigger className="h-11 w-full"><SelectValue placeholder="Goal type" /></SelectTrigger>
                <SelectContent>
                  {goalTypes.map((type) => <SelectItem key={type} value={type}>{labelize(type)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground/90">Status</label>
              <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: (value ?? current.status) as SavingsGoalStatus }))}>
                <SelectTrigger className="h-11 w-full"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => <SelectItem key={status} value={status}>{labelize(status)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Input label="Current Balance (₱)" type="number" min="0" step="0.01" value={form.currentBalance} onChange={(event) => setForm((current) => ({ ...current, currentBalance: event.target.value }))} required />
            <Input label="Monthly Contribution (₱)" type="number" min="0" step="0.01" value={form.monthlyContribution} onChange={(event) => setForm((current) => ({ ...current, monthlyContribution: event.target.value }))} required />
            <Input label="Target Amount (₱)" type="number" min="0" step="0.01" value={form.targetAmount} onChange={(event) => setForm((current) => ({ ...current, targetAmount: event.target.value }))} />
            <Input label="Interest Rate (%)" type="number" min="0" step="0.01" value={form.interestRate} onChange={(event) => setForm((current) => ({ ...current, interestRate: event.target.value }))} />
            <Input label="Start Date" type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} required />

            <div className="md:col-span-2">
              <Textarea label="Notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={3} />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 px-6 pb-6 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" isLoading={isPending}>{goal ? 'Save Goal' : 'Create Goal'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}