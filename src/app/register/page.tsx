'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/components/ThemeProvider';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      // Password strength validation
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else {
        const hasUppercase = /[A-Z]/.test(formData.password);
        const hasLowercase = /[a-z]/.test(formData.password);
        const hasNumber = /\d/.test(formData.password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
        
        if (!(hasUppercase && hasLowercase && hasNumber && hasSpecial)) {
          newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
        }
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      // Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Registration failed' });
        return;
      }

      // Auto sign in after successful registration
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setErrors({ general: 'Registration successful, but auto sign-in failed. Please sign in manually.' });
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
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
            Create your account
          </Typography>
          <Typography variant="body" color="medium">
            Join us to start tracking your budget
          </Typography>
        </div>

        {/* Register Form */}
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

            {/* Name Input */}
            <Input
              type="text"
              name="name"
              label="Full name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              required
            />

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
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              required
            />

            {/* Password Strength Indicator */}
            {formData.password && (
              <PasswordStrengthIndicator 
                password={formData.password}
                showDetails={true}
              />
            )}

            {/* Confirm Password Input */}
            <PasswordInput
              name="confirmPassword"
              label="Confirm password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              required
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
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
                  Already have an account?
                </span>
              </div>
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-6">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Sign in instead
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

export default RegisterPage;