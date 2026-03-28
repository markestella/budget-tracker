'use client';

import React, { useState } from 'react';

interface AddFundsDialogProps {
  itemName: string;
  remaining: number;
  onSubmit: (amount: number) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

export default function AddFundsDialog({ itemName, remaining, onSubmit, onCancel, isSubmitting }: AddFundsDialogProps) {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    onSubmit(parsed);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Add Funds
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {itemName} — ₱{remaining.toLocaleString()} remaining
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_AMOUNTS.filter((a) => a <= remaining || remaining <= 0).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAmount(a.toString())}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors
                ${amount === a.toString()
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                }`}
            >
              ₱{a.toLocaleString()}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Custom Amount (₱)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Funds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
