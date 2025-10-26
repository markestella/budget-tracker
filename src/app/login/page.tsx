'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/components/ThemeProvider';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isDark } = useTheme();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: 'Invalid email or password' });
      } else {
        // Refresh the session
        await getSession();
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Typography variant="h2" color="dark" className="mb-2">
            Welcome back
          </Typography>
          <Typography variant="body" color="medium">
            Sign in to your account to continue
          </Typography>
        </div>

        {/* Login Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className={`p-4 rounded-lg ${
                isDark ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  {errors.general}
                </p>
              </div>
            )}

            {/* Email Input */}
            <Input
              type="email"
              name="email"
              label="Email address"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
            />

            {/* Password Input */}
            <PasswordInput
              name="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              required
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className={`absolute inset-0 flex items-center ${
                isDark ? 'border-gray-700' : 'border-gray-300'
              }`}>
                <div className={`w-full border-t ${
                  isDark ? 'border-gray-700' : 'border-gray-300'
                }`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${
                  isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
                }`}>
                  Don't have an account?
                </span>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6">
            <Link href="/register">
              <Button variant="outline" className="w-full">
                Create new account
              </Button>
            </Link>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <Typography variant="small" color="medium">
            <Link href="/" className={`${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            } transition-colors`}>
              ← Back to home
            </Link>
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;