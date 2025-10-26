'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/components/ThemeProvider';

const IncomePage: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <Typography variant="h2" color="dark" className="mb-2">
                Income Management
              </Typography>
              <Typography variant="body" color="medium">
                Track and manage your income sources
              </Typography>
            </div>
            <Button variant="primary">
              Add Income
            </Button>
          </div>

          {/* Income Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                This Month
              </Typography>
              <Typography variant="h2" color="success" className="mb-2">
                ₱45,000.00
              </Typography>
              <Typography variant="caption" color="success">
                +12% vs last month
              </Typography>
            </Card>

            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                Average Monthly
              </Typography>
              <Typography variant="h2" color="primary" className="mb-2">
                ₱42,300.00
              </Typography>
              <Typography variant="caption" color="medium">
                Last 6 months
              </Typography>
            </Card>

            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-4">
                Total This Year
              </Typography>
              <Typography variant="h2" color="accent" className="mb-2">
                ₱480,500.00
              </Typography>
              <Typography variant="caption" color="success">
                +8% vs last year
              </Typography>
            </Card>
          </div>

          {/* Income Sources */}
          <Card className="p-6">
            <Typography variant="h3" color="dark" className="mb-6">
              Income Sources
            </Typography>
            <div className="space-y-4">
              {[
                { source: 'Primary Job - Tech Company', amount: '₱35,000.00', frequency: 'Monthly', next: 'Nov 1, 2025' },
                { source: 'Freelance Projects', amount: '₱8,500.00', frequency: 'Variable', next: 'Ongoing' },
                { source: 'Investment Dividends', amount: '₱1,500.00', frequency: 'Quarterly', next: 'Dec 15, 2025' },
              ].map((income, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div>
                    <Typography variant="body" color="dark" className="font-medium">
                      {income.source}
                    </Typography>
                    <Typography variant="caption" color="medium">
                      {income.frequency} • Next: {income.next}
                    </Typography>
                  </div>
                  <Typography variant="body" color="success" className="font-semibold">
                    {income.amount}
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

export default IncomePage;