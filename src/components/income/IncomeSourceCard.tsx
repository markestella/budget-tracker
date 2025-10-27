'use client';

import { IncomeCategoryBadge } from './IncomeCategoryBadge';
import Button from '@/components/ui/Button';
import { useTheme } from '@/components/ThemeProvider';
import { useState } from 'react';

type IncomeCategory = 'SALARY' | 'FREELANCE' | 'BUSINESS' | 'INVESTMENT' | 'RENTAL' | 'PENSION' | 'BENEFITS' | 'OTHER';
type PaymentFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';

interface IncomeSource {
  id: string;
  name: string;
  category: IncomeCategory;
  description?: string;
  frequency: PaymentFrequency;
  amount: number;
  isActive: boolean;
  scheduleDays?: number[] | null;
  scheduleWeekday?: number | null;
  scheduleWeek?: string | null;
  scheduleTime?: string | null;
  useManualAmounts?: boolean | null;
  scheduleDayAmounts?: Record<string, number> | null;
  _count?: {
    incomeRecords: number;
  };
}

interface IncomeSourceCardProps {
  source: IncomeSource;
  onEdit?: (source: IncomeSource) => void;
  onDelete?: (source: IncomeSource) => void;
  onToggleActive?: (source: IncomeSource) => void;
  onViewRecords?: (source: IncomeSource) => void;
}

export function IncomeSourceCard({
  source,
  onEdit,
  onDelete,
  onToggleActive,
  onViewRecords,
}: IncomeSourceCardProps) {
  const { isDark } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatFrequency = (frequency: PaymentFrequency) => {
    const frequencyMap = {
      WEEKLY: 'Weekly',
      BIWEEKLY: 'Bi-weekly',
      MONTHLY: 'Monthly',
      QUARTERLY: 'Quarterly',
      YEARLY: 'Yearly',
      ONE_TIME: 'One Time',
    };
    return frequencyMap[frequency] || frequency;
  };

  const getPerPaymentAmount = () => {
    if (source.frequency === 'MONTHLY' && source.scheduleDays && source.scheduleDays.length > 1) {
      if (source.useManualAmounts && source.scheduleDayAmounts && Object.keys(source.scheduleDayAmounts).length > 0) {
        // For manual amounts, show the first payment amount as an example
        const firstDay = source.scheduleDays.sort((a, b) => a - b)[0];
        const dayAmounts = typeof source.scheduleDayAmounts === 'object' 
          ? source.scheduleDayAmounts as Record<string, number>
          : {};
        return dayAmounts[firstDay.toString()] || 0;
      } else {
        // Automatic division
        return source.amount / source.scheduleDays.length;
      }
    }
    return source.amount;
  };

  const getScheduleInfo = () => {
    if (source.frequency === 'MONTHLY' && source.scheduleDays && source.scheduleDays.length > 0) {
      const days = source.scheduleDays.sort((a, b) => a - b);
      if (days.length > 1) {
        return `${days.length} payments: ${days.join(', ')}${days.includes(31) ? ' (last day)' : ''}`;
      } else {
        return `Day ${days[0]}${days[0] === 31 ? ' (last day)' : ''}`;
      }
    }
    return '';
  };  return (
    <div className={`rounded-xl border transition-all duration-200 hover:shadow-lg ${
      source.isActive 
        ? isDark 
          ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xl'
        : isDark
          ? 'bg-gray-900 border-gray-800 opacity-70'
          : 'bg-gray-50 border-gray-300 opacity-70'
    }`}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h3 className={`text-lg font-semibold truncate ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {source.name}
              </h3>
              {!source.isActive && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  Inactive
                </span>
              )}
            </div>
            <IncomeCategoryBadge category={source.category} />
          </div>
          
          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
              </svg>
            </button>
            
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                <div className={`absolute right-0 top-10 mt-2 w-48 rounded-lg shadow-lg border z-20 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="py-2">
                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit(source);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          isDark
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Source
                        </div>
                      </button>
                    )}
                    
                    {onViewRecords && (
                      <button
                        onClick={() => {
                          onViewRecords(source);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          isDark
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View Records
                        </div>
                      </button>
                    )}
                    
                    {onToggleActive && (
                      <button
                        onClick={() => {
                          onToggleActive(source);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          source.isActive
                            ? isDark
                              ? 'text-orange-400 hover:bg-gray-700 hover:text-orange-300'
                              : 'text-orange-600 hover:bg-orange-50'
                            : isDark
                              ? 'text-green-400 hover:bg-gray-700 hover:text-green-300'
                              : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {source.isActive ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a2 2 0 002 2h2a2 2 0 002-2v-4M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1" />
                            </svg>
                          )}
                          {source.isActive ? 'Deactivate' : 'Activate'}
                        </div>
                      </button>
                    )}
                    
                    {onDelete && (
                      <>
                        <div className={`my-2 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        <button
                          onClick={() => {
                            onDelete(source);
                            setIsMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            isDark
                              ? 'text-red-400 hover:bg-gray-700 hover:text-red-300'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Source
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Amount and Frequency */}
        <div className={`text-right mb-4 ${!source.isActive ? 'opacity-75' : ''}`}>
          {source.frequency === 'MONTHLY' && source.scheduleDays && source.scheduleDays.length > 1 ? (
            <>
              {source.useManualAmounts && source.scheduleDayAmounts && Object.keys(source.scheduleDayAmounts).length > 0 ? (
                <>
                  <div className={`text-lg font-semibold ${
                    isDark ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    Manual Amounts
                  </div>
                  <div className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {source.scheduleDays.map(day => {
                      const dayAmounts = typeof source.scheduleDayAmounts === 'object' 
                        ? source.scheduleDayAmounts as Record<string, number>
                        : {};
                      const amount = dayAmounts[day.toString()] || 0;
                      return `Day ${day}: ${formatAmount(amount)}`;
                    }).join(', ')}
                  </div>
                  <div className={`text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Total: {formatAmount(source.amount)}
                  </div>
                </>
              ) : (
                <>
                  <div className={`text-lg font-semibold ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {formatAmount(getPerPaymentAmount())}
                  </div>
                  <div className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    per payment (automatic)
                  </div>
                  <div className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    ({formatAmount(source.amount)} monthly total)
                  </div>
                </>
              )}
            </>
          ) : (
            <div className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {formatAmount(source.amount)}
            </div>
          )}
          <div className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {formatFrequency(source.frequency)}
          </div>
          {getScheduleInfo() && (
            <div className={`text-xs mt-1 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {getScheduleInfo()}
            </div>
          )}
        </div>

        {/* Description */}
        {source.description && (
          <p className={`text-sm mb-4 line-clamp-2 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {source.description}
          </p>
        )}
      </div>

      {/* Footer Stats */}
      <div className={`px-6 py-4 border-t ${
        isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              source.isActive 
                ? 'bg-green-500' 
                : isDark ? 'bg-gray-600' : 'bg-gray-400'
            }`} />
            <span className={`text-sm font-medium ${
              source.isActive
                ? 'text-green-600'
                : isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {source.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <span className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {source._count?.incomeRecords || 0} record{source._count?.incomeRecords !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}