'use client';

import { useState } from 'react';

import { Account } from '@/hooks/api/useAccountHooks';
import Button from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { budgetCategoryLabels } from '@/lib/budget-ui';
import type { BudgetCategory, BudgetItem, BudgetItemPayload, BudgetItemType } from '@/types/budgets';

const budgetCategories = Object.keys(budgetCategoryLabels) as BudgetCategory[];
const dueDateOptions = Array.from({ length: 31 }, (_, index) => index + 1);

interface BudgetItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: BudgetItemType;
  item?: BudgetItem | null;
  accounts: Account[];
  isPending?: boolean;
  onSubmit: (payload: BudgetItemPayload) => Promise<void> | void;
}

interface FormState {
  description: string;
  amount: string;
  dueDate: string;
  merchant: string;
  category: BudgetCategory;
  linkedAccountId: string;
  isActive: boolean;
  totalMonths: string;
  startDate: string;
}

function createInitialFormState(item?: BudgetItem | null): FormState {
  return {
    amount: item ? String(item.amount) : '',
    category: item?.category ?? 'HOUSING',
    description: item?.description ?? '',
    dueDate: item?.dueDate ? String(item.dueDate) : '1',
    isActive: item?.isActive ?? true,
    linkedAccountId: item?.linkedAccountId ?? '',
    merchant: item?.merchant ?? '',
    startDate: item?.startDate ? item.startDate.split('T')[0] : '',
    totalMonths: item?.totalMonths ? String(item.totalMonths) : '',
  };
}

function BudgetItemDialogContent({
  accounts,
  isPending,
  item,
  onOpenChange,
  onSubmit,
  resolvedType,
}: {
  accounts: Account[];
  isPending?: boolean;
  item?: BudgetItem | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: BudgetItemPayload) => Promise<void> | void;
  resolvedType: BudgetItemType;
}) {
  const [form, setForm] = useState<FormState>(() => createInitialFormState(item));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(form.amount);
    const dueDate = Number(form.dueDate);

    if (!form.description.trim() || !Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const payload: BudgetItemPayload = {
      amount,
      category: form.category,
      description: form.description.trim(),
      dueDate,
      isActive: form.isActive,
      linkedAccountId: form.linkedAccountId || undefined,
      merchant: form.merchant.trim() || undefined,
      type: resolvedType,
      ...(resolvedType === 'DURATION'
        ? {
            startDate: form.startDate,
            totalMonths: Number(form.totalMonths),
          }
        : {}),
    };

    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader className="p-6 pb-2">
        <DialogTitle>
          {item ? 'Edit Budget Item' : resolvedType === 'CONSTANT' ? 'Add Constant Expense' : 'Add Duration Expense'}
        </DialogTitle>
        <DialogDescription>
          {resolvedType === 'CONSTANT'
            ? 'Capture recurring monthly obligations such as utilities, rent, or subscriptions.'
            : 'Capture installment-based obligations and track repayment progress over time.'}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 p-6 pt-4 md:grid-cols-2">
        <Input
          label="Description"
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          placeholder="Internet bill"
          required
        />
        <Input
          label="Amount (₱)"
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
          placeholder="2500"
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground/90">Due Date</label>
          <Select value={form.dueDate} onValueChange={(value) => setForm((current) => ({ ...current, dueDate: value ?? current.dueDate }))}>
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Select a day" />
            </SelectTrigger>
            <SelectContent>
              {dueDateOptions.map((day) => (
                <SelectItem key={day} value={String(day)}>
                  Day {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Input
          label="Merchant Name"
          value={form.merchant}
          onChange={(event) => setForm((current) => ({ ...current, merchant: event.target.value }))}
          placeholder="Meralco"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground/90">Category</label>
          <Select value={form.category} onValueChange={(value) => setForm((current) => ({ ...current, category: (value ?? current.category) as BudgetCategory }))}>
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {budgetCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {budgetCategoryLabels[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground/90">Linked Account</label>
          <Select value={form.linkedAccountId || 'none'} onValueChange={(value) => setForm((current) => ({ ...current, linkedAccountId: !value || value === 'none' ? '' : value }))}>
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No linked account</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.accountName} · {account.bankName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {resolvedType === 'DURATION' ? (
          <>
            <Input
              label="Duration (months)"
              type="number"
              min="1"
              step="1"
              value={form.totalMonths}
              onChange={(event) => setForm((current) => ({ ...current, totalMonths: event.target.value }))}
              placeholder="24"
              required
            />
            <Input
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
              required
            />
          </>
        ) : null}

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-300 md:col-span-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
          />
          Keep this budget item active
        </label>
      </div>

      <DialogFooter className="rounded-b-[2rem]">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          {item ? 'Save Changes' : 'Create Budget Item'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function BudgetItemDialog({
  open,
  onOpenChange,
  type,
  item,
  accounts,
  isPending,
  onSubmit,
}: BudgetItemDialogProps) {
  const resolvedType = item?.type ?? type;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-[2rem] bg-white p-0 dark:bg-slate-950">
        <BudgetItemDialogContent
          key={`${item?.id ?? 'new'}-${resolvedType}-${open ? 'open' : 'closed'}`}
          accounts={accounts}
          isPending={isPending}
          item={item}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
          resolvedType={resolvedType}
        />
      </DialogContent>
    </Dialog>
  );
}