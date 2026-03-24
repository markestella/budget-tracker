'use client';

import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface ProgressRingProps {
  className?: string;
  label?: string;
  progress: number;
  showValue?: boolean;
  size?: number;
  strokeWidth?: number;
  valueLabel?: string;
}

export function ProgressRing({
  className,
  label,
  progress,
  showValue = true,
  size = 132,
  strokeWidth = 12,
  valueLabel,
}: ProgressRingProps) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div className={cn('inline-flex flex-col items-center gap-3', className)}>
      <div className="relative" style={{ height: size, width: size }}>
        <svg className="-rotate-90" height={size} width={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            fill="none"
            r={radius}
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            animate={{ strokeDashoffset }}
            cx={size / 2}
            cy={size / 2}
            fill="none"
            initial={{ strokeDashoffset: circumference }}
            r={radius}
            stroke="var(--chart-1)"
            strokeDasharray={circumference}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        {showValue ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-semibold text-foreground">{Math.round(normalizedProgress)}%</span>
            {valueLabel ? (
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {valueLabel}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      {label ? <span className="text-sm font-medium text-muted-foreground">{label}</span> : null}
    </div>
  );
}