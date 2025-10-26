'use client';

import React from 'react';
import { useTheme } from '../ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  variant?: 'white' | 'gradient' | 'feature';
  gradientType?: 'primary' | 'success' | 'warning' | 'accent';
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'white', 
  gradientType = 'primary',
  className = '',
  hover = true 
}) => {
  const { isDark } = useTheme();
  const baseClasses = 'rounded-2xl transition-all duration-200';
  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';
  
  const getVariantClasses = () => {
    if (isDark) {
      return {
        white: 'bg-gray-900 border border-gray-700 shadow-lg',
        gradient: getGradientClasses(gradientType, true),
        feature: `${getGradientClasses(gradientType, true)} border ${getBorderClass(gradientType, true)} p-8`
      };
    } else {
      return {
        white: 'bg-white border border-gray-200 shadow-lg',
        gradient: getGradientClasses(gradientType, false),
        feature: `${getGradientClasses(gradientType, false)} border ${getBorderClass(gradientType, false)} p-8`
      };
    }
  };

  const variantClasses = getVariantClasses();

  function getGradientClasses(type: string, isDarkMode: boolean): string {
    if (isDarkMode) {
      const darkGradients = {
        primary: 'bg-gradient-to-br from-blue-900/40 to-blue-800/30',
        success: 'bg-gradient-to-br from-green-900/40 to-green-800/30',
        warning: 'bg-gradient-to-br from-orange-900/40 to-orange-800/30',
        accent: 'bg-gradient-to-br from-purple-900/40 to-purple-800/30'
      };
      return darkGradients[type as keyof typeof darkGradients] || darkGradients.primary;
    } else {
      const lightGradients = {
        primary: 'bg-gradient-to-br from-blue-50 to-blue-100',
        success: 'bg-gradient-to-br from-green-50 to-green-100',
        warning: 'bg-gradient-to-br from-orange-50 to-orange-100',
        accent: 'bg-gradient-to-br from-purple-50 to-purple-100'
      };
      return lightGradients[type as keyof typeof lightGradients] || lightGradients.primary;
    }
  }

  function getBorderClass(type: string, isDarkMode: boolean): string {
    if (isDarkMode) {
      const darkBorders = {
        primary: 'border-blue-700',
        success: 'border-green-700',
        warning: 'border-orange-700',
        accent: 'border-purple-700'
      };
      return darkBorders[type as keyof typeof darkBorders] || darkBorders.primary;
    } else {
      const lightBorders = {
        primary: 'border-blue-200',
        success: 'border-green-200',
        warning: 'border-orange-200',
        accent: 'border-purple-200'
      };
      return lightBorders[type as keyof typeof lightBorders] || lightBorders.primary;
    }
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;