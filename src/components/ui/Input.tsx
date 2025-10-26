'use client';

import React from 'react';
import { useTheme } from '../ThemeProvider';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  helperText, 
  className = '',
  ...props 
}) => {
  const { isDark } = useTheme();

  const baseClasses = `
    w-full px-4 py-3 rounded-lg border transition-all duration-200
    focus:outline-none focus:ring-2
    ${isDark 
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/20' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
    }
    ${error 
      ? isDark 
        ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' 
        : 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : ''
    }
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium ${
          isDark ? 'text-gray-200' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}
      <input
        className={`${baseClasses} ${className}`}
        {...props}
      />
      {error && (
        <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;