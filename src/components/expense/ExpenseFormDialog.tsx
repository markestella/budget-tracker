'use client';

import { useState, useEffect, useRef } from 'react';

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
import { budgetCategoryLabels } from '@/lib/expense-ui';
import { useAutoCategorize } from '@/hooks/api/useAutoCategorizeHook';
import type { Account } from '@/hooks/api/useAccountHooks';
import type { BudgetItem } from '@/types/budgets';
import type { ExpensePayload, ExpenseRecord } from '@/types/expenses';

const expenseCategories = Object.keys(budgetCategoryLabels);

interface ExpenseFormDialogProps {
  accounts: Account[];
  budgetItems?: BudgetItem[];
  expense?: ExpenseRecord | null;
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ExpensePayload) => Promise<void> | void;
  open: boolean;
}

interface FormState {
  amount: string;
  category: string;
  date: string;
  isRecurring: boolean;
  linkedAccountId: string;
  linkedBudgetItemId: string;
  merchant: string;
  notes: string;
}

function createInitialState(expense?: ExpenseRecord | null): FormState {
  return {
    amount: expense ? String(expense.amount) : '',
    category: expense?.category ?? 'FOOD_DINING',
    date: expense?.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
    isRecurring: expense?.isRecurring ?? false,
    linkedAccountId: expense?.linkedAccountId ?? 'none',
    linkedBudgetItemId: expense?.linkedBudgetItemId ?? 'none',
    merchant: expense?.merchant ?? '',
    notes: expense?.notes ?? '',
  };
}

export function ExpenseFormDialog({
  accounts,
  budgetItems = [],
  expense,
  isPending,
  onOpenChange,
  onSubmit,
  open,
}: ExpenseFormDialogProps) {
  const [form, setForm] = useState<FormState>(() => createInitialState(expense));
  const categorizeMut = useAutoCategorize();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Auto-categorize when merchant changes (only for new expenses)
  useEffect(() => {
    if (expense) return; // skip for edits
    const merchant = form.merchant.trim();
    if (merchant.length < 3) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      categorizeMut.mutate(merchant, {
        onSuccess: (data) => {
          if (data.confidence >= 0.6) {
            setForm((current) => ({ ...current, category: data.category }));
          }
        },
      });
    }, 500);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form.merchant]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0 || !form.merchant.trim()) {
      return;
    }

    await onSubmit({
      amount,
      category: form.category as ExpensePayload['category'],
      date: form.date,
      isRecurring: form.isRecurring,
      linkedAccountId: form.linkedAccountId !== 'none' ? form.linkedAccountId : undefined,
      linkedBudgetItemId: form.linkedBudgetItemId !== 'none' ? form.linkedBudgetItemId : undefined,
      merchant: form.merchant.trim(),
      notes: form.notes.trim() || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[2rem] bg-white p-0 dark:bg-slate-950">
        <form key={expense?.id ?? 'new'} onSubmit={handleSubmit}>
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{expense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
            <DialogDescription>
              Capture merchant, amount, category, account linkage, and optional notes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 p-6 pt-4 md:grid-cols-2">
            <Input
              label="Amount (₱)"
              min="0"
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              placeholder="1250"
              required
              step="0.01"
              type="number"
              value={form.amount}
            />
            <Input
              label="Merchant"
              onChange={(event) => setForm((current) => ({ ...current, merchant: event.target.value }))}
              placeholder="SM Hypermarket"
              required
              value={form.merchant}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground/90">Category</label>
              <Select value={form.category} onValueChange={(value) => setForm((current) => ({ ...current, category: value ?? current.category }))}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {budgetCategoryLabels[category as keyof typeof budgetCategoryLabels]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input
              label="Date"
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              required
              type="date"
              value={form.date}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground/90">Card / Account</label>
              <Select value={form.linkedAccountId} onValueChange={(value) => setForm((current) => ({ ...current, linkedAccountId: value ?? 'none' }))}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No linked card</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountName} · {account.bankName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground/90">Linked Budget Item</label>
              <Select value={form.linkedBudgetItemId} onValueChange={(value) => setForm((current) => ({ ...current, linkedBudgetItemId: value ?? 'none' }))}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select budget item" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No linked budget item</SelectItem>
                  {budgetItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-300 md:col-span-2">
              <input
                checked={form.isRecurring}
                onChange={(event) => setForm((current) => ({ ...current, isRecurring: event.target.checked }))}
                type="checkbox"
              />
              Mark as recurring expense
            </label>

            <div className="md:col-span-2">
              <Textarea
                helperText="Optional note or receipt detail"
                label="Notes"
                maxLength={280}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Optional notes"
                value={form.notes}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 px-6 pb-6 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button isLoading={isPending} type="submit">
              {expense ? 'Save Changes' : 'Create Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}