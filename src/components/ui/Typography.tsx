'use client';

import React from 'react';
import { useTheme } from '../ThemeProvider';

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
  const { isDark } = useTheme();
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

  const getColorClasses = () => {
    if (isDark) {
      return {
        dark: '!text-gray-100',
        medium: '!text-gray-300', 
        light: '!text-gray-400',
        primary: '!text-blue-400',
        success: '!text-green-400',
        warning: '!text-orange-400',
        accent: '!text-purple-400',
        white: '!text-white'
      };
    } else {
      return {
        dark: '!text-gray-900',
        medium: '!text-gray-700',
        light: '!text-gray-600',
        primary: '!text-blue-600',
        success: '!text-green-600',
        warning: '!text-orange-600',
        accent: '!text-purple-600',
        white: '!text-white'
      };
    }
  };

  const colorClasses = getColorClasses();

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
      className: `${variantClasses[variant]} ${colorClasses[color]} ${className}`
    },
    children
  );
};

export default Typography;