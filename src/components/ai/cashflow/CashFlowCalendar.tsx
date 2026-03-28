'use client';

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DayBalance {
  day: number;
  date: string;
  projectedBalance: number;
  isProjected: boolean;
}

interface CashFlowCalendarProps {
  balances: DayBalance[];
  maxBalance: number;
}

const fmt = new Intl.NumberFormat('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

function balanceColor(balance: number, max: number): string {
  if (balance <= 0) return 'bg-red-500 dark:bg-red-600';
  const ratio = balance / max;
  if (ratio > 0.6) return 'bg-green-400 dark:bg-green-500';
  if (ratio > 0.3) return 'bg-amber-400 dark:bg-amber-500';
  return 'bg-orange-400 dark:bg-orange-500';
}

export function CashFlowCalendar({ balances, maxBalance }: CashFlowCalendarProps) {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-slate-400 dark:text-slate-500 pb-1">
            {d}
          </div>
        ))}
        {(() => {
          const firstDate = balances[0] ? new Date(balances[0].date) : new Date();
          // getDay(): 0=Sun, convert to Mon=0 offset
          const firstDayOffset = (firstDate.getDay() + 6) % 7;
          const spacers = Array.from({ length: firstDayOffset }, (_, i) => (
            <div key={`spacer-${i}`} />
          ));
          return spacers;
        })()}
        {balances.map((b) => {
          const dateObj = new Date(b.date);
          const dayOfWeek = dateObj.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          return (
            <Tooltip key={b.day}>
              <TooltipTrigger>
                <div
                  className={cn(
                    'relative flex flex-col items-center justify-center rounded-lg p-1.5 sm:p-2 transition cursor-default',
                    b.isProjected ? 'border border-dashed border-slate-300 dark:border-slate-600' : 'border border-slate-200 dark:border-slate-700',
                    isWeekend ? 'bg-slate-50/50 dark:bg-slate-800/30' : '',
                  )}
                >
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {dateObj.getDate()}
                  </span>
                  <div
                    className={cn('mt-0.5 h-1.5 w-full rounded-full', balanceColor(b.projectedBalance, maxBalance))}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p className="font-medium">{dateObj.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</p>
                <p>₱{fmt.format(b.projectedBalance)}</p>
                {b.isProjected && <p className="text-slate-400">Projected</p>}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
