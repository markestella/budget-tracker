'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useDailyQuoteQuery } from '@/hooks/api/useDailyQuoteHook';

export default function DailyQuote() {
  const { data: quote, isLoading } = useDailyQuoteQuery();

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-indigo-200 dark:bg-indigo-800 rounded w-3/4 mb-2" />
        <div className="h-3 bg-indigo-200 dark:bg-indigo-800 rounded w-1/4" />
      </div>
    );
  }

  if (!quote) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-5 relative overflow-hidden"
    >
      {/* Subtle decorative pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-600 dark:text-indigo-400">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="50" r="10" fill="currentColor" />
        </svg>
      </div>

      <div className="relative">
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">💡 Daily Insight</p>
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed italic">
          &ldquo;{quote.text}&rdquo;
        </p>
        {quote.author && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            — {quote.author}
          </p>
        )}
      </div>
    </motion.div>
  );
}
