'use client';

import React from 'react';
import { useTheme } from '../ThemeProvider';

type PaymentStatus = 'PENDING' | 'RECEIVED' | 'OVERDUE';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const { isDark } = useTheme();

  const getStatusConfig = (status: PaymentStatus) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (status) {
      case 'RECEIVED':
        return {
          label: 'Received',
          className: isDark 
            ? 'bg-green-900/40 text-green-400 border border-green-800'
            : 'bg-green-100 text-green-800 border border-green-200',
        };
      case 'PENDING':
        return {
          label: 'Pending',
          className: isDark 
            ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-800'
            : 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        };
      case 'OVERDUE':
        return {
          label: 'Overdue',
          className: isDark 
            ? 'bg-red-900/40 text-red-400 border border-red-800'
            : 'bg-red-100 text-red-800 border border-red-200',
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

  const config = getStatusConfig(status);

  return (
    <span className={`${config.className} ${className || ''}`}>
      {config.label}
    </span>
  );
}