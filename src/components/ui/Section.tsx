'use client';

import React from 'react';
import { useTheme } from '../ThemeProvider';

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
  const { isDark } = useTheme();
  const baseClasses = 'py-20';
  
  const getVariantClasses = () => {
    if (isDark) {
      return {
        white: 'bg-gray-900',
        light: 'bg-gray-800',
        dark: 'bg-gray-900',
        'gradient-light': 'bg-gradient-to-br from-gray-900 to-gray-950',
        'gradient-dark': 'bg-gradient-to-r from-blue-600 to-purple-600'
      };
    } else {
      return {
        white: 'bg-white',
        light: 'bg-gray-50',
        dark: 'bg-gray-900',
        'gradient-light': 'bg-gradient-to-br from-gray-50 to-blue-50',
        'gradient-dark': 'bg-gradient-to-r from-blue-600 to-purple-600'
      };
    }
  };

  const variantClasses = getVariantClasses();

  const textColorClasses = {
    white: '',
    light: '',
    dark: 'text-white',
    'gradient-light': '',
    'gradient-dark': 'text-white'
  };

  return (
    <section 
      id={id}
      className={`${baseClasses} ${variantClasses[variant]} ${textColorClasses[variant]} ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
};

export default Section;