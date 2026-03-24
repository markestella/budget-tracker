'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/components/ThemeProvider';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { AccountCard } from '@/components/accounts/AccountCard';
import { AccountForm } from '@/components/accounts/AccountForm';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface AccountSummary {
  totalLiquidAssets: number;
  totalCreditLimit: number;
  totalCreditBalance: number;
  totalAvailableCredit: number;
  totalCreditUtilization: number;
  accountCounts: {
    savings: number;
    checking: number;
    creditCards: number;
    debitCards: number;
  };
  alerts: any[];
}

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

export default function AccountsPage() {
  const { isDark } = useTheme();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accountsRes, summaryRes] = await Promise.all([
        fetch('/api/accounts', { credentials: 'include' }),
        fetch('/api/accounts/dashboard', { credentials: 'include' })
      ]);

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(accountsData);
      }

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }
    } catch (error) {
      console.error('Error fetching accounts data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccountSubmit = async (accountData: Omit<Account, 'id' | 'calculations'>) => {
    try {
      const url = editingAccount 
        ? `/api/accounts/${editingAccount.id}` 
        : '/api/accounts';
      
      const method = editingAccount ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
        credentials: 'include',
      });

      if (response.ok) {
        await fetchData();
        setShowAccountForm(false);
        setEditingAccount(null);
      }
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleAccountDelete = (account: Account) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Account',
      message: `Are you sure you want to delete "${account.accountName}" (${account.bankName})? This action cannot be undone.`,
      isDestructive: true,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/accounts/${account.id}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (response.ok) {
            await fetchData();
          }
        } catch (error) {
          console.error('Error deleting account:', error);
        }
      }
    });
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'danger': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getAlertColor = (severity: string) => {
    if (isDark) {
      switch (severity) {
        case 'danger': return 'text-red-400 bg-red-900/20 border-red-800';
        case 'warning': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
        case 'info': return 'text-blue-400 bg-blue-900/20 border-blue-800';
        default: return 'text-gray-400 bg-gray-800/20 border-gray-700';
      }
    } else {
      switch (severity) {
        case 'danger': return 'text-red-700 bg-red-50 border-red-200';
        case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
        case 'info': return 'text-blue-700 bg-blue-50 border-blue-200';
        default: return 'text-gray-700 bg-gray-50 border-gray-200';
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <Typography variant="h1" color="dark" className="text-center">
              Loading accounts...
            </Typography>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h1" color="dark" className="mb-2">
                Accounts & Cards
              </Typography>
              <Typography variant="body" color="medium">
                Manage your financial accounts, track balances, and monitor credit utilization
              </Typography>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setEditingAccount(null);
                setShowAccountForm(true);
              }}
            >
              Add Account
            </Button>
          </div>

          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <Typography variant="caption" color="medium" className="mb-2">
                  Liquid Assets
                </Typography>
                <Typography variant="h2" color="primary" className="mb-2">
                  {formatCurrency(summary.totalLiquidAssets)}
                </Typography>
                <Typography variant="caption" color="medium">
                  {summary.accountCounts.savings + summary.accountCounts.checking} accounts
                </Typography>
              </Card>

              <Card className="p-6">
                <Typography variant="caption" color="medium" className="mb-2">
                  Available Credit
                </Typography>
                <Typography variant="h2" color="success" className="mb-2">
                  {formatCurrency(summary.totalAvailableCredit)}
                </Typography>
                <Typography variant="caption" color="medium">
                  {summary.accountCounts.creditCards} credit cards
                </Typography>
              </Card>

              <Card className="p-6">
                <Typography variant="caption" color="medium" className="mb-2">
                  Credit Utilization
                </Typography>
                <Typography 
                  variant="h2" 
                  color={summary.totalCreditUtilization > 70 ? "warning" : summary.totalCreditUtilization > 30 ? "medium" : "success"}
                  className="mb-2"
                >
                  {summary.totalCreditUtilization.toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="medium">
                  {formatCurrency(summary.totalCreditBalance)} of {formatCurrency(summary.totalCreditLimit)}
                </Typography>
              </Card>

              <Card className="p-6">
                <Typography variant="caption" color="medium" className="mb-2">
                  Total Accounts
                </Typography>
                <Typography variant="h2" color="dark" className="mb-2">
                  {Object.values(summary.accountCounts).reduce((a, b) => a + b, 0)}
                </Typography>
                <Typography variant="caption" color="medium">
                  {summary.alerts.length} alerts
                </Typography>
              </Card>
            </div>
          )}

          {/* Alerts */}
          {summary && summary.alerts.length > 0 && (
            <Card className="p-6">
              <Typography variant="h3" color="dark" className="mb-4">
                Alerts & Notifications
              </Typography>
              <div className="space-y-3">
                {summary.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${getAlertColor(alert.severity)}`}
                  >
                    <span className="text-lg">{getAlertIcon(alert.severity)}</span>
                    <Typography variant="body" className="flex-1">
                      {alert.message}
                    </Typography>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Accounts Grid */}
          <div className="space-y-6">
            <Typography variant="h2" color="dark">
              Your Accounts
            </Typography>
            
            {accounts.length === 0 ? (
              <Card className="p-12 text-center">
                <Typography variant="h3" color="medium" className="mb-4">
                  No accounts found
                </Typography>
                <Typography variant="body" color="medium" className="mb-6">
                  Start by adding your first financial account to track balances and manage your finances.
                </Typography>
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingAccount(null);
                    setShowAccountForm(true);
                  }}
                >
                  Add Your First Account
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onEdit={(account: Account) => {
                      setEditingAccount(account);
                      setShowAccountForm(true);
                    }}
                    onDelete={handleAccountDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Account Form Modal */}
        {showAccountForm && (
          <AccountForm
            account={editingAccount}
            onSubmit={handleAccountSubmit}
            onCancel={() => {
              setShowAccountForm(false);
              setEditingAccount(null);
            }}
          />
        )}

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          isDestructive={confirmModal.isDestructive}
          onConfirm={() => {
            confirmModal.onConfirm();
            setConfirmModal({ ...confirmModal, isOpen: false });
          }}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        />
      </div>
    </DashboardLayout>
  );
}