'use client';

import { useState } from 'react';

import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/budget-ui';
import type { BudgetCategory, CategoryBudgetRow } from '@/types/budgets';

interface CategoryBudgetManagerProps {
  budgets: CategoryBudgetRow[];
  isLoading?: boolean;
  savingCategory?: BudgetCategory | null;
  onSave: (category: BudgetCategory, monthlyLimit: number, rollover: boolean) => Promise<void> | void;
}

function CategoryBudgetRowEditor({
  row,
  savingCategory,
  onSave,
}: {
  row: CategoryBudgetRow;
  savingCategory?: BudgetCategory | null;
  onSave: (category: BudgetCategory, monthlyLimit: number, rollover: boolean) => Promise<void> | void;
}) {
  const [monthlyLimit, setMonthlyLimit] = useState(row.monthlyLimit?.toString() ?? '');
  const [rollover, setRollover] = useState(row.rollover);
  const utilization = row.utilizationPercent;

  return (
    <TableRow>
      <TableCell>
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">{row.categoryLabel}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{utilization.toFixed(0)}% used this month</p>
        </div>
      </TableCell>
      <TableCell className="font-medium">{formatCurrency(row.spentAmount)}</TableCell>
      <TableCell className="min-w-[180px]">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={monthlyLimit}
          onChange={(event) => setMonthlyLimit(event.target.value)}
          placeholder="0.00"
        />
      </TableCell>
      <TableCell>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={rollover}
            onChange={(event) => setRollover(event.target.checked)}
          />
          Allow rollover
        </label>
      </TableCell>
      <TableCell className="text-right">
        <Button
          size="sm"
          isLoading={savingCategory === row.category}
          onClick={() => {
            const nextLimit = Number(monthlyLimit);
            if (!Number.isFinite(nextLimit) || nextLimit <= 0) {
              return;
            }

            void onSave(row.category, nextLimit, rollover);
          }}
        >
          Save
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function CategoryBudgetManager({
  budgets,
  isLoading,
  savingCategory,
  onSave,
}: CategoryBudgetManagerProps) {
  return (
    <Card className="rounded-[2rem]">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Category Budget Limits</CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Set monthly caps per category and compare them to current spending.
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Monthly Limit</TableHead>
                <TableHead>Rollover</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((row) => {
                return (
                  <CategoryBudgetRowEditor
                    key={`${row.category}-${row.monthlyLimit ?? 'none'}-${row.rollover}`}
                    row={row}
                    savingCategory={savingCategory}
                    onSave={onSave}
                  />
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}