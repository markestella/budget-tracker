'use client';

import { Edit3, Trash2 } from 'lucide-react';

import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/expense-ui';
import type { ExpenseRecord } from '@/types/expenses';

interface TransactionHistoryProps {
  expenses: ExpenseRecord[];
  isLoading?: boolean;
  onDelete: (expense: ExpenseRecord) => void;
  onEdit: (expense: ExpenseRecord) => void;
  onPageChange: (page: number) => void;
  page: number;
  totalPages: number;
  totalCount: number;
}

export function TransactionHistory({
  expenses,
  isLoading,
  onDelete,
  onEdit,
  onPageChange,
  page,
  totalCount,
  totalPages,
}: TransactionHistoryProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 7);

  return (
    <Card className="rounded-[2rem] border-white/60 bg-white/90 shadow-[0_28px_90px_-48px_rgba(15,23,42,0.4)] dark:border-slate-800/80 dark:bg-slate-950/85">
      <CardHeader>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>{totalCount} total expenses in the current result set.</CardDescription>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">20 per page</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300/80 bg-slate-50/80 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
            No expenses match your filters
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Card</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{new Date(expense.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-950 dark:text-slate-100">{expense.merchant}</p>
                        {expense.notes ? <p className="text-xs text-slate-500 dark:text-slate-400">{expense.notes}</p> : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{expense.category.replaceAll('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-rose-600 dark:text-rose-400">{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>{expense.linkedAccount?.accountName ?? 'Unlinked'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => onEdit(expense)} size="sm" variant="ghost">
                          <Edit3 className="size-4" />
                        </Button>
                        <Button onClick={() => onDelete(expense)} size="sm" variant="ghost">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button disabled={page <= 1} onClick={() => onPageChange(page - 1)} size="sm" variant="outline">
                Previous
              </Button>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {pages.map((pageNumber) => (
                  <Button key={pageNumber} onClick={() => onPageChange(pageNumber)} size="sm" variant={pageNumber === page ? 'primary' : 'outline'}>
                    {pageNumber}
                  </Button>
                ))}
              </div>
              <Button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} size="sm" variant="outline">
                Load More
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}