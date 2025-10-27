'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/components/ThemeProvider';
import { IncomeSourceForm } from '@/components/income/IncomeSourceForm';
import { IncomeSourceCard } from '@/components/income/IncomeSourceCard';
import { IncomeRecordForm } from '@/components/income/IncomeRecordForm';
import { IncomeRecordTable } from '@/components/income/IncomeRecordTable';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

type IncomeCategory = 'SALARY' | 'FREELANCE' | 'BUSINESS' | 'INVESTMENT' | 'RENTAL' | 'PENSION' | 'BENEFITS' | 'OTHER';
type PaymentFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
type PaymentStatus = 'PENDING' | 'RECEIVED' | 'OVERDUE';

interface IncomeSource {
  id: string;
  name: string;
  category: IncomeCategory;
  description?: string;
  frequency: PaymentFrequency;
  amount: number;
  isActive: boolean;
  _count?: {
    incomeRecords: number;
  };
}

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

interface IncomeCalculations {
  summary: {
    totalExpected: number;
    totalReceived: number;
    totalPending: number;
    totalOverdue: number;
    receiptRate: number;
  };
  recentPayments: Array<{
    id: string;
    actualAmount: number;
    actualDate: string;
    incomeSource: {
      name: string;
      category: IncomeCategory;
    };
  }>;
  upcomingPayments: Array<{
    id: string;
    expectedDate: string;
    expectedAmount: number;
    incomeSource: {
      name: string;
      category: IncomeCategory;
      amount: number;
      perPaymentAmount?: number;
    };
  }>;
}

