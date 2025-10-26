'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/components/ThemeProvider';

const AccountsPage: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <Typography variant="h2" color="dark" className="mb-2">
                Accounts & Cards
              </Typography>
              <Typography variant="body" color="medium">
                Manage your bank accounts and credit cards
              </Typography>
            </div>
            <Button variant="primary">
              Add Account
            </Button>
          </div>

          {/* Account Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                Total Assets
              </Typography>
              <Typography variant="h2" color="success" className="mb-2">
                ₱127,350.00
              </Typography>
              <Typography variant="caption" color="success">
                Across all accounts
              </Typography>
            </Card>

            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                Credit Used
              </Typography>
              <Typography variant="h2" color="warning" className="mb-2">
                ₱15,200.00
              </Typography>
              <Typography variant="caption" color="medium">
                28% of available credit
              </Typography>
            </Card>
          </div>

          {/* Bank Accounts */}
          <Card className="p-6 mb-6">
            <Typography variant="h3" color="dark" className="mb-6">
              Bank Accounts
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'BPI Savings Account', number: '•••• 1234', balance: '₱85,420.00', type: 'Savings' },
                { name: 'BDO Checking Account', number: '•••• 5678', balance: '₱32,180.00', type: 'Checking' },
                { name: 'Metrobank Time Deposit', number: '•••• 9012', balance: '₱9,750.00', type: 'Time Deposit' },
              ].map((account, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Typography variant="body" color="dark" className="font-medium">
                        {account.name}
                      </Typography>
                      <Typography variant="caption" color="medium">
                        {account.number} • {account.type}
                      </Typography>
                    </div>
                    <Typography variant="body" color="success" className="font-semibold">
                      {account.balance}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Credit Cards */}
          <Card className="p-6">
            <Typography variant="h3" color="dark" className="mb-6">
              Credit Cards
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'BPI Gold Mastercard', number: '•••• 3456', used: '₱12,500.00', limit: '₱50,000.00', utilization: 25 },
                { name: 'Citi Rewards Visa', number: '•••• 7890', used: '₱2,700.00', limit: '₱30,000.00', utilization: 9 },
              ].map((card, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Typography variant="body" color="dark" className="font-medium">
                        {card.name}
                      </Typography>
                      <Typography variant="caption" color="medium">
                        {card.number}
                      </Typography>
                    </div>
                    <Typography variant="caption" color={card.utilization > 30 ? 'warning' : 'medium'}>
                      {card.utilization}% used
                    </Typography>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Used:</span>
                      <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>{card.used}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Limit:</span>
                      <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>{card.limit}</span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-full rounded-full ${
                          card.utilization > 30 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${card.utilization}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountsPage;