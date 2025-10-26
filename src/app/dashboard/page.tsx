'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/components/ThemeProvider';

const DashboardPage: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Typography variant="h2" color="dark" className="mb-2">
              Dashboard Overview
            </Typography>
            <Typography variant="body" color="medium">
              Get insights into your financial health
            </Typography>
          </div>

          {/* Dashboard Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                Total Balance
              </Typography>
              <Typography variant="h2" color="primary" className="mb-2">
                ₱25,420.50
              </Typography>
              <Typography variant="caption" color="success">
                +5.2% from last month
              </Typography>
            </Card>

            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                Monthly Expenses
              </Typography>
              <Typography variant="h2" color="warning" className="mb-2">
                ₱8,750.30
              </Typography>
              <Typography variant="caption" color="medium">
                68% of budget used
              </Typography>
            </Card>

            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                Savings Goal
              </Typography>
              <Typography variant="h2" color="accent" className="mb-2">
                ₱12,000.00
              </Typography>
              <Typography variant="caption" color="success">
                78% completed
              </Typography>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="mt-8 p-6">
            <Typography variant="h3" color="dark" className="mb-6">
              Recent Transactions
            </Typography>
            <div className="space-y-4">
              {[
                { name: 'Grocery Shopping', amount: '-₱1,250.00', date: 'Oct 25, 2025', category: 'Food' },
                { name: 'Salary Deposit', amount: '+₱25,000.00', date: 'Oct 24, 2025', category: 'Income' },
                { name: 'Electric Bill', amount: '-₱2,150.00', date: 'Oct 23, 2025', category: 'Bills' },
              ].map((transaction, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${
                  isDark ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div>
                    <Typography variant="body" color="dark">
                      {transaction.name}
                    </Typography>
                    <Typography variant="caption" color="medium">
                      {transaction.date} • {transaction.category}
                    </Typography>
                  </div>
                  <Typography 
                    variant="body" 
                    color={transaction.amount.startsWith('+') ? 'success' : 'dark'}
                    className="font-semibold"
                  >
                    {transaction.amount}
                  </Typography>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;