'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { budgetCategoryLabels } from '@/lib/expense-ui';

interface ExtractedData {
  merchantName: string;
  totalAmount: number;
  date: string;
  items: { name: string; amount: number }[];
  suggestedCategory: string;
}

interface ReceiptReviewProps {
  scanId: string;
  extracted: ExtractedData;
  onConfirm: (data: { scanId: string; data: { merchantName?: string; totalAmount: number; date?: string; category?: string; description?: string } }) => void;
  onCancel: () => void;
  isConfirming: boolean;
}

const categories = Object.keys(budgetCategoryLabels);

export function ReceiptReview({ scanId, extracted, onConfirm, onCancel, isConfirming }: ReceiptReviewProps) {
  const [merchant, setMerchant] = useState(extracted.merchantName);
  const [amount, setAmount] = useState(String(extracted.totalAmount));
  const [date, setDate] = useState(extracted.date?.split('T')[0] ?? new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(extracted.suggestedCategory || 'MISCELLANEOUS');
  const [description, setDescription] = useState('');

  function handleConfirm() {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;

    onConfirm({
      scanId,
      data: {
        merchantName: merchant.trim() || undefined,
        totalAmount: parsedAmount,
        date: date || undefined,
        category,
        description: description.trim() || undefined,
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-900/40 dark:bg-green-950/20">
        <div className="flex items-center gap-2">
          <span className="text-lg">✅</span>
          <p className="text-sm font-medium text-green-800 dark:text-green-200">Receipt scanned successfully</p>
        </div>
      </div>

      {/* Extracted Items Summary */}
      {extracted.items.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Extracted Items</p>
          <div className="space-y-1">
            {extracted.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                <span className="font-medium text-slate-900 dark:text-white">₱{item.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editable fields */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Merchant"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          placeholder="Store name"
        />
        <Input
          label="Amount (₱)"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground/90">Category</label>
          <Select value={category} onValueChange={(value) => setCategory(value ?? category)}>
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {budgetCategoryLabels[cat as keyof typeof budgetCategoryLabels]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Input
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g., Grocery shopping"
      />

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Discard
        </Button>
        <Button onClick={handleConfirm} isLoading={isConfirming}>
          ✓ Create Expense
        </Button>
      </div>
    </div>
  );
}
