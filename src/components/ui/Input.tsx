'use client';

import React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';

import { cn } from '@/lib/utils';

interface InputProps extends React.ComponentProps<'input'> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, className = '', id, ...props },
  ref
) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground/90">
          {label}
        </label>
      ) : null}
      <InputPrimitive
        ref={ref}
        id={inputId}
        data-slot="input"
        className={cn(
          'flex h-11 w-full min-w-0 rounded-lg border border-input bg-background px-4 py-3 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 md:text-sm',
          error && 'border-destructive focus-visible:ring-destructive/20 dark:border-destructive/70',
          className
        )}
        {...props}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {helperText && !error ? <p className="text-sm text-muted-foreground">{helperText}</p> : null}
    </div>
  );
});

export default Input;