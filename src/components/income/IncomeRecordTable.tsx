'use client';

import { IncomeCategoryBadge } from './IncomeCategoryBadge';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import Button from '@/components/ui/Button';
import { useTheme } from '@/components/ThemeProvider';

type IncomeCategory = 'SALARY' | 'FREELANCE' | 'BUSINESS' | 'INVESTMENT' | 'RENTAL' | 'PENSION' | 'BENEFITS' | 'OTHER';
type PaymentFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
type PaymentStatus = 'PENDING' | 'RECEIVED' | 'OVERDUE';

interface IncomeRecord {
  id: string;
  incomeSourceId: string;
  expectedDate: string;
  actualAmount?: number;
  actualDate?: string;
  status: PaymentStatus;
  notes?: string;
  incomeSource: {
    name: string;
    category: IncomeCategory;
    frequency: PaymentFrequency;
    amount?: number;
  };
}

interface IncomeRecordTableProps {
  records: IncomeRecord[];
  loading?: boolean;
  onEdit?: (record: IncomeRecord) => void;
  onDelete?: (record: IncomeRecord) => void;
  onStatusUpdate?: (record: IncomeRecord, newStatus: PaymentStatus) => void;
}

export function IncomeRecordTable({
  records,
  loading = false,
  onEdit,
  onDelete,
  onStatusUpdate,
}: IncomeRecordTableProps) {
  const { isDark } = useTheme();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusFromDate = (expectedDate: string, currentStatus: PaymentStatus): PaymentStatus => {
    if (currentStatus === 'RECEIVED') return 'RECEIVED';
    
    const expected = new Date(expectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expected.setHours(0, 0, 0, 0);
    
    return expected < today ? 'OVERDUE' : 'PENDING';
  };

  if (loading) {
    return (
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`p-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Loading records...
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`p-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className="text-lg mb-2">No income records found</div>
          <p>Records will appear here as you track your income payments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <tr>
              <th className={`text-left px-6 py-3 text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Income Source
              </th>
              <th className={`text-left px-6 py-3 text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Expected Date
              </th>
              <th className={`text-left px-6 py-3 text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Expected Amount
              </th>
              <th className={`text-left px-6 py-3 text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Status
              </th>
              <th className={`text-left px-6 py-3 text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Actual Amount
              </th>
              <th className={`text-left px-6 py-3 text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Received Date
              </th>
              <th className={`text-right px-6 py-3 text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`${isDark ? 'bg-gray-800' : 'bg-white'} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {records.map((record) => {
              const actualStatus = getStatusFromDate(record.expectedDate, record.status);
              const expectedAmount = record.incomeSource.amount || 0;
              
              return (
                <tr key={record.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        {record.incomeSource.name}
                      </div>
                      <div className="mt-1">
                        <IncomeCategoryBadge 
                          category={record.incomeSource.category} 
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </td>
                  
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {formatDate(record.expectedDate)}
                  </td>
                  
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {formatAmount(expectedAmount)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PaymentStatusBadge status={actualStatus} />
                  </td>
                  
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {record.actualAmount ? (
                      <div>
                        <div>{formatAmount(record.actualAmount)}</div>
                        {expectedAmount > 0 && (
                          <div className={`text-xs ${
                            record.actualAmount >= expectedAmount 
                              ? isDark ? 'text-green-400' : 'text-green-600'
                              : isDark ? 'text-red-400' : 'text-red-600'
                          }`}>
                            {record.actualAmount >= expectedAmount 
                              ? `+${formatAmount(record.actualAmount - expectedAmount)}`
                              : `-${formatAmount(expectedAmount - record.actualAmount)}`
                            }
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>-</span>
                    )}
                  </td>
                  
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {record.actualDate ? formatDate(record.actualDate) : (
                      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>-</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                      {onStatusUpdate && actualStatus !== 'RECEIVED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStatusUpdate(record, 'RECEIVED')}
                          className={`${isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'}`}
                        >
                          Mark Received
                        </Button>
                      )}
                      
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(record)}
                        >
                          Edit
                        </Button>
                      )}
                      
                      {onDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(record)}
                          className={`${isDark ? 'text-red-400 hover:text-red-300 border-red-600 hover:border-red-500' : 'text-red-600 hover:text-red-700 border-red-200 hover:border-red-300'}`}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}