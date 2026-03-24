'use client';

import { useTheme } from '@/components/ThemeProvider';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';

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
  calculations?: {
    availableCredit?: number;
    utilizationRate?: number;
  };
}

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const { isDark } = useTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'SAVINGS': return '🏦';
      case 'CHECKING': return '💳';
      case 'CREDIT_CARD': return '💎';
      case 'DEBIT_CARD': return '🔹';
      default: return '🏛️';
    }
  };

  const getAccountTypeName = (type: string) => {
    switch (type) {
      case 'SAVINGS': return 'Savings Account';
      case 'CHECKING': return 'Checking Account';
      case 'CREDIT_CARD': return 'Credit Card';
      case 'DEBIT_CARD': return 'Debit Card';
      default: return 'Account';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return isDark ? 'text-green-400' : 'text-green-600';
      case 'INACTIVE': return isDark ? 'text-yellow-400' : 'text-yellow-600';
      case 'CLOSED': return isDark ? 'text-red-400' : 'text-red-600';
      default: return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getUtilizationColor = (rate: number) => {
    if (rate > 70) return isDark ? 'text-red-400' : 'text-red-600';
    if (rate > 30) return isDark ? 'text-yellow-400' : 'text-yellow-600';
    return isDark ? 'text-green-400' : 'text-green-600';
  };

  const isExpiringCard = () => {
    if (account.accountType !== 'CREDIT_CARD' || !account.expiryDate) return false;
    
    const [month, year] = account.expiryDate.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const currentDate = new Date();
    const monthsUntilExpiry = (expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    return monthsUntilExpiry <= 3 && monthsUntilExpiry > 0;
  };

  return (
    <Card className={`p-6 ${isExpiringCard() ? 'border-yellow-500' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getAccountTypeIcon(account.accountType)}</span>
          <div>
            <Typography variant="h4" color="dark" className="font-semibold">
              {account.accountName}
            </Typography>
            <Typography variant="caption" color="medium">
              {account.bankName} • {getAccountTypeName(account.accountType)}
            </Typography>
          </div>
        </div>
        <span className={`text-sm font-medium ${getStatusColor(account.status)}`}>
          {account.status}
        </span>
      </div>

      {account.accountNumber && (
        <div className="mb-4">
          <Typography variant="caption" color="medium">
            Account Number: •••• {account.accountNumber}
          </Typography>
        </div>
      )}

      {/* Balance/Limit Information */}
      <div className="space-y-3 mb-6">
        {account.accountType === 'CREDIT_CARD' ? (
          <>
            <div className="flex justify-between">
              <Typography variant="body" color="medium">Current Balance:</Typography>
              <Typography variant="body" color="dark" className="font-semibold">
                {formatCurrency(account.currentBalance)}
              </Typography>
            </div>
            
            {account.creditLimit && (
              <>
                <div className="flex justify-between">
                  <Typography variant="body" color="medium">Credit Limit:</Typography>
                  <Typography variant="body" color="dark">
                    {formatCurrency(account.creditLimit)}
                  </Typography>
                </div>
                
                <div className="flex justify-between">
                  <Typography variant="body" color="medium">Available Credit:</Typography>
                  <Typography variant="body" color="success" className="font-semibold">
                    {formatCurrency(account.calculations?.availableCredit || 0)}
                  </Typography>
                </div>
                
                {account.calculations?.utilizationRate !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Typography variant="body" color="medium">Utilization:</Typography>
                      <Typography 
                        variant="body" 
                        className={`font-semibold ${getUtilizationColor(account.calculations.utilizationRate)}`}
                      >
                        {account.calculations.utilizationRate.toFixed(1)}%
                      </Typography>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-full rounded-full ${
                          account.calculations.utilizationRate > 70 ? 'bg-red-500' : 
                          account.calculations.utilizationRate > 30 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(account.calculations.utilizationRate, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {account.expiryDate && (
              <div className="flex justify-between">
                <Typography variant="body" color="medium">Expires:</Typography>
                <Typography variant="body" color={isExpiringCard() ? "warning" : "dark"}>
                  {account.expiryDate}
                </Typography>
              </div>
            )}

            {account.paymentDueDate && (
              <div className="flex justify-between">
                <Typography variant="body" color="medium">Payment Due:</Typography>
                <Typography variant="body" color="dark">
                  {new Date(account.paymentDueDate).toLocaleDateString()}
                </Typography>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-between">
              <Typography variant="body" color="medium">Current Balance:</Typography>
              <Typography variant="h3" color="success" className="font-semibold">
                {formatCurrency(account.currentBalance)}
              </Typography>
            </div>
            
            {account.interestRate && (
              <div className="flex justify-between">
                <Typography variant="body" color="medium">Interest Rate:</Typography>
                <Typography variant="body" color="dark">
                  {(account.interestRate * 100).toFixed(2)}% APY
                </Typography>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(account)}
        >
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`flex-1 ${isDark ? 'text-red-400 hover:text-red-300 border-red-600 hover:border-red-500' : 'text-red-600 hover:text-red-700 border-red-200 hover:border-red-300'}`}
          onClick={() => onDelete(account)}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}