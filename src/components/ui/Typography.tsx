'use client';

import React from 'react';

import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body-lg' | 'caption' | 'button' | 'small';
  color?: 'dark' | 'medium' | 'light' | 'primary' | 'success' | 'warning' | 'accent' | 'white';
  className?: string;
}

const Typography: React.FC<TypographyProps> = ({ 
  children, 
  variant = 'body', 
  color = 'dark',
  className = '' 
}) => {
  const variantClasses = {
    h1: 'text-5xl font-bold leading-tight',
    h2: 'text-4xl font-bold',
    h3: 'text-2xl font-bold',
    h4: 'text-xl font-semibold',
    'body-lg': 'text-xl leading-relaxed',
    body: 'text-base leading-relaxed',
    caption: 'text-sm',
    button: 'text-base font-semibold',
    small: 'text-xs'
  };

  const colorClasses = {
    dark: 'text-foreground',
    medium: 'text-foreground/80',
    light: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    accent: 'text-fuchsia-600 dark:text-fuchsia-400',
    white: 'text-white'
  };

  const Component = getComponent(variant);
  
  function getComponent(variant: string) {
    switch (variant) {
      case 'h1': return 'h1';
      case 'h2': return 'h2';
      case 'h3': return 'h3';
      case 'h4': return 'h4';
      default: return 'p';
    }
  }

  return React.createElement(
    Component,
    {
      className: cn(variantClasses[variant], colorClasses[color], className)
    },
    children
  );
};

export default Typography;