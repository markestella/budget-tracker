'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/components/ThemeProvider';

const BudgetsPage: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <Typography variant="h2" color="dark" className="mb-2">
                Budget Manager
              </Typography>
              <Typography variant="body" color="medium">
                Create and track your spending budgets
              </Typography>
            </div>
            <Button variant="primary">
              Create Budget
            </Button>
          </div>

          {/* Budget Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                Total Budget
              </Typography>
              <Typography variant="h2" color="primary" className="mb-2">
                ₱40,000.00
              </Typography>
              <Typography variant="caption" color="medium">
                Monthly allocation
              </Typography>
            </Card>

            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                Spent So Far
              </Typography>
              <Typography variant="h2" color="warning" className="mb-2">
                ₱28,750.00
              </Typography>
              <Typography variant="caption" color="warning">
                72% of budget
              </Typography>
            </Card>

            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                Remaining
              </Typography>
              <Typography variant="h2" color="success" className="mb-2">
                ₱11,250.00
              </Typography>
              <Typography variant="caption" color="success">
                8 days left
              </Typography>
            </Card>
          </div>

          {/* Budget Categories */}
          <Card className="p-6">
            <Typography variant="h3" color="dark" className="mb-6">
              Budget Categories
            </Typography>
            <div className="space-y-6">
              {[
                { name: 'Food & Dining', budget: '₱12,000.00', spent: '₱8,500.00', percentage: 71, status: 'on-track' },
                { name: 'Transportation', budget: '₱6,000.00', spent: '₱5,200.00', percentage: 87, status: 'warning' },
                { name: 'Bills & Utilities', budget: '₱5,000.00', spent: '₱4,800.00', percentage: 96, status: 'danger' },
                { name: 'Entertainment', budget: '₱4,000.00', spent: '₱2,900.00', percentage: 73, status: 'on-track' },
                { name: 'Shopping', budget: '₱8,000.00', spent: '₱3,750.00', percentage: 47, status: 'good' },
                { name: 'Healthcare', budget: '₱5,000.00', spent: '₱3,600.00', percentage: 72, status: 'on-track' },
              ].map((budget, index) => {
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'good': return 'text-green-600';
                    case 'on-track': return 'text-blue-600';
                    case 'warning': return 'text-orange-600';
                    case 'danger': return 'text-red-600';
                    default: return 'text-gray-600';
                  }
                };

                const getProgressColor = (status: string) => {
                  switch (status) {
                    case 'good': return 'bg-green-500';
                    case 'on-track': return 'bg-blue-500';
                    case 'warning': return 'bg-orange-500';
                    case 'danger': return 'bg-red-500';
                    default: return 'bg-gray-500';
                  }
                };

                return (
                  <div key={index} className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <Typography variant="body" color="dark" className="font-medium">
                          {budget.name}
                        </Typography>
                        <Typography variant="caption" color="medium">
                          {budget.spent} of {budget.budget}
                        </Typography>
                      </div>
                      <Typography variant="caption" className={getStatusColor(budget.status)}>
                        {budget.percentage}% used
                      </Typography>
                    </div>
                    <div className="space-y-2">
                      <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className={`h-full rounded-full ${getProgressColor(budget.status)}`}
                          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          Remaining: ₱{(parseFloat(budget.budget.replace('₱', '').replace(',', '')) - parseFloat(budget.spent.replace('₱', '').replace(',', ''))).toLocaleString()}.00
                        </span>
                        <span className={getStatusColor(budget.status)}>
                          {budget.status === 'good' && 'Under budget'}
                          {budget.status === 'on-track' && 'On track'}
                          {budget.status === 'warning' && 'Close to limit'}
                          {budget.status === 'danger' && 'Over budget'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BudgetsPage;