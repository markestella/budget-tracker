'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/components/ThemeProvider';

const ExpensesPage: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <Typography variant="h2" color="dark" className="mb-2">
                Expense Tracker
              </Typography>
              <Typography variant="body" color="medium">
                Monitor and categorize your spending
              </Typography>
            </div>
            <Button variant="primary">
              Add Expense
            </Button>
          </div>

          {/* Expense Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                This Month
              </Typography>
              <Typography variant="h2" color="warning" className="mb-2">
                ₱28,750.00
              </Typography>
              <Typography variant="caption" color="warning">
                +15% vs last month
              </Typography>
            </Card>

            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                Daily Average
              </Typography>
              <Typography variant="h2" color="primary" className="mb-2">
                ₱1,125.00
              </Typography>
              <Typography variant="caption" color="medium">
                Last 30 days
              </Typography>
            </Card>

            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                Largest Category
              </Typography>
              <Typography variant="body" color="dark" className="mb-1 font-medium">
                Food & Dining
              </Typography>
              <Typography variant="h3" color="accent" className="mb-2">
                ₱8,500.00
              </Typography>
            </Card>

            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                Budget Status
              </Typography>
              <Typography variant="h2" color="success" className="mb-2">
                72%
              </Typography>
              <Typography variant="caption" color="success">
                Within budget
              </Typography>
            </Card>
          </div>

          {/* Recent Expenses */}
          <Card className="p-6 mb-6">
            <Typography variant="h3" color="dark" className="mb-6">
              Recent Expenses
            </Typography>
            <div className="space-y-4">
              {[
                { description: 'Grocery Shopping at SM', amount: '₱1,250.00', category: 'Food & Dining', date: 'Oct 25, 2025', account: 'BPI Debit' },
                { description: 'Uber ride to office', amount: '₱180.00', category: 'Transportation', date: 'Oct 25, 2025', account: 'GCash' },
                { description: 'Netflix subscription', amount: '₱549.00', category: 'Entertainment', date: 'Oct 24, 2025', account: 'BPI Credit' },
                { description: 'Starbucks coffee', amount: '₱325.00', category: 'Food & Dining', date: 'Oct 24, 2025', account: 'BPI Debit' },
                { description: 'Gasoline', amount: '₱2,100.00', category: 'Transportation', date: 'Oct 23, 2025', account: 'BPI Credit' },
              ].map((expense, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex-1">
                    <Typography variant="body" color="dark" className="font-medium">
                      {expense.description}
                    </Typography>
                    <Typography variant="caption" color="medium">
                      {expense.date} • {expense.category} • {expense.account}
                    </Typography>
                  </div>
                  <Typography variant="body" color="dark" className="font-semibold">
                    -{expense.amount}
                  </Typography>
                </div>
              ))}
            </div>
          </Card>

          {/* Expense Categories */}
          <Card className="p-6">
            <Typography variant="h3" color="dark" className="mb-6">
              Spending by Category
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { category: 'Food & Dining', amount: '₱8,500.00', percentage: 30, color: 'bg-blue-500' },
                { category: 'Transportation', amount: '₱5,200.00', percentage: 18, color: 'bg-green-500' },
                { category: 'Bills & Utilities', amount: '₱4,800.00', percentage: 17, color: 'bg-yellow-500' },
                { category: 'Shopping', amount: '₱3,750.00', percentage: 13, color: 'bg-purple-500' },
                { category: 'Entertainment', amount: '₱2,900.00', percentage: 10, color: 'bg-pink-500' },
                { category: 'Healthcare', amount: '₱3,600.00', percentage: 12, color: 'bg-red-500' },
              ].map((category, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <Typography variant="body" color="dark" className="font-medium">
                      {category.category}
                    </Typography>
                    <Typography variant="body" color="dark" className="font-semibold">
                      {category.amount}
                    </Typography>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-full rounded-full ${category.color}`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {category.percentage}%
                    </span>
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

export default ExpensesPage;