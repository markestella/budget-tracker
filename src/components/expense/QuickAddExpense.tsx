'use client';

import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
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
import type { Account } from '@/hooks/api/useAccountHooks';
import type { ExpensePayload } from '@/types/expenses';

interface QuickAddExpenseProps {
  accounts: Account[];
  isPending?: boolean;
  onSubmit: (payload: ExpensePayload) => Promise<void> | void;
  onOpenFullForm: () => void;
  values: ExpensePayload;
  onChange: (next: ExpensePayload) => void;
}

const expenseCategories = Object.keys(budgetCategoryLabels);

export function QuickAddExpense({
  accounts,
  isPending,
  onSubmit,
  onOpenFullForm,
  values,
  onChange,
}: QuickAddExpenseProps) {
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  return (
    <Card className="overflow-hidden rounded-[2rem] border-white/60 bg-white/90 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.35)] dark:border-slate-800/80 dark:bg-slate-950/85">
      <CardHeader className="border-b border-slate-200/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.03),rgba(14,165,233,0.10))] dark:border-slate-800 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.03),rgba(14,165,233,0.12))]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Quick Add Expense</CardTitle>
            <CardDescription>
              Add a transaction in seconds, or open the full form for richer details.
            </CardDescription>
          </div>
          <Button onClick={onOpenFullForm} size="sm" variant="outline">
            Open Full Form
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]" onSubmit={handleSubmit}>
          <Input
            label="Amount"
            min="0"
            onChange={(event) => onChange({ ...values, amount: Number(event.target.value) || 0 })}
            placeholder="₱ 0.00"
            required
            step="0.01"
            type="number"
            value={values.amount || ''}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground/90">Category</label>
            <Select value={values.category} onValueChange={(value) => onChange({ ...values, category: (value ?? values.category) as ExpensePayload['category'] })}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Category" />
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
            label="Merchant"
            onChange={(event) => onChange({ ...values, merchant: event.target.value })}
            placeholder="Merchant"
            required
            value={values.merchant}
          />

          <Input
            label="Date"
            onChange={(event) => onChange({ ...values, date: event.target.value })}
            required
            type="date"
            value={values.date}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground/90">Card</label>
            <Select value={values.linkedAccountId ?? 'none'} onValueChange={(value) => onChange({ ...values, linkedAccountId: !value || value === 'none' ? undefined : value })}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Card" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No card</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.accountName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button className="w-full" isLoading={isPending} type="submit">
              Add
            </Button>
          </div>

          <div className="xl:col-span-6">
            <Textarea
              label="Notes"
              maxLength={280}
              onChange={(event) => onChange({ ...values, notes: event.target.value || undefined })}
              placeholder="Optional note"
              rows={2}
              value={values.notes ?? ''}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}