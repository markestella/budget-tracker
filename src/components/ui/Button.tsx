'use client';

import React from 'react';
import { useTheme } from '../ThemeProvider';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  isLoading = false,
  disabled,
  ...props 
}) => {
  const { isDark } = useTheme();
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  
  const getVariantClasses = () => {
    if (isDark) {
      return {
        primary: '!bg-gradient-to-r !from-blue-600 !to-blue-700 !text-white hover:!from-blue-700 hover:!to-blue-800 !shadow-md focus:!ring-blue-500',
        secondary: '!bg-gradient-to-r !from-gray-600 !to-gray-700 !text-white hover:!from-gray-700 hover:!to-gray-800 !shadow-md focus:!ring-gray-500',
        outline: '!border-2 !border-blue-500 !text-blue-400 !bg-gray-800 hover:!bg-gray-700 hover:!border-blue-400 focus:!ring-blue-500',
        ghost: '!text-blue-400 hover:!bg-gray-800 hover:!text-blue-300 focus:!ring-blue-500'
      };
    } else {
      return {
        primary: '!bg-gradient-to-r !from-blue-600 !to-blue-700 !text-white hover:!from-blue-700 hover:!to-blue-800 !shadow-md focus:!ring-blue-300',
        secondary: '!bg-gradient-to-r !from-gray-600 !to-gray-700 !text-white hover:!from-gray-700 hover:!to-gray-800 !shadow-md focus:!ring-gray-300',
        outline: '!border-2 !border-blue-600 !text-blue-700 !bg-white hover:!bg-blue-50 hover:!border-blue-700 focus:!ring-blue-300',
        ghost: '!text-blue-700 hover:!bg-blue-50 hover:!text-blue-800 focus:!ring-blue-300'
      };
    }
  };

  const variantClasses = getVariantClasses();

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-25"
            />
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              className="opacity-75"
            />
          </svg>
          {children}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;