'use client';

import { useCashFlowQuery } from '@/hooks/api/useAIInsightsHooks';
import { CashFlowCalendar } from './CashFlowCalendar';

const fmt = new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function CashFlowPage() {
  const { data, isLoading } = useCashFlowQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No cash flow data available. Add some budgets and expenses to see projections.
        </p>
      </div>
    );
  }

  const { dailyBalances, projectedZeroDate, summary, stats } = data;
  const maxBalance = Math.max(...dailyBalances.map((b) => b.projectedBalance), 1);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Budget', value: `₱${fmt.format(stats.totalBudget)}`, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Total Spent', value: `₱${fmt.format(stats.totalSpent)}`, color: 'text-orange-600 dark:text-orange-400' },
          { label: 'Remaining', value: `₱${fmt.format(stats.remaining)}`, color: stats.remaining > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400' },
          { label: 'Daily Spend Rate', value: `₱${fmt.format(stats.dailySpendRate)}/day`, color: 'text-violet-600 dark:text-violet-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className={`text-lg font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Zero-date warning */}
      {projectedZeroDate && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-950/20">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Budget projected to reach ₱0
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Estimated date: {new Date(projectedZeroDate).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="mb-3 text-sm font-medium text-slate-900 dark:text-white">30-Day Projection</h3>
        <CashFlowCalendar balances={dailyBalances} maxBalance={maxBalance} />
        <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-400" /> Healthy</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Moderate</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-400" /> Low</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Depleted</span>
        </div>
      </div>

      {/* AI Summary */}
      {summary && (
        <div className="rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50 to-indigo-50 p-4 dark:border-violet-900/40 dark:from-violet-950/20 dark:to-indigo-950/20">
          <div className="flex items-start gap-2">
            <span className="text-lg">🤖</span>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">AI Summary</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{summary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
