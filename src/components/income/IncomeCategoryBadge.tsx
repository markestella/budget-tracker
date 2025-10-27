'use client';

import React from 'react';
import { useTheme } from '../ThemeProvider';

type IncomeCategory = 'SALARY' | 'FREELANCE' | 'BUSINESS' | 'INVESTMENT' | 'RENTAL' | 'PENSION' | 'BENEFITS' | 'OTHER';

interface IncomeCategoryBadgeProps {
  category: IncomeCategory;
  className?: string;
}

export function IncomeCategoryBadge({ category, className }: IncomeCategoryBadgeProps) {
  const { isDark } = useTheme();

  const getCategoryConfig = (category: IncomeCategory) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (category) {
      case 'SALARY':
        return {
          label: 'Salary',
          className: isDark 
            ? 'bg-blue-900/40 text-blue-400 border border-blue-800'
            : 'bg-blue-100 text-blue-800 border border-blue-200',
        };
      case 'FREELANCE':
        return {
          label: 'Freelance',
          className: isDark 
            ? 'bg-purple-900/40 text-purple-400 border border-purple-800'
            : 'bg-purple-100 text-purple-800 border border-purple-200',
        };
      case 'BUSINESS':
        return {
          label: 'Business',
          className: isDark 
            ? 'bg-green-900/40 text-green-400 border border-green-800'
            : 'bg-green-100 text-green-800 border border-green-200',
        };
      case 'INVESTMENT':
        return {
          label: 'Investment',
          className: isDark 
            ? 'bg-orange-900/40 text-orange-400 border border-orange-800'
            : 'bg-orange-100 text-orange-800 border border-orange-200',
        };
      case 'RENTAL':
        return {
          label: 'Rental',
          className: isDark 
            ? 'bg-teal-900/40 text-teal-400 border border-teal-800'
            : 'bg-teal-100 text-teal-800 border border-teal-200',
        };
      case 'PENSION':
        return {
          label: 'Pension',
          className: isDark 
            ? 'bg-indigo-900/40 text-indigo-400 border border-indigo-800'
            : 'bg-indigo-100 text-indigo-800 border border-indigo-200',
        };
      case 'BENEFITS':
        return {
          label: 'Benefits',
          className: isDark 
            ? 'bg-pink-900/40 text-pink-400 border border-pink-800'
            : 'bg-pink-100 text-pink-800 border border-pink-200',
        };
      case 'OTHER':
        return {
          label: 'Other',
          className: isDark 
            ? 'bg-gray-800 text-gray-400 border border-gray-700'
            : 'bg-gray-100 text-gray-800 border border-gray-200',
        };
      default:
        return {
          label: 'Unknown',
          className: isDark 
            ? 'bg-gray-800 text-gray-400 border border-gray-700'
            : 'bg-gray-100 text-gray-800 border border-gray-200',
        };
    }
  };

  const config = getCategoryConfig(category);

  return (
    <span className={`${config.className} ${className || ''}`}>
      {config.label}
    </span>
  );
}