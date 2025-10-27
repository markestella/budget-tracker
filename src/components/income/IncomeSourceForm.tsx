'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { useTheme } from '@/components/ThemeProvider';

type IncomeCategory = 'SALARY' | 'FREELANCE' | 'BUSINESS' | 'INVESTMENT' | 'RENTAL' | 'PENSION' | 'BENEFITS' | 'OTHER';
type PaymentFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
type ScheduleWeek = 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH' | 'LAST';

interface IncomeSource {
  id?: string;
  name: string;
  category: IncomeCategory;
  description?: string;
  frequency: PaymentFrequency;
  amount: number;
  isActive: boolean;
  scheduleDays?: number[];
  scheduleWeekday?: number;
  scheduleWeek?: ScheduleWeek;
  scheduleTime?: string;
  useManualAmounts?: boolean;
  scheduleDayAmounts?: Record<number, number>;
}

interface IncomeSourceFormProps {
  source?: IncomeSource;
  onSubmit: (source: Omit<IncomeSource, 'id'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function IncomeSourceForm({ source, onSubmit, onCancel, loading = false }: IncomeSourceFormProps) {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState<Omit<IncomeSource, 'id'>>({
    name: source?.name || '',
    category: source?.category || 'SALARY',
    description: source?.description || '',
    frequency: source?.frequency || 'MONTHLY',
    amount: source?.amount || 0,
    isActive: source?.isActive ?? true,
    scheduleDays: source?.scheduleDays || [],
    scheduleWeekday: source?.scheduleWeekday ?? undefined,
    scheduleWeek: source?.scheduleWeek ?? undefined,
    scheduleTime: source?.scheduleTime || '09:00',
    useManualAmounts: source?.useManualAmounts ?? false,
    scheduleDayAmounts: source?.scheduleDayAmounts || {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.frequency) {
      newErrors.frequency = 'Payment frequency is required';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    // Schedule validation for non-one-time payments
    if (formData.frequency !== 'ONE_TIME') {
      if (formData.frequency === 'MONTHLY') {
        if (!formData.scheduleDays || formData.scheduleDays.length === 0) {
          newErrors.scheduleDays = 'Please select at least one payment day for monthly frequency';
        }
      }

      if (formData.frequency === 'WEEKLY' || formData.frequency === 'BIWEEKLY') {
        if (formData.scheduleWeekday === undefined || formData.scheduleWeekday === null) {
          newErrors.scheduleWeekday = 'Please select a day of the week';
        }

        if (formData.frequency === 'BIWEEKLY' && !formData.scheduleWeek) {
          newErrors.scheduleWeek = 'Please select which week of the month for bi-weekly payments';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // If changing scheduleDays, update the amounts accordingly
      if (field === 'scheduleDays' && formData.frequency === 'MONTHLY') {
        const newDays = value as number[];
        const currentAmounts = prev.scheduleDayAmounts || {};
        const newAmounts: Record<number, number> = {};
        
        // Keep existing amounts for days that are still selected
        newDays.forEach(day => {
          newAmounts[day] = currentAmounts[day] || (prev.useManualAmounts ? 0 : prev.amount / Math.max(newDays.length, 1));
        });
        
        newData.scheduleDayAmounts = newAmounts;
        
        // Update total amount if not using manual amounts
        if (!prev.useManualAmounts && newDays.length > 0) {
          const avgAmount = prev.amount / newDays.length;
          Object.keys(newAmounts).forEach(day => {
            newAmounts[parseInt(day)] = avgAmount;
          });
        }
      }
      
      // If toggling manual amounts, recalculate amounts
      if (field === 'useManualAmounts') {
        const days = prev.scheduleDays || [];
        const newAmounts: Record<number, number> = {};
        
        if (value) {
          // Switching to manual: keep current divided amounts as starting point
          days.forEach(day => {
            newAmounts[day] = prev.amount / Math.max(days.length, 1);
          });
        } else {
          // Switching to automatic: divide current total equally
          const equalAmount = prev.amount / Math.max(days.length, 1);
          days.forEach(day => {
            newAmounts[day] = equalAmount;
          });
        }
        
        newData.scheduleDayAmounts = newAmounts;
      }
      
      // If changing amount in automatic mode, update day amounts proportionally
      if (field === 'amount' && !prev.useManualAmounts && prev.scheduleDays && prev.scheduleDays.length > 0) {
        const newAmounts: Record<number, number> = {};
        const equalAmount = (value as number) / prev.scheduleDays.length;
        prev.scheduleDays.forEach(day => {
          newAmounts[day] = equalAmount;
        });
        newData.scheduleDayAmounts = newAmounts;
      }
      
      return newData;
    });
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateTotalFromDayAmounts = () => {
    if (!formData.scheduleDayAmounts) return 0;
    return Object.values(formData.scheduleDayAmounts).reduce((sum, amount) => sum + (amount || 0), 0);
  };

  const updateDayAmount = (day: number, amount: number) => {
    const newAmounts = { ...formData.scheduleDayAmounts, [day]: amount };
    setFormData(prev => ({ 
      ...prev, 
      scheduleDayAmounts: newAmounts,
      // Update total amount if using manual amounts
      amount: prev.useManualAmounts ? Object.values(newAmounts).reduce((sum, amt) => sum + (amt || 0), 0) : prev.amount
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-200' : 'text-gray-700'
        }`}>
          Income Source Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
            errors.name 
              ? isDark 
                ? 'border-red-600 bg-gray-800 text-white focus:border-red-500 focus:ring-red-500/20' 
                : 'border-red-300 bg-white text-gray-900 focus:border-red-500 focus:ring-red-500/20'
              : isDark 
                ? 'border-gray-600 bg-gray-800 text-white focus:border-blue-400 focus:ring-blue-400/20' 
                : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
          }`}
          placeholder="e.g., Main Job Salary"
        />
        {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-200' : 'text-gray-700'
        }`}>
          Category *
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => handleInputChange('category', e.target.value as IncomeCategory)}
          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
            errors.category 
              ? isDark 
                ? 'border-red-600 bg-gray-800 text-white focus:border-red-500 focus:ring-red-500/20' 
                : 'border-red-300 bg-white text-gray-900 focus:border-red-500 focus:ring-red-500/20'
              : isDark 
                ? 'border-gray-600 bg-gray-800 text-white focus:border-blue-400 focus:ring-blue-400/20' 
                : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
          }`}
        >
          <option value="SALARY">Salary</option>
          <option value="FREELANCE">Freelance</option>
          <option value="BUSINESS">Business</option>
          <option value="INVESTMENT">Investment</option>
          <option value="RENTAL">Rental</option>
          <option value="PENSION">Pension</option>
          <option value="BENEFITS">Benefits</option>
          <option value="OTHER">Other</option>
        </select>
        {errors.category && <p className="mt-2 text-sm text-red-500">{errors.category}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-200' : 'text-gray-700'
        }`}>
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
            isDark 
              ? 'border-gray-600 bg-gray-800 text-white focus:border-blue-400 focus:ring-blue-400/20' 
              : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
          }`}
          placeholder="Additional details about this income source..."
        />
      </div>

      {/* Payment Frequency */}
      <div>
        <label htmlFor="frequency" className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-200' : 'text-gray-700'
        }`}>
          Payment Frequency *
        </label>
        <select
          id="frequency"
          value={formData.frequency}
          onChange={(e) => handleInputChange('frequency', e.target.value as PaymentFrequency)}
          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
            errors.frequency 
              ? isDark 
                ? 'border-red-600 bg-gray-800 text-white focus:border-red-500 focus:ring-red-500/20' 
                : 'border-red-300 bg-white text-gray-900 focus:border-red-500 focus:ring-red-500/20'
              : isDark 
                ? 'border-gray-600 bg-gray-800 text-white focus:border-blue-400 focus:ring-blue-400/20' 
                : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
          }`}
        >
          <option value="WEEKLY">Weekly</option>
          <option value="BIWEEKLY">Bi-weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="QUARTERLY">Quarterly</option>
          <option value="YEARLY">Yearly</option>
          <option value="ONE_TIME">One Time</option>
        </select>
        {errors.frequency && <p className="mt-2 text-sm text-red-500">{errors.frequency}</p>}
      </div>

      {/* Schedule Configuration */}
      {formData.frequency !== 'ONE_TIME' && (
        <div className={`space-y-4 p-4 rounded-lg border ${
          isDark ? 'border-gray-600 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <h3 className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Payment Schedule Configuration
          </h3>

          {/* Monthly Schedule */}
          {formData.frequency === 'MONTHLY' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Payment Days (Select specific dates) *
              </label>
              <div className="grid grid-cols-7 gap-2 mb-3">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      const days = formData.scheduleDays || [];
                      const newDays = days.includes(day)
                        ? days.filter(d => d !== day)
                        : [...days, day].sort((a, b) => a - b);
                      handleInputChange('scheduleDays', newDays);
                    }}
                    className={`px-2 py-1 text-xs rounded border transition-all ${
                      (formData.scheduleDays || []).includes(day)
                        ? isDark
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-blue-500 border-blue-400 text-white'
                        : isDark
                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  const days = formData.scheduleDays || [];
                  const newDays = days.includes(31) ? days.filter(d => d !== 31) : [...days, 31];
                  handleInputChange('scheduleDays', newDays.sort((a, b) => a - b));
                }}
                className={`text-xs px-3 py-1 rounded border transition-all ${
                  (formData.scheduleDays || []).includes(31)
                    ? isDark
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-blue-500 border-blue-400 text-white'
                    : isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Last Day of Month
              </button>
              <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Selected: {(formData.scheduleDays || []).join(', ') || 'None'}
              </p>

              {/* Amount Configuration Toggle for Multiple Days */}
              {formData.scheduleDays && formData.scheduleDays.length > 1 && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  isDark ? 'border-gray-600 bg-gray-800/30' : 'border-gray-300 bg-gray-100/50'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="useManualAmounts"
                      checked={formData.useManualAmounts || false}
                      onChange={(e) => handleInputChange('useManualAmounts', e.target.checked)}
                      className={`h-4 w-4 rounded focus:ring-2 ${
                        isDark 
                          ? 'text-blue-400 focus:ring-blue-400/20 border-gray-600 bg-gray-800' 
                          : 'text-blue-600 focus:ring-blue-500/20 border-gray-300 bg-white'
                      }`}
                    />
                    <label htmlFor="useManualAmounts" className={`text-sm font-medium ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Set different amounts for each payment day
                    </label>
                  </div>

                  {formData.useManualAmounts ? (
                    <div className="space-y-3">
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Set the amount you receive on each selected day:
                      </p>
                      {(formData.scheduleDays || []).sort((a, b) => a - b).map((day) => (
                        <div key={day} className="flex items-center gap-3">
                          <label className={`text-sm w-20 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            Day {day}{day === 31 ? ' (last)' : ''}:
                          </label>
                          <div className="flex items-center gap-1">
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>₱</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.scheduleDayAmounts?.[day] || 0}
                              onChange={(e) => updateDayAmount(day, parseFloat(e.target.value) || 0)}
                              className={`w-32 px-3 py-1 text-sm rounded border transition-all duration-200 focus:outline-none focus:ring-2 ${
                                isDark 
                                  ? 'border-gray-600 bg-gray-800 text-white focus:border-blue-400 focus:ring-blue-400/20' 
                                  : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
                              }`}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      ))}
                      <div className={`mt-3 p-2 rounded border ${
                        isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                      }`}>
                        <p className={`text-sm font-medium ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                          💰 Total Monthly: ₱{calculateTotalFromDayAmounts().toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-3 rounded border ${
                      isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
                    }`}>
                      <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                        🔄 Automatic Division
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                        Monthly Total: ₱{formData.amount.toLocaleString()} ÷ {formData.scheduleDays.length} payments = <strong>₱{(formData.amount / formData.scheduleDays.length).toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong> per payment
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        Each payment on: {formData.scheduleDays.sort((a, b) => a - b).join(', ')}{formData.scheduleDays.includes(31) ? ' (last day means end of month)' : ''}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {errors.scheduleDays && <p className="mt-2 text-sm text-red-500">{errors.scheduleDays}</p>}
            </div>
          )}

          {/* Weekly/Bi-weekly Schedule */}
          {(formData.frequency === 'WEEKLY' || formData.frequency === 'BIWEEKLY') && (
            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Day of Week *
                </label>
                <select
                  value={formData.scheduleWeekday ?? ''}
                  onChange={(e) => handleInputChange('scheduleWeekday', e.target.value ? parseInt(e.target.value) : undefined)}
                  className={`w-full px-3 py-2 rounded border transition-all duration-200 focus:outline-none focus:ring-2 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-800 text-white focus:border-blue-400 focus:ring-blue-400/20' 
                      : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                >
                  <option value="">Select day...</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                  <option value="0">Sunday</option>
                </select>
                {errors.scheduleWeekday && <p className="mt-2 text-sm text-red-500">{errors.scheduleWeekday}</p>}
              </div>

              {formData.frequency === 'BIWEEKLY' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Week of Month *
                  </label>
                  <select
                    value={formData.scheduleWeek || ''}
                    onChange={(e) => handleInputChange('scheduleWeek', e.target.value as ScheduleWeek || undefined)}
                    className={`w-full px-3 py-2 rounded border transition-all duration-200 focus:outline-none focus:ring-2 ${
                      isDark 
                        ? 'border-gray-600 bg-gray-800 text-white focus:border-blue-400 focus:ring-blue-400/20' 
                        : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                  >
                    <option value="">Select week...</option>
                    <option value="FIRST">First Week</option>
                    <option value="SECOND">Second Week</option>
                    <option value="THIRD">Third Week</option>
                    <option value="FOURTH">Fourth Week</option>
                    <option value="LAST">Last Week</option>
                  </select>
                  {errors.scheduleWeek && <p className="mt-2 text-sm text-red-500">{errors.scheduleWeek}</p>}
                </div>
              )}
            </div>
          )}

          {/* Payment Time */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Payment Time (Optional)
            </label>
            <input
              type="time"
              value={formData.scheduleTime || '09:00'}
              onChange={(e) => handleInputChange('scheduleTime', e.target.value)}
              className={`w-full px-3 py-2 rounded border transition-all duration-200 focus:outline-none focus:ring-2 ${
                isDark 
                  ? 'border-gray-600 bg-gray-800 text-white focus:border-blue-400 focus:ring-blue-400/20' 
                  : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
            <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Expected time when payment is received
            </p>
          </div>
        </div>
      )}

      {/* Amount */}
      <div>
        <label htmlFor="amount" className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-200' : 'text-gray-700'
        }`}>
          Expected Amount (₱) *
        </label>
        <input
          type="number"
          id="amount"
          min="0"
          step="0.01"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
            errors.amount 
              ? isDark 
                ? 'border-red-600 bg-gray-800 text-white focus:border-red-500 focus:ring-red-500/20' 
                : 'border-red-300 bg-white text-gray-900 focus:border-red-500 focus:ring-red-500/20'
              : isDark 
                ? 'border-gray-600 bg-gray-800 text-white focus:border-blue-400 focus:ring-blue-400/20' 
                : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
          }`}
          placeholder="0.00"
          disabled={formData.useManualAmounts && formData.frequency === 'MONTHLY' && formData.scheduleDays && formData.scheduleDays.length > 1}
        />
        {formData.useManualAmounts && formData.frequency === 'MONTHLY' && formData.scheduleDays && formData.scheduleDays.length > 1 && (
          <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Amount is calculated from individual day amounts above
          </p>
        )}
        {errors.amount && <p className="mt-2 text-sm text-red-500">{errors.amount}</p>}
      </div>

      {/* Active Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => handleInputChange('isActive', e.target.checked)}
          className={`h-4 w-4 rounded focus:ring-2 ${
            isDark 
              ? 'text-blue-400 focus:ring-blue-400/20 border-gray-600 bg-gray-800' 
              : 'text-blue-600 focus:ring-blue-500/20 border-gray-300 bg-white'
          }`}
        />
        <label htmlFor="isActive" className={`ml-3 text-sm ${
          isDark ? 'text-gray-200' : 'text-gray-700'
        }`}>
          Active (include in calculations and projections)
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Saving...' : (source ? 'Update Income Source' : 'Create Income Source')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}