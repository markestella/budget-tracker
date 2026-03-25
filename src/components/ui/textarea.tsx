'use client';

import React from 'react';

import { cn } from '@/lib/utils';

interface TextareaProps extends React.ComponentProps<'textarea'> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, helperText, className = '', id, ...props },
  ref,
) {
  const textareaId = id ?? props.name;

  return (
    <div className="space-y-2">
      {label ? <label htmlFor={textareaId} className="block text-sm font-medium text-foreground/90">{label}</label> : null}
      <textarea
        ref={ref}
        id={textareaId}
        className={cn(
          'flex min-h-28 w-full rounded-lg border border-input bg-background px-4 py-3 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 md:text-sm',
          error && 'border-destructive focus-visible:ring-destructive/20 dark:border-destructive/70',
          className,
        )}
        {...props}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {helperText && !error ? <p className="text-sm text-muted-foreground">{helperText}</p> : null}
    </div>
  );
});

export { Textarea };