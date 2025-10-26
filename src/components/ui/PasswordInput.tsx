'use client';

import React, { useState } from 'react';
import { useTheme } from '../ThemeProvider';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ 
  label, 
  error, 
  helperText, 
  className = '',
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { isDark } = useTheme();

  const baseClasses = `
    w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200
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

  const iconColor = isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800';

  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium ${
          isDark ? 'text-gray-200' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className={`${baseClasses} ${className}`}
          {...props}
        />
        <button
          type="button"
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors ${iconColor}`}
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m-3.122-3.122l4.242 4.242M21 21l-3.6-3.6m0 0a10.05 10.05 0 01-3.175 2.025c-.659.175-1.349.175-2.009 0a10.05 10.05 0 01-3.175-2.025m0 0L9.878 9.878" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
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

export default PasswordInput;