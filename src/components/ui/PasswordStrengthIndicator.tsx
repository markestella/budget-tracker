'use client';

import React from 'react';
import { useTheme } from '../ThemeProvider';

interface PasswordStrengthIndicatorProps {
  password: string;
  showDetails?: boolean;
}

interface PasswordCriteria {
  label: string;
  test: (password: string) => boolean;
}

const passwordCriteria: PasswordCriteria[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains number', test: (p) => /\d/.test(p) },
  { label: 'Contains special character', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

const getPasswordStrength = (password: string) => {
  if (!password) return { strength: 0, label: '', color: '' };
  
  const passedTests = passwordCriteria.filter(criteria => criteria.test(password)).length;
  
  if (passedTests <= 1) return { strength: 1, label: 'Very Weak', color: 'bg-red-500' };
  if (passedTests === 2) return { strength: 2, label: 'Weak', color: 'bg-orange-500' };
  if (passedTests === 3) return { strength: 3, label: 'Fair', color: 'bg-yellow-500' };
  if (passedTests === 4) return { strength: 4, label: 'Good', color: 'bg-blue-500' };
  if (passedTests === 5) return { strength: 5, label: 'Strong', color: 'bg-green-500' };
  
  return { strength: 0, label: '', color: '' };
};

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password, 
  showDetails = true 
}) => {
  const { isDark } = useTheme();
  const { strength, label, color } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Password Strength
          </span>
          <span className={`text-sm font-medium ${
            strength >= 4 
              ? 'text-green-600' 
              : strength >= 3 
                ? 'text-yellow-600' 
                : strength >= 2 
                  ? 'text-orange-600' 
                  : 'text-red-600'
          }`}>
            {label}
          </span>
        </div>
        <div className={`w-full h-2 rounded-full ${
          isDark ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <div 
            className={`h-full rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Criteria Details */}
      {showDetails && (
        <div className="space-y-2">
          <p className={`text-sm font-medium ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Password Requirements:
          </p>
          <ul className="space-y-1">
            {passwordCriteria.map((criteria, index) => {
              const isPassed = criteria.test(password);
              return (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <svg 
                    className={`w-4 h-4 ${
                      isPassed 
                        ? 'text-green-500' 
                        : isDark 
                          ? 'text-gray-500' 
                          : 'text-gray-400'
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d={isPassed 
                        ? "M5 13l4 4L19 7" 
                        : "M6 18L18 6M6 6l12 12"
                      } 
                    />
                  </svg>
                  <span className={
                    isPassed 
                      ? isDark 
                        ? 'text-green-400' 
                        : 'text-green-600'
                      : isDark 
                        ? 'text-gray-400' 
                        : 'text-gray-600'
                  }>
                    {criteria.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;