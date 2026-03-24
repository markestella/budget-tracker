'use client';

import React from 'react';

import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  variant?: 'white' | 'light' | 'dark' | 'gradient-light' | 'gradient-dark';
  id?: string;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ 
  children, 
  variant = 'white', 
  id,
  className = '' 
}) => {
  const baseClasses = 'py-20';
  const variantClasses = {
    white: 'bg-background',
    light: 'bg-muted/40',
    dark: 'bg-slate-950 text-white dark:bg-slate-950',
    'gradient-light': 'bg-gradient-to-br from-background via-muted/40 to-primary/10',
    'gradient-dark': 'bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white',
  };

  return (
    <section 
      id={id}
      className={cn(baseClasses, variantClasses[variant], className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
};

export default Section;