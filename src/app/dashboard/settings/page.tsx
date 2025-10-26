'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import { useSession } from 'next-auth/react';

const SettingsPage: React.FC = () => {
  const { isDark } = useTheme();
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Typography variant="h2" color="dark" className="mb-2">
              Settings
            </Typography>
            <Typography variant="body" color="medium">
              Manage your account preferences and application settings
            </Typography>
          </div>

          <div className="space-y-8">
            {/* Profile Settings */}
            <Card className="p-6">
              <Typography variant="h3" color="dark" className="mb-6">
                Profile Information
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="text"
                  name="name"
                  label="Full Name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  placeholder="Enter your full name"
                />
                <Input
                  type="email"
                  name="email"
                  label="Email Address"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  placeholder="Enter your email"
                />
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="primary">
                  Save Changes
                </Button>
              </div>
            </Card>

            {/* Appearance Settings */}
            <Card className="p-6">
              <Typography variant="h3" color="dark" className="mb-6">
                Appearance
              </Typography>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body" color="dark" className="font-medium mb-1">
                    Theme Preference
                  </Typography>
                  <Typography variant="caption" color="medium">
                    Choose between light and dark mode
                  </Typography>
                </div>
                <ThemeToggle />
              </div>
            </Card>

            {/* Currency Settings */}
            <Card className="p-6">
              <Typography variant="h3" color="dark" className="mb-6">
                Currency & Localization
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Primary Currency
                  </label>
                  <select className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-400 focus:ring-blue-400/20' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}>
                    <option value="PHP">Philippine Peso (₱)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Date Format
                  </label>
                  <select className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-400 focus:ring-blue-400/20' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Notification Settings */}
            <Card className="p-6">
              <Typography variant="h3" color="dark" className="mb-6">
                Notifications
              </Typography>
              <div className="space-y-4">
                {[
                  { label: 'Budget alerts', description: 'Get notified when you exceed budget limits', enabled: true },
                  { label: 'Monthly reports', description: 'Receive monthly spending summaries', enabled: true },
                  { label: 'Goal reminders', description: 'Reminders about your savings goals', enabled: false },
                  { label: 'Security alerts', description: 'Notifications about account security', enabled: true },
                ].map((notification, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <Typography variant="body" color="dark" className="font-medium mb-1">
                        {notification.label}
                      </Typography>
                      <Typography variant="caption" color="medium">
                        {notification.description}
                      </Typography>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked={notification.enabled}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>

            {/* Security Settings */}
            <Card className="p-6">
              <Typography variant="h3" color="dark" className="mb-6">
                Security
              </Typography>
              <div className="space-y-4">
                <Button variant="outline" className="w-full sm:w-auto">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full sm:w-auto ml-0 sm:ml-4">
                  Two-Factor Authentication
                </Button>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 border-red-200 dark:border-red-700">
              <Typography variant="h3" color="dark" className="mb-4 text-red-600">
                Danger Zone
              </Typography>
              <Typography variant="body" color="medium" className="mb-4">
                These actions are permanent and cannot be undone.
              </Typography>
              <div className="space-y-3">
                <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Export All Data
                </Button>
                <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;