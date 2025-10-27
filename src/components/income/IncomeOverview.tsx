'use client';

interface IncomeStatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
}

export function IncomeStatsCard({
  title,
  value,
  subtitle,
  change,
  icon,
  className = '',
}: IncomeStatsCardProps) {
  const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-2xl font-bold text-gray-900">
          {value}
        </div>
        
        {subtitle && (
          <div className="text-sm text-gray-600">
            {subtitle}
          </div>
        )}
        
        {change && (
          <div className={`text-sm ${getChangeColor(change.type)}`}>
            {change.value}
          </div>
        )}
      </div>
    </div>
  );
}

interface IncomeOverviewProps {
  totalExpected: number;
  totalReceived: number;
  totalPending: number;
  totalOverdue: number;
  receiptRate: number;
  period?: string;
  loading?: boolean;
}

export function IncomeOverview({
  totalExpected,
  totalReceived,
  totalPending,
  totalOverdue,
  receiptRate,
  period = 'This Month',
  loading = false,
}: IncomeOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <IncomeStatsCard
        title="Expected Income"
        value={formatCurrency(totalExpected)}
        subtitle={period}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        }
      />

      <IncomeStatsCard
        title="Received"
        value={formatCurrency(totalReceived)}
        subtitle={`${formatPercentage(receiptRate)} of expected`}
        change={{
          value: totalReceived >= totalExpected ? 'On target' : 'Below target',
          type: totalReceived >= totalExpected ? 'increase' : 'decrease',
        }}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      <IncomeStatsCard
        title="Pending"
        value={formatCurrency(totalPending)}
        subtitle={`${Math.round((totalPending / (totalExpected || 1)) * 100)}% of expected`}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      <IncomeStatsCard
        title="Overdue"
        value={formatCurrency(totalOverdue)}
        subtitle={totalOverdue > 0 ? 'Needs attention' : 'All up to date'}
        change={{
          value: totalOverdue > 0 ? 'Action required' : 'Good standing',
          type: totalOverdue > 0 ? 'decrease' : 'increase',
        }}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.736 0L3.078 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
      />

      <IncomeStatsCard
        title="Receipt Rate"
        value={formatPercentage(receiptRate)}
        subtitle="Collection efficiency"
        change={{
          value: receiptRate >= 90 ? 'Excellent' : receiptRate >= 75 ? 'Good' : 'Needs improvement',
          type: receiptRate >= 90 ? 'increase' : receiptRate >= 75 ? 'neutral' : 'decrease',
        }}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      />
    </div>
  );
}