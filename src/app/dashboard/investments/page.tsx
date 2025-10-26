'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/components/ThemeProvider';

const InvestmentsPage: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <Typography variant="h2" color="dark" className="mb-2">
                Investments & Savings
              </Typography>
              <Typography variant="body" color="medium">
                Track your investments and savings goals
              </Typography>
            </div>
            <Button variant="primary">
              Add Investment
            </Button>
          </div>

          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                Total Portfolio
              </Typography>
              <Typography variant="h2" color="success" className="mb-2">
                ₱185,420.00
              </Typography>
              <Typography variant="caption" color="success">
                +5.2% this month
              </Typography>
            </Card>

            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                Monthly Savings
              </Typography>
              <Typography variant="h2" color="primary" className="mb-2">
                ₱15,000.00
              </Typography>
              <Typography variant="caption" color="success">
                Goal: ₱12,000.00
              </Typography>
            </Card>

            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                Total Gain/Loss
              </Typography>
              <Typography variant="h2" color="success" className="mb-2">
                +₱8,420.00
              </Typography>
              <Typography variant="caption" color="success">
                +4.75% overall
              </Typography>
            </Card>

            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                Emergency Fund
              </Typography>
              <Typography variant="h2" color="accent" className="mb-2">
                ₱45,000.00
              </Typography>
              <Typography variant="caption" color="success">
                3 months expenses
              </Typography>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Investment Holdings */}
            <Card className="p-6">
              <Typography variant="h3" color="dark" className="mb-6">
                Investment Holdings
              </Typography>
              <div className="space-y-4">
                {[
                  { name: 'UITF Equity Fund', value: '₱75,500.00', change: '+₱3,200.00', changePercent: '+4.4%', allocation: 41 },
                  { name: 'Government Bonds', value: '₱45,000.00', change: '+₱850.00', changePercent: '+1.9%', allocation: 24 },
                  { name: 'Stock Portfolio (PSE)', value: '₱35,920.00', change: '+₱2,920.00', changePercent: '+8.8%', allocation: 19 },
                  { name: 'MP2 PAGIBIG', value: '₱29,000.00', change: '+₱1,450.00', changePercent: '+5.3%', allocation: 16 },
                ].map((investment, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Typography variant="body" color="dark" className="font-medium">
                          {investment.name}
                        </Typography>
                        <Typography variant="caption" color="success">
                          {investment.change} ({investment.changePercent})
                        </Typography>
                      </div>
                      <div className="text-right">
                        <Typography variant="body" color="dark" className="font-semibold">
                          {investment.value}
                        </Typography>
                        <Typography variant="caption" color="medium">
                          {investment.allocation}% of portfolio
                        </Typography>
                      </div>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${investment.allocation}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Savings Goals */}
            <Card className="p-6">
              <Typography variant="h3" color="dark" className="mb-6">
                Savings Goals
              </Typography>
              <div className="space-y-4">
                {[
                  { goal: 'Emergency Fund', target: '₱60,000.00', current: '₱45,000.00', percentage: 75, deadline: 'Dec 2025' },
                  { goal: 'New Car Down Payment', target: '₱150,000.00', current: '₱89,500.00', percentage: 60, deadline: 'Mar 2026' },
                  { goal: 'Vacation Fund', target: '₱80,000.00', current: '₱32,000.00', percentage: 40, deadline: 'Jun 2026' },
                  { goal: 'House Down Payment', target: '₱500,000.00', current: '₱125,000.00', percentage: 25, deadline: 'Dec 2027' },
                ].map((goal, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <Typography variant="body" color="dark" className="font-medium">
                          {goal.goal}
                        </Typography>
                        <Typography variant="caption" color="medium">
                          Target by {goal.deadline}
                        </Typography>
                      </div>
                      <div className="text-right">
                        <Typography variant="body" color="success" className="font-semibold">
                          {goal.current}
                        </Typography>
                        <Typography variant="caption" color="medium">
                          of {goal.target}
                        </Typography>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${goal.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          {goal.percentage}% complete
                        </span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          ₱{(parseFloat(goal.target.replace('₱', '').replace(',', '')) - parseFloat(goal.current.replace('₱', '').replace(',', ''))).toLocaleString()}.00 to go
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InvestmentsPage;