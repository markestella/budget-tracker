'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WishlistCardProps {
  item: {
    id: string;
    name: string;
    price: string | number;
    savedAmount: string | number;
    imageUrl?: string | null;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'SAVING' | 'AFFORDABLE' | 'PURCHASED';
    weeksToAffordable?: number | null;
  };
  onAddFunds: (id: string) => void;
  onMarkPurchased: (id: string) => void;
  onEdit: (id: string) => void;
}

const priorityConfig = {
  HIGH: { label: 'High', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  MEDIUM: { label: 'Medium', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  LOW: { label: 'Low', class: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
};

const statusEmoji: Record<string, string> = {
  SAVING: '💰',
  AFFORDABLE: '✅',
  PURCHASED: '🎉',
};

export default function WishlistCard({ item, onAddFunds, onMarkPurchased, onEdit }: WishlistCardProps) {
  const price = Number(item.price);
  const saved = Number(item.savedAmount);
  const progress = price > 0 ? Math.min((saved / price) * 100, 100) : 0;
  const isAffordable = item.status === 'AFFORDABLE';
  const isPurchased = item.status === 'PURCHASED';
  const priority = priorityConfig[item.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 p-5 transition-all
        ${isAffordable ? 'border-green-400 dark:border-green-500 shadow-lg shadow-green-500/10' : 'border-gray-200 dark:border-gray-700'}
        ${isPurchased ? 'opacity-70' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0">{statusEmoji[item.status]}</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${priority.class}`}>
              {priority.label}
            </span>
          </div>
        </div>
        <button
          onClick={() => onEdit(item.id)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          aria-label="Edit item"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>

      {/* Price & Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500 dark:text-gray-400">
            ₱{saved.toLocaleString()} / ₱{price.toLocaleString()}
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              isPurchased
                ? 'bg-gray-400'
                : isAffordable
                  ? 'bg-green-500'
                  : 'bg-indigo-500'
            }`}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Projection */}
      {item.weeksToAffordable && item.status === 'SAVING' && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          ~{item.weeksToAffordable} weeks at current rate
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!isPurchased && (
          <button
            onClick={() => onAddFunds(item.id)}
            className="flex-1 text-sm py-2 px-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors font-medium"
          >
            + Add Funds
          </button>
        )}
        {isAffordable && (
          <button
            onClick={() => onMarkPurchased(item.id)}
            className="flex-1 text-sm py-2 px-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors font-medium"
          >
            🎉 Mark Purchased
          </button>
        )}
      </div>
    </motion.div>
  );
}
