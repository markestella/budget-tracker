'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';

const getInitialFormData = (account: Account | null) => ({
  accountType: account?.accountType || 'SAVINGS',
  bankName: account?.bankName || '',
  accountName: account?.accountName || '',
  accountNumber: account?.accountNumber || '',
  currentBalance: account?.currentBalance || 0,
  interestRate: account?.interestRate || 0,
  status: account?.status || 'ACTIVE',
  expiryDate: account?.expiryDate || '',
  cutoffDate: account?.cutoffDate || 1,
  creditLimit: account?.creditLimit || 0,
  minimumPaymentDue: account?.minimumPaymentDue || 0,
  paymentDueDate: account?.paymentDueDate ? account.paymentDueDate.split('T')[0] : '',
});

type FormData = ReturnType<typeof getInitialFormData>;

interface Account {
  id: string;
  accountType: string;
  bankName: string;
  accountName: string;
  accountNumber?: string;
  currentBalance: number;
  interestRate?: number;
  status: string;
  expiryDate?: string;
  cutoffDate?: number;
  statementDate?: number;
  creditLimit?: number;
  minimumPaymentDue?: number;
  paymentDueDate?: string;
}

interface AccountFormProps {
  account: Account | null;
  onSubmit: (data: Omit<Account, 'id' | 'calculations'>) => void;
  onCancel: () => void;
}

export function AccountForm({ account, onSubmit, onCancel }: AccountFormProps) {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState<FormData>(() => getInitialFormData(account));

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setFormData(getInitialFormData(account));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [account]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    }

    if (formData.currentBalance < 0) {
      newErrors.currentBalance = 'Balance cannot be negative';
    }

    if (formData.accountType === 'CREDIT_CARD') {
      if (formData.creditLimit <= 0) {
        newErrors.creditLimit = 'Credit limit must be greater than 0';
      }

      if (formData.currentBalance > formData.creditLimit) {
        newErrors.currentBalance = 'Balance cannot exceed credit limit';
      }

      if (formData.expiryDate) {
        const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!expiryRegex.test(formData.expiryDate)) {
          newErrors.expiryDate = 'Expiry date must be in MM/YY format';
        }
      }

      if (formData.cutoffDate < 1 || formData.cutoffDate > 31) {
        newErrors.cutoffDate = 'Cut-off date must be between 1 and 31';
      }
    }

    if (formData.interestRate < 0 || formData.interestRate > 100) {
      newErrors.interestRate = 'Interest rate must be between 0 and 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        currentBalance: Number(formData.currentBalance),
        interestRate: formData.interestRate ? Number(formData.interestRate) / 100 : undefined,
        creditLimit: formData.accountType === 'CREDIT_CARD' ? Number(formData.creditLimit) : undefined,
        minimumPaymentDue: formData.accountType === 'CREDIT_CARD' ? Number(formData.minimumPaymentDue) : undefined,
        cutoffDate: formData.accountType === 'CREDIT_CARD' ? Number(formData.cutoffDate) : undefined,
        paymentDueDate: formData.paymentDueDate || undefined,
        expiryDate: formData.expiryDate || undefined,
        accountNumber: formData.accountNumber || undefined,
      };

      onSubmit(submitData as Omit<Account, 'id' | 'calculations'>);
    }
  };

  const accountTypes = [
    { value: 'SAVINGS', label: 'Savings Account' },
    { value: 'CHECKING', label: 'Checking Account' },
    { value: 'CREDIT_CARD', label: 'Credit Card' },
    { value: 'DEBIT_CARD', label: 'Debit Card' },
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="fixed inset-0" onClick={handleBackdropClick} />
      <div className={`relative w-full max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl border ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 p-6 pb-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-t-xl`}>
          <div className="flex items-center justify-between">
            <Typography variant="h2" color="dark">
              {account ? 'Edit Account' : 'Add New Account'}
            </Typography>
            <button
              onClick={onCancel}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Account Type *
              </label>
              <select
                value={formData.accountType}
                onChange={(e) => handleInputChange('accountType', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                } ${errors.accountType ? 'border-red-500' : ''}`}
              >
                {accountTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.accountType && <p className="mt-1 text-sm text-red-500">{errors.accountType}</p>}
            </div>

            {/* Bank Name */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Bank Name *
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                } ${errors.bankName ? 'border-red-500' : ''}`}
                placeholder="e.g., Chase, Bank of America, Wells Fargo"
              />
              {errors.bankName && <p className="mt-1 text-sm text-red-500">{errors.bankName}</p>}
            </div>

            {/* Account Name */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Account Name *
              </label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => handleInputChange('accountName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                } ${errors.accountName ? 'border-red-500' : ''}`}
                placeholder="e.g., Emergency Fund, Main Checking, Rewards Card"
              />
              {errors.accountName && <p className="mt-1 text-sm text-red-500">{errors.accountName}</p>}
            </div>

            {/* Account Number (Last 4 digits) */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Account Number (Last 4 digits)
              </label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value.slice(0, 4))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="1234"
                maxLength={4}
              />
            </div>

            {/* Current Balance */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Current Balance *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.currentBalance}
                onChange={(e) => handleInputChange('currentBalance', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                } ${errors.currentBalance ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
              {errors.currentBalance && <p className="mt-1 text-sm text-red-500">{errors.currentBalance}</p>}
            </div>

            {/* Interest Rate */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Interest Rate (% {formData.accountType === 'CREDIT_CARD' ? 'APR' : 'APY'})
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                } ${errors.interestRate ? 'border-red-500' : ''}`}
                placeholder="2.50"
              />
              {errors.interestRate && <p className="mt-1 text-sm text-red-500">{errors.interestRate}</p>}
            </div>

            {/* Credit Card Specific Fields */}
            {formData.accountType === 'CREDIT_CARD' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Credit Limit */}
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Credit Limit *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.creditLimit}
                      onChange={(e) => handleInputChange('creditLimit', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                      } ${errors.creditLimit ? 'border-red-500' : ''}`}
                      placeholder="5000.00"
                    />
                    {errors.creditLimit && <p className="mt-1 text-sm text-red-500">{errors.creditLimit}</p>}
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Expiry Date (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                      } ${errors.expiryDate ? 'border-red-500' : ''}`}
                      placeholder="12/26"
                      maxLength={5}
                    />
                    {errors.expiryDate && <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cut-off Date */}
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Cut-off Date (Day of Month)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.cutoffDate}
                      onChange={(e) => handleInputChange('cutoffDate', parseInt(e.target.value) || 1)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                      } ${errors.cutoffDate ? 'border-red-500' : ''}`}
                      placeholder="25"
                    />
                    {errors.cutoffDate && <p className="mt-1 text-sm text-red-500">{errors.cutoffDate}</p>}
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Statement will be generated 20 days after cut-off
                    </p>
                  </div>

                  {/* Payment Due Date */}
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Payment Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.paymentDueDate}
                      onChange={(e) => handleInputChange('paymentDueDate', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Minimum Payment Due */}
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Minimum Payment Due
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minimumPaymentDue}
                    onChange={(e) => handleInputChange('minimumPaymentDue', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="0.00"
                  />
                </div>
              </>
            )}

            {/* Status */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1">
                {account ? 'Update Account' : 'Add Account'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}