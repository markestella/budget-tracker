'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

type PaymentStatus = 'PENDING' | 'RECEIVED' | 'OVERDUE';

interface IncomeRecord {
  id?: string;
  incomeSourceId: string;
  expectedDate: string;
  actualAmount?: number;
  actualDate?: string;
  status: PaymentStatus;
  notes?: string;
}

interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  category?: string;
}

interface IncomeRecordFormProps {
  record?: IncomeRecord;
  incomeSourceId?: string;
  expectedAmount?: number;
  incomeSources?: IncomeSource[];
  onSubmit: (record: Omit<IncomeRecord, 'id'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function IncomeRecordForm({ 
  record, 
  incomeSourceId, 
  expectedAmount, 
  incomeSources = [],
  onSubmit, 
  onCancel, 
  loading = false 
}: IncomeRecordFormProps) {
  const [formData, setFormData] = useState<Omit<IncomeRecord, 'id'>>({
    incomeSourceId: record?.incomeSourceId || incomeSourceId || '',
    expectedDate: record?.expectedDate || new Date().toISOString().split('T')[0],
    actualAmount: record?.actualAmount || undefined,
    actualDate: record?.actualDate || undefined,
    status: record?.status || 'PENDING',
    notes: record?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.incomeSourceId) {
      newErrors.incomeSourceId = 'Income source is required';
    }

    if (!formData.expectedDate) {
      newErrors.expectedDate = 'Expected date is required';
    }

    if (formData.status === 'RECEIVED' && !formData.actualAmount) {
      newErrors.actualAmount = 'Actual amount is required when status is Received';
    }

    if (formData.actualAmount !== undefined && formData.actualAmount <= 0) {
      newErrors.actualAmount = 'Actual amount must be greater than 0';
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
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-set actual date when marking as received
    if (field === 'status' && value === 'RECEIVED' && !formData.actualDate) {
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        actualDate: new Date().toISOString().split('T')[0]
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Income Source */}
      <div>
        <label htmlFor="incomeSourceId" className="block text-sm font-medium text-gray-700 mb-1">
          Income Source *
        </label>
        <select
          id="incomeSourceId"
          value={formData.incomeSourceId}
          onChange={(e) => handleInputChange('incomeSourceId', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.incomeSourceId ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Select an income source</option>
          {incomeSources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.name} - ${parseFloat(source.amount.toString()).toFixed(2)}
            </option>
          ))}
        </select>
        {errors.incomeSourceId && <p className="mt-1 text-sm text-red-600">{errors.incomeSourceId}</p>}
      </div>

      {/* Expected Date */}
      <div>
        <label htmlFor="expectedDate" className="block text-sm font-medium text-gray-700 mb-1">
          Expected Date *
        </label>
        <input
          type="date"
          id="expectedDate"
          value={formData.expectedDate}
          onChange={(e) => handleInputChange('expectedDate', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.expectedDate ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.expectedDate && <p className="mt-1 text-sm text-red-600">{errors.expectedDate}</p>}
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status *
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => handleInputChange('status', e.target.value as PaymentStatus)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.status ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="PENDING">Pending</option>
          <option value="RECEIVED">Received</option>
          <option value="OVERDUE">Overdue</option>
        </select>
        {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
      </div>

      {/* Actual Amount (shown when status is RECEIVED) */}
      {(formData.status === 'RECEIVED' || formData.actualAmount !== undefined) && (
        <div>
          <label htmlFor="actualAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Actual Amount ($) {formData.status === 'RECEIVED' && '*'}
          </label>
          <input
            type="number"
            id="actualAmount"
            min="0"
            step="0.01"
            value={formData.actualAmount || ''}
            onChange={(e) => handleInputChange('actualAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.actualAmount ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={expectedAmount ? `Expected: $${expectedAmount}` : '0.00'}
          />
          {errors.actualAmount && <p className="mt-1 text-sm text-red-600">{errors.actualAmount}</p>}
          {expectedAmount && formData.actualAmount && (
            <p className={`mt-1 text-sm ${
              formData.actualAmount >= expectedAmount ? 'text-green-600' : 'text-red-600'
            }`}>
              {formData.actualAmount >= expectedAmount 
                ? `+$${(formData.actualAmount - expectedAmount).toFixed(2)} above expected`
                : `-$${(expectedAmount - formData.actualAmount).toFixed(2)} below expected`
              }
            </p>
          )}
        </div>
      )}

      {/* Actual Date (shown when status is RECEIVED) */}
      {(formData.status === 'RECEIVED' || formData.actualDate) && (
        <div>
          <label htmlFor="actualDate" className="block text-sm font-medium text-gray-700 mb-1">
            Actual Received Date
          </label>
          <input
            type="date"
            id="actualDate"
            value={formData.actualDate || ''}
            onChange={(e) => handleInputChange('actualDate', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Any additional notes about this payment..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Saving...' : (record ? 'Update Record' : 'Create Record')}
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