const IncomePage: React.FC = () => {
  const { isDark } = useTheme();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'records'>('overview');
  
  // State for sources
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [showSourceForm, setShowSourceForm] = useState(false);
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null);
  
  // State for records
  const [records, setRecords] = useState<IncomeRecord[]>([]);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IncomeRecord | null>(null);
  
  // State for calculations
  const [calculations, setCalculations] = useState<IncomeCalculations | null>(null);
  const [loading, setLoading] = useState(true);
  

  // State for confirmation modals
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDestructive: false,
  });

  // Fetch all data
  const fetchData = async () => {
    if (status !== 'authenticated') return;
    
    try {
      setLoading(true);
      const [sourcesRes, recordsRes, calculationsRes] = await Promise.all([
        fetch('/api/income/sources', { credentials: 'include' }),
        fetch('/api/income/records?limit=50', { credentials: 'include' }),
        fetch('/api/income/calculations?period=monthly', { credentials: 'include' })
      ]);

      if (sourcesRes.ok) {
        const sourcesData = await sourcesRes.json();
        setSources(sourcesData);
      }

      if (recordsRes.ok) {
        const recordsData = await recordsRes.json();
        setRecords(recordsData.records || []);
      }

      if (calculationsRes.ok) {
        const calculationsData = await calculationsRes.json();
        setCalculations(calculationsData);
      }
    } catch (error) {
      console.error('Error fetching income data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [status]);

  // Handle source operations
  const handleSourceSubmit = async (sourceData: Omit<IncomeSource, 'id'>) => {
    try {
      const url = editingSource 
        ? `/api/income/sources/${editingSource.id}` 
        : '/api/income/sources';
      
      const method = editingSource ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sourceData),
        credentials: 'include',
      });

      if (response.ok) {
        await fetchData();
        setShowSourceForm(false);
        setEditingSource(null);
      }
    } catch (error) {
      console.error('Error saving source:', error);
    }
  };

  const handleToggleActive = async (source: IncomeSource) => {
    try {
      const response = await fetch(`/api/income/sources/${source.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...source,
          isActive: !source.isActive,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error toggling source active status:', error);
    }
  };

  const handleSourceDelete = (source: IncomeSource) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Income Source',
      message: `Are you sure you want to delete "${source.name}"? This action cannot be undone and will also delete all associated payment records.`,
      isDestructive: true,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/income/sources/${source.id}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (response.ok) {
            await fetchData();
          }
        } catch (error) {
          console.error('Error deleting source:', error);
        }
      }
    });
  };


  // Quick actions for pending payments
  const handleQuickReceived = async (payment: any) => {
    try {
      const incomeSourceId = payment.incomeSource?.id || payment.incomeSourceId;
      
      if (!incomeSourceId) {
        console.error('No income source ID found:', payment);
        alert('Error: Unable to identify income source');
        return;
      }

      const response = await fetch('/api/income/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomeSourceId: incomeSourceId,
          expectedDate: payment.expectedDate,
          actualAmount: payment.expectedAmount,
          actualDate: new Date().toISOString().split('T')[0],
          status: 'RECEIVED',
          notes: 'Quick action - marked as received'
        }),
        credentials: 'include',
      });

      if (response.ok) {
        await fetchData();
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        alert(`Error: ${errorData.error || 'Failed to create record'}`);
      }
    } catch (error) {
      console.error('Error marking payment as received:', error);
      alert('Error marking payment as received. Please try again.');
    }
  };

  const handleQuickNotYet = async (payment: any) => {
    try {
      const incomeSourceId = payment.incomeSource?.id || payment.incomeSourceId;
      
      if (!incomeSourceId) {
        console.error('No income source ID found:', payment);
        alert('Error: Unable to identify income source');
        return;
      }

      const response = await fetch('/api/income/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomeSourceId: incomeSourceId,
          expectedDate: payment.expectedDate,
          status: 'OVERDUE',
          notes: 'Quick action - marked as not yet received'
        }),
        credentials: 'include',
      });

      if (response.ok) {
        await fetchData();
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        alert(`Error: ${errorData.error || 'Failed to create record'}`);
      }
    } catch (error) {
      console.error('Error marking payment as not yet received:', error);
      alert('Error marking payment as overdue. Please try again.');
    }
  };



  // Handle record operations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRecordSubmit = async (recordData: any) => {
    try {
      const url = editingRecord 
        ? `/api/income/records/${editingRecord.id}` 
        : '/api/income/records';
      
      const method = editingRecord ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
        credentials: 'include',
      });

      if (response.ok) {
        await fetchData();
        setShowRecordForm(false);
        setEditingRecord(null);
      }
    } catch (error) {
      console.error('Error saving record:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (status === 'loading') {
    return <DashboardLayout><div className="p-8">Loading...</div></DashboardLayout>;
  }

  if (status === 'unauthenticated') {
    return <DashboardLayout><div className="p-8">Please sign in to access income management.</div></DashboardLayout>;
  }

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
                Track and manage your income sources and payments
              </Typography>
            </div>
            <div className="flex gap-3">

              {activeTab === 'sources' && (
                <Button 
                  variant="primary"
                  onClick={() => {
                    setEditingSource(null);
                    setShowSourceForm(true);
                  }}
                >
                  Add Income Source
                </Button>
              )}
              {activeTab === 'records' && (
                <Button 
                  variant="primary"
                  onClick={() => {
                    setEditingRecord(null);
                    setShowRecordForm(true);
                  }}
                >
                  Add Payment Record
                </Button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview', icon: '📊' },
                  { id: 'sources', label: 'Income Sources', icon: '💼' },
                  { id: 'records', label: 'Payment Records', icon: '📋' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? isDark
                          ? 'border-blue-400 text-blue-400'
                          : 'border-blue-500 text-blue-600'
                        : isDark
                          ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Income Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                  <Typography variant="h4" color="dark" className="mb-4">
                    This Month Expected
                  </Typography>
                  <Typography variant="h2" color="primary" className="mb-2">
                    {calculations ? formatCurrency(calculations.summary.totalExpected) : '₱0.00'}
                  </Typography>
                  <Typography variant="caption" color="medium">
                    Total expected income
                  </Typography>
                </Card>

                <Card className="p-6">
                  <Typography variant="h4" color="dark" className="mb-4">
                    Received
                  </Typography>
                  <Typography variant="h2" color="success" className="mb-2">
                    {calculations ? formatCurrency(calculations.summary.totalReceived) : '₱0.00'}
                  </Typography>
                  <Typography variant="caption" color="success">
                    {calculations ? `${calculations.summary.receiptRate.toFixed(1)}% receipt rate` : '0% receipt rate'}
                  </Typography>
                </Card>

                <Card className="p-6">
                  <Typography variant="h4" color="dark" className="mb-4">
                    Pending
                  </Typography>
                  <Typography variant="h2" color="warning" className="mb-2">
                    {calculations ? formatCurrency(calculations.summary.totalPending) : '₱0.00'}
                  </Typography>
                  <Typography variant="caption" color="medium">
                    Awaiting payment
                  </Typography>
                </Card>

                <Card className="p-6">
                  <Typography variant="h4" color="dark" className="mb-4">
                    Overdue
                  </Typography>
                  <Typography variant="h2" color="warning" className="mb-2">
                    {calculations ? formatCurrency(calculations.summary.totalOverdue) : '₱0.00'}
                  </Typography>
                  <Typography variant="caption" color="warning">
                    Past due date
                  </Typography>
                </Card>
              </div>

              {/* Pending Payment Notifications */}
              {calculations?.upcomingPayments && calculations.upcomingPayments.length > 0 && (
                <Card className="p-6">
                  <Typography variant="h3" color="dark" className="mb-6">
                    Payment Notifications (Next 2 Weeks)
                  </Typography>
                  <div className="space-y-3">
                    {calculations.upcomingPayments
                      .filter(payment => {
                        const paymentDate = new Date(payment.expectedDate);
                        const today = new Date();
                        const diffTime = paymentDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        // Show payments that are overdue, due today, or due within 2 weeks
                        // But exclude payments that have been marked as received or overdue (not pending anymore)
                        const isWithinTimeframe = diffDays <= 14;
                        const isPending = !(payment as any).status || (payment as any).status === 'PENDING';
                        return isWithinTimeframe && isPending;
                      })
                      .slice(0, 5)
                      .map((payment) => {
                        const paymentDate = new Date(payment.expectedDate);
                        const today = new Date();
                        const diffTime = paymentDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const isOverdue = diffDays < 0;
                        const isDueToday = diffDays === 0;
                        const isDueSoon = diffDays <= 3 && diffDays > 0; // Due within 3 days
                        const isDueThisWeek = diffDays <= 7 && diffDays > 3; // Due within a week
                        const isDueLater = diffDays > 7; // Due later (within 2 weeks)
                        
                        return (
                          <div key={payment.id} className={`flex items-center justify-between p-4 rounded-lg ${
                            isDark ? 'bg-gray-800' : 'bg-gray-50'
                          }`}>
                            <div className="flex-1">
                              <Typography variant="body" color="dark" className="font-medium">
                                {payment.incomeSource.name}
                              </Typography>
                              <div className="flex items-center gap-2">
                                <Typography variant="caption" color="medium">
                                  Expected: {formatDate(payment.expectedDate)}
                                </Typography>
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                  isOverdue 
                                    ? isDark 
                                      ? 'bg-red-900/30 text-red-400' 
                                      : 'bg-red-100 text-red-700'
                                    : isDueToday 
                                    ? isDark 
                                      ? 'bg-yellow-900/30 text-yellow-400'
                                      : 'bg-yellow-100 text-yellow-700'
                                    : isDueSoon
                                    ? isDark 
                                      ? 'bg-orange-900/30 text-orange-400'
                                      : 'bg-orange-100 text-orange-700'
                                    : isDark 
                                      ? 'bg-gray-700 text-gray-300'
                                      : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {isOverdue 
                                    ? `${Math.abs(diffDays)} days overdue` 
                                    : isDueToday 
                                    ? 'Due today' 
                                    : diffDays <= 7
                                    ? `Due in ${diffDays} days`
                                    : `Due in ${Math.ceil(diffDays / 7)} weeks`
                                  }
                                </span>
                              </div>
                              <Typography variant="body" color="primary" className="font-semibold">
                                {formatCurrency(payment.expectedAmount)}
                              </Typography>
                            </div>
                            {/* Only show action buttons for payments due within a week */}
                            {diffDays <= 7 && (
                              <div className="flex gap-2 ml-4">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleQuickReceived(payment)}
                                  className="px-3 py-1 text-xs"
                                >
                                  Received
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuickNotYet(payment)}
                                  className="px-3 py-1 text-xs"
                                >
                                  Not Yet
                                </Button>
                              </div>
                            )}
                            {/* Show info text for payments due later */}
                            {diffDays > 7 && (
                              <div className="ml-4 flex items-center">
                                <Typography variant="caption" color="medium" className="text-xs">
                                  Actions available when due date approaches
                                </Typography>
                              </div>
                            )}
                          </div>
                        );
                      })
                    }
                  </div>
                  {calculations.upcomingPayments.filter(payment => {
                    const paymentDate = new Date(payment.expectedDate);
                    const today = new Date();
                    const diffTime = paymentDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const isWithinTimeframe = diffDays <= 14;
                    const isPending = !(payment as any).status || (payment as any).status === 'PENDING';
                    return isWithinTimeframe && isPending;
                  }).length === 0 && (
                    <Typography variant="body" color="medium" className="text-center py-4">
                      No pending payments requiring attention
                    </Typography>
                  )}
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Payments */}
                <Card className="p-6">
                  <Typography variant="h3" color="dark" className="mb-6">
                    Recent Payments
                  </Typography>
                  <div className="space-y-4">
                    {calculations?.recentPayments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className={`flex items-center justify-between p-4 rounded-lg ${
                        isDark ? 'bg-gray-800' : 'bg-gray-50'
                      }`}>
                        <div>
                          <Typography variant="body" color="dark" className="font-medium">
                            {payment.incomeSource.name}
                          </Typography>
                          <Typography variant="caption" color="medium">
                            {formatDate(payment.actualDate)}
                          </Typography>
                        </div>
                        <Typography variant="body" color="success" className="font-semibold">
                          {formatCurrency(payment.actualAmount)}
                        </Typography>
                      </div>
                    )) || (
                      <Typography variant="body" color="medium" className="text-center py-4">
                        No recent payments
                      </Typography>
                    )}
                  </div>
                </Card>

                {/* Upcoming Payments */}
                <Card className="p-6">
                  <Typography variant="h3" color="dark" className="mb-6">
                    Upcoming Payments
                  </Typography>
                  <div className="space-y-4">
                    {calculations?.upcomingPayments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className={`flex items-center justify-between p-4 rounded-lg ${
                        isDark ? 'bg-gray-800' : 'bg-gray-50'
                      }`}>
                        <div>
                          <Typography variant="body" color="dark" className="font-medium">
                            {payment.incomeSource.name}
                          </Typography>
                          <Typography variant="caption" color="medium">
                            Expected: {formatDate(payment.expectedDate)}
                          </Typography>
                        </div>
                        <Typography variant="body" color="primary" className="font-semibold">
                          {formatCurrency(payment.expectedAmount)}
                        </Typography>
                      </div>
                    )) || (
                      <Typography variant="body" color="medium" className="text-center py-4">
                        No upcoming payments
                      </Typography>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="p-6 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </Card>
                  ))}
                </div>
              ) : sources.length === 0 ? (
                <Card className="p-12 text-center">
                  <Typography variant="h3" color="medium" className="mb-4">
                    No income sources yet
                  </Typography>
                  <Typography variant="body" color="medium" className="mb-6">
                    Create your first income source to start tracking your payments.
                  </Typography>
                  <Button 
                    variant="primary"
                    onClick={() => {
                      setEditingSource(null);
                      setShowSourceForm(true);
                    }}
                  >
                    Add Income Source
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sources.map((source) => (
                    <IncomeSourceCard
                      key={source.id}
                      source={source}
                      onEdit={(source) => {
                        setEditingSource(source);
                        setShowSourceForm(true);
                      }}
                      onDelete={handleSourceDelete}
                      onToggleActive={handleToggleActive}
                      onViewRecords={(source) => {
                        setActiveTab('records');
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'records' && (
            <div>
              <IncomeRecordTable
                records={records}
                loading={loading}
                onEdit={(record) => {
                  setEditingRecord(record);
                  setShowRecordForm(true);
                }}
                onDelete={(record) => {
                  setConfirmModal({
                    isOpen: true,
                    title: 'Delete Payment Record',
                    message: `Are you sure you want to delete this payment record from "${record.incomeSource.name}"? This action cannot be undone.`,
                    isDestructive: true,
                    onConfirm: async () => {
                      try {
                        const response = await fetch(`/api/income/records/${record.id}`, {
                          method: 'DELETE',
                          credentials: 'include',
                        });

                        if (response.ok) {
                          await fetchData();
                        }
                      } catch (error) {
                        console.error('Error deleting record:', error);
                      }
                    }
                  });
                }}
                onStatusUpdate={async (record, newStatus) => {
                  try {
                    const updateData = {
                      ...record,
                      status: newStatus,
                      actualDate: newStatus === 'RECEIVED' ? new Date().toISOString().split('T')[0] : record.actualDate,
                      actualAmount: newStatus === 'RECEIVED' && !record.actualAmount 
                        ? record.incomeSource.amount 
                        : record.actualAmount,
                    };

                    const response = await fetch(`/api/income/records/${record.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(updateData),
                      credentials: 'include',
                    });

                    if (response.ok) {
                      await fetchData();
                    }
                  } catch (error) {
                    console.error('Error updating record:', error);
                  }
                }}
              />
            </div>
          )}

          {/* Form Modals */}
          {showSourceForm && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="p-6">
                  <Typography variant="h3" color="dark" className="mb-6">
                    {editingSource ? 'Edit Income Source' : 'Add New Income Source'}
                  </Typography>
                  <IncomeSourceForm
                    source={editingSource || undefined}
                    onSubmit={handleSourceSubmit}
                    onCancel={() => {
                      setShowSourceForm(false);
                      setEditingSource(null);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {showRecordForm && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="p-6">
                  <Typography variant="h3" color="dark" className="mb-6">
                    {editingRecord ? 'Edit Payment Record' : 'Add New Payment Record'}
                  </Typography>
                  <IncomeRecordForm
                    record={editingRecord || undefined}
                    incomeSources={sources}
                    onSubmit={handleRecordSubmit}
                    onCancel={() => {
                      setShowRecordForm(false);
                      setEditingRecord(null);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
          <ConfirmModal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            onConfirm={confirmModal.onConfirm}
            title={confirmModal.title}
            message={confirmModal.message}
            isDestructive={confirmModal.isDestructive}
            confirmText={confirmModal.isDestructive ? 'Delete' : 'Confirm'}
            cancelText="Cancel"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default IncomePage;