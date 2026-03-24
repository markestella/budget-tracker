'use client';

import React from 'react';

import { cn } from '@/lib/utils';

export interface LegacyCardProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
  variant?: 'white' | 'gradient' | 'feature';
  gradientType?: 'primary' | 'success' | 'warning' | 'accent';
  className?: string;
  hover?: boolean;
}

const gradients = {
  primary: 'from-blue-500/15 to-blue-600/5 dark:from-blue-400/20 dark:to-blue-500/10',
  success: 'from-emerald-500/15 to-emerald-600/5 dark:from-emerald-400/20 dark:to-emerald-500/10',
  warning: 'from-amber-500/15 to-amber-600/5 dark:from-amber-400/20 dark:to-amber-500/10',
  accent: 'from-fuchsia-500/15 to-fuchsia-600/5 dark:from-fuchsia-400/20 dark:to-fuchsia-500/10',
};

const borders = {
  primary: 'border-blue-200/70 dark:border-blue-500/30',
  success: 'border-emerald-200/70 dark:border-emerald-500/30',
  warning: 'border-amber-200/70 dark:border-amber-500/30',
  accent: 'border-fuchsia-200/70 dark:border-fuchsia-500/30',
};

const LegacyCard: React.FC<LegacyCardProps> = ({
  children,
  variant = 'white',
  gradientType = 'primary',
  className = '',
  hover = true,
  ...props
}) => {
  const hoverClasses = hover ? 'hover:-translate-y-1 hover:shadow-xl' : '';
  const variantClasses = {
    white: 'bg-card text-card-foreground ring-1 ring-border/80 shadow-sm',
    gradient: cn('bg-gradient-to-br', gradients[gradientType], 'text-card-foreground ring-1 ring-border/60 shadow-sm'),
    feature: cn('bg-gradient-to-br p-8 text-card-foreground ring-1 shadow-sm', gradients[gradientType], borders[gradientType]),
  };

  return (
    <div
      className={cn('rounded-2xl transition-all duration-200', variantClasses[variant], hoverClasses, className)}
      {...props}
    >
      {children}
    </div>
  );
};

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-3xl border border-slate-200/70 bg-white/90 text-slate-950 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-50',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-slate-600 dark:text-slate-400', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export { Card, CardContent, CardDescription, CardHeader, CardTitle };

export default LegacyCard